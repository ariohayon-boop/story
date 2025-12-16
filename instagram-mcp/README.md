# 🚀 STORIT Instagram MCP Server

**Instagram MCP Server** עבור פלטפורמת STORIT - אימות אוטומטי של סטוריז באינסטגרם בזמן אמת.

---

## 📋 מה זה עושה?

ה-MCP Server מאפשר ל-Claude לבדוק, לאמת ולנתח סטוריז באינסטגרם באופן אוטומטי:

✅ **בדיקה אוטומטית** - כל 5 דקות בודק submissions חדשים  
✅ **אימות חכם** - מוודא שהסטורי מתייג את העסק הנכון  
✅ **ספירת צפיות** - מודד ROI אמיתי  
✅ **אנליטיקס מלא** - נתונים לבעלי עסקים  
✅ **שילוב עם Claude** - כל הכוח דרך שיחה טבעית

---

## 🛠️ התקנה

### דרישות מקדימות

- **Node.js** >= 18.0.0
- **npm** או **yarn**
- חשבון **Supabase** (יש לך כבר!)
- חשבון **Instagram Business** + **Facebook App**

### שלב 1: הורדה והתקנה

```bash
# Clone הפרויקט
cd instagram-mcp

# התקן dependencies
npm install

# העתק את קובץ ה-.env לדוגמה
cp .env.example .env
```

### שלב 2: הגדרת Environment Variables

ערוך את הקובץ `.env` והוסף את הפרטים שלך:

```env
# Supabase (יש לך כבר!)
SUPABASE_URL=https://xrbzofqgyukkdjwumdft.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Instagram (צריך להשיג - ראה הוראות למטה)
INSTAGRAM_ACCESS_TOKEN=your_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id_here

# הגדרות נוספות (אופציונלי)
CHECK_INTERVAL=300000  # 5 דקות
LOG_LEVEL=info
ENABLE_AUTOMATION=true
```

---

## 🔑 איך להשיג Instagram Access Token?

### שלב 1: יצירת Facebook App

