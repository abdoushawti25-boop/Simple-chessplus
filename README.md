# Simple Chess (Android & Web)

تطبيق شطرنج كلاسيكي خفيف وسريع، مصمم للعمل بسلاسة على الهواتف الذكية (Android) ومتصفح الويب.

## الميزات الأساسية المتوفرة:
1. **رقعة شطرنج قياسية (8x8):** عرض متناسق عالي الدقة مع إحداثيات الأعمدة والصفوف.
2. **قطع الشطرنج:** رسوميات متجهة (SVG) عالية الوضوح لجميع القطع (أبيض وأسود).
3. **تحريك قانوني كامل:**
   * تحديد واختيار القطع.
   * إظهار دوائر النقلات القانونية المتاحة ومؤشرات الأكل.
   * دعم التبييت، والأكل بالمرور، وترقية البيدق (Pawn Promotion).
   * التحقق التلقائي من الكش، والكش مات، والتعادل.
4. **زر New Game (لعبة جديدة):** لإعادة ضبط الرقعة وبدء مباراة جديدة فورياً.
5. **مؤثرات صوتية فيزيائية خفيفة:** نقر النقلات والأكل والكش عبر Web Audio API.
6. **واجهة خفيفة وفورية:** بدون محركات أو ذكاء اصطناعي أو تعقيدات إضافية.

---

## بنية المشروع:
```
simple-chess/
├── src/
│   ├── components/
│   │   └── ChessPiece.tsx     # الرسوميات المتجهة لقطع الشطرنج
│   ├── App.tsx                # الواجهة الرئيسية للرقعة والتحريك وزر New Game
│   ├── main.tsx               # نقطة بدء تطبيق الويب
│   └── index.css              # تنسيقات Tailwind وملاءمة الهاتف
├── android/                   # مشروع Android الأصلي (Capacitor Native)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/simplechess/app/MainActivity.kt
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── res/           # أيقونات التطبيق وثيمات الأندرويد
│   │   │   └── assets/public/ # ملفات التطبيق المجمعة للأندرويد
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradlew
├── capacitor.config.ts
├── package.json
└── vite.config.ts
```

---

## كيفية تشغيل المشروع وتوليد ملف الـ APK:

### 1. تشغيل التطبيق في وضع التطوير (Web):
```bash
npm install
npm run dev
```

### 2. تجهيز وتحديث ملفات الأندرويد:
```bash
npm run build
npx cap copy android
```

### 3. بناء APK باستخدام Android Studio (الأسهل والموصى به):
1. افتح مجلد `android/` داخل برنامج **Android Studio**.
2. انتظر ثوانٍ لاكتمال مزامنة Gradle.
3. من القائمة العلوية اختر **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. ستجد ملف الـ APK الناتج جاهزاً للتثبيت المباشر على الهاتف في المسار:
   `android/app/build/outputs/apk/debug/app-debug.apk`.

### 4. بناء APK عبر سطر الأوامر (CLI):
```bash
cd android
./gradlew assembleDebug
```
