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
        .select('profile_completed')
        .eq('id', data.user.id)
        .maybeSingle()
      let path = '/profile-setup'

      if (profile?.profile_completed) {
        const { count } = await supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', data.user.id)

        path = count ? '/garage' : '/garage-setup'
      }

      return NextResponse.redirect(`${origin}${path}`)
    }
  }
  return NextResponse.redirect(`${origin}/login`)
}
