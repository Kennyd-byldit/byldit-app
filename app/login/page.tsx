import { Yellowtail } from 'next/font/google'
import Link from 'next/link'

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] })

export default function LoginPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* App Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>

          {/* Welcome */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p className={yellowtail.className} style={{ fontSize: '2rem', color: 'var(--light-blue)', lineHeight: 1 }}>Get Started</p>
            <p style={{ fontSize: '1rem', color: 'var(--secondary-text)', marginTop: 6 }}>Turn stalled dreams into finished builds.</p>
          </div>

          {/* Google Sign In */}
          <button style={{
            width: '100%',
            padding: '14px',
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            marginBottom: 16,
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--dark-blue)',
            fontFamily: 'var(--font-nunito)',
          }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Email address"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontFamily: 'var(--font-nunito)',
                color: 'var(--navy)',
                outline: 'none',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              placeholder="Password"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 12,
                fontSize: '0.95rem',
                fontFamily: 'var(--font-nunito)',
                color: 'var(--navy)',
                outline: 'none',
              }}
            />
          </div>

          {/* Sign In CTA */}
          <button style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #e8750a, #f4a543)',
            borderRadius: 50,
            border: 'none',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 700,
            fontFamily: 'var(--font-nunito)',
            boxShadow: '0 6px 20px rgba(232,117,10,0.3)',
            cursor: 'pointer',
            marginBottom: 16,
          }}>
            Sign In →
          </button>

          {/* Sign Up link */}
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            Don&apos;t have an account?{' '}
            <span style={{ color: 'var(--orange)', fontWeight: 700, cursor: 'pointer' }}>Sign up free</span>
          </p>

        </div>
      </main>

    </div>
  )
}
