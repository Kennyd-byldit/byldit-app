import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return Response.json(
      { error: 'Demo reset is not configured yet.' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return Response.json({ error: 'Missing active session.' }, { status: 401 })
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey)
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token)

  if (userError || !user) {
    return Response.json({ error: 'Could not verify demo user.' }, { status: 401 })
  }

  const isDemoUser =
    user.user_metadata?.demo_mode === true ||
    user.app_metadata?.demo_mode === true ||
    user.email?.toLowerCase().includes('demo') === true ||
    user.email?.toLowerCase().includes('test') === true

  if (!isDemoUser) {
    return Response.json(
      { error: 'This reset is only available for demo users.' },
      { status: 403 },
    )
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey)
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
