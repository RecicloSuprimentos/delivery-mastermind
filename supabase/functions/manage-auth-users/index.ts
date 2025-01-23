import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthUser {
  email: string;
  password?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userData } = await req.json()

    let result

    switch (action) {
      case 'list':
        result = await supabaseClient.auth.admin.listUsers()
        break

      case 'create':
        const { email, password } = userData as AuthUser
        result = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        })
        break

      case 'delete':
        const { id } = userData
        result = await supabaseClient.auth.admin.deleteUser(id)
        break

      case 'update':
        const { id: userId, ...updateData } = userData
        result = await supabaseClient.auth.admin.updateUserById(
          userId,
          updateData
        )
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})