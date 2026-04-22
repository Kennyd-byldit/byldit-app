'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

const GOAL_SUB_OPTIONS: Record<string, string[]> = {
  'Maintenance': ['Oil change', 'Tire rotation', 'Brakes', 'Filters', 'Fluids', 'Tune-up'],
  'Body & Paint': ['Full repaint', 'Touch-up / spot repair', 'Rust repair', 'Body panel replacement', 'Prep & primer', 'Vinyl wrap'],
  'Engine Swap': ['Complete swap', 'Engine rebuild', 'Top end only', 'Bottom end only', 'Forced induction', 'Other'],
}

type Vehicle = {
  id: string
  nickname: string
  year: number
  make: string
  model: string
  cover_photo_url: string | null
}

const getVehiclePhoto = (v: Vehicle): string => {
  if (v.cover_photo_url) return v.cover_photo_url
  const model = v.model?.toLowerCase() || ''
  if (model.includes('ranger')) return '/photos/ranger-2025.jpg'
  if (model.includes('f250') || model.includes('f-250')) return '/photos/f250-hiboy-68.jpg'
  return '/photos/f250-hiboy-68.jpg'
}

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[
        { icon: '🏠', label: 'Garage', active: false },
        { icon: '🔧', label: 'Projects', active: true },
        { icon: '🔩', label: 'Parts', active: false },
        { icon: '📋', label: "Walt's Notes", active: false },
      ].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => { if (item.label === 'Garage') window.location.href = '/garage' }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

const WaltBar = () => (
  <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>Ask me anything...</div>
      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

function WorkContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const goals = decodeURIComponent(searchParams.get('goals') || '')
  const condition = searchParams.get('condition') || ''

  const goalList = goals.split(',').filter(Boolean)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      if (!vehicleId) { window.location.replace('/create-project'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }
      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, cover_photo_url')
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single()
      if (!data) { window.location.replace('/create-project'); return }
      setVehicle(data)
      setLoading(false)
    }
    load()
  }, [vehicleId])

  const toggle = (item: string) =>
    setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const canContinue = selected.length > 0 || notes.trim().length > 0

  const handleContinue = () => {
    const work = encodeURIComponent(selected.join(','))
    const notesEnc = encodeURIComponent(notes.trim())
    window.location.href = `/create-project/name?vehicle=${vehicleId}&goals=${encodeURIComponent(goals)}&condition=${condition}&work=${work}&notes=${notesEnc}`
  }

  // Goals that have sub-options defined
  const goalsWithOptions = goalList.filter(g => GOAL_SUB_OPTIONS[g])
  // Goals without sub-options yet — will just show in text prompt
  const goalsWithoutOptions = goalList.filter(g => !GOAL_SUB_OPTIONS[g])

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  )

  if (!vehicle) return null

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = `/create-project/condition?vehicle=${vehicleId}&goals=${encodeURIComponent(goals)}`}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 48 }} />
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Hero photo — scrolls with content */}
          <div style={{ padding: '12px 14px 16px' }}>
            <div style={{ height: 160, position: 'relative', overflow: 'hidden', borderRadius: 16, boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
              <img src={getVehiclePhoto(vehicle)} alt={vehicle.nickname || vehicle.make}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 16px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.65rem', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 18px' }}>

          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>What needs to be done?</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>Select all that apply</p>

          {/* Sections for goals with defined sub-options */}
          {goalsWithOptions.map(goal => (
            <div key={goal} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>{goal}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {GOAL_SUB_OPTIONS[goal].map(item => {
                  const isSelected = selected.includes(item)
                  return (
                    <div key={item} onClick={() => toggle(item)}
                      style={{
                        background: isSelected ? '#4da8da' : 'white',
                        border: `1.5px solid ${isSelected ? '#4da8da' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding: '14px 12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isSelected ? 'white' : 'var(--dark-blue)',
                        lineHeight: 1.3,
                      }}>
                      {item}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Walt tip card */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
            <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
              The more you tell me, the better your plan will be. Don&apos;t hold back — mileage, symptoms, what you&apos;ve already tried, parts you have on hand. I&apos;ll use all of it.
            </p>
          </div>

          {/* Free text field */}
          <div style={{ marginBottom: 24 }}>
            <textarea
              placeholder={goalsWithoutOptions.length > 0
                ? `Describe what needs to be done for: ${goalsWithoutOptions.join(', ')}. Add any other details Walt should know...`
                : "Add any other details — symptoms, parts on hand, what you've already tried..."}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px', background: 'white',
                border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16,
                fontFamily: 'var(--font-nunito)', outline: 'none',
                boxSizing: 'border-box' as const, resize: 'vertical' as const,
                color: 'var(--dark-blue)'
              }}
            />
          </div>

          {/* Continue button */}
          <button onClick={handleContinue} disabled={!canContinue}
            style={{
              width: '100%', padding: '14px',
              background: canContinue ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              borderRadius: 25, border: 'none', color: 'white',
              fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              boxShadow: canContinue ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
            }}>
            Continue →
          </button>

          </div>
        </div>
      </main>

      <WaltBar />
      <NavBar />
    </div>
  )
}

export default function WorkPage() {
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}><p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>Loading...</p></div>}>
      <WorkContent />
    </Suspense>
  )
}
