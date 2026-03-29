# Desktop / Electron Roadmap

## الحالة الحالية
لم يعد هذا الملف مجرد roadmap فقط. تم إضافة scaffold أولي فعلي داخل مجلد `electron/` يشمل:
- `main.cjs`
- `preload.cjs`
- `dev-runner.mjs`
- `build-desktop.mjs`
- `builder.json`

## ما الذي يفعله الآن؟
- يشغّل Next.js محليًا ثم يفتح نافذة Electron في وضع التطوير.
- يدعم بناء نسخة `standalone` من Next.js لاستخدامها داخل سطح المكتب.
- يجهز الإعدادات الأساسية لـ electron-builder لتغليف نسخة Windows لاحقًا.

## ما الذي ما يزال مطلوبًا بعد ذلك؟
- تثبيت التبعيات محليًا: `electron`, `electron-builder`
- اختبار الإنتاج على ويندوز الفعلي
- إضافة أيقونات التطبيق
- تخصيص التوقيع والتغليف الإنتاجي إذا لزم
