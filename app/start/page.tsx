'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function StartPage() {
  useEffect(() => {
    let cancelled = false

    const routeUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        window.location.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed, onboarded')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (!profile?.profile_completed) {
        window.location.replace('/profile-setup')
        return
      }

      const { count } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (cancelled) return

      window.location.replace(count ? '/garage' : '/garage-setup')
    }

    routeUser().catch(() => {
      if (!cancelled) window.location.replace('/login')
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main
      style={{
        alignItems: 'center',
        background: 'var(--bg)',
        color: 'var(--dark-blue)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-nunito)',
        gap: 16,
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <span
        style={{
          border: '2px solid var(--light-blue)',
          borderRadius: 8,
          display: 'inline-flex',
          padding: '8px 18px 6px',
        }}
      >
        <span
          style={{
            color: 'var(--dark-blue)',
            fontFamily: 'var(--font-barlow)',
            fontSize: 28,
            fontStyle: 'italic',
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          BYLD
        </span>
        <span
          style={{
            color: 'var(--light-blue)',
            fontSize: 24,
            fontWeight: 300,
            lineHeight: 1,
            marginLeft: 1,
          }}
        >
          it
        </span>
      </span>
      <div>
        <h1 style={{ fontSize: '1.35rem', margin: '0 0 6px' }}>
          Getting your garage ready...
        </h1>
        <p
          style={{
            color: 'var(--secondary-text)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            margin: 0,
            maxWidth: 360,
          }}
        >
          We&apos;re checking whether you should sign in, finish your profile,
          or head straight to your garage.
        </p>
      </div>
    </main>
  )
}
