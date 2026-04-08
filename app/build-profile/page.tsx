'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WaltMsg = ({ text }: { text: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
      <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{text}</div>
  </div>
)

const UserReply = ({ text }: { text: string }) => (
  <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '8px 14px', marginBottom: 12, marginLeft: 38, fontSize: '0.9rem', color: 'var(--dark-blue)', textAlign: 'right' }}>{text}</div>
)

const expOptions = [
  { emoji: '\u{1F530}', label: 'Just getting started' },
  { emoji: '\u{1F527}', label: 'Handle the basics' },
  { emoji: '\u2699\uFE0F', label: 'Done this before' },
  { emoji: '\u{1F3C6}', label: 'Blindfolded' },
]

const reasonOptions = [
  { emoji: '\u{1F697}', label: 'Project in the garage' },
  { emoji: '\u{1F50D}', label: 'About to buy one' },
  { emoji: '\u{1F527}', label: 'Specific project' },
  { emoji: '\u{1F6E0}\uFE0F', label: 'Mid-build, need help' },
]

export default function BuildProfilePage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [exp, setExp] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFinish = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        name,
        experience: exp,
        reason,
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
    }
    window.location.href = '/garage'
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>Build Your Profile</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 14 }}>Step 1 of 3</p>
          {(name || exp || reason) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[name, exp, reason].filter(Boolean).map(t => (
                <div key={t} style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem' }}>{t}</div>
              ))}
            </div>
          )}
          <WaltMsg text={<>Alright, let&apos;s get to know each other. <strong>What&apos;s your first name?</strong></>} />
          {step === 1 && (
            <div style={{ marginLeft: 38, marginBottom: 16 }}>
              <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter' && name) setStep(2) }} />
              {name && <button onClick={() => setStep(2)} style={{ marginTop: 10, width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>That&apos;s me &#x2192;</button>}
            </div>
          )}
          {step >= 2 && (
            <>
              <UserReply text={name} />
              <WaltMsg text={<>Good to meet you, {name}. <strong>How much experience do you have wrenching?</strong></>} />
              {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {expOptions.map(o => (
                    <div key={o.label} onClick={() => { setExp(o.emoji + ' ' + o.label); setStep(3) }}
                      style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {step >= 3 && (
            <>
              <UserReply text={exp} />
              <WaltMsg text={<>Nice &#x2014; solid starting point. <strong>What brings you to BYLDit.ai?</strong></>} />
              {step === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {reasonOptions.map(o => (
                    <div key={o.label} onClick={() => { setReason(o.emoji + ' ' + o.label); setStep(4) }}
                      style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {step >= 4 && (
            <>
              <UserReply text={reason} />
              <WaltMsg text="Great &#x2014; I've got what I need. Want to round out your profile? Totally optional." />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg)', border: '2px dashed var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>&#x1F4F7;</div>
                <div><p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-blue)' }}>{name}</p><p style={{ fontSize: '0.75rem', color: 'var(--light-blue)' }}>Add photo</p></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input placeholder="Age" style={{ flex: 1, padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }} />
                <input placeholder="City, State" style={{ flex: 2, padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }} />
              </div>
              <input placeholder="Bio &#x2014; Tell us about yourself..." style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', display: 'block', marginBottom: 10 }} />
              <input placeholder="Dream build &#x2014; What's your dream vehicle?" style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', display: 'block', marginBottom: 18 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleFinish} disabled={saving} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>Skip</button>
                <button onClick={handleFinish} disabled={saving} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Head to my garage \u2192'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa' }}>Tell me about yourself...</div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
      <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
        <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
          {[{ icon: '\u{1F3E0}', label: 'Garage', active: true }, { icon: '\u{1F527}', label: 'Projects', active: false }, { icon: '\u{1F529}', label: 'Parts', active: false }, { icon: '\u{1F4CB}', label: "Walt's Notes", active: false }, { icon: '\u22EF', label: 'More', active: false }].map(item => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
