import { hash, compare } from "bcryptjs";

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash?: string | null) {
  if (!passwordHash) return false;
  return compare(password, passwordHash);
}
