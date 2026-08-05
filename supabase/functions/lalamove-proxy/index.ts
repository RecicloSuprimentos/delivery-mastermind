const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signatureBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { path, method, payload, market = 'BR' } = await req.json()

    if (!path || !method) {
      throw new Error("Missing 'path' or 'method' in request")
    }

    const LALAMOVE_API_KEY = Deno.env.get('LALAMOVE_API_KEY')
    const LALAMOVE_API_SECRET = Deno.env.get('LALAMOVE_API_SECRET')
    const baseUrl = Deno.env.get('LALAMOVE_BASE_URL') || 'https://rest.sandbox.lalamove.com'

    if (!LALAMOVE_API_KEY || !LALAMOVE_API_SECRET) {
      throw new Error("Missing LALAMOVE API Credentials in environment variables")
    }

    const time = new Date().getTime().toString()
    const bodyStr = payload && method !== 'GET' ? JSON.stringify(payload) : ''
    const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${bodyStr}`

    const signature = await hmacSha256Hex(LALAMOVE_API_SECRET, rawSignature)
    const token = `${LALAMOVE_API_KEY}:${time}:${signature}`

    const headers = new Headers()
    headers.set('Authorization', `hmac ${token}`)
    headers.set('Market', market)
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')

    const requestOptions: RequestInit = { method, headers }
    if (bodyStr) {
      requestOptions.body = bodyStr
    }

    const apiUrl = `${baseUrl}${path}`
    const lalaResponse = await fetch(apiUrl, requestOptions)

    const data = await lalaResponse.text()
    let parsedData = null
    try {
      parsedData = JSON.parse(data)
    } catch (_e) {
      parsedData = { raw: data }
    }

    if (!lalaResponse.ok) {
      return new Response(
        JSON.stringify({ error: parsedData }),
        { status: lalaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
