# برومبت تسليم لوكيل برمجي لإكمال المشروع

انسخ النص التالي إلى وكيل برمجي أو ذكاء اصطناعي مطور:

```text
You are inheriting an existing ISP billing and subscriber management project.

Your job is NOT to redesign it from scratch.
Your job is to inspect the current codebase, preserve what already exists, and continue building it professionally.

Project context:
- Local-first ISP billing system
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Local SQLite database
- Remote PostgreSQL schema for online sync
- Database-backed authentication sessions
- RBAC with roles and permissions tables
- Messaging, invoices, imports, usage logs, settings, admin area
- Intended future Electron desktop wrapper

Before making changes, do the following in order:
1. Read README.md
2. Read docs/01-INSTALL-AND-RUN.md
3. Read docs/02-PROJECT-STATUS.md
4. Read docs/03-PROJECT-MANIFEST.md
5. Read docs/06-AUTH-RBAC-NOTES.md
6. Inspect prisma/schema.prisma and prisma/schema.postgres.prisma
7. Inspect package.json scripts
8. Inspect actions/, app/, components/, lib/

Rules:
- Do not delete working features unless absolutely necessary.
- Prefer extension over rewrite.
- Keep the Arabic-first UI direction.
- Keep the project local-first.
- Keep SQLite as local DB and PostgreSQL as remote DB.
- Keep auth session-based unless you have a strong reason and document it.
- Use clean code and consistent naming.
- Any missing feature should be added incrementally.
- Each step must leave the project in a runnable state.
- If you change database schema, update seed and docs.
- If you add a dependency, explain why.

Current status summary:
- Core scaffolding exists.
- Authentication foundations now exist.
- Roles/permissions DB models and UI exist.
- CRUD coverage is good for users, roles, permissions, employees, wallets, packages, templates, subscribers.
- Messaging/import/sync are partially scaffolded.
- Setup/bootstrap scripts now exist.

Main missing priorities:
1. CRUD for subscriber contacts and more conservative transaction/invoice mutations
2. Real WhatsApp / Telegram integration
3. Better import parsers and preview workflow
4. Better invoice publishing and message sending flow
5. Electron wrapper and desktop build pipeline
6. Tests and production hardening

Implementation order you should follow:
Phase 1:
- Add CRUD for subscriber contacts
- Add phone/channel preferences to invoice sending flow
- Add permission-aware action buttons in UI

Phase 2:
- Improve transaction/invoice edit/cancel flow with reversible accounting logic
- Add better validations and referential guards

Phase 3:
- Improve import pipeline
- Add fuzzy matching for subscriber lookup
- Add preview approval flow and conflict resolution

Phase 4:
- Integrate real messaging providers
- Add message retry and failure handling

Phase 5:
- Add Electron wrapper
- Make desktop build runnable

Phase 6:
- Add tests and deployment guidance

Important:
- Generate ready-to-copy files.
- Work in small phases.
- List files before writing them.
- Keep documentation updated.
```


## تحديث الحالة الحالية
- تم تنفيذ CRUD لجهات الاتصال الخاصة بالمشتركين.
- تم تنفيذ اختيار جهة الاتصال المناسبة للإرسال بحسب القناة.
- تم منع الإرسال إذا كانت قناة الفاتورة = NONE مع تسجيل MessageLog من نوع SKIPPED.
- تمت إضافة scaffold فعلي لنسخة Electron داخل مجلد `electron/`.
- الأولوية التالية: تعديل/إلغاء العمليات والفواتير بطريقة محاسبية آمنة + اختبارات + تكامل رسائل حقيقي.
