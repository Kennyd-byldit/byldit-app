'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Yellowtail } from 'next/font/google'

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getRedirectPath(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', userId)
    .single()
  return data?.onboarded ? '/garage' : '/meet-walt'
}

type View = 'landing' | 'signup' | 'signin'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  background: 'white',
  border: '1.5px solid var(--border)',
  borderRadius: 25,
  fontSize: 16,
  fontFamily: 'var(--font-nunito)',
  color: 'var(--navy)',
  outline: 'none',
  display: 'block',
  marginBottom: 12,
  boxSizing: 'border-box',
}

const googleSvg = (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
)

export default function LoginPage() {
  const [view, setView] = useState<View>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = (nextView: View) => {
    setEmail('')
    setPassword('')
    setError('')
    setView(nextView)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleSignup = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) {
      setError(error.message)
    } else if (data.session) {
      const path = await getRedirectPath(data.session.user.id)
      window.location.href = path
    } else {
      setError('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  const handleSignin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else if (data.user) {
      const path = await getRedirectPath(data.user.id)
      window.location.href = path
    }
    setLoading(false)
  }

  const Divider = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}>or jump right in</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )

  const SimpleDivider = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )

  const GoogleButton = () => (
    <button onClick={handleGoogle} disabled={loading}
      style={{ width: '100%', padding: '14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-blue)', fontFamily: 'var(--font-nunito)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      {googleSvg}
      Continue with Google
    </button>
  )

  const BackLink = () => (
    <p style={{ textAlign: 'center', marginTop: 4 }}>
      <span onClick={() => reset('landing')}
        style={{ fontSize: '0.82rem', color: 'var(--secondary-text)', cursor: 'pointer' }}>
        &larr; Back
      </span>
    </p>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:00 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '28px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>

          {/* LANDING VIEW */}
          {view === 'landing' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <p className={yellowtail.className} style={{ fontSize: '2.4rem', color: 'var(--dark-blue)', lineHeight: 1, marginBottom: 8 }}>Get Started</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary-text)' }}>Your build. Your way.</p>
              </div>
              <button onClick={() => reset('signup')}
                style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 14 }}>
                Create My Account
              </button>
              <button onClick={() => reset('signin')}
                style={{ width: '100%', padding: '15px', background: 'white', border: '2px solid var(--dark-blue)', borderRadius: 25, color: 'var(--dark-blue)', fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer', marginBottom: 28 }}>
                I Already Have an Account
              </button>
              <Divider />
              <GoogleButton />
            </>
          )}

          {/* SIGNUP VIEW */}
          {view === 'signup' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p className={yellowtail.className} style={{ fontSize: '2.2rem', color: '#e8750a', lineHeight: 1, marginBottom: 8 }}>Create Account</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary-text)' }}>Let&apos;s get your build started.</p>
              </div>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSignup() }}
                style={{ ...inputStyle, marginBottom: 18 }} />
              {error && (
                <p style={{ color: error.includes('Check') ? 'var(--light-blue)' : '#e74c3c', fontSize: '0.8rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>
              )}
              <button onClick={handleSignup} disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 20 }}>
                {loading ? 'Loading...' : 'Create My Account \u2192'}
              </button>
              <SimpleDivider />
              <GoogleButton />
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: 8 }}>
                Already have an account?{' '}
                <span onClick={() => reset('signin')} style={{ color: 'var(--light-blue)', fontWeight: 700, cursor: 'pointer' }}>
                  Log in
                </span>
              </p>
              <BackLink />
            </>
          )}

          {/* SIGNIN VIEW */}
          {view === 'signin' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p className={yellowtail.className} style={{ fontSize: '2.2rem', color: 'var(--dark-blue)', lineHeight: 1, marginBottom: 8 }}>Welcome Back</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary-text)' }}>Good to see you again.</p>
              </div>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSignin() }}
                style={{ ...inputStyle, marginBottom: 18 }} />
              {error && (
                <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>
              )}
              <button onClick={handleSignin} disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'var(--dark-blue)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(36,80,122,0.3)', cursor: 'pointer', marginBottom: 20 }}>
                {loading ? 'Loading...' : 'Sign In \u2192'}
              </button>
              <SimpleDivider />
              <GoogleButton />
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: 8 }}>
                Don&apos;t have an account?{' '}
                <span onClick={() => reset('signup')} style={{ color: '#e8750a', fontWeight: 700, cursor: 'pointer' }}>
                  Sign up free
                </span>
              </p>
              <BackLink />
            </>
          )}

        </div>
      </main>
    </div>
  )
}
