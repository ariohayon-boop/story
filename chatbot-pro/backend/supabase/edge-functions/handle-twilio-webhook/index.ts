// ============================================
// ChatBot Pro - Handle Twilio WhatsApp Webhook
// Edge Function לטיפול בהודעות WhatsApp דרך Twilio
// ============================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-twilio-signature",
};

// Environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const claudeApiKey = Deno.env.get("CLAUDE_API_KEY")!;
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// Helper Functions
// ============================================

/**
 * בדיקה האם אנחנו בשעות פעילות
 */
function isWithinWorkingHours(workingHours: any): boolean {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  
  const todayHours = workingHours[today];
  if (!todayHours || !todayHours.active) {
    return false;
  }
  
  const currentTime = now.toTimeString().slice(0, 5);
  return currentTime >= todayHours.start && currentTime <= todayHours.end;
}

/**
 * בניית הפרומפט ל-Claude
 */
function buildPrompt(
  business: any,
  knowledgeBase: any[],
  customerMessage: string
): string {
  const knowledgeText = knowledgeBase
    .filter(k => k.is_active)
    .map(k => `שאלה: ${k.question}\nתשובה: ${k.answer}\n---`)
    .join('\n');
  
  const hoursText = Object.entries(business.working_hours)
    .map(([day, hours]: [string, any]) => {
      if (!hours.active) return `${day}: סגור`;
      return `${day}: ${hours.start}-${hours.end}`;
    })
    .join('\n');
  
  return `אתה ${business.bot_name}, עוזר וירטואלי של ${business.business_name}.
אתה צריך לענות ללקוחות בצורה ${business.bot_style === 'formal' ? 'רשמית ומקצועית' : business.bot_style === 'casual' ? 'קז\'ואלית וחברית' : 'ידידותית ונעימה'}.

===== מאגר המידע שלך =====
${knowledgeText || 'אין מידע במאגר עדיין.'}

===== שעות פעילות =====
${hoursText}

===== חוקים חשובים =====
1. אם התשובה קיימת במאגר המידע - תן תשובה מפורטת וידידותית בעברית
2. אם התשובה לא קיימת במאגר - תגיד בדיוק: "[NO_ANSWER]"
3. אם הלקוח רוצה לקבוע פגישה/שיחה/להתקשר - תגיד בדיוק: "[SCHEDULE_CALL]"
4. אל תמציא מידע שלא קיים במאגר!
5. אל תשאל שאלות מיותרות
6. תענה בעברית בלבד
7. השתמש באימוג'ים כדי להיות יותר ידידותי

===== הודעת הלקוח =====
${customerMessage}

תענה רק את התשובה, ללא הקדמות או הסברים על איך ענית.`;
}

/**
 * קריאה ל-Claude API
 */
async function callClaudeAPI(prompt: string): Promise<{ response: string; confidence: number }> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    const botResponse = data.content[0].text;
    
    let confidence = 0.9;
    if (botResponse.includes("[NO_ANSWER]")) {
      confidence = 0.0;
    } else if (botResponse.includes("[SCHEDULE_CALL]")) {
      confidence = 1.0;
    }
    
    return { response: botResponse, confidence };
    
  } catch (error) {
    console.error("Error calling Claude:", error);
    throw error;
  }
}

/**
 * שליחת הודעה דרך Twilio WhatsApp API
 */
