import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

export function formatDate(date?: Date | string | null) {
  if (!date) return "-";
  return format(new Date(date), "yyyy-MM-dd HH:mm");
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
}

export async function fileToBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  meta?: Record<string, string>;
};

export const initialActionState: ActionState = {
  success: false,
  message: ""
};
