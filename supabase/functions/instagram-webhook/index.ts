// Instagram Webhook Handler Edge Function
// This function receives webhooks from Instagram when users tag businesses in stories

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VERIFY_TOKEN = Deno.env.get('WEBHOOK_VERIFY_TOKEN') || 'storit_webhook_secret_2025'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const method = req.method
  const url = new URL(req.url)

  // ============================================
  // Handle CORS Preflight
  // ============================================
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ============================================
  // STEP 1: Handle Facebook Verification (GET)
  // Facebook sends a GET request to verify the webhook endpoint
  // ============================================
  if (method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    console.log('📡 Webhook verification request received')
    console.log('Mode:', mode)
    console.log('Token:', token ? 'Present' : 'Missing')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!')
      return new Response(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
    
    console.log('❌ Webhook verification failed - token mismatch')
    return new Response('Forbidden', { status: 403 })
  }

  // ============================================
  // STEP 2: Handle Webhook Events (POST)
  // ============================================
  if (method === 'POST') {
    try {
      const data = await req.json()
      
      console.log('📨 Webhook event received:')
      console.log(JSON.stringify(data, null, 2))

      // Initialize Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Process each entry
      for (const entry of data.entry || []) {
        console.log('Processing entry:', entry.id)
        
        for (const change of entry.changes || []) {
          console.log('Change field:', change.field)
          
          // Handle Instagram mentions in stories
          if (change.field === 'mentions') {
            await handleMention(supabase, change.value, entry.id)
          }
          
          // Handle story insights (views count)
          if (change.field === 'story_insights') {
            await handleStoryInsights(supabase, change.value)
          }

          // Handle other Instagram events
          if (change.field === 'comments') {
            console.log('📝 Comment event received - not processing')
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed' }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('❌ Webhook processing error:', error.message)
      
      // Always return 200 to Facebook to prevent retries
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { 
          status: 200, // Return 200 even on error to prevent Facebook from retrying
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response('Method not allowed', { status: 405 })
})

// ============================================
// Handle Mention Event
// Called when someone mentions/tags a business in their story
// ============================================
async function handleMention(supabase: any, mention: any, pageId: string) {
  console.log('👤 Processing mention event...')
  console.log('Mention data:', JSON.stringify(mention))
  
  try {
    const mediaId = mention.media_id
    const commentId = mention.comment_id
    
    if (!mediaId) {
      console.log('⚠️ No media_id in mention - skipping')
      return
    }
    
    console.log('Media ID:', mediaId)
    console.log('Page ID:', pageId)
    
    // Find the business by their Instagram account ID (which is the page ID)
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('instagram_account_id', pageId)
      .single()
    
    if (businessError || !business) {
      console.log('⚠️ Business not found for Instagram account:', pageId)
      
      // Try to save the mention anyway for manual review later
      await saveMentionForReview(supabase, mention, pageId)
      return
    }
    
    console.log('✅ Found business:', business.business_name)
    
    // Get story details from Instagram API
    let storyDetails = null
    if (business.instagram_access_token) {
      storyDetails = await getStoryDetails(mediaId, business.instagram_access_token)
    }
    
    const mentionUsername = storyDetails?.username || 'unknown'
    console.log('Story from user:', mentionUsername)
    
    // Find matching pending submission
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .eq('business_id', business.business_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (submission) {
      console.log('✅ Found pending submission:', submission.id)
      
      // Get story insights (views)
      let insights = { impressions: 0, reach: 0 }
      if (business.instagram_access_token) {
        insights = await getStoryInsights(mediaId, business.instagram_access_token)
      }
      
      // Update submission to verified
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          story_url: storyDetails?.permalink || null,
          views_count: insights.impressions || submission.instagram_followers * 0.4,
          ai_confidence: 100
        })
        .eq('id', submission.id)
      
      if (updateError) {
        console.error('Error updating submission:', updateError)
      } else {
        console.log('🎉 Submission verified automatically!')
      }
    } else {
      console.log('⚠️ No pending submission found for this business')
    }
    
    // Save mention record
    await supabase
      .from('instagram_mentions')
      .insert({
        business_id: business.business_id,
        submission_id: submission?.id || null,
        media_id: mediaId,
        user_id: storyDetails?.owner?.id || null,
        username: mentionUsername,
        views_count: 0,
        story_url: storyDetails?.permalink || null,
        raw_webhook_data: mention,
        processed: true
      })
    
    console.log('✅ Mention record saved')
    
  } catch (error) {
    console.error('Error handling mention:', error)
    throw error
  }
}

// ============================================
// Handle Story Insights Event
// Called when story views are updated
// ============================================
async function handleStoryInsights(supabase: any, insights: any) {
  console.log('📊 Processing story insights event...')
  console.log('Insights data:', JSON.stringify(insights))
  
  // TODO: Update views_count in database when we receive new insights
  // This requires matching the media_id to a submission
}

// ============================================
// Save mention for manual review
// ============================================
async function saveMentionForReview(supabase: any, mention: any, pageId: string) {
  try {
    await supabase
      .from('instagram_mentions')
      .insert({
        media_id: mention.media_id,
        raw_webhook_data: { ...mention, page_id: pageId },
        processed: false
      })
    console.log('📝 Mention saved for manual review')
  } catch (error) {
    console.error('Error saving mention:', error)
  }
}

// ============================================
// Helper: Get Story Details from Instagram API
// ============================================
async function getStoryDetails(mediaId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}?` +
      `fields=id,media_type,media_url,permalink,timestamp,username,owner&` +
      `access_token=${accessToken}`
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('Error getting story details:', errorData)
      return null
    }
    
    const data = await response.json()
    console.log('Story details:', data)
    return data
  } catch (error) {
    console.error('Error fetching story details:', error)
    return null
  }
}

// ============================================
// Helper: Get Story Insights (Views Count)
// ============================================
async function getStoryInsights(mediaId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}/insights?` +
      `metric=impressions,reach&` +
      `access_token=${accessToken}`
    )
    
    if (!response.ok) {
      console.log('Could not get insights - may be too early or not available')
      return { impressions: 0, reach: 0 }
    }
    
    const data = await response.json()
    console.log('Story insights:', data)
    
    const impressions = data.data?.find((m: any) => m.name === 'impressions')?.values?.[0]?.value || 0
    const reach = data.data?.find((m: any) => m.name === 'reach')?.values?.[0]?.value || 0
    
    return { impressions, reach }
  } catch (error) {
    console.error('Error fetching story insights:', error)
    return { impressions: 0, reach: 0 }
  }
}
