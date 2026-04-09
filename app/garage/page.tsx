'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Yellowtail } from 'next/font/google'
import { createClient } from '@supabase/supabase-js'

const yellowtail = Yellowtail({ weight: '400', subsets: ['latin'] })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

// Mock vehicle data — replace with real Supabase query once projects are built
const mockVehicle = {
  nickname: 'Betty Lou',
  year: 1968, make: 'Ford', model: 'F-250 Hi-Boy',
  photo: '/photos/f250-hiboy-68.jpg',
  project: { progress: 34, currentStep: 'Prep the firewall', type: 'Full Restoration' },
  stats: { myPlan: '2/6', waltsNotes: 2, budget: '$13.8k', upNext: 3 },
  flagged: 2, daysSince: 5,
}

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }, { icon: '⋯', label: 'More', active: false }].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
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
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>Ask me about your garage...</div>
      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

const AppHeader = () => (
  <>
    <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>11:32 AM</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
    </div>
    <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
        BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
      </span>
    </header>
  </>
)

export default function GaragePage() {
  const [userName, setUserName] = useState('')
  const [hasVehicles, setHasVehicles] = useState(false)
  const [firstVehicle, setFirstVehicle] = useState<{nickname: string, year: number, make: string, model: string} | null>(null)
  const [hasActiveProject, setHasActiveProject] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single()
      const { data: vehicles } = await supabase.from('vehicles').select('id, nickname, year, make, model').eq('user_id', user.id).limit(1)
      setUserName(profile?.name || user.email?.split('@')[0] || 'there')
      setHasVehicles((vehicles?.length ?? 0) > 0)
      if (vehicles && vehicles.length > 0) setFirstVehicle(vehicles[0])
      // Check for active project
      const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id).eq('status', 'active').limit(1)
      setHasActiveProject((projects?.length ?? 0) > 0)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={WALT} alt="Walt" style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--orange)', marginBottom: 12 }} />
        <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading your garage...</p>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <AppHeader />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px', paddingBottom: 20 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {hasVehicles ? (
            <>
              {/* ====================================================
                  LOCKED LAYOUT ORDER (Apr 5, KD approved) — DO NOT REORDER
                  1. Vehicle photo card
                  2. Progress bar (active project only)
                  3. Welcome Back, [name]
                  4. CTA button (active project only)
                  5. 4 stat cards (active project only)
                  6. + Add to My Garage
                  ==================================================== */}

              {/* 1. Vehicle Photo Card */}
              <div style={{ height: 160, marginBottom: 8, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
                <Image src={mockVehicle.photo} alt={mockVehicle.nickname} fill style={{ objectFit: 'cover', objectPosition: 'center 35%' }} />
                <div style={{ position: 'absolute', top: 8, right: 10, background: 'var(--orange)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>ACTIVE BUILD</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>{firstVehicle?.nickname || mockVehicle.nickname}</p>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {firstVehicle ? firstVehicle.year + " " + firstVehicle.make + " " + firstVehicle.model : mockVehicle.year + " " + mockVehicle.make + " " + mockVehicle.model} · {mockVehicle.project.type}
                  </p>
                </div>
              </div>

              {/* 2. Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${mockVehicle.project.progress}%`, height: '100%', background: 'var(--orange)', borderRadius: 4 }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--orange)' }}>{mockVehicle.project.progress}%</span>
              </div>

              {/* 3. Welcome Back */}
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <p className={yellowtail.className} style={{ fontSize: '1.5rem', color: 'var(--light-blue)', lineHeight: 1 }}>Welcome Back,</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)', letterSpacing: -0.5, lineHeight: 1.15 }}>{userName}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginTop: 4 }}>
                  {mockVehicle.daysSince} days since your last session &middot;{' '}
                  <span style={{ fontWeight: 800, color: 'var(--orange)' }}>{mockVehicle.flagged} items flagged</span>
                </p>
              </div>

              {/* 4. CTA */}
              <div style={{ background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 50, padding: '12px 16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 10 }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Pick Up Where I Left Off &#x2192;</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', marginTop: 2 }}>Step 14 &middot; {mockVehicle.project.currentStep}</p>
              </div>

              {/* 5. Stat Cards */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[
                  { label: 'My Plan', value: mockVehicle.stats.myPlan, color: 'var(--dark-blue)' },
                  { label: "Walt's Notes", value: mockVehicle.stats.waltsNotes, color: 'var(--orange)' },
                  { label: 'Budget', value: mockVehicle.stats.budget, color: 'var(--dark-blue)' },
                  { label: 'Up Next', value: mockVehicle.stats.upNext, color: 'var(--light-blue)' },
                ].map((stat) => (
                  <div key={stat.label} style={{ flex: 1, background: 'white', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1.5px solid ${stat.color}`, cursor: 'pointer', minWidth: 0 }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: '0.5rem', color: 'var(--secondary-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* 6. Add to My Garage */}
              <div style={{ border: '2px dashed var(--light-blue)', borderRadius: 25, padding: '11px', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ color: 'var(--light-blue)', fontWeight: 700, fontSize: '0.9rem' }}>+ Add to My Garage</span>
              </div>
            </>
          ) : (
            // EMPTY STATE — no vehicles yet
            <div style={{ paddingTop: 20 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--dark-blue)', lineHeight: 1 }}>Welcome,</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)' }}>{userName}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '12px 16px', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>
                  Your garage is empty. Let&apos;s fix that &mdash; add your first vehicle and we&apos;ll build your plan together.
                </div>
              </div>
              <div style={{ background: 'white', border: '2px dashed var(--light-blue)', borderRadius: 16, padding: '28px 20px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚗</div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--light-blue)', marginBottom: 4 }}>+ Add your first vehicle</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Year &middot; Make &middot; Model &middot; Nickname</p>
              </div>
            </div>
          )}

        </div>
      </main>
      <WaltBar />
      <NavBar />
    </div>
  )
}
