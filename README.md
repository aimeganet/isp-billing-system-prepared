# ISP Billing System

نظام محاسبة وإدارة مشتركين لشبكة إنترنت، مبني بأسلوب **Local-First**:
- قاعدة بيانات محلية عبر **SQLite**
- قابل لاحقًا للمزامنة مع نسخة أونلاين عبر **API Sync**
- جاهز تنظيميًا للتحويل لاحقًا إلى **برنامج Desktop** عبر Electron
- يتضمن الآن **تسجيل دخول + RBAC + إدارة أدوار وصلاحيات + CRUD موسع + جهات اتصال للمشتركين + Scaffold فعلي لنسخة Desktop**

## ماذا أضيف في هذه النسخة؟
- طبقة Auth محلية مبنية على Sessions داخل قاعدة البيانات
- أدوار وصلاحيات مرنة عبر جداول Prisma
- صفحات إدارة للمستخدمين والأدوار والصلاحيات والموظفين والمحافظ والباقات والقوالب
- سجل Audit للأحداث الحساسة
- سكربت إعداد موحد لتجهيز المشروع وقاعدة البيانات المحلية والبعيدة
- سكربت فحص سريع للحالة
- توثيق تشغيل واضح
- ملف حالة يوضح ما اكتمل وما ينقص
- ملف تسليم لوكيل برمجي لإكمال المشروع باحترافية

## تشغيل سريع جدًا
### PowerShell
```powershell
./scripts/setup.ps1
npm run dev
```

### Windows CMD
```bat
setup.bat
npm run dev
```

### Bash / Git Bash / WSL
```bash
./scripts/setup.sh
npm run dev
```

ثم افتح:
```text
http://localhost:3000
```

## بيانات الدخول الافتراضية بعد الـ Seed
- البريد: `admin@local.test`
- كلمة المرور: `ChangeMe123!`

يمكن تغييرهما من `.env` عبر:
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

## أهم السكربتات
- `npm run bootstrap` تجهيز المشروع المحلي
- `npm run doctor` فحص سريع للحالة
- `npm run db:push:remote` تهيئة قاعدة PostgreSQL البعيدة
- `npm run dev` تشغيل المشروع

## الملفات التوضيحية
- `docs/01-INSTALL-AND-RUN.md` التشغيل والتركيب
- `docs/02-PROJECT-STATUS.md` ما تم وما ينقص
- `docs/03-PROJECT-MANIFEST.md` جرد المشروع
- `docs/04-AGENT-CONTINUATION-PROMPT.md` برومبت وكيل الإكمال
- `docs/05-DESKTOP-ROADMAP.md` خطة نسخة Desktop/Electron
- `docs/06-AUTH-RBAC-NOTES.md` ملاحظات المصادقة والصلاحيات

## ملاحظات صادقة
- السكربت يستطيع **تهيئة قاعدة أونلاين موجودة بالفعل**، لكنه لا ينشئ خادم PostgreSQL من الصفر.
- الرسائل تعمل الآن بهيكل منطقي ووضع محاكاة، وتحتاج مفاتيح API حقيقية لتفعيل الإرسال الفعلي.
- OCR/Import موجود كبنية، ويحتاج تخصيصًا بحسب شكل الملفات الحقيقية التي سترفعها.
- CRUD مفعّل بصورة جيدة للجداول الإدارية والرئيسية، لكن العمليات المحاسبية والفواتير لا تزال بحاجة طبقة تعديل/إلغاء أكثر تحفظًا حتى لا تتلف الأثر المحاسبي.

## أوامر قاعدة البيانات
```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:generate:remote
npm run db:push:remote
```

## الأوامر الكاملة للمشروع
```bash
npm install
npm run bootstrap -- --skip-install
npm run doctor
npm run dev
npm run build
```

## الصفحات الأساسية
- `/login`
- `/dashboard`
- `/subscribers`
- `/subscribers/new`
- `/subscribers/[id]`
- `/subscribers/[id]/edit`
- `/subscribers/[id]/contacts/new`
- `/subscribers/[id]/contacts/[contactId]`
- `/transactions`
- `/transactions/new`
- `/invoices`
- `/invoices/[id]`
- `/imports`
- `/imports/[id]`
- `/messaging/templates`
- `/messaging/templates/[id]`
- `/reports`
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


## أوامر نسخة Desktop
```bash
npm run desktop:dev
npm run desktop:package
```

> `desktop:dev` يشغّل Next.js ثم يفتح التطبيق داخل Electron محليًا.
> `desktop:package` يبني نسخة Next standalone ثم يجهز حزمة سطح مكتب باستخدام electron-builder.
# isp-billing-system-prepared
# isp-billing-system-prepared
