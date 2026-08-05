// @ts-ignore: EdgeRuntime is available globally in Supabase self-hosted edge-runtime
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const { pathname } = url
  // pathname comes in as /lalamove-proxy when strip_path=true in Kong
  const service_name = pathname.replace(/^\//, '').split('/')[0]

  if (!service_name) {
    return new Response('Function not found', { status: 404 })
  }

  try {
    // @ts-ignore
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath: `/home/deno/functions/${service_name}`,
      memoryLimitMb: 150,
      workerTimeoutMs: 5 * 60 * 1000,
      noModuleCache: false,
    })
    return await worker.fetch(req)
  } catch (e: any) {
    console.error(`[main] Error loading function '${service_name}':`, e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
