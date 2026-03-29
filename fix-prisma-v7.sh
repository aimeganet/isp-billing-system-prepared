#!/bash/bin

echo "🚀 البدء في إصلاح توافق Prisma 7..."

# 1. تثبيت المحولات والمكتبات اللازمة لـ SQLite
echo "📦 تثبيت التبعيات الجديدة..."
npm install @prisma/adapter-sqlite better-sqlite3 @prisma/config

# 2. إنشاء ملف prisma.config.ts المتوافق مع Prisma 7
echo "📝 إنشاء ملف prisma.config.ts..."
cat <<EOF > prisma.config.ts
import { defineConfig } from '@prisma/config';
import { PrismaSQLite } from '@prisma/adapter-sqlite';
import Database from 'better-sqlite3';

const connectionString = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const dbPath = connectionString.replace('file:', '');

const db = new Database(dbPath);
const adapter = new PrismaSQLite(db);

export default defineConfig({
  adapter: adapter,
});
EOF

# 3. تعديل ملف schema.prisma (Local SQLite)
echo "🛠️ تحديث ملف schema.prisma..."
# إضافة driverAdapters وتغيير الـ url
sed -i 's/provider = "prisma-client-js"/provider = "prisma-client-js"\n  previewFeatures = ["driverAdapters"]/' prisma/schema.prisma
sed -i 's/url      = env("DATABASE_URL")/url      = "file:.\/dev.db"/' prisma/schema.prisma

# 4. تعديل ملف schema.postgres.prisma (Remote PostgreSQL)
echo "🌐 تحديث ملف schema.postgres.prisma..."
sed -i 's/provider = "prisma-client-js"/provider = "prisma-client-js"\n  previewFeatures = ["driverAdapters"]/' prisma/schema.postgres.prisma
# ملاحظة: بالنسبة لـ Postgres، يفضل ترك الـ url كـ env ولكن الإصدار 7 يتطلب إدارتها عبر config في حالة المزامنة

# 5. محاولة توليد العميل من جديد
echo "🔄 إعادة توليد Prisma Client..."
npx prisma generate

echo "✅ تم الإصلاح بنجاح! يمكنك الآن تشغيل npm run dev."