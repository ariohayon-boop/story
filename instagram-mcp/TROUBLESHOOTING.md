# 🔧 Troubleshooting Guide - STORIT Instagram MCP

**פתרון בעיות נפוצות ושאלות ותשובות**

---

## 📑 תוכן עניינים

1. [בעיות התקנה](#בעיות-התקנה)
2. [בעיות חיבור](#בעיות-חיבור)
3. [בעיות Instagram API](#בעיות-instagram-api)
4. [בעיות Supabase](#בעיות-supabase)
5. [בעיות אוטומציה](#בעיות-אוטומציה)
6. [בעיות Claude Integration](#בעיות-claude-integration)
7. [שגיאות נפוצות](#שגיאות-נפוצות)

---

## 🔨 בעיות התקנה

### ❌ `npm install` נכשל

**תסמינים:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**פתרון:**
```bash
# נקה cache
npm cache clean --force

# נסה שוב
npm install

# אם עדיין לא עובד, נסה עם --legacy-peer-deps
npm install --legacy-peer-deps
```

---

### ❌ `Cannot find module '@modelcontextprotocol/sdk'`

**תסמינים:**
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**פתרון:**
```bash
# התקן מחדש
npm install @modelcontextprotocol/sdk

# אם לא עובד, בדוק את גרסת Node
node --version  # צריך להיות >= 18.0.0
```

---

## 🌐 בעיות חיבור

### ❌ `ECONNREFUSED` ל-Supabase

**תסמינים:**
```
Error: connect ECONNREFUSED
Failed to connect to Supabase
```

**פתרונות אפשריים:**

1. **בדוק חיבור לאינטרנט:**
```bash
ping google.com
```

2. **בדוק את ה-URL ב-.env:**
```env
SUPABASE_URL=https://xrbzofqgyukkdjwumdft.supabase.co
# ודא שאין רווחים או תווים מיוחדים
```

3. **בדוק ש-Supabase פעיל:**
- לך ל-[Supabase Dashboard](https://app.supabase.com)
- ודא שהפרויקט שלך פעיל

4. **בדוק Firewall:**
```bash
# אם אתה מאחורי Firewall, ודא שפורט 443 פתוח
```

---

### ❌ `Network request failed` כללי

**תסמינים:**
```
Error: Network request failed
```

**פתרון:**
```bash
# בדוק DNS
nslookup xrbzofqgyukkdjwumdft.supabase.co

# נסה עם VPN אחר או כבה VPN
# בדוק proxy settings
```

---

## 📷 בעיות Instagram API

### ❌ `Invalid access token`

**תסמינים:**
```
Instagram API health check failed
Error: Invalid OAuth access token
```

**פתרונות:**

1. **Token פג תוקף (60 יום):**
```bash
# צור token חדש דרך Graph API Explorer:
# https://developers.facebook.com/tools/explorer/

# אחר כך המר ל-Long-lived:
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

2. **הרשאות חסרות:**
- לך ל-Facebook App
- Graph API Explorer
- ודא שיש: `instagram_basic`, `instagram_manage_insights`

3. **Token לא מתאים ל-Business Account:**
```bash
# בדוק שה-token שייך ל-User שמחובר ל-Business Account
curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"
```

---

### ❌ `User does not have permission`

**תסמינים:**
```
Error: (#200) The user hasn't authorized the application
```

**פתרון:**
1. וודא שה-Instagram Account הוא **Business Account**
2. וודא שהוא מחובר ל-**Facebook Page**
3. הרשה את ה-App לגשת ל-Page

```bash
# בדוק חיבור:
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"
```

---

### ❌ `Rate limit exceeded`

**תסמינים:**
```
Error: (#4) Application request limit reached
```

**פתרון:**
```bash
# המתן שעה (200 calls per hour limit)
# או הגדל את CHECK_INTERVAL ב-.env:
CHECK_INTERVAL=600000  # 10 דקות במקום 5
```

**לעתיד:** נוסיף מטמון (cache) להפחתת קריאות.

---

### ❌ `Cannot find story`

**תסמינים:**
```
Story not found
Reason: user_not_found / no_stories / not_tagged
```

**זה לא באג!** זה אומר:
1. המשתמש לא העלה סטורי
2. הסטורי נמחק כבר
3. הסטורי לא מתייג את העסק

**מה לעשות:**
- המתן 5 דקות (הסטורי יכול להיות טרי מדי)
- בדוק ידנית באינסטגרם
- שאל את הלקוח להעלות שוב

---

## 🗄️ בעיות Supabase

### ❌ `Invalid API key`

**תסמינים:**
```
Supabase health check failed
Error: Invalid API key
```

**פתרון:**
```bash
# בדוק ב-Supabase Dashboard:
# Settings → API → anon public / service_role

# ודא שהעתקת נכון (ללא רווחים):
SUPABASE_ANON_KEY=eyJhbGci...
```

---

### ❌ `Row not found`

**תסמינים:**
```
Error: Row not found
```

**פתרון:**
```sql
-- בדוק שהטבלאות קיימות:
SELECT * FROM businesses LIMIT 1;
SELECT * FROM submissions LIMIT 1;

-- בדוק columns:
\d businesses
\d submissions
```

---

### ❌ `Permission denied`

**תסמינים:**
```
Error: new row violates row-level security policy
```

**פתרון:**
```sql
-- ב-Supabase, השבת RLS זמנית או הוסף policies:
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- או צור policy:
CREATE POLICY "Enable all for service role" 
ON submissions 
FOR ALL 
TO service_role 
USING (true);
```

---

## 🤖 בעיות אוטומציה

### ❌ האוטומציה לא מתחילה

**תסמינים:**
```
Server starts but automation doesn't run
```

**פתרון:**
```bash
# בדוק .env:
ENABLE_AUTOMATION=true  # לא false!

# בדוק logs:
tail -f logs/mcp-server.log
```

---

### ❌ האוטומציה לא מוצאת submissions

**תסמינים:**
```
✅ Check completed
Checked: 0
```

**פתרון:**
```sql
-- בדוק שיש submissions עם status='pending':
SELECT * FROM submissions WHERE status = 'pending';

-- אם אין, צור אחד לבדיקה:
INSERT INTO submissions (business_id, username, instagram_followers, status)
VALUES ('your-business-id', 'test_user', 500, 'pending');
```

---

### ❌ האוטומציה תקועה

**תסמינים:**
```
Last run: 2 hours ago
```

**פתרון:**
```bash
# אתחל את השרת:
# Ctrl+C
npm start

# בדוק אם יש שגיאות:
npm start 2>&1 | tee output.log
```

---

## 🤝 בעיות Claude Integration

### ❌ Claude לא מוצא את ה-MCP Server

**תסמינים:**
```
Claude: "I don't have access to those tools"
```

**פתרונות:**

1. **בדוק את config file:**
```bash
# MacOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

2. **ודא שהנתיב מלא:**
```json
{
  "mcpServers": {
    "storit-instagram": {
      "command": "node",
      "args": ["/FULL/ABSOLUTE/PATH/instagram-mcp/src/index.js"]
    }
  }
}
```

3. **אתחל את Claude Desktop:**
- סגור לגמרי
- פתח שוב
- חכה 10 שניות

4. **בדוק שהשרת רץ:**
```bash
# בטרמינל נפרד:
npm start

# צריך לראות:
# "✅ MCP Server is running!"
```

---

### ❌ Claude מקבל שגיאות מה-Tools

**תסמינים:**
```
Claude: "I got an error when trying to use that tool"
```

**פתרון:**
```bash
# בדוק logs:
tail -f logs/mcp-server.log

# או:
npm start  # ותראה את השגיאות ישירות
```

---

### ❌ התגובות איטיות מדי

**תסמינים:**
- Claude לוקח 30+ שניות לענות

**פתרונות:**
1. בדוק את חיבור האינטרנט
2. הפחת את מספר הקריאות ל-API
3. הגדל את Timeout ב-Instagram API

---

## ⚠️ שגיאות נפוצות

### 1. `MODULE_NOT_FOUND`

**פתרון:**
```bash
npm install
```

### 2. `Cannot read property 'X' of undefined`

**פתרון:**
```bash
# בדוק validation
# ודא שכל הפרמטרים קיימים
```

### 3. `Unexpected token`

**פתרון:**
```bash
# בדוק שאתה משתמש ב-Node >= 18
node --version
```

### 4. `EISDIR: illegal operation on a directory`

**פתרון:**
```bash
# בדוק שאתה מפנה לקובץ, לא לתיקייה
# ב-config: /path/to/index.js (לא /path/to/)
```

---

## 🧪 איך לדבג בעיות?

### שלב 1: הפעל במצב Debug

```bash
LOG_LEVEL=debug npm start
```

### שלב 2: בדוק את הלוגים

```bash
# Real-time
tail -f logs/mcp-server.log

# חפש שגיאות
grep -i error logs/mcp-server.log
```

### שלב 3: הרץ Tests

```bash
npm test
```

### שלב 4: בדוק חיבורים ידנית

```bash
# Test Supabase
curl "https://xrbzofqgyukkdjwumdft.supabase.co/rest/v1/businesses?select=*" \
  -H "apikey: YOUR_KEY"

# Test Instagram
curl "https://graph.facebook.com/v18.0/YOUR_ACCOUNT_ID?access_token=YOUR_TOKEN"
```

---

## 💡 טיפים למניעת בעיות

### 1. שמור Backup של Tokens

```bash
# שמור את ה-tokens בקובץ בטוח
cp .env .env.backup
```

### 2. עקוב אחרי תאריכי תפוגה

```bash
# שים תזכורת בלוח שנה לחידוש token כל 50 יום
```

### 3. נטר את המערכת

```bash
# בדוק logs מדי פעם:
tail -f logs/mcp-server.log
```

### 4. עדכן Dependencies

```bash
# כל חודש:
npm outdated
npm update
```

---

## 📞 עדיין תקוע?

אם אף אחד מהפתרונות לא עובד:

1. **צור Issue ב-GitHub** עם:
   - תיאור הבעיה
   - לוגים (ללא sensitive data!)
   - מה ניסית כבר
   - גרסת Node, OS

2. **פנה אלי ישירות:**
   - Email: [your-email]
   - LinkedIn: [your-linkedin]

3. **בדוק שוב את ה-README:**
   - לפעמים מפספסים פרט קטן!

---

**🔧 בהצלחה בפתרון הבעיה! רוב הבעיות פשוטות לתיקון.**
