# جرد المشروع

## أهم المجلدات
- `app/` صفحات الواجهة ونقاط API
- `actions/` منطق الخادم المرتبط بالنماذج والعمليات
- `components/` المكونات المشتركة والنماذج
- `lib/` خدمات النظام: Prisma, auth, permissions, billing, messaging, importers, sync
- `prisma/` مخططات قاعدة البيانات وseed
- `scripts/` سكربتات الإعداد والتشغيل والفحص
- `docs/` وثائق المشروع التشغيلية والتسليمية
- `storage/` حفظ الصور والمرفقات محليًا
- `messages/` ملفات النصوص والترجمة
- `electron/` خريطة طريق لنسخة سطح المكتب

## أهم الملفات التنفيذية
- `package.json`
- `.env.example`
- `README.md`
- `scripts/bootstrap.mjs`
- `scripts/prisma-remote.mjs`
- `scripts/doctor.mjs`
- `prisma/schema.prisma`
- `prisma/schema.postgres.prisma`
- `lib/auth.ts`
- `lib/permissions.ts`
- `lib/password.ts`
- `lib/audit.ts`

## أهم الصفحات الموجودة
- `/login`
- `/dashboard`
- `/subscribers`
- `/subscribers/new`
- `/subscribers/[id]`
- `/subscribers/[id]/edit`
- `/transactions`
- `/transactions/new`
- `/invoices`
- `/invoices/[id]`
- `/imports`
- `/imports/[id]`
- `/reports`
- `/messaging/templates`
- `/messaging/templates/[id]`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/roles`
- `/admin/roles/[id]`
- `/admin/permissions`
- `/admin/permissions/[id]`
- `/admin/employees`
- `/admin/employees/[id]`
- `/admin/wallets`
- `/admin/wallets/[id]`
- `/admin/audit`
- `/settings`
- `/settings/packages/[id]`
- `/sync`

## ملاحظة معمارية
النسخة الحالية Local-First:
- التشغيل المحلي يعتمد على SQLite
- الدعم الأونلاين يعتمد على PostgreSQL عبر schema منفصل
- المزامنة مصممة على هيئة Sync Queue + Push API
- Auth محلي عبر Sessions database-backed
- الصلاحيات مرنة عبر RBAC database-backed


## إضافات المرحلة الحالية
- `components/forms/subscriber-contact-form.tsx`
- `app/subscribers/[id]/contacts/new/page.tsx`
- `app/subscribers/[id]/contacts/[contactId]/page.tsx`
- `electron/main.cjs`
- `electron/preload.cjs`
- `electron/dev-runner.mjs`
- `electron/build-desktop.mjs`
- `electron/builder.json`
- `docs/07-CONTACTS-DESKTOP-NOTES.md`