1. לך ל-[Facebook Developers](https://developers.facebook.com)
2. לחץ על **"My Apps"** → **"Create App"**
3. בחר **"Business"** כסוג האפליקציה
4. מלא פרטים בסיסיים (שם האפליקציה, אימייל)

### שלב 2: הוספת Instagram Graph API

1. בתוך ה-App, לחץ על **"Add Product"**
2. מצא **"Instagram Graph API"** ולחץ **"Set Up"**
3. עקוב אחרי ההוראות

### שלב 3: חיבור Instagram Business Account

1. ה-Instagram Account שלך צריך להיות **Business Account**
2. ה-Business Account צריך להיות מחובר ל-**Facebook Page**
3. ב-Facebook Developers, לך ל-**Instagram → Basic Display**
4. הוסף את ה-Instagram Account

### שלב 4: קבלת Access Token

#### אופציה A: Graph API Explorer (קל ומהיר)

1. לך ל-[Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. בחר את ה-App שלך
3. בחר **Permissions**: `instagram_basic`, `instagram_manage_insights`
4. לחץ **"Generate Access Token"**
5. **⚠️ זה Short-lived Token!** תצטרך להמיר ל-Long-lived

#### אופציה B: Long-lived Access Token (מומלץ)

כשיש לך Short-lived Token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

זה ייתן לך Long-lived Token שמחזיק 60 יום.

### שלב 5: קבלת Instagram Business Account ID

```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"
```

זה ייתן לך רשימת Pages. מצא את ה-Page שמחובר ל-Instagram ואז:

```bash
curl -X GET "https://graph.facebook.com/v18.0/{PAGE_ID}?fields=instagram_business_account&access_token=YOUR_ACCESS_TOKEN"
```

ה-`instagram_business_account.id` הוא מה שאתה צריך!

---

## 🧪 בדיקה שהכל עובד

```bash
npm test
```

התוכנית תבדוק:
- ✅ חיבור ל-Supabase
- ✅ חיבור ל-Instagram API
- ✅ קריאת עסקים מהמערכת
- ✅ קריאת submissions
- ✅ חיפוש סטוריז (דוגמה)

אם הכל עובד - אתה מוכן! 🎉

---

## ▶️ הפעלה

### הפעלה רגילה

```bash
npm start
```

### הפעלה עם auto-restart (development)

```bash
npm run dev
```

### מה קורה כשמפעילים?

1. ✅ המערכת מתחברת ל-Supabase
2. ✅ המערכת מתחברת ל-Instagram API
3. ✅ **אוטומציה מתחילה לרוץ** (כל 5 דקות)
4. ✅ ה-MCP Server מתחיל להאזין ל-Claude

---

## 🔌 חיבור ל-Claude

### אופציה 1: Claude Desktop (מומלץ)

ערוך את `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "storit-instagram": {
      "command": "node",
      "args": ["/path/to/instagram-mcp/src/index.js"],
      "env": {
        "SUPABASE_URL": "https://xrbzofqgyukkdjwumdft.supabase.co",
        "SUPABASE_ANON_KEY": "your_key_here",
        "INSTAGRAM_ACCESS_TOKEN": "your_token_here",
        "INSTAGRAM_BUSINESS_ACCOUNT_ID": "your_id_here"
      }
    }
  }
}
```

### אופציה 2: Claude CLI

```bash
claude mcp add storit-instagram node /path/to/instagram-mcp/src/index.js
```

---

## 🛠️ כלים זמינים ל-Claude

### 1. `check_story_status`

בדוק סטטוס של submission ספציפי.

**דוגמה:**
```
Claude, בדוק את הסטטוס של submission עם ID: 123e4567-e89b-12d3-a456-426614174000
```

**מה זה מחזיר:**
- האם הסטורי קיים
- האם מתויג נכון
- כמה צפיות
- URL של הסטורי

---

### 2. `get_pending_submissions`

קבל רשימה של כל ה-submissions שממתינים לאימות.

**דוגמה:**
```
Claude, תראה לי את כל ה-submissions שממתינים לאימות
```

**פרמטרים אופציונליים:**
- `businessId` - סנן לפי עסק ספציפי

---

### 3. `verify_submission`

אשר submission באופן ידני.

**דוגמה:**
```
Claude, אשר את submission 123e4567-e89b-12d3-a456-426614174000 עם 500 צפיות
```

**פרמטרים:**
- `submissionId` (חובה)
- `views` (אופציונלי)
- `confidence` (אופציונלי, 0-100)
- `storyUrl` (אופציונלי)

---

### 4. `reject_submission`

דחה submission.

**דוגמה:**
```
Claude, דחה את submission 123e4567-e89b-12d3-a456-426614174000 כי הסטורי לא מתייג את העסק
```

---

### 5. `get_story_analytics`

קבל אנליטיקס מפורט של עסק.

**דוגמה:**
```
Claude, תן לי אנליטיקס של העסק הזה בשבוע האחרון
```

**פרמטרים:**
- `businessId` (חובה)
- `timeframe`: `all`, `today`, `week`, `month`

**מה זה מחזיר:**
- סה"כ סטוריז
- סה"כ צפיות
- ROI מחושב
- צפיות לכל ₪

---

### 6. `get_all_businesses`

קבל רשימה של כל העסקים הפעילים.

**דוגמה:**
```
Claude, הצג לי את כל העסקים במערכת
```

---

### 7. `search_instagram_story`

חפש סטורי ספציפי באינסטגרם.

**דוגמה:**
```
Claude, חפש סטורי של המשתמש john_doe שמתייג את @bar_tlv
```

**פרמטרים:**
- `username` (חובה)
- `businessHandle` (חובה)

---

### 8. `monitor_submissions_realtime`

התחל ניטור בזמן אמת.

**דוגמה:**
```
Claude, תתחיל לנטר submissions בזמן אמת, תבדוק כל 5 דקות למשך שעה
```

**פרמטרים:**
- `intervalMinutes` (ברירת מחדל: 5)
- `maxIterations` (ברירת מחדל: 12 = שעה)
- `businessId` (אופציונלי)

---

### 9. `check_stale_submissions`

בדוק submissions שממתינים יותר מדי זמן.

**דוגמה:**
```
Claude, תמצא לי submissions שממתינים יותר מ-24 שעות
```

---

### 10. `start_automation` / `stop_automation`

הפעל או עצור את מנוע האוטומציה.

**דוגמה:**
```
Claude, תפעיל את האוטומציה
Claude, תעצור את האוטומציה
```

---

### 11. `get_automation_stats`

קבל סטטיסטיקות של האוטומציה.

**דוגמה:**
```
Claude, תראה לי סטטיסטיקות של האוטומציה
```

**מה זה מחזיר:**
- כמה בדיקות רצו
- כמה submissions אומתו/נדחו
- האם האוטומציה רצה כרגע

---

## 💬 שאלות נפוצות

### ❓ האוטומציה לא מאמתת סטוריז אוטומטית?

**בעיה ידועה:** Instagram Graph API דורש הרשאות מיוחדות לחיפוש סטוריז של משתמשים אחרים. 

**פתרונות:**

1. **שימוש ב-Instagram Mentions API** - מחייב Instagram Business Account עם גישה מתקדמת
2. **שימוש ב-Webhooks** - Instagram שולח התראה כשמישהו מתייג אותך
3. **גישה ידנית** - המשתמשים שולחים צילום מסך (השיטה הנוכחית)

### ❓ איך מתחדשים Tokens שפגים?

Long-lived Tokens מחזיקים 60 יום. תצטרך לחדש אותם ידנית.

**פתרון עתידי:** נוסיף מערכת אוטומטית לחידוש tokens.

### ❓ מה קורה אם הסטורי נמחק לפני 24 שעות?

האוטומציה בודקת אם הסטורי עדיין קיים. אם נמחק לפני 24 שעות - הסטטוס משתנה ל-`rejected`.

### ❓ האם זה עובד עם Instagram Personal Accounts?

**לא.** צריך Instagram **Business Account** שמחובר ל-Facebook Page.

### ❓ כמה זה עולה?

- **Instagram Graph API** - חינם!
- **Supabase** - יש לך כבר
- **Node.js Server** - רץ local (חינם) או על VPS (~$5/חודש)

---

## 📊 מבנה הקבצים

```
instagram-mcp/
├── package.json              # Dependencies
├── .env.example             # דוגמה להגדרות
├── README.md                # זה!
├── src/
│   ├── index.js            # MCP Server ראשי
│   ├── instagram-api.js    # Instagram Graph API
│   ├── supabase-client.js  # Supabase Database
│   ├── automation.js       # מנוע אוטומציה
│   ├── tools/              # כלים ל-Claude
│   │   ├── check-story.js
│   │   ├── verify-submission.js
│   │   ├── get-analytics.js
│   │   └── monitor-realtime.js
│   └── utils/
│       ├── logger.js       # מערכת לוגים
│       └── validators.js   # בדיקות קלט
└── tests/
    └── test-api.js         # בדיקות אוטומטיות
```

---

## 🐛 פתרון בעיות

### בעיה: `ECONNREFUSED` כשמתחבר ל-Supabase

**פתרון:** בדוק שה-URL וה-Key נכונים ב-`.env`

### בעיה: `Invalid access token` מ-Instagram

**פתרון:** 
1. בדוק שה-token לא פג (60 יום)
2. חדש את ה-token
3. ודא שיש לך את ההרשאות הנכונות

### בעיה: `No stories found`

**פתרון:**
1. ודא שהמשתמש באמת העלה סטורי
2. ודא שהסטורי עדיין לא נמחק (24 שעות)
3. ודא שהמשתמש באמת תייג את העסק

### בעיה: האוטומציה לא רצה

**פתרון:** ודא ש-`ENABLE_AUTOMATION=true` ב-`.env`

---

## 🚀 השלבים הבאים

### גרסה 1.1 (מתוכנן)

- [ ] Webhooks מ-Instagram (אימות מיידי)
- [ ] חידוש אוטומטי של Access Tokens
- [ ] מערכת התראות (Slack/Email)
- [ ] דשבורד Web לניטור
- [ ] תמיכה במספר Business Accounts

### גרסה 2.0 (חלום)

- [ ] Machine Learning לזיהוי תיוגים
- [ ] תמיכה ב-TikTok, Facebook
- [ ] אנליטיקס מתקדם + תחזיות
- [ ] API ציבורי לשילוב חיצוני

---

## 🤝 תרומה

רוצה לעזור? מעולה!

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. פתח Pull Request

---

## 📞 צור קשר

**אריאל אוחיון** - מייסד STORIT

- 📧 Email: [your-email@example.com]
- 💼 LinkedIn: [your-linkedin]
- 🌐 Website: https://story-seven-psi.vercel.app

---

## 📄 רישיון

MIT License - עשה מה שאתה רוצה עם הקוד! 

---

## ❤️ תודות

- **Anthropic** על Claude וה-MCP Protocol
- **Supabase** על Database + Edge Functions מדהימים
- **Instagram** על ה-Graph API
- **הקהילה** שתומכת ב-STORIT

---

**🎉 בהצלחה עם STORIT! אם יש שאלות - פנה אלי בכל עת.**
