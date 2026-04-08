import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', data.user.id)
        .single()
      const path = profile?.onboarded ? '/garage' : '/meet-walt'
      return NextResponse.redirect(`${origin}${path}`)
    }
  }
  return NextResponse.redirect(`${origin}/login`)
}
