const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");

const DEV_PORT = process.env.ELECTRON_DEV_PORT || "3000";
const isDev = !app.isPackaged;
let mainWindow = null;
let nextServerProcess = null;

function getUserDataDbUrl() {
  const dbPath = path.join(app.getPath("userData"), "local.db");
  return `file:${dbPath}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // ignore and retry
    }
    await wait(1000);
  }
  throw new Error(`Server did not start in time: ${url}`);
}

async function startStandaloneServer() {
  const serverEntry = path.join(process.resourcesPath, "app.asar.unpacked", ".next", "standalone", "server.js");
  const fallbackEntry = path.join(app.getAppPath(), ".next", "standalone", "server.js");
  const entry = fs.existsSync(serverEntry) ? serverEntry : fallbackEntry;

  if (!fs.existsSync(entry)) {
    throw new Error(`Standalone server entry not found: ${entry}`);
  }

  const port = process.env.PORT || "3010";
  nextServerProcess = fork(entry, [], {
    cwd: path.dirname(entry),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: port,
      HOSTNAME: "127.0.0.1",
      DATABASE_URL: process.env.DATABASE_URL || getUserDataDbUrl()
    },
    stdio: "inherit"
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);
  return url;
}

async function resolveStartUrl() {
  if (isDev) {
    return process.env.ELECTRON_START_URL || `http://127.0.0.1:${DEV_PORT}`;
  }
  return startStandaloneServer();
}

async function createMainWindow() {
  const startUrl = await resolveStartUrl();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    autoHideMenuBar: true,
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  await mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  ipcMain.handle("app:get-info", () => ({
    name: app.getName(),
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    userDataPath: app.getPath("userData")
  }));

  ipcMain.handle("app:open-user-data", async () => {
    await shell.openPath(app.getPath("userData"));
    return true;
  });

  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServerProcess && !nextServerProcess.killed) {
    nextServerProcess.kill();
  }
});
