// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const FB_APP_ID = Deno.env.get('FB_APP_ID') || '2700329290344167'
const FB_APP_SECRET = Deno.env.get('FB_APP_SECRET') || '1871c8ff5e6f6bf82886eb63083a77b8'
const REDIRECT_URI = 'https://story-seven-psi.vercel.app/oauth-callback.html'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, businessId } = await req.json()
    
    console.log('📥 OAuth request received')
    console.log('Business ID:', businessId)
    console.log('Code:', code ? 'Present' : 'Missing')
    
    // Validate inputs
    if (!code || !businessId) {
      throw new Error('Missing code or businessId')
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // ========================================
    // STEP 1: Exchange code for short-lived token
    // ========================================
    console.log('🔄 Step 1: Exchanging code for short-lived token...')
    
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token?' + 
      `client_id=${FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${FB_APP_SECRET}` +
      `&code=${code}`
    
    const tokenResponse = await fetch(tokenUrl)
    const tokenData = await tokenResponse.json()
    
    console.log('Token response:', JSON.stringify(tokenData))
    
    if (tokenData.error) {
      throw new Error(`Facebook error: ${tokenData.error.message}`)
    }
    
    const shortLivedToken = tokenData.access_token
    
    if (!shortLivedToken) {
      throw new Error('No access token received from Facebook')
    }
    
    console.log('✅ Short-lived token received')

    // ========================================
    // STEP 2: Exchange for long-lived token (60 days)
    // ========================================
    console.log('🔄 Step 2: Exchanging for long-lived token...')
    
    const longLivedUrl = 'https://graph.facebook.com/v18.0/oauth/access_token?' +
      `grant_type=fb_exchange_token` +
      `&client_id=${FB_APP_ID}` +
      `&client_secret=${FB_APP_SECRET}` +
      `&fb_exchange_token=${shortLivedToken}`
    
    const longLivedResponse = await fetch(longLivedUrl)
    const longLivedData = await longLivedResponse.json()
    
    console.log('Long-lived token response:', JSON.stringify(longLivedData))
    
    if (longLivedData.error) {
      throw new Error(`Facebook error: ${longLivedData.error.message}`)
    }
    
    const longLivedToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000 // Default 60 days
    
    console.log('✅ Long-lived token received, expires in:', expiresIn, 'seconds')

    // ========================================
    // STEP 3: Get user's Facebook Pages
    // ========================================
    console.log('🔄 Step 3: Getting Facebook Pages...')
    
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    const pagesResponse = await fetch(pagesUrl)
    const pagesData = await pagesResponse.json()
    
    console.log('Pages response:', JSON.stringify(pagesData))
    
    if (pagesData.error) {
      throw new Error(`Facebook error: ${pagesData.error.message}`)
    }
    
    const pages = pagesData.data || []
    
    if (pages.length === 0) {
      throw new Error('לא נמצאו דפי Facebook מחוברים. וודא שיש לך דף עסקי ב-Facebook.')
    }
    
    console.log('✅ Found', pages.length, 'Facebook page(s)')

    // ========================================
    // STEP 4: Find Instagram Business Account
    // ========================================
    console.log('🔄 Step 4: Finding Instagram Business Account...')
    
    let instagramAccountId = null
    let instagramUsername = null
    let pageAccessToken = null
    
    for (const page of pages) {
      console.log('Checking page:', page.name)
      
      const igUrl = `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      const igResponse = await fetch(igUrl)
      const igData = await igResponse.json()
      
      console.log('IG data for page:', JSON.stringify(igData))
      
      if (igData.instagram_business_account) {
        instagramAccountId = igData.instagram_business_account.id
        pageAccessToken = page.access_token
        
        // Get Instagram username
        const igDetailsUrl = `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username,name,profile_picture_url&access_token=${pageAccessToken}`
        const igDetailsResponse = await fetch(igDetailsUrl)
        const igDetails = await igDetailsResponse.json()
        
        console.log('IG details:', JSON.stringify(igDetails))
        
        instagramUsername = igDetails.username
        console.log('✅ Found Instagram Business Account:', instagramUsername)
        break
      }
    }
    
    if (!instagramAccountId) {
      throw new Error('לא נמצא חשבון Instagram Business מחובר לדפי Facebook שלך. וודא שחשבון Instagram העסקי מחובר לדף Facebook.')
    }

    // ========================================
    // STEP 5: Calculate expiry date
    // ========================================
    const tokenCreatedAt = new Date()
    const tokenExpiresAt = new Date(tokenCreatedAt.getTime() + (expiresIn * 1000))
    
    console.log('Token created at:', tokenCreatedAt.toISOString())
    console.log('Token expires at:', tokenExpiresAt.toISOString())

    // ========================================
    // STEP 6: Save to Supabase
    // ========================================
    console.log('🔄 Step 6: Saving to Supabase...')
    
    const { data: updateData, error: updateError } = await supabase
      .from('businesses')
      .update({
        instagram_access_token: pageAccessToken,
        instagram_account_id: instagramAccountId,
        instagram_username: instagramUsername,
        token_created_at: tokenCreatedAt.toISOString(),
        token_expires_at: tokenExpiresAt.toISOString()
      })
      .eq('business_id', businessId)
      .select('business_name, instagram_handle')
      .single()
    
    if (updateError) {
      console.error('Supabase update error:', updateError)
      throw new Error(`Database error: ${updateError.message}`)
    }
    
    console.log('✅ Saved to database:', updateData)

    // ========================================
    // Return success
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        instagramUsername: instagramUsername,
        instagramAccountId: instagramAccountId,
        businessName: updateData?.business_name,
        expiresAt: tokenExpiresAt.toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ OAuth Error:', error.message)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'בדוק שחשבון Instagram Business מחובר לדף Facebook'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
