import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    if (authError) throw authError

    // Get all existing system users
    const { data: systemUsers, error: systemError } = await supabaseClient
      .from('system_users')
      .select('email')
    if (systemError) throw systemError

    // Create a set of existing system user emails for faster lookup
    const existingEmails = new Set(systemUsers.map(user => user.email))

    // Filter out users that already exist in system_users
    const availableUsers = authUsers.users
      .filter(user => !existingEmails.has(user.email))
      .map(user => ({
        email: user.email
      }))

    return new Response(
      JSON.stringify({ users: availableUsers }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})