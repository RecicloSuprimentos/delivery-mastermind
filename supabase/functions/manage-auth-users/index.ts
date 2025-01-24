import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Starting manage-auth-users function")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
        const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers({
          page: 1,
          perPage: 100,
        })
        
        if (listError) {
          console.error('Error listing users:', listError)
          throw listError
        }
        
        // Buscar dados adicionais dos usuários do system_users
        const userIds = users.map(user => user.id)
        const { data: systemUsers, error: systemUsersError } = await supabaseClient
          .from('system_users')
          .select('*')
          .in('id', userIds)

        if (systemUsersError) {
          console.error('Error fetching system users:', systemUsersError)
          throw systemUsersError
        }

        // Combinar os dados
        const enrichedUsers = users.map(user => {
          const systemUser = systemUsers?.find(su => su.id === user.id)
          return {
            ...user,
            user_type: systemUser?.user_type || 'user',
            name: systemUser?.name || '',
            is_active: systemUser?.is_active ?? true
          }
        })
        
        console.log(`Found ${enrichedUsers.length} users`)
        return new Response(
          JSON.stringify({ users: enrichedUsers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'create':
        console.log('Creating user:', userData.email)
        // Criar usuário no auth
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        })
        
        if (createError) {
          console.error('Error creating user:', createError)
          throw createError
        }

        // Criar entrada correspondente em system_users
        if (newUser.user) {
          const { error: systemUserError } = await supabaseClient
            .from('system_users')
            .insert([{
              id: newUser.user.id,
              email: userData.email,
              name: userData.name || userData.email,
              user_type: userData.user_type || 'user',
              is_active: true
            }])

          if (systemUserError) {
            console.error('Error creating system user:', systemUserError)
            throw systemUserError
          }
        }
        
        console.log('User created successfully:', newUser)
        return new Response(
          JSON.stringify({ user: newUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'update':
        console.log('Updating user:', userData.id)
        const updateData: any = {}
        
        if (userData.email) {
          updateData.email = userData.email
        }
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

        // Atualizar system_users se necessário
        if (userData.user_type || userData.name) {
          const { error: systemUserUpdateError } = await supabaseClient
            .from('system_users')
            .update({
              user_type: userData.user_type,
              name: userData.name,
              email: userData.email
            })
            .eq('id', userData.id)

          if (systemUserUpdateError) {
            console.error('Error updating system user:', systemUserUpdateError)
            throw systemUserUpdateError
          }
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

        // Deletar entrada em system_users
        const { error: systemUserDeleteError } = await supabaseClient
          .from('system_users')
          .delete()
          .eq('id', userData.id)

        if (systemUserDeleteError) {
          console.error('Error deleting system user:', systemUserDeleteError)
          throw systemUserDeleteError
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