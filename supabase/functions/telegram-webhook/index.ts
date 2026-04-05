import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const adminChatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!payload.message || !payload.message.text) {
      return new Response('OK')
    }

    const { chat, text, from } = payload.message
    const chatId = chat.id.toString()

    // Security: Only the authorized admin (TELEGRAM_CHAT_ID) can generate keys
    if (chatId !== adminChatId) {
      console.log(`Unauthorized access attempt from ${chatId}`)
      return new Response('OK')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Command patterns:
    // /gen <label> <days>
    // /keys - List last 10 keys
    // /revoke <code> - Revoke a key

    const args = text.split(' ')
    const command = args[0].toLowerCase()

    if (command === '/start') {
      await sendTelegramMessage(botToken, chatId, "Welcome Admin. \nCommands:\n`/gen <label> <days>` - Generate key\n`/keys` - List keys\n`/revoke <code>` - Revoke key")
    } 
    else if (command === '/gen') {
      if (args.length < 2) {
        await sendTelegramMessage(botToken, chatId, "Usage: `/gen <label> [days]`")
        return new Response('OK')
      }

      const label = args[1]
      const days = parseInt(args[2]) || 30
      
      // Call generate_key_code RPC
      const { data: keyCode, error: genError } = await supabase.rpc('generate_key_code')
      if (genError) throw genError

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)

      const { error } = await supabase.from("access_keys").insert({
        key_code: keyCode,
        label: label,
        expiry_days: days,
        expires_at: expiresAt.toISOString(),
      })

      if (error) throw error

      const message = `✅ *Key Generated\\!*
━━━━━━━━━━━━━━━
📦 Label: ${escapeMarkdown(label)}
🔑 Key: \`${escapeMarkdown(keyCode)}\`
⏳ Duration: ${days} days
📅 Expires: ${escapeMarkdown(expiresAt.toLocaleDateString())}
━━━━━━━━━━━━━━━`
      
      await sendTelegramMessage(botToken, chatId, message)
    }
    else if (command === '/keys') {
      const { data: keys, error } = await supabase
        .from('access_keys')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (!keys || keys.length === 0) {
        await sendTelegramMessage(botToken, chatId, "No keys found.")
        return new Response('OK')
      }

      let message = "📋 *Recent Keys:*\n━━━━━━━━━━━━━━━\n"
      keys.forEach(k => {
        const status = k.is_active ? "✅" : "❌"
        message += `${status} \`${k.key_code}\` (${k.label})\n`
      })
      
      await sendTelegramMessage(botToken, chatId, message)
    }
    else if (command === '/revoke') {
       if (args.length < 2) {
        await sendTelegramMessage(botToken, chatId, "Usage: `/revoke <code>`")
        return new Response('OK')
      }
      const targetCode = args[1].toUpperCase()
      const { error } = await supabase
        .from('access_keys')
        .update({ is_active: false })
        .eq('key_code', targetCode)

      if (error) throw error
      await sendTelegramMessage(botToken, chatId, `Revoked \`${targetCode}\``)
    }

    return new Response('OK')
  } catch (err) {
    console.error('Bot error:', err)
    return new Response('OK')
  }
})

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'MarkdownV2',
    }),
  })
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}
