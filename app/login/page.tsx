'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Yellowtail } from 'next/font/google'

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/garage` }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmail = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/garage` } })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else if (mode === 'signin') window.location.href = '/garage'
    else setError('Check your email to confirm your account!')
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:00 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '28px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p className={yellowtail.className} style={{ fontSize: '2.2rem', color: 'var(--light-blue)', lineHeight: 1, marginBottom: 6 }}>Get Started</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>Your build. Your way.</p>
          </div>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 18px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', color: 'var(--navy)', outline: 'none', display: 'block', marginBottom: 12 }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px 18px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', color: 'var(--navy)', outline: 'none', display: 'block', marginBottom: 18 }} />
          {error && <p style={{ color: error.includes('Check') ? 'var(--light-blue)' : 'red', fontSize: '0.8rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>}
          <button onClick={handleEmail} disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 18 }}>
            {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-blue)', fontFamily: 'var(--font-nunito)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              🍎 Apple
            </button>
            <button onClick={handleGoogle} disabled={loading}
              style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-blue)', fontFamily: 'var(--font-nunito)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              G Google
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} style={{ color: 'var(--light-blue)', fontWeight: 700, cursor: 'pointer' }}>
              {mode === 'signup' ? 'Log in' : 'Sign up free'}
            </span>
          </p>
        </div>
      </main>
    </div>
  )
}
