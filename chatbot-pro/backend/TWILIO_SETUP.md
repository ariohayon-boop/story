# 📱 מדריך הגדרת Twilio WhatsApp API

## 🎯 סקירה כללית

Twilio הוא ספק רשמי של Meta ל-WhatsApp Business API.
היתרונות: יציב, חוקי, תמיכה טובה, קל לשימוש.

---

## 📋 שלב 1: יצירת חשבון Twilio

1. לך ל-[twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. הירשם עם אימייל
3. אמת את הטלפון שלך
4. תקבל **$15 קרדיט חינם** לבדיקות

---

## 🔑 שלב 2: קבלת API Credentials

בדשבורד של Twilio תמצא:

| פרט | איפה למצוא |
|-----|-----------|
| **Account SID** | בדף הבית, מתחיל ב-`AC...` |
| **Auth Token** | בדף הבית, לחץ "Show" לחשיפה |

**שמור אותם! תצטרך אותם ב-Supabase.**

---

## 📱 שלב 3: הפעלת WhatsApp Sandbox (לבדיקות)

### למצב פיתוח/בדיקות:

1. בתפריט הצד: **Messaging** → **Try it out** → **Send a WhatsApp message**

2. תראה הוראות לחיבור ה-Sandbox:
   - שלח הודעה מהטלפון שלך ל: `+1 415 523 8886`
   - עם הטקסט: `join <your-code>` (הקוד יופיע על המסך)

3. עכשיו אתה יכול לשלוח ולקבל הודעות WhatsApp!

### מספר ה-Sandbox:
```
whatsapp:+14155238886
```

---

## 🔗 שלב 4: הגדרת Webhook

1. בתפריט: **Messaging** → **Try it out** → **Send a WhatsApp message**

2. גלול למטה ל-**Sandbox Configuration**

3. בשדה **When a message comes in** הכנס:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/handle-twilio-webhook
   ```

4. Method: **HTTP POST**

5. לחץ **Save**

---

## ⚙️ שלב 5: הגדרת Supabase Edge Function

### משתני סביבה נדרשים:

ב-Supabase Dashboard → Settings → Edge Functions → Secrets:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLAUDE_API_KEY=your_anthropic_api_key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### פריסת ה-Edge Function:

```bash
# התקנת Supabase CLI
npm install -g supabase

# התחברות
supabase login

# פריסה
supabase functions deploy handle-twilio-webhook --project-ref YOUR_PROJECT_REF
```

---

## 🏭 שלב 6: מעבר ל-Production (מספר אמיתי)

### דרישות:
1. חשבון Twilio משודרג (לא Trial)
2. חשבון Meta Business מאומת
3. מספר טלפון ייעודי

### התהליך:

1. **בקשת מספר WhatsApp:**
   - Twilio Console → Messaging → Senders → WhatsApp Senders
   - לחץ "Request a new WhatsApp Sender"

2. **אימות העסק:**
   - Twilio יבקשו מסמכים (ח.פ./רישיון עסק)
   - זמן אישור: 1-5 ימי עסקים

3. **קבלת המספר:**
   - תקבל מספר WhatsApp Business מאומת
   - עדכן את ה-Webhook לכתובת שלך

---

## 💰 תמחור Twilio

### WhatsApp Business API:

| סוג | מחיר |
|-----|------|
| **Conversation (User-initiated)** | ~$0.005 - $0.08 |
| **Conversation (Business-initiated)** | ~$0.03 - $0.15 |
| **מספר WhatsApp** | ~$0 - $1/חודש |

*המחירים משתנים לפי מדינה

### דוגמה לישראל:
- הודעה נכנסת (לקוח שואל) + תשובה = ~$0.04
- 500 שיחות בחודש = ~$20

---

## 🧪 בדיקה

### שלח הודעת בדיקה:

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  -u "YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN" \
  -d "To=whatsapp:+972501234567" \
  -d "From=whatsapp:+14155238886" \
  -d "Body=שלום! זו הודעת בדיקה"
```

---

## 🔍 Troubleshooting

### הודעות לא מגיעות:
1. בדוק שה-Webhook URL נכון
2. בדוק את הלוגים ב-Supabase
3. ודא שה-Sandbox מחובר (שלחת `join <code>`)

### שגיאת 401 Unauthorized:
- בדוק שה-Account SID ו-Auth Token נכונים

### שגיאת 403:
- ודא שהמספר שאתה שולח אליו חיבר את ה-Sandbox

---

## 📁 קבצים רלוונטיים

```
chatbot-pro/
└── backend/
    └── supabase/
        ├── edge-functions/
        │   └── handle-twilio-webhook/
        │       └── index.ts          ← הקוד הראשי
        └── migrations/
            └── add_twilio_fields.sql ← עדכון DB
```

---

## 🔗 קישורים שימושיים

- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com)
- [WhatsApp Pricing](https://www.twilio.com/whatsapp/pricing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**בהצלחה! 🚀**
