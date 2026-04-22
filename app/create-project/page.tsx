'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

type Vehicle = {
  id: string
  nickname: string
  year: number
  make: string
  model: string
  cover_photo_url: string | null
  is_primary: boolean
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
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>
        Ask me anything...
      </div>
      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

export default function CreateProjectPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }
      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, cover_photo_url, is_primary')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
      setVehicles(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = '/garage'}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 48 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 18px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>Start a Build</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: 24 }}>What are we working on?</p>

          {/* Option 1: Vehicle already in garage */}
          {vehicles.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>
                A vehicle I already own
              </p>
              {vehicles.map(v => (
                <div key={v.id}
                  onClick={() => window.location.href = `/create-project/goal?vehicle=${v.id}`}
                  style={{ background: 'white', borderRadius: 14, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', alignItems: 'stretch', cursor: 'pointer', border: '1.5px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--light-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div style={{ width: 90, flexShrink: 0, overflow: 'hidden' }}>
                    <img src={getVehiclePhoto(v)} alt={v.nickname || v.make}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark-blue)', marginBottom: 2 }}>
                      {v.nickname || `${v.year} ${v.make} ${v.model}`}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>{v.year} {v.make} {v.model}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 16, color: 'var(--light-blue)', fontSize: '1.2rem' }}>›</div>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Option 2: New vehicle */}
          <div onClick={() => window.location.href = '/add-vehicle?from=create-project'}
            style={{ background: 'white', borderRadius: 14, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid var(--border)' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark-blue)', marginBottom: 2 }}>Add a new vehicle</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Add it to your garage and start a build</p>
            </div>
            <span style={{ color: 'var(--light-blue)', fontSize: '1.2rem' }}>›</span>
          </div>

          {/* Option 3: Dream build */}
          <div onClick={() => window.location.href = '/add-vehicle?from=create-project&type=dream'}
            style={{ background: 'white', borderRadius: 14, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid var(--border)' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark-blue)', marginBottom: 2 }}>Plan a dream build</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>You don&apos;t own it yet — but you can plan it</p>
            </div>
            <span style={{ color: 'var(--light-blue)', fontSize: '1.2rem' }}>›</span>
          </div>

        </div>
      </main>

      <WaltBar />
      <NavBar />
    </div>
  )
}
