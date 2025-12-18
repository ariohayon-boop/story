# 📡 מדריך התקנת Instagram Webhooks - STORIT

## 🎯 מטרה

מדריך מלא להתקנת Webhooks של Instagram שישלחו לנו התראות אוטומטיות כשמישהו מתייג עסק בסטורי.

**מה זה נותן לנו?**
- אימות אוטומטי של סטוריז ללא צילומי מסך
- ספירת צפיות בזמן אמת
- חוויית משתמש טובה יותר

---

## ✅ דרישות מוקדמות

לפני שמתחילים, וודא שיש לך:

- [ ] Facebook App (App ID: `2700329290344167`)
- [ ] גישה ל-Facebook for Developers
- [ ] גישה ל-Supabase Dashboard
- [ ] Edge Function פעילה (`instagram-webhook`)

---

## 📋 שלב 1: הכנת ה-Edge Function

### 1.1 וידוא שהפונקציה קיימת

הקובץ `supabase/functions/instagram-webhook/index.ts` כבר נוצר.

### 1.2 Deploy ל-Supabase

```bash
# התקן Supabase CLI אם עדיין אין
npm install -g supabase

# התחבר לפרויקט
supabase login
supabase link --project-ref xrbzofqgyukkdjwumdft

# Deploy את הפונקציה
supabase functions deploy instagram-webhook
```

### 1.3 הוסף Environment Variables ב-Supabase

לך ל-Supabase Dashboard → Settings → Edge Functions → Environment Variables

הוסף:
```
WEBHOOK_VERIFY_TOKEN = storit_webhook_secret_2025
FB_APP_ID = 2700329290344167
FB_APP_SECRET = 1871c8ff5e6f6bf82886eb63083a77b8
```

### 1.4 בדיקה שהפונקציה רצה

פתח בדפדפן או עם curl:
```
https://xrbzofqgyukkdjwumdft.supabase.co/functions/v1/instagram-webhook?hub.mode=subscribe&hub.verify_token=storit_webhook_secret_2025&hub.challenge=test123
```

**תוצאה צפויה:** `test123`

---

## 📋 שלב 2: הגדרת Facebook App

### 2.1 כניסה ל-Facebook Developers

1. לך ל: https://developers.facebook.com/apps/2700329290344167/
2. התחבר עם חשבון Facebook שהוא מנהל של האפליקציה

### 2.2 הוספת Instagram Product

1. בתפריט השמאלי לחץ על **"Add Product"** (➕)
2. חפש **"Instagram"**
3. לחץ **"Set Up"** ליד Instagram Basic Display או Instagram API

### 2.3 הגדרת Webhooks

1. בתפריט השמאלי לחץ על **"Webhooks"**
2. אם לא קיים, לחץ **"Add Product"** והוסף Webhooks
3. בדרופדאון בחר **"Instagram"**
4. לחץ על **"Subscribe to this object"**

---

## 📋 שלב 3: רישום ה-Webhook

### 3.1 הגדרות ה-Webhook

בחלון שנפתח, מלא:

| שדה | ערך |
|-----|-----|
| **Callback URL** | `https://xrbzofqgyukkdjwumdft.supabase.co/functions/v1/instagram-webhook` |
| **Verify Token** | `storit_webhook_secret_2025` |

### 3.2 לחץ "Verify and Save"

אם הכל תקין, תראה הודעת הצלחה ירוקה ✅

### 3.3 Subscribe to Fields

לאחר שה-Webhook נוצר בהצלחה, לחץ על **"Subscribe"** ליד השדות הבאים:

- [x] `mentions` - כשמישהו מתייג את העסק בסטורי
- [x] `story_insights` - צפיות בסטורי

---

## 📋 שלב 4: הוספת טבלת instagram_mentions

צריך להוסיף טבלה חדשה ב-Supabase. לך ל-SQL Editor והרץ:

