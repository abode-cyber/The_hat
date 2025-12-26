# نشر موقع The Hat Restaurant على Render

هذا الدليل سيساعدك في نشر الموقع على منصة Render بسهولة.

## الخطوات:

1. **رفع الملفات على GitHub:**
   - قم بفك ضغط الملف المرفق.
   - ارفع جميع الملفات إلى مستودع (Repository) جديد على GitHub.

2. **الإعداد في Render:**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com/).
   - اضغط على **New +** واختر **Static Site**.
   - اربط حسابك بـ GitHub واختر المستودع الذي رفعته.

3. **إعدادات البناء (Build Settings):**
   - **Name:** (اختر أي اسم، مثلاً: the-hat-restaurant)
   - **Branch:** main (أو master حسب ما سميته)
   - **Root Directory:** (اتركه فارغاً)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **الضغط على Create Static Site:**
   - سيبدأ Render في بناء الموقع، وسيصبح جاهزاً خلال دقائق.

## ملاحظة هامة عن Firebase:
تأكد من أن ملف `client/src/lib/firebase.ts` يحتوي على إعدادات Firebase الصحيحة الخاصة بك. إذا كنت تستخدم مشروع Firebase جديد، قد تحتاج لتحديث مفاتيح API في هذا الملف.
