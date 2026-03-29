import { prisma } from "@/lib/prisma";

type SettingMap = Record<string, string>;

export async function getSettingsMap(): Promise<SettingMap> {
  const settings = await prisma.systemSetting.findMany();
  return Object.fromEntries(settings.map((item) => [item.key, item.value]));
}

export async function getSetting(key: string, fallback = "") {
  const value = await prisma.systemSetting.findUnique({ where: { key } });
  return value?.value ?? fallback;
}

export async function getBooleanSetting(key: string, fallback = false) {
  const value = await getSetting(key, String(fallback));
  return value === "true";
}

export async function getNumberSetting(key: string, fallback = 0) {
  const value = await getSetting(key, String(fallback));
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function saveSetting(key: string, value: string, description?: string) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description }
  });
}
