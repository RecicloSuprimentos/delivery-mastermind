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
        const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers()
        if (listError) throw listError
        console.log('Users listed:', users)
        result = { users: users.users }
        break

      case 'create':
        const { email, password } = userData as AuthUser
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { created_by: 'admin' }
        })
        if (createError) throw createError
        console.log('User created:', newUser)
        result = { user: newUser }
        break

      case 'delete':
        const { id } = userData
        const { data: deletedUser, error: deleteError } = await supabaseClient.auth.admin.deleteUser(id)
        if (deleteError) throw deleteError
        console.log('User deleted:', deletedUser)
        result = { user: deletedUser }
        break

      case 'update':
        const { id: userId, ...updateData } = userData
        const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(
          userId,
          updateData
        )
        if (updateError) throw updateError
        console.log('User updated:', updatedUser)
        result = { user: updatedUser }
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
    console.error('Error in manage-auth-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})