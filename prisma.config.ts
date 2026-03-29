import { defineConfig } from 'prisma/config';
import { SQLiteAdapter } from '@prisma/adapter-sqlite'; // need to install this package

export default defineConfig({
  datasource: {
    db: {
      adapter: new SQLiteAdapter({
        url: process.env.DATABASE_URL || 'file:./local.db'
      })
    }
  }
});