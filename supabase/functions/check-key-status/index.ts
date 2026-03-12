import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { key_id, device_id } = await req.json()

    if (!key_id || !device_id) {
      return new Response(JSON.stringify({ valid: false, reason: 'Missing key or device info' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: key, error } = await supabase
      .from('access_keys')
      .select('id, is_active, expires_at, device_id')
      .eq('id', key_id)
      .single()

    // Key deleted by admin
    if (error || !key) {
      return new Response(JSON.stringify({ valid: false, reason: 'Key not found or deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Key revoked by admin
    if (!key.is_active) {
      return new Response(JSON.stringify({ valid: false, reason: 'Key has been revoked by admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Key expired - check properly with date comparison
    const now = new Date()
    const expiresAt = new Date(key.expires_at)
    if (expiresAt <= now) {
      return new Response(JSON.stringify({ valid: false, reason: 'Key has expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Device mismatch
    if (key.device_id && key.device_id !== device_id) {
      return new Response(JSON.stringify({ valid: false, reason: 'Key is locked to another device' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update last_used_at
    await supabase
      .from('access_keys')
      .update({ last_used_at: now.toISOString() })
      .eq('id', key.id)

    // Calculate remaining time
    const remainingMs = expiresAt.getTime() - now.getTime()
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

    return new Response(JSON.stringify({ 
      valid: true,
      remaining_days: remainingDays,
      expires_at: key.expires_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, reason: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})