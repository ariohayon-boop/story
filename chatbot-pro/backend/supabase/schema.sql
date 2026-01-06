-- ============================================
-- ChatBot Pro - Database Schema
-- מערכת בוט וואטסאפ עם דשבורד לניהול
-- ============================================

-- הפעלת UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- טבלת עסקים (businesses)
-- כל עסק שמשתמש במערכת
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- פרטי העסק
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  
  -- פרטי WhatsApp (מ-Evolution API)
  whatsapp_number TEXT,              -- מספר הווצאפ של העסק
  evolution_instance_id TEXT,         -- ID של ה-instance ב-Evolution
  evolution_instance_token TEXT,      -- Token לאימות
  
  -- תוכנית ומצב
  plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  
  -- אינטגרציות
  google_calendar_id TEXT,            -- לקביעת פגישות
  google_refresh_token TEXT,          -- לחידוש גישה ל-Calendar
  
  -- הגדרות הבוט
  bot_name TEXT DEFAULT 'עוזר וירטואלי',
  bot_style TEXT DEFAULT 'friendly' CHECK (bot_style IN ('formal', 'friendly', 'casual')),
  welcome_message TEXT DEFAULT 'היי! 👋 אני העוזר הוירטואלי. איך אפשר לעזור?',
  
  -- שעות פעילות (JSON)
  -- מבנה: { "sunday": { "active": true, "start": "09:00", "end": "18:00" }, ... }
  working_hours JSONB DEFAULT '{
    "sunday": {"active": true, "start": "09:00", "end": "18:00"},
    "monday": {"active": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"active": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"active": true, "start": "09:00", "end": "18:00"},
    "thursday": {"active": true, "start": "09:00", "end": "18:00"},
    "friday": {"active": true, "start": "09:00", "end": "14:00"},
    "saturday": {"active": false, "start": "00:00", "end": "00:00"}
  }'::jsonb,
  
  -- הודעה מחוץ לשעות פעילות
  out_of_hours_message TEXT DEFAULT 'תודה על הפנייה! 🙏 אנחנו כרגע לא זמינים, אבל נחזור אליך בשעות הפעילות.',
  
  -- הודעה כשאין תשובה במאגר
  no_answer_message TEXT DEFAULT 'שאלה מעולה! 🤔 אעביר אותה למנהל והוא יחזור אליך בהקדם.',
  
  -- סטטיסטיקות (מתעדכן אוטומטית)
  total_conversations INTEGER DEFAULT 0,
  total_answered INTEGER DEFAULT 0,
  
  -- timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- טבלת מאגר מידע (knowledge_base)
-- שאלות ותשובות לכל עסק
-- ============================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- קטגוריה לארגון
  category TEXT NOT NULL CHECK (category IN (
    'pricing',      -- מחירים
    'services',     -- שירותים
    'hours',        -- שעות פעילות
    'location',     -- מיקום והגעה
    'terms',        -- תנאים ומדיניות
    'technical',    -- שאלות טכניות
    'faq',          -- שאלות נפוצות
    'other'         -- אחר
  )),
  
  -- השאלה והתשובה
  question TEXT NOT NULL,             -- השאלה (לדוגמה: "כמה עולה?")
  answer TEXT NOT NULL,               -- התשובה המלאה
  
  -- מילות מפתח לחיפוש (מערך)
  -- לדוגמה: ["מחיר", "עלות", "כמה", "תעריף"]
  keywords TEXT[] DEFAULT '{}',
  
  -- עדיפות (גבוה יותר = יופיע ראשון במקרה של התלבטות)
  priority INTEGER DEFAULT 0,
  
  -- האם פעיל
  is_active BOOLEAN DEFAULT true,
  
  -- timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- טבלת שיחות (conversations)
-- היסטוריית כל ההודעות
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- פרטי הלקוח
  customer_phone TEXT NOT NULL,       -- מספר טלפון (מ-WhatsApp)
  customer_name TEXT,                 -- שם (אם ידוע)
  customer_profile_pic TEXT,          -- URL לתמונת פרופיל
  
  -- ההודעה
  message TEXT NOT NULL,              -- מה הלקוח שלח
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'document')),
  
  -- התשובה
  bot_response TEXT,                  -- מה הבוט ענה
  response_type TEXT CHECK (response_type IN (
    'answered',           -- נענה ממאגר המידע
    'no_answer',          -- לא נמצאה תשובה - הועבר למנהל
    'scheduling',         -- בקשה לקביעת פגישה
    'out_of_hours',       -- מחוץ לשעות פעילות
    'greeting',           -- הודעת פתיחה
    'error'               -- שגיאה
  )),
  
  -- מידע על ה-AI
  ai_confidence DECIMAL(3,2),         -- רמת ביטחון (0.00-1.00)
  matched_knowledge_id UUID REFERENCES knowledge_base(id), -- איזה שאלה התאימה
  
  -- סטטוס
  is_read BOOLEAN DEFAULT false,      -- האם בעל העסק קרא
  needs_followup BOOLEAN DEFAULT false, -- האם צריך מעקב
  
  -- timestamps
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- טבלת פגישות (appointments)
-- פגישות שנקבעו דרך הבוט
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- פרטי הלקוח
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  
  -- פרטי הפגישה
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  appointment_type TEXT DEFAULT 'call', -- call/meeting/other
  
  -- Google Calendar
  google_event_id TEXT,               -- ID של האירוע ב-Calendar
  
  -- סטטוס
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- ממתין לאישור
    'confirmed',    -- מאושר
    'cancelled',    -- בוטל
    'completed',    -- הושלם
    'no_show'       -- לא הגיע
  )),
  
  -- הערות
  notes TEXT,
  
  -- תזכורות
  reminder_sent BOOLEAN DEFAULT false,
  
  -- timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- טבלת התראות (notifications)
