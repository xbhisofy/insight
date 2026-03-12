import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function sendTelegramAlert(key: any, deviceId: string, ip: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) return

  // Get location from IP
  let location = 'Unknown'
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`)
    if (geoRes.ok) {
      const geo = await geoRes.json()
      if (geo.city && geo.country) {
        location = `${geo.city}, ${geo.country}`
      }
    }
  } catch { /* ignore */ }

  const now = new Date()
  const timeStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' }) +
    ', ' + now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })

  const shortDeviceId = 'DX-' + deviceId.substring(0, 8).toUpperCase()

  const message = `🔐 *New Login Alert\\!*
━━━━━━━━━━━━━━━
📦 User: ${escapeMarkdown(key.label)}
🔑 Key: \`${escapeMarkdown(key.key_code)}\`
📍 Location: ${escapeMarkdown(location)}
🌐 IP: \`${escapeMarkdown(ip)}\`
📱 Device: ${escapeMarkdown(shortDeviceId)}
🕐 Time: ${escapeMarkdown(timeStr)}
━━━━━━━━━━━━━━━
Powered by DarkSideX 🚀`

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'MarkdownV2',
      }),
    })
  } catch { /* ignore */ }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { key_code, device_id } = await req.json()

    if (!key_code || !device_id) {
      return new Response(JSON.stringify({ error: 'Key and device ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Find key
    const { data: key, error } = await supabase
      .from('access_keys')
      .select('*')
      .eq('key_code', key_code.toUpperCase())
      .single()

    if (error || !key) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!key.is_active) {
      return new Response(JSON.stringify({ error: 'Key has been revoked' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    const expiresAt = new Date(key.expires_at)
    if (expiresAt <= now) {
      return new Response(JSON.stringify({ error: 'Key has expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (key.device_id && key.device_id !== device_id) {
      return new Response(JSON.stringify({ error: 'Key is already used on another device' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    const { error: updateError } = await supabase
      .from('access_keys')
      .update({
        device_id: device_id,
        device_info: req.headers.get('user-agent') || 'unknown',
        last_used_at: now.toISOString(),
        last_ip: clientIp,
      })
      .eq('id', key.id)

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to validate key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send Telegram alert (don't await to not slow down response)
    sendTelegramAlert(key, device_id, clientIp)

    const remainingMs = expiresAt.getTime() - now.getTime()
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

    return new Response(JSON.stringify({
      success: true,
      key: {
        id: key.id,
        label: key.label,
        expires_at: key.expires_at,
        remaining_days: remainingDays,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})