import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If not logged in and trying to access protected pages, redirect to login
  const protectedRoutes = ['/garage', '/build-profile', '/meet-walt']
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in and on login page, redirect appropriately
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (profile?.onboarded) {
      return NextResponse.redirect(new URL('/garage', request.url))
    } else {
      return NextResponse.redirect(new URL('/meet-walt', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|avatars|photos).*)'],
}