-- התראות לבעל העסק
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- סוג ההתראה
  type TEXT NOT NULL CHECK (type IN (
    'new_conversation',   -- שיחה חדשה
    'no_answer',          -- שאלה ללא תשובה
    'appointment',        -- פגישה חדשה
    'system'              -- הודעת מערכת
  )),
  
  -- תוכן
  title TEXT NOT NULL,
  message TEXT,
  
  -- קישור (אופציונלי)
  link TEXT,
  
  -- סטטוס
  is_read BOOLEAN DEFAULT false,
  
  -- timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- אינדקסים לביצועים
-- ============================================

-- עסקים
CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_businesses_whatsapp ON businesses(whatsapp_number);
CREATE INDEX idx_businesses_status ON businesses(status);

-- מאגר מידע
CREATE INDEX idx_knowledge_business ON knowledge_base(business_id);
CREATE INDEX idx_knowledge_category ON knowledge_base(business_id, category);
CREATE INDEX idx_knowledge_active ON knowledge_base(business_id, is_active);
CREATE INDEX idx_knowledge_keywords ON knowledge_base USING GIN(keywords);

-- שיחות
CREATE INDEX idx_conversations_business ON conversations(business_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX idx_conversations_customer ON conversations(business_id, customer_phone);
CREATE INDEX idx_conversations_unread ON conversations(business_id, is_read) WHERE is_read = false;
CREATE INDEX idx_conversations_followup ON conversations(business_id, needs_followup) WHERE needs_followup = true;

-- פגישות
CREATE INDEX idx_appointments_business ON appointments(business_id);
CREATE INDEX idx_appointments_time ON appointments(scheduled_time);
CREATE INDEX idx_appointments_status ON appointments(business_id, status);
CREATE INDEX idx_appointments_upcoming ON appointments(business_id, scheduled_time) 
  WHERE status IN ('pending', 'confirmed');

-- התראות
CREATE INDEX idx_notifications_business ON notifications(business_id);
CREATE INDEX idx_notifications_unread ON notifications(business_id, is_read) WHERE is_read = false;

-- ============================================
-- פונקציית עדכון updated_at אוטומטי
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- טריגרים לעדכון אוטומטי
CREATE TRIGGER update_businesses_updated_at 
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at 
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- פונקציה לעדכון סטטיסטיקות עסק
-- ============================================
CREATE OR REPLACE FUNCTION update_business_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses SET
    total_conversations = (
      SELECT COUNT(*) FROM conversations WHERE business_id = NEW.business_id
    ),
    total_answered = (
      SELECT COUNT(*) FROM conversations 
      WHERE business_id = NEW.business_id AND response_type = 'answered'
    )
  WHERE id = NEW.business_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_conversation
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_business_stats();

-- ============================================
-- פונקציה ליצירת התראה אוטומטית
-- ============================================
CREATE OR REPLACE FUNCTION create_notification_on_no_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- אם אין תשובה - צור התראה לבעל העסק
  IF NEW.response_type = 'no_answer' THEN
    INSERT INTO notifications (business_id, type, title, message, link)
    VALUES (
      NEW.business_id,
      'no_answer',
      'שאלה ללא תשובה',
      'לקוח שאל: ' || LEFT(NEW.message, 50) || '...',
      '/conversations/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_no_answer
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION create_notification_on_no_answer();

-- ============================================
-- Row Level Security (RLS)
-- הגנה ברמת השורה - כל עסק רואה רק את המידע שלו
-- ============================================

-- הפעלת RLS על כל הטבלאות
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy לעסקים - כל אחד רואה רק את העסק שלו
-- (ב-MVP נשתמש ב-service_role key אז זה פחות רלוונטי)
CREATE POLICY "businesses_select_own" ON businesses
  FOR SELECT USING (true);  -- MVP: כולם יכולים לקרוא (נשנה בהמשך)

CREATE POLICY "knowledge_select_own" ON knowledge_base
  FOR SELECT USING (true);

CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "appointments_select_own" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (true);

-- Policies ל-INSERT/UPDATE/DELETE
CREATE POLICY "all_insert" ON businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "all_update" ON businesses FOR UPDATE USING (true);

CREATE POLICY "knowledge_insert" ON knowledge_base FOR INSERT WITH CHECK (true);
CREATE POLICY "knowledge_update" ON knowledge_base FOR UPDATE USING (true);
CREATE POLICY "knowledge_delete" ON knowledge_base FOR DELETE USING (true);

CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_update" ON conversations FOR UPDATE USING (true);

CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (true);

CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (true);

-- ============================================
-- נתוני דוגמה (למחיקה בייצור)
-- ============================================

-- הוספת עסק לדוגמה
INSERT INTO businesses (
  business_name,
  owner_name,
  email,
  phone,
  whatsapp_number,
  bot_name,
  welcome_message
) VALUES (
  'יאכטות פלוס',
  'ישראל ישראלי',
  'demo@chatbot-pro.com',
  '050-1234567',
  '972501234567',
  'מיכל - העוזרת הוירטואלית',
  'שלום! 👋 אני מיכל מיאכטות פלוס. איך אוכל לעזור לך היום?'
);

-- הוספת שאלות למאגר המידע
INSERT INTO knowledge_base (business_id, category, question, answer, keywords, priority) VALUES
(
  (SELECT id FROM businesses WHERE email = 'demo@chatbot-pro.com'),
  'pricing',
  'כמה עולה להשכיר יאכטה?',
  'המחירים משתנים לפי גודל היאכטה והמועד:\n\n🚤 יאכטה קטנה (עד 8 אנשים): 3,500-4,500 ₪\n🛥️ יאכטה בינונית (עד 15 אנשים): 5,000-6,500 ₪\n⛵ יאכטה גדולה (עד 25 אנשים): 7,000-9,000 ₪\n\nהמחיר כולל קפטן, דלק, וציוד בטיחות.\nרוצה לשמוע על התאריכים הפנויים?',
  ARRAY['מחיר', 'עלות', 'כמה', 'תעריף', 'עולה', 'השכרה'],
  10
),
(
  (SELECT id FROM businesses WHERE email = 'demo@chatbot-pro.com'),
  'hours',
  'מתי אתם פתוחים?',
  'אנחנו פעילים:\n\n📅 ימים א-ה: 09:00-18:00\n📅 יום ו: 09:00-14:00\n📅 שבת: סגור\n\nניתן להזמין שייט גם בשבת, אבל צריך לתאם מראש בימי השבוע.',
  ARRAY['שעות', 'פתוח', 'פעילות', 'זמינים', 'מתי'],
  5
),
(
  (SELECT id FROM businesses WHERE email = 'demo@chatbot-pro.com'),
  'services',
  'מה כולל השייט?',
  'כל שייט כולל:\n\n✅ קפטן מקצועי ומנוסה\n✅ דלק לכל המסלול\n✅ ציוד בטיחות מלא\n✅ מערכת סאונד\n✅ אזור ישיבה מוצל\n✅ סולם לים\n\nאפשר להוסיף:\n🍕 קייטרינג (+500 ₪)\n🤿 ציוד צלילה (+200 ₪)\n📸 צלם (+800 ₪)',
  ARRAY['כולל', 'שייט', 'מה יש', 'אופציות', 'תוספות'],
  8
),
(
  (SELECT id FROM businesses WHERE email = 'demo@chatbot-pro.com'),
  'location',
  'איפה אתם נמצאים?',
  '📍 אנחנו נמצאים במרינה הרצליה, רציף 3.\n\nהנה הכתובת המדויקת:\nרח'' המרינה 15, הרצליה פיתוח\n\n🚗 יש חניה חינם במרינה\n🚌 קו 90 עוצר במרחק 5 דקות הליכה',
  ARRAY['איפה', 'מיקום', 'כתובת', 'נמצאים', 'להגיע', 'הגעה'],
  5
),
(
  (SELECT id FROM businesses WHERE email = 'demo@chatbot-pro.com'),
  'terms',
  'מה מדיניות הביטולים?',
  'מדיניות הביטולים שלנו:\n\n✅ עד 7 ימים לפני - ביטול חינם\n⚠️ 3-7 ימים לפני - 50% מהסכום\n❌ פחות מ-3 ימים - ללא החזר\n\n💡 טיפ: בימים סוערים אנחנו מאפשרים דחייה ללא עלות!',
  ARRAY['ביטול', 'לבטל', 'החזר', 'מדיניות', 'דחייה'],
  3
);

-- ============================================
-- Views שימושיים
-- ============================================

-- תצוגה של שיחות עם שם העסק
CREATE OR REPLACE VIEW conversations_with_business AS
SELECT 
  c.*,
  b.business_name,
  b.bot_name
FROM conversations c
JOIN businesses b ON c.business_id = b.id;

-- תצוגה של סטטיסטיקות יומיות
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  business_id,
  DATE(timestamp) as date,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE response_type = 'answered') as answered,
  COUNT(*) FILTER (WHERE response_type = 'no_answer') as no_answer,
  ROUND(AVG(ai_confidence)::numeric, 2) as avg_confidence
FROM conversations
GROUP BY business_id, DATE(timestamp)
ORDER BY date DESC;

-- ============================================
-- הרשאות ל-service_role
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
