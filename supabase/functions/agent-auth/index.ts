import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AuthRequest {
  email: string
  password: string
}

Deno.serve(async (req) => {
  // Tratamento do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Extrair credenciais do corpo da requisição
    const { email, password }: AuthRequest = await req.json()

    // Autenticar usuário
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError

    // Verificar se o usuário é um agente
    const { data: userData, error: userError } = await supabaseClient
      .from('system_users')
      .select('user_type')
      .eq('email', email)
      .single()

    if (userError) throw userError

    if (userData.user_type !== 'agent') {
      throw new Error('Acesso permitido apenas para agentes')
    }

    return new Response(
      JSON.stringify({
        message: 'Autenticação bem-sucedida',
        session: authData.session
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})