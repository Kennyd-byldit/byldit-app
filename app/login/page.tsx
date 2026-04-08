import { Yellowtail } from 'next/font/google'

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] })

export default function LoginPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:00 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* App Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '28px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>

          {/* Get Started */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p className={yellowtail.className} style={{ fontSize: '2.2rem', color: 'var(--light-blue)', lineHeight: 1, marginBottom: 6 }}>Get Started</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Your build. Your way.</p>
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: 25,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-nunito)',
              color: 'var(--navy)',
              outline: 'none',
              display: 'block',
              marginBottom: 12,
            }}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: 25,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-nunito)',
              color: 'var(--navy)',
              outline: 'none',
              display: 'block',
              marginBottom: 18,
            }}
          />

          {/* Create Account CTA */}
          <button style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #e8750a, #f4a543)',
            borderRadius: 25,
            border: 'none',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 700,
            fontFamily: 'var(--font-nunito)',
            boxShadow: '0 6px 20px rgba(232,117,10,0.3)',
            cursor: 'pointer',
            marginBottom: 18,
          }}>
            Create Account
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Apple + Google side by side */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button style={{
              flex: 1,
              padding: '12px',
              background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: 14,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--dark-blue)',
              fontFamily: 'var(--font-nunito)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              🍎 Apple
            </button>
            <button style={{
              flex: 1,
              padding: '12px',
              background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: 14,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--dark-blue)',
              fontFamily: 'var(--font-nunito)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              G Google
            </button>
          </div>

          {/* Log in link */}
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--light-blue)', fontWeight: 700, cursor: 'pointer' }}>Log in</span>
          </p>

        </div>
      </main>

    </div>
  )
}
