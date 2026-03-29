# Electron Desktop Scaffold

تم في هذه النسخة إضافة scaffold فعلي لسطح المكتب.

## الملفات
- `electron/main.cjs` نقطة دخول Electron
- `electron/preload.cjs` طبقة preload الآمنة
- `electron/dev-runner.mjs` تشغيل وضع التطوير
- `electron/build-desktop.mjs` بناء نسخة التغليف
- `electron/builder.json` إعدادات electron-builder

## أوامر الاستخدام
```bash
npm install
npm run desktop:dev
```

وللتغليف:
```bash
npm run desktop:package
```

## الملاحظات
- `desktop:dev` يحتاج تشغيل محلي بعد تثبيت الحزم.
- `desktop:package` يعتمد على بناء Next.js بوضع `standalone` ثم تغليفه.
- لم يتم إخراج EXE داخل هذه البيئة الحالية؛ هذا يتم على جهازك بعد تثبيت التبعيات.
