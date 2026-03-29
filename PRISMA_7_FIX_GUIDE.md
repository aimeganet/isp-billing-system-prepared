## إصلاح Prisma 7 وحقن البيانات

### الخيار الأول: استخدام PostgreSQL محلياً (الأفضل)

```bash
# 1. تثبيت Docker (إن لم يكن مثبتاً)
# Linux/Mac: https://docs.docker.com/get-docker/
# Windows: https://docs.docker.com/desktop/windows/install/

# 2. تشغيل PostgreSQL في container
docker run --name isp-postgres \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=isp_dev \
  -p 5432:5432 \
  -d postgres:latest

# 3. تحديث .env
DATABASE_URL="postgresql://postgres:dev@localhost:5432/isp_dev"

# 4. تشغيل الأوامر
npm run db:generate
npm run db:seed
npm run dev
```

### الخيار الثاني: استخدام SQLite مع حل بديل

```bash
# 1. تثبيت المكتبات الضرورية
npm install --save @prisma/adapter-sqlite better-sqlite3

# 2. تحديث prisma/schema.prisma
# أضف إلى generator client:
previewFeatures = ["driverAdapters"]

# 3. وأضف إلى datasource db:
url = "file:./prisma/dev.db"

# 4. تشغيل الأوامر
npm run db:generate
npm run db:seed
```

### الخيار الثالث: استخدام نسخة أقدم من Prisma

```bash
npm install prisma@6.x @prisma/client@6.x
npm run db:generate
npm run db:seed
```

---

## الملفات التي تم تحديثها:

1. **prisma/schema.prisma**
   - ✅ حذف SyncQueue المكررة
   - ✅ حذف url من datasource

2. **prisma/seed.ts**
   - ✅ تحديث بـ 6 موظفين عرب

   - ✅ إضافة EGP للإعدادات

3. **.env**
   - ✅ تعيين DATABASE_URL بشكل صحيح

4. **prisma.config.js**
   - ✅ إنشاء ملف config لـ Prisma 7

5. **lib/prisma.ts**
   - ✅ بقاء بدون تغييرات (صحيح بالفعل)

---

## الأوامر النهائية:

بعد حل مشكلة قاعدة البيانات، شغّل:

```bash
# توليد Prisma Client
npm run db:generate

# حقن البيانات الأساسية
npm run db:seed

# تشغيل التطبيق
npm run dev
```

---

## دعم إضافي:

إذا واجهت مشاكل، تحقق من:
- أن `better-sqlite3` مثبتة بشكل صحيح
- أن متغيرات البيئة محدثة بشكل صحيح
- أن ملفات Prisma لا تحتوي على أخطاء صيغة

شكراً لاستخدام MegaNet ISP Billing System! 🚀
