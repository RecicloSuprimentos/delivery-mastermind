import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RouteWithDetails {
  route: any;
  stops: any[];
  services: any[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get route ID from query params if provided
    const url = new URL(req.url)
    const routeId = url.searchParams.get('id')

    let routesQuery = supabaseClient
      .from('routes')
      .select(`
        *,
        agent:system_users(name)
      `)

    // If route ID is provided, filter by it
    if (routeId) {
      routesQuery = routesQuery.eq('id', routeId)
    }

    const { data: routes, error: routesError } = await routesQuery

    if (routesError) {
      console.error('Error fetching routes:', routesError)
      throw routesError
    }

    // Get details for each route
    const routesWithDetails: RouteWithDetails[] = await Promise.all(
      routes.map(async (route) => {
        // Get stops for this route
        const { data: stops, error: stopsError } = await supabaseClient
          .from('route_stops')
          .select('*')
          .eq('route_id', route.id)
          .order('sequence_number')

        if (stopsError) {
          console.error('Error fetching stops:', stopsError)
          throw stopsError
        }

        // Get services for this route
        const serviceIds = stops.map((stop) => stop.service_id)
        const { data: services, error: servicesError } = await supabaseClient
          .from('services')
          .select('*')
          .in('id', serviceIds)

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
          throw servicesError
        }

        return {
          route,
          stops,
          services,
        }
      })
    )

    return new Response(
      JSON.stringify(routesWithDetails),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})