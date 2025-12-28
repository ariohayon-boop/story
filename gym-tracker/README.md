# 💪 GymTracker - אפליקציית מעקב אימונים

אפליקציית PWA לניהול ומעקב אימוני כושר. עובדת גם אופליין!

![GymTracker](https://via.placeholder.com/800x400/4F46E5/ffffff?text=GymTracker)

## ✨ פיצ'רים

- 📱 **PWA** - התקנה על הטלפון כאפליקציה
- 🔄 **עבודה אופליין** - תעד אימונים גם בלי אינטרנט
- ⏱️ **טיימר אימון** - מעקב זמן בזמן אמת
- 📊 **סטטיסטיקות** - גרפים וניתוח התקדמות
- 🏆 **שיאים אישיים** - מעקב אוטומטי אחרי PRs
- 🌙 **מצב כהה** - עיצוב לילה נוח לעיניים
- 📋 **70+ תרגילים** - בנק תרגילים מובנה
- ➕ **תרגילים מותאמים** - הוספת תרגילים משלך

## 🚀 התקנה

### דרישות מקדימות

1. חשבון [Supabase](https://supabase.com/) (חינמי)
2. חשבון [Vercel](https://vercel.com/) (חינמי)

### שלב 1: הגדרת Supabase

1. צור פרויקט חדש ב-Supabase
2. לך ל **SQL Editor**
3. העתק את כל התוכן מ `supabase/schema.sql`
4. הרץ את ה-SQL
5. לך ל **Settings → API** והעתק:
   - `Project URL`
   - `anon public` key

### שלב 2: הגדרת הקוד

1. פתח את `js/supabase-client.js`
2. החלף את הערכים:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### שלב 3: העלאה ל-Vercel

1. Push לגיטהאב
2. חבר את הריפו ל-Vercel
3. Deploy! 🎉

### שלב 4: התקנה על הטלפון

1. פתח את האתר בדפדפן
2. לחץ על "Add to Home Screen" / "התקן"
3. האפליקציה תופיע כאייקון על המסך

## 📁 מבנה הפרויקט

```
gym-tracker/
├── index.html          # מסך בית
├── workout.html        # מסך אימון פעיל
├── exercises.html      # ספריית תרגילים
├── stats.html          # סטטיסטיקות
├── settings.html       # הגדרות
├── manifest.json       # PWA manifest
├── service-worker.js   # אופליין support
├── css/
│   ├── main.css        # סטיילים גלובליים
│   └── workout.css     # סטיילים לדף אימון
├── js/
│   ├── app.js              # לוגיקה ראשית
│   ├── supabase-client.js  # חיבור ל-DB
│   ├── storage-manager.js  # אופליין וסנכרון
│   └── workout-manager.js  # ניהול אימון פעיל
├── supabase/
│   └── schema.sql      # מבנה הטבלאות
└── assets/
    └── icons/          # אייקונים ל-PWA
```

## 🎨 עיצוב

### ערכת צבעים Light Mode
- Primary: `#4F46E5` (Indigo)
- Secondary: `#10B981` (Green)
- Background: `#F9FAFB`

### ערכת צבעים Dark Mode
- Primary: `#6366F1` (Lighter Indigo)
- Secondary: `#34D399` (Lighter Green)
- Background: `#0F172A`

## 📱 שימוש

### התחלת אימון
1. לחץ על "התחל אימון"
2. בחר תרגילים מהרשימה
3. לחץ "התחל"
4. הזן משקל, חזרות, ו-RPE לכל סט
5. סמן ✓ כשמסיים סט
6. לחץ "סיים אימון"

### הוספת תרגיל מותאם
1. בדף בחירת תרגילים
2. לחץ "הוסף תרגיל מותאם אישית"
3. מלא שם וקבוצת שרירים
4. התרגיל יישמר גם מקומית וגם בענן

## 🔧 פיתוח

### הרצה מקומית
```bash
# אפשר להשתמש בכל שרת HTTP פשוט
npx serve .
# או
python -m http.server 8000
```

### Debug
- פתח Developer Tools (F12)
- בדוק את הלוג ב-Console
- בדוק את ה-Network לבקשות API
- בדוק Application → Service Workers

## 📈 פיצ'רים עתידיים

- [ ] מסך סטטיסטיקות מלא
- [ ] מסך הגדרות
- [ ] ייצוא נתונים (CSV/JSON)
- [ ] Push notifications להזכרת אימון
- [ ] תבניות אימונים
- [ ] שיתוף תוצאות

## 🐛 Known Issues

- Service Worker עלול לא לעבוד ב-localhost ללא HTTPS
- חלק מהדפדפנים לא תומכים ב-PWA install

## 📄 License

MIT License - תרגיש חופשי להשתמש ולשנות!

---

נבנה עם ❤️ לאימונים טובים יותר
