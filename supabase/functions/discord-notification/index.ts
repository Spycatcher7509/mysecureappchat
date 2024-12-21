import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')
const RATE_LIMIT_SECONDS = 2 // Minimum seconds between messages

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiting
const messageTimestamps = new Map<string, number>()

interface NotificationRequest {
  type: 'new_message' | 'user_joined' | 'user_left'
  content: string
  username?: string
}

const formatDiscordMessage = (request: NotificationRequest) => {
  let color: number
  let title: string

  switch (request.type) {
    case 'new_message':
      color = 0x3498db // Blue
      title = '💬 New Message'
      break
    case 'user_joined':
      color = 0x2ecc71 // Green
      title = '👋 User Joined'
      break
    case 'user_left':
      color = 0xe74c3c // Red
      title = '🚶 User Left'
      break
    default:
      color = 0x95a5a6 // Grey
      title = 'Notification'
  }

  return {
    embeds: [{
      title,
      description: request.content,
      color,
      timestamp: new Date().toISOString(),
      footer: {
        text: request.username ? `From: ${request.username}` : 'Secure Chat Application'
      }
    }]
  }
}

const isRateLimited = (userId: string): boolean => {
  const now = Date.now()
  const lastMessage = messageTimestamps.get(userId)
  
  if (lastMessage && (now - lastMessage) < RATE_LIMIT_SECONDS * 1000) {
    return true
  }
  
  messageTimestamps.set(userId, now)
  return false
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify webhook URL is configured
    if (!DISCORD_WEBHOOK_URL) {
      console.error('Discord webhook URL not configured')
      return new Response(
        JSON.stringify({ error: 'Discord webhook not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create Supabase client to verify the user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check rate limiting
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Get request body
    const request: NotificationRequest = await req.json()
    
    // Format the message for Discord
    const discordMessage = formatDiscordMessage(request)

    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    })

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text()
      console.error('Discord API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send to Discord' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in discord-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})