export const dynamic = "force-dynamic"
export async function GET() { return new Response(JSON.stringify({ status: "ok", time: Date.now() }), { headers: { "content-type": "application/json" } }) }
