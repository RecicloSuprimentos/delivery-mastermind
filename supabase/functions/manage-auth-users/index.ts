import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Starting manage-auth-users function")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, userData } = await req.json()
    console.log(`Received action: ${action}`)

    switch (action) {
      case 'list':
        console.log('Listing users...')
        const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error listing users:', listError)
          throw listError
        }
        
        console.log(`Found ${users.length} users`)
        return new Response(
          JSON.stringify({ users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create':
        console.log('Creating user:', userData.email)
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        })
        
        if (createError) {
          console.error('Error creating user:', createError)
          throw createError
        }
        
        console.log('User created successfully:', newUser)
        return new Response(
          JSON.stringify({ user: newUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update':
        console.log('Updating user:', userData.id)
        const updateData: any = { email: userData.email }
        if (userData.password) {
          updateData.password = userData.password
        }
        
        const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin.updateUserById(
          userData.id,
          updateData
        )
        
        if (updateError) {
          console.error('Error updating user:', updateError)
          throw updateError
        }
        
        console.log('User updated successfully:', updatedUser)
        return new Response(
          JSON.stringify({ user: updatedUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'delete':
        console.log('Deleting user:', userData.id)
        const { data: deletedUser, error: deleteError } = await supabaseClient.auth.admin.deleteUser(
          userData.id
        )
        
        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          throw deleteError
        }
        
        console.log('User deleted successfully')
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error(`Invalid action: ${action}`)
    }
  } catch (error) {
    console.error('Error in manage-auth-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})