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

// Mock vehicle data — will be replaced with real Supabase data
const mockVehicle = {
  nickname: 'Betty Lou',
  year: 1968,
  make: 'Ford',
  model: 'F-250 Hi-Boy',
  photo: '/photos/f250-hiboy-68.jpg',
  project: { progress: 34, currentStep: 'Prep the firewall', type: 'Full Restoration', phase: 'Phase 2 · Engine Work' },
  stats: { myPlan: '2/6', waltsNotes: 2, budget: '$13.8k', upNext: 3 },
  flagged: 2,
  daysSince: 5,
}

export default function GaragePage() {
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      // Use profile name, or fall back to email prefix
      const name = profile?.name || user.email?.split('@')[0] || 'there'
      setUserName(name)
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

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>11:32 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* App Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px', paddingBottom: 20 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Welcome Back */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p className={yellowtail.className} style={{ fontSize: '1.5rem', color: 'var(--light-blue)', lineHeight: 1 }}>Welcome Back,</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)', letterSpacing: -0.5, lineHeight: 1.15 }}>{userName}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginTop: 4 }}>
              {mockVehicle.daysSince} days since your last session ·{' '}
              <span style={{ fontWeight: 800, color: 'var(--orange)' }}>{mockVehicle.flagged} items flagged</span>
            </p>
          </div>

          {/* Betty Lou Photo Card */}
          <div style={{ height: 160, marginBottom: 8, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
            <Image src={mockVehicle.photo} alt={mockVehicle.nickname} fill style={{ objectFit: 'cover', objectPosition: 'center 35%' }} />
            <div style={{ position: 'absolute', top: 8, right: 10, background: 'var(--orange)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-nunito)' }}>
              ACTIVE BUILD
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>{mockVehicle.nickname}</p>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {mockVehicle.year} {mockVehicle.make} {mockVehicle.model} · {mockVehicle.project.type}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 6 }}>
              <div style={{ width: `${mockVehicle.project.progress}%`, height: '100%', background: 'var(--orange)', borderRadius: 4 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--orange)' }}>{mockVehicle.project.progress}%</span>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 50, padding: '12px 16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 10 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Pick Up Where I Left Off &#x2192;</p>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', marginTop: 2 }}>Step 14 · {mockVehicle.project.currentStep}</p>
          </div>

          {/* Stat Cards */}
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

          {/* Add to My Garage */}
          <div style={{ border: '2px dashed var(--light-blue)', borderRadius: 25, padding: '11px', textAlign: 'center', cursor: 'pointer' }}>
            <span style={{ color: 'var(--light-blue)', fontWeight: 700, fontSize: '0.9rem' }}>+ Add to My Garage</span>
          </div>

        </div>
      </main>

      {/* Walt Input Bar */}
      <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>
            Ask me about your garage...
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
        <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
          {[
            { icon: '🏠', label: 'Garage', active: true },
            { icon: '🔧', label: 'Projects', active: false },
            { icon: '🔩', label: 'Parts', active: false },
            { icon: '📋', label: "Walt's Notes", active: false },
            { icon: '⋯', label: 'More', active: false },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </nav>

    </div>
  )
}
