-- ============================================
-- ChatBot Pro - Database Schema Update for Twilio
-- הוספת שדות Twilio לטבלת businesses
-- ============================================

-- הוספת עמודות Twilio לטבלת businesses
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT,
ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT,
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT,
ADD COLUMN IF NOT EXISTS twilio_messaging_service_sid TEXT;

-- הסרת עמודות Evolution API (אופציונלי - רק אם רוצים לנקות)
-- ALTER TABLE businesses 
-- DROP COLUMN IF EXISTS evolution_instance_id,
-- DROP COLUMN IF EXISTS evolution_instance_token;

-- יצירת אינדקס על מספר הטלפון של Twilio
CREATE INDEX IF NOT EXISTS idx_businesses_twilio_phone 
ON businesses(twilio_phone_number);

-- עדכון הערות
COMMENT ON COLUMN businesses.twilio_phone_number IS 'מספר WhatsApp Business של Twilio (פורמט: 972501234567)';
COMMENT ON COLUMN businesses.twilio_account_sid IS 'Twilio Account SID';
COMMENT ON COLUMN businesses.twilio_auth_token IS 'Twilio Auth Token (מוצפן)';
COMMENT ON COLUMN businesses.twilio_messaging_service_sid IS 'Twilio Messaging Service SID (אופציונלי)';
