// ============================================
// ChatBot Pro - Handle WhatsApp Message
// Edge Function לטיפול בכל הודעה נכנסת מווצאפ
// ============================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// יצירת Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const claudeApiKey = Deno.env.get("CLAUDE_API_KEY")!;
const evolutionApiUrl = Deno.env.get("EVOLUTION_API_URL")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// פונקציות עזר
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
  
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
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
  // בניית מאגר המידע כטקסט
  const knowledgeText = knowledgeBase
    .filter(k => k.is_active)
    .map(k => `שאלה: ${k.question}\nתשובה: ${k.answer}\n---`)
    .join('\n');
  
  // בניית שעות פעילות כטקסט
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
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    const botResponse = data.content[0].text;
    
    // חישוב confidence לפי התשובה
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
 * שליחת הודעה חזרה דרך Evolution API
 */
async function sendWhatsAppMessage(
  instanceId: string,
  instanceToken: string,
  phone: string,
  message: string
): Promise<void> {
  try {
    const response = await fetch(
      `${evolutionApiUrl}/message/sendText/${instanceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": instanceToken
        },
        body: JSON.stringify({
          number: phone,
          text: message
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Evolution API error:", error);
      throw new Error(`Evolution API error: ${response.status}`);
    }
    
    console.log("Message sent successfully to:", phone);
    
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
  confidence: number,
  matchedKnowledgeId: string | null = null
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
      matched_knowledge_id: matchedKnowledgeId,
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

// ============================================
// Main Handler
// ============================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // קבלת ה-webhook מ-Evolution API
    const payload = await req.json();
    console.log("Received webhook:", JSON.stringify(payload, null, 2));
    
    // בדיקה שזו הודעה נכנסת (לא הודעה ששלחנו)
    if (payload.event !== "messages.upsert" || payload.data?.key?.fromMe) {
      return new Response(JSON.stringify({ status: "ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // חילוץ המידע מה-webhook
    const instanceId = payload.instance;
    const customerPhone = payload.data?.key?.remoteJid?.replace("@s.whatsapp.net", "");
    const customerName = payload.data?.pushName || null;
    const messageContent = payload.data?.message?.conversation || 
                           payload.data?.message?.extendedTextMessage?.text || "";
    
    if (!customerPhone || !messageContent) {
      console.log("Missing phone or message, ignoring");
      return new Response(JSON.stringify({ status: "ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`Processing message from ${customerPhone}: ${messageContent}`);
    
    // מציאת העסק לפי instance_id
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("evolution_instance_id", instanceId)
      .single();
    
    if (businessError || !business) {
      console.error("Business not found for instance:", instanceId);
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // בדיקת שעות פעילות
    if (!isWithinWorkingHours(business.working_hours)) {
      // מחוץ לשעות פעילות - שלח הודעה מתאימה
      await sendWhatsAppMessage(
        instanceId,
        business.evolution_instance_token,
        customerPhone,
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
      
      return new Response(JSON.stringify({ status: "out_of_hours" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // שליפת מאגר המידע של העסק
    const { data: knowledgeBase, error: kbError } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("priority", { ascending: false });
    
    if (kbError) {
      console.error("Error fetching knowledge base:", kbError);
    }
    
    // בניית הפרומפט וקריאה ל-Claude
    const prompt = buildPrompt(business, knowledgeBase || [], messageContent);
    const { response: aiResponse, confidence } = await callClaudeAPI(prompt);
    
    // טיפול בתשובה לפי הסוג
    let finalResponse = aiResponse;
    let responseType = "answered";
    
    if (aiResponse.includes("[NO_ANSWER]")) {
      // אין תשובה במאגר
      finalResponse = business.no_answer_message;
      responseType = "no_answer";
      
    } else if (aiResponse.includes("[SCHEDULE_CALL]")) {
      // בקשה לקביעת פגישה
      finalResponse = "מעולה! 📅 אשמח לקבוע לך שיחה. מתי נוח לך?\n\nאפשר גם להתקשר ישירות: " + (business.phone || "");
      responseType = "scheduling";
    }
    
    // שליחת התשובה ללקוח
    await sendWhatsAppMessage(
      instanceId,
      business.evolution_instance_token,
      customerPhone,
      finalResponse
    );
    
    // שמירת השיחה
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
    
    return new Response(JSON.stringify({ 
      status: "success",
      responseType,
      confidence 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error processing message:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
