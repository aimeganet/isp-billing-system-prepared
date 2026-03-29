import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileToBuffer } from "@/lib/utils";

const ROOT = path.join(process.cwd(), "storage");

export async function saveUploadedFile(file: File, folder = "uploads") {
  const buffer = await fileToBuffer(file);
  const now = new Date();
  const targetDir = path.join(
    ROOT,
    folder,
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0")
  );

  await mkdir(targetDir, { recursive: true });

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const fullPath = path.join(targetDir, safeName);

  await writeFile(fullPath, buffer);

  return {
    fileName: file.name,
    filePath: fullPath,
    relativePath: path.relative(process.cwd(), fullPath),
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buffer.byteLength
  };
}
