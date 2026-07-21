export function GET() {
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export const POST = GET
export const PATCH = GET
export const PUT = GET
export const DELETE = GET
