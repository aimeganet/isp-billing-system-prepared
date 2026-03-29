import { defineConfig } from '@prisma/config';
import { PrismaSQLite } from '@prisma/adapter-sqlite';
import Database from 'better-sqlite3';

// استخراج مسار الملف من الرابط (إزالة file: إذا وُجدت)
const connectionString = process.env.DATABASE_URL || 'file:./local.db';
const dbPath = connectionString.replace('file:', '');

const db = new Database(dbPath);
const adapter = new PrismaSQLite(db);

export default defineConfig({
  adapter: adapter,
});