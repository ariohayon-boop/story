# ⚡ Quick Start Guide - STORIT Instagram MCP

**התחל תוך 5 דקות!**

---

## 📦 התקנה מהירה

```bash
# 1. התקן dependencies
npm install

# 2. העתק .env
cp .env.example .env

# 3. ערוך .env עם הפרטים שלך
nano .env  # או vim, או code

# 4. בדוק שהכל עובד
npm test

# 5. הרץ!
npm start
```

---

## 🔑 מה צריך להכין?

### יש לך כבר:
- ✅ Supabase URL + Keys
- ✅ Database Tables (businesses, submissions)

### צריך להשיג:
- ❌ Instagram Access Token
- ❌ Instagram Business Account ID

---

## 🚀 קבלת Instagram Credentials - גרסה מהירה

### שלב 1: Facebook App (5 דקות)
1. [Facebook Developers](https://developers.facebook.com) → Create App
2. Select **Business** → Fill details
3. Add Product → **Instagram Graph API**

### שלב 2: Access Token (3 דקות)
1. [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Get Token → Add permissions: `instagram_basic`, `instagram_manage_insights`
4. **Copy the token!**

### שלב 3: Long-lived Token (2 דקות)

```bash
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

### שלב 4: Get Instagram Account ID (2 דקות)

```bash
# Get your Pages
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"

# Get Instagram Account from Page
curl "https://graph.facebook.com/v18.0/{PAGE_ID}?fields=instagram_business_account&access_token=YOUR_TOKEN"
```

---

## ⚙️ הגדרת .env

```env
# Supabase (יש לך!)
SUPABASE_URL=https://xrbzofqgyukkdjwumdft.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Instagram (השג עכשיו!)
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000000

# הגדרות (אופציונלי)
CHECK_INTERVAL=300000
ENABLE_AUTOMATION=true
LOG_LEVEL=info
```

---

## 🧪 בדיקה

```bash
npm test
```

**אמור לראות:**
```
✅ Supabase connected successfully
✅ Instagram API connected successfully
✅ Found X active businesses
✅ Found X pending submissions
```

---

## ▶️ הרצה

```bash
npm start
```

**אמור לראות:**
```
🚀 Starting STORIT Instagram MCP Server...
✅ Supabase connected
✅ Instagram API connected
🤖 Automation engine started
✅ MCP Server is running!
Waiting for tool calls from Claude...
```

---

## 🔌 חיבור ל-Claude

### MacOS/Linux

ערוך: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "storit-instagram": {
      "command": "node",
      "args": ["/FULL/PATH/TO/instagram-mcp/src/index.js"],
      "env": {
        "SUPABASE_URL": "https://xrbzofqgyukkdjwumdft.supabase.co",
        "SUPABASE_ANON_KEY": "your_key",
        "INSTAGRAM_ACCESS_TOKEN": "your_token",
        "INSTAGRAM_BUSINESS_ACCOUNT_ID": "your_id"
      }
    }
  }
}
```

### Windows

ערוך: `%APPDATA%\Claude\claude_desktop_config.json`

*(אותו תוכן)*

---

## ✅ בדיקה ש-Claude מחובר

פתח Claude Desktop ונסה:

```
Claude, תראה לי את כל העסקים במערכת STORIT
```

אם Claude משתמש ב-tool `get_all_businesses` - **הצלחת!** 🎉

---

## 💡 דוגמאות שימוש

### בדוק submission ספציפי
```
Claude, בדוק את הסטטוס של submission עם ID: [paste-id-here]
```

### קבל pending submissions
```
Claude, תראה לי את כל ה-submissions שממתינים לאימות
```

### קבל אנליטיקס
```
Claude, תן לי אנליטיקס של העסק [business-name] מהשבוע האחרון
```

### התחל ניטור
```
Claude, תתחיל לנטר submissions בזמן אמת
```

---

## 🐛 בעיות נפוצות

### ❌ "Instagram API health check failed"

**פתרון:**
1. בדוק ש-Access Token תקין
2. בדוק שיש לך את ההרשאות הנכונות
3. ודא שה-Business Account ID נכון

### ❌ "Supabase connection failed"

**פתרון:**
1. בדוק את ה-URL וה-Keys ב-.env
2. ודא שיש חיבור אינטרנט
3. נסה להיכנס ל-Supabase dashboard ידנית

### ❌ "No tools found" ב-Claude

**פתרון:**
1. ודא שה-server רץ (`npm start`)
2. בדוק את נתיב הקובץ ב-config
3. אתחל את Claude Desktop

---

## 📚 לקריאה נוספת

- **README המלא** - `README.md`
- **API Docs** - `docs/API.md` (בקרוב)
- **Troubleshooting** - `docs/TROUBLESHOOTING.md` (בקרוב)

---

## 🎯 Next Steps

עכשיו שהכל עובד:

1. ✅ נסה את כל ה-tools עם Claude
2. ✅ בדוק שהאוטומציה מאמתת submissions
3. ✅ התאם את ההגדרות ב-.env לצרכים שלך
4. ✅ התחל להשתמש בייצור!

---

**🚀 מוכן לעבוד? בהצלחה!**

נתקעת? שאל אותי (אריאל) או תיצור Issue ב-GitHub.
