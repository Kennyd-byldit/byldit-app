'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    const prepareRecoverySession = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const hashError = hashParams.get('error_description') || hashParams.get('error')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error && !cancelled) {
          setError(error.message)
          setLoading(false)
          return
        }
        window.history.replaceState({}, document.title, '/reset-password')
      }

      if (!code && accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error && !cancelled) {
          setError(error.message)
          setLoading(false)
          return
        }
        window.history.replaceState({}, document.title, '/reset-password')
      }

      if (!code && !accessToken && hashError && !cancelled) {
        setError(hashError)
        setLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!cancelled) {
        setReady(Boolean(session))
        setLoading(false)
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        setLoading(false)
        setError('')
      }
    })

    prepareRecoverySession().catch(() => {
      if (!cancelled) {
        setError('This reset link is invalid or expired. Please request a new one.')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const updatePassword = async () => {
    setError('')
    setNotice('')

    if (password.length < 6) {
      setError('Please use at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setNotice('Password updated. You can sign in with your new password.')
    setPassword('')
    setConfirmPassword('')
  }

  const inputStyle: React.CSSProperties = {
    background: 'white',
    border: '1.5px solid var(--border)',
    borderRadius: 25,
    boxSizing: 'border-box',
    color: 'var(--navy)',
    display: 'block',
    fontFamily: 'var(--font-nunito)',
    fontSize: 16,
    marginBottom: 12,
    outline: 'none',
    padding: '14px 18px',
    width: '100%',
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
            <p style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem', color: 'var(--dark-blue)', lineHeight: 1, marginBottom: 8 }}>Choose New Password</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--secondary-text)' }}>
              {loading ? 'Checking your reset link...' : 'Create a new password for your BYLDit account.'}
            </p>
          </div>

          {error && (
            <p style={{ color: '#e74c3c', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: 14, textAlign: 'center' }}>{error}</p>
          )}
          {notice && (
            <p style={{ color: 'var(--light-blue)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: 14, textAlign: 'center' }}>{notice}</p>
          )}

          {!loading && ready && !notice && (
            <>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') updatePassword() }}
                style={{ ...inputStyle, marginBottom: 18 }}
              />
              <button
                onClick={updatePassword}
                disabled={saving}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 18 }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}

          {!loading && !ready && !notice && (
            <a href="/login" style={{ alignItems: 'center', background: 'var(--dark-blue)', borderRadius: 25, color: 'white', display: 'flex', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center', padding: '14px', textDecoration: 'none', width: '100%' }}>
              Back to Login
            </a>
          )}

          {notice && (
            <a href="/login" style={{ alignItems: 'center', background: 'var(--dark-blue)', borderRadius: 25, color: 'white', display: 'flex', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center', padding: '14px', textDecoration: 'none', width: '100%' }}>
              Back to Login
            </a>
          )}
        </div>
      </main>
    </div>
  )
}
