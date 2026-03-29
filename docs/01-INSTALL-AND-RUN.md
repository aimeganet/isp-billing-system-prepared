# التشغيل والتركيب

## المتطلبات
- Node.js 20 أو أحدث
- npm 10 أو أحدث
- قاعدة بيانات PostgreSQL أونلاين إذا أردت المزامنة الفعلية مع نسخة بعيدة

## أسرع طريقة تشغيل
من داخل مجلد المشروع شغّل:

### على PowerShell
```powershell
./scripts/setup.ps1
npm run dev
```

### على Bash / Git Bash / WSL
```bash
./scripts/setup.sh
npm run dev
```

## ماذا يفعل سكربت الإعداد؟
`bootstrap` يقوم بالآتي:
1. ينشئ ملف `.env` من `.env.example` إذا لم يكن موجودًا.
2. ينشئ مجلدات التخزين المحلية.
3. يثبت الحزم (`npm install`).
4. يولد Prisma Client.
5. ينشئ قاعدة SQLite المحلية ويطبق الجداول عليها.
6. يضيف بيانات seed أولية بما فيها المدير والأدوار والصلاحيات الأساسية.
7. إذا كان `REMOTE_DATABASE_URL` موجودًا، يهيئ قاعدة PostgreSQL البعيدة بنفس الـ schema.

## بيانات الدخول الافتراضية بعد التهيئة
- البريد: `admin@local.test`
- كلمة المرور: `ChangeMe123!`

> يمكنك تغييرهما من `.env` باستخدام:
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

## تهيئة قاعدة البيانات الأونلاين
> ملاحظة مهمة: السكربت لا ينشئ لك خادم PostgreSQL من الصفر، لكنه يهيئ الجداول على قاعدة موجودة بالفعل.

### مثال تشغيل مع قاعدة أونلاين ومزامنة
```bash
node scripts/bootstrap.mjs   --remote-db-url="postgresql://user:pass@host:5432/dbname"   --remote-sync-url="https://your-app.example.com"   --sync-secret="change-me"   --admin-email="admin@example.com"   --admin-password="StrongPass123"   --enable-sync
```

### مثال PowerShell
```powershell
./scripts/setup.ps1 `
  -RemoteDbUrl "postgresql://user:pass@host:5432/dbname" `
  -RemoteSyncUrl "https://your-app.example.com" `
  -SyncSecret "change-me" `
  -EnableSync
```

## أوامر مهمة
```bash
npm run doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run db:push:remote
npm run dev
```

## أين تحفظ الملفات؟
- قاعدة البيانات المحلية: `local.db` أو أي مسار تحدده في `DATABASE_URL`
- الصور والمرفقات: `storage/`
- الإعدادات: `.env`

## أول خطوات بعد التشغيل
1. افتح `http://localhost:3000`
2. سجّل الدخول بحساب المدير الافتراضي
3. راجع صفحة الإعدادات
4. أضف الباقات والموظفين والمحافظ
5. جرّب إضافة مشترك
6. جرّب إضافة عملية وفاتورة


## تشغيل نسخة Desktop
بعد تثبيت الحزم محليًا يمكنك تجربة سطح المكتب مباشرة:

```bash
npm run desktop:dev
```

وللتغليف الأولي:

```bash
npm run desktop:package
```

> ملاحظة: هذا سيبني Next.js بصيغة `standalone` ثم يمررها إلى `electron-builder`.