async function sendWhatsAppMessage(
  toPhone: string,
  fromPhone: string,
  message: string
): Promise<void> {
  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    // Basic auth credentials
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    // Format phone numbers for WhatsApp
    const to = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;
    const from = fromPhone.startsWith('whatsapp:') ? fromPhone : `whatsapp:${fromPhone}`;
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', from);
    formData.append('Body', message);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio API error:", error);
      throw new Error(`Twilio API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Message sent successfully, SID:", result.sid);
    
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}

/**
 * שמירת השיחה ב-Database
 */
async function saveConversation(
  businessId: string,
  customerPhone: string,
  customerName: string | null,
  message: string,
  botResponse: string,
  responseType: string,
  confidence: number
): Promise<void> {
  try {
    const { error } = await supabase.from("conversations").insert({
      business_id: businessId,
      customer_phone: customerPhone,
      customer_name: customerName,
      message: message,
      bot_response: botResponse,
      response_type: responseType,
      ai_confidence: confidence,
      needs_followup: responseType === 'no_answer'
    });
    
    if (error) {
      console.error("Error saving conversation:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in saveConversation:", error);
    throw error;
  }
}

/**
 * Parse Twilio webhook form data
 */
function parseFormData(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const data: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

// ============================================
// Main Handler
// ============================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Twilio sends form-urlencoded data
    const bodyText = await req.text();
    const payload = parseFormData(bodyText);
    
    console.log("Received Twilio webhook:", JSON.stringify(payload, null, 2));
    
    // Extract data from Twilio webhook
    // Twilio format: whatsapp:+972501234567
    const fromPhone = payload.From || "";
    const toPhone = payload.To || "";
    const messageContent = payload.Body || "";
    const customerName = payload.ProfileName || null;
    const messageSid = payload.MessageSid || "";
    
    // Clean phone number (remove 'whatsapp:' prefix)
    const customerPhone = fromPhone.replace('whatsapp:', '').replace('+', '');
    const businessPhone = toPhone.replace('whatsapp:', '').replace('+', '');
    
    if (!customerPhone || !messageContent) {
      console.log("Missing phone or message, ignoring");
      // Return TwiML empty response
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { ...corsHeaders, "Content-Type": "text/xml" }
      });
    }
    
    console.log(`Processing message from ${customerPhone}: ${messageContent}`);
    
    // Find business by Twilio phone number
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("twilio_phone_number", businessPhone)
      .single();
    
    if (businessError || !business) {
      console.error("Business not found for phone:", businessPhone);
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { ...corsHeaders, "Content-Type": "text/xml" }
      });
    }
    
    // Check working hours
    if (!isWithinWorkingHours(business.working_hours)) {
      await sendWhatsAppMessage(
        fromPhone,
        toPhone,
        business.out_of_hours_message
      );
      
      await saveConversation(
        business.id,
        customerPhone,
        customerName,
        messageContent,
        business.out_of_hours_message,
        "out_of_hours",
        1.0
      );
      
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { ...corsHeaders, "Content-Type": "text/xml" }
      });
    }
    
    // Get knowledge base
    const { data: knowledgeBase, error: kbError } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("priority", { ascending: false });
    
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
    }
    
    // Build prompt and call Claude
    const prompt = buildPrompt(business, knowledgeBase || [], messageContent);
    const { response: aiResponse, confidence } = await callClaudeAPI(prompt);
    
    // Process response
    let finalResponse = aiResponse;
    let responseType = "answered";
    
    if (aiResponse.includes("[NO_ANSWER]")) {
      finalResponse = business.no_answer_message;
      responseType = "no_answer";
    } else if (aiResponse.includes("[SCHEDULE_CALL]")) {
      finalResponse = "מעולה! 📅 אשמח לקבוע לך שיחה. מתי נוח לך?\n\nאפשר גם להתקשר ישירות: " + (business.phone || "");
      responseType = "scheduling";
    }
    
    // Send response via Twilio
    await sendWhatsAppMessage(
      fromPhone,
      toPhone,
      finalResponse
    );
    
    // Save conversation
    await saveConversation(
      business.id,
      customerPhone,
      customerName,
      messageContent,
      finalResponse,
      responseType,
      confidence
    );
    
    console.log(`Response sent: ${responseType} (confidence: ${confidence})`);
    
    // Return empty TwiML (we already sent the message via API)
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { ...corsHeaders, "Content-Type": "text/xml" }
    });
    
  } catch (error) {
    console.error("Error processing message:", error);
    
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { ...corsHeaders, "Content-Type": "text/xml" }
    });
  }
});