```sql
-- Create instagram_mentions table
CREATE TABLE IF NOT EXISTS instagram_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT REFERENCES businesses(business_id),
  submission_id UUID REFERENCES submissions(id),
  media_id TEXT NOT NULL,
  user_id TEXT,
  username TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  story_url TEXT,
  raw_webhook_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentions_media_id ON instagram_mentions(media_id);
CREATE INDEX IF NOT EXISTS idx_mentions_business_id ON instagram_mentions(business_id);
CREATE INDEX IF NOT EXISTS idx_mentions_processed ON instagram_mentions(processed);

-- Add new columns to businesses table for Instagram OAuth
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
ADD COLUMN IF NOT EXISTS instagram_account_id TEXT,
ADD COLUMN IF NOT EXISTS instagram_username TEXT,
ADD COLUMN IF NOT EXISTS token_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;
```

---

## 📋 שלב 5: בדיקות

### 5.1 בדיקת Verification

פתח את הכתובת בדפדפן:
```
https://xrbzofqgyukkdjwumdft.supabase.co/functions/v1/instagram-webhook?hub.mode=subscribe&hub.verify_token=storit_webhook_secret_2025&hub.challenge=TESTCHALLENGE123
```

**תוצאה צפויה:** `TESTCHALLENGE123`

### 5.2 בדיקת Webhook עם cURL

```bash
curl -X POST \
  https://xrbzofqgyukkdjwumdft.supabase.co/functions/v1/instagram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "123456789",
      "time": 1234567890,
      "changes": [{
        "field": "mentions",
        "value": {
          "media_id": "test_media_123"
        }
      }]
    }]
  }'
```

**תוצאה צפויה:** `{"success":true,"message":"Webhook processed"}`

### 5.3 בדיקת Logs ב-Supabase

1. לך ל-Supabase Dashboard
2. לחץ על **"Edge Functions"** בתפריט
3. בחר את `instagram-webhook`
4. לחץ על **"Logs"**
5. תראה את כל ה-requests וה-logs

---

## 🐛 Troubleshooting

### בעיה: Verification נכשל

**סימפטום:** Facebook מחזיר שגיאה בעת ניסיון לאמת את ה-Webhook

**פתרונות:**
1. וודא שה-Verify Token זהה בדיוק: `storit_webhook_secret_2025`
2. וודא שה-Edge Function פועלת (בדוק ב-Supabase Dashboard)
3. בדוק שה-URL נכון ונגיש מבחוץ

### בעיה: לא מקבל webhooks

**סימפטום:** אין logs של webhooks נכנסים

**פתרונות:**
1. וודא שלחצת "Subscribe" על השדות הנכונים (mentions, story_insights)
2. וודא שהאפליקציה ב-Facebook היא במצב "Live" ולא "Development"
3. בדוק שיש חשבון Instagram Business מחובר

### בעיה: שגיאות בעיבוד

**סימפטום:** ה-Webhook מתקבל אבל יש שגיאות

**פתרונות:**
1. בדוק את ה-Logs ב-Supabase
2. וודא שטבלת `instagram_mentions` קיימת
3. וודא שכל ה-Environment Variables מוגדרים

---

## 📊 מה קורה אחרי ההתקנה?

כשהכל מותקן נכון, זה מה שקורה:

```
1. מישהו מפרסם סטורי שמתייג @bar_tlv
        ⬇️
2. Instagram שולח webhook ל-Edge Function שלנו
        ⬇️
3. המערכת מקבלת את ה-media_id
        ⬇️
4. שואלת את Instagram על פרטי הסטורי
        ⬇️
5. מחפשת submission תואם ב-Database
        ⬇️
6. מעדכנת אוטומטית ל-'verified'
        ⬇️
7. שומרת את מספר הצפיות
```

**הכל אוטומטי! 🎉**

---

## 🔒 אבטחה

### Verify Token

ה-Verify Token משמש לאימות ש-Facebook הוא זה ששולח את ה-Webhooks. 
**לעולם אל תשתף את ה-Token הזה!**

### App Secret

ה-App Secret משמש לחתימה על הבקשות. שמור אותו בסוד!

```
App Secret: 1871c8ff5e6f6bf82886eb63083a77b8
```

### Environment Variables

כל המפתחות הרגישים צריכים להיות ב-Environment Variables ולא בקוד!

---

## 📞 תמיכה

אם יש בעיות:

1. בדוק את ה-Logs ב-Supabase
2. בדוק את ה-Webhooks Dashboard ב-Facebook
3. פנה לאריאל (המייסד)

---

**נוצר ב-** December 2024  
**עודכן לאחרונה:** December 2024  
**גרסה:** 1.0
