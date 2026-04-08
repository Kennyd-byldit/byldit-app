import Image from 'next/image'

// Temporary mock data — will be replaced with real Supabase data
const mockUser = { name: 'Kenny' }
const mockVehicle = {
  nickname: 'Betty Lou',
  year: 1968,
  make: 'Ford',
  model: 'F-250 Hi-Boy',
  photo: '/photos/f250-hiboy-68.jpg',
  project: {
    name: 'Full Restoration',
    progress: 34,
    currentStep: 'Prep firewall for paint',
    phase: 'Phase 2 · Engine Work',
  },
  stats: {
    myPlan: '2/6',
    waltsNotes: 2,
    budget: '$13.8k',
    upNext: 3,
  },
}

export default function GaragePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* App Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-barlow)',
          fontSize: '1.8rem',
          fontWeight: 800,
          fontStyle: 'italic',
          color: 'white',
        }}>
          BYLD
          <span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>

      {/* Content */}
      <main style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto', paddingBottom: 120 }}>

        {/* Welcome Back — free floating, centered, above the card */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '1.4rem', fontWeight: 300, color: 'var(--dark-blue)' }}>
            Welcome Back,
          </p>
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)' }}>
            {mockUser.name}
          </p>
        </div>

        {/* Betty Lou Photo Card — separate card below welcome */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(36,80,122,0.1)',
          marginBottom: 12,
          position: 'relative',
        }}>
          {/* ACTIVE BUILD badge */}
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'var(--orange)',
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            zIndex: 10,
            fontFamily: 'var(--font-nunito)',
          }}>
            ACTIVE BUILD
          </div>

          {/* Vehicle Photo */}
          <div style={{ position: 'relative', height: 180 }}>
            <Image
              src={mockVehicle.photo}
              alt={mockVehicle.nickname}
              fill
              style={{ objectFit: 'cover' }}
            />
            {/* Vehicle name overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '32px 14px 10px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
            }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {mockVehicle.nickname}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem' }}>
                {mockVehicle.year} {mockVehicle.make} {mockVehicle.model}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: '12px 14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4 }}>
                <div style={{ width: `${mockVehicle.project.progress}%`, height: '100%', background: 'var(--orange)', borderRadius: 4 }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--dark-blue)' }}>
                {mockVehicle.project.progress}%
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', marginBottom: 12 }}>
              {mockVehicle.project.phase} · Next: {mockVehicle.project.currentStep}
            </p>
          </div>

          {/* CTA Button */}
          <div style={{ padding: '0 14px 14px' }}>
            <button className="cta-gradient">
              Pick Up Where I Left Off →
            </button>
          </div>
        </div>

        {/* Stat Cards — 4 across in a single row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'My Plan', value: mockVehicle.stats.myPlan, color: 'var(--dark-blue)' },
            { label: "Walt's Notes", value: mockVehicle.stats.waltsNotes, color: 'var(--orange)' },
            { label: 'Budget', value: mockVehicle.stats.budget, color: 'var(--dark-blue)' },
            { label: 'Up Next', value: mockVehicle.stats.upNext, color: 'var(--light-blue)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1,
              background: 'white',
              borderRadius: 12,
              padding: '8px 4px',
              textAlign: 'center',
              border: `1.5px solid ${stat.color}`,
              cursor: 'pointer',
              minWidth: 0,
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: '0.5rem', color: 'var(--secondary-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Add to My Garage */}
        <div style={{
          border: '2px dashed var(--light-blue)',
          borderRadius: 25,
          padding: '12px',
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          <span style={{ color: 'var(--light-blue)', fontWeight: 700, fontSize: '0.9rem' }}>+ Add to My Garage</span>
        </div>

      </main>

      {/* Walt Input Bar */}
      <div style={{
        position: 'fixed',
        bottom: 58,
        left: 0,
        right: 0,
        background: 'white',
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            flex: 1,
            background: 'var(--bg)',
            borderRadius: 25,
            padding: '10px 16px',
            fontSize: '0.85rem',
            color: '#aaa',
            fontFamily: 'var(--font-nunito)',
          }}>
            Ask me about your garage...
          </div>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '2px solid var(--orange)',
            background: 'linear-gradient(135deg, var(--orange), var(--gold))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            fontSize: '1.1rem',
          }}>
            🔧
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--border)',
        padding: '6px 0 4px',
      }}>
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
              <div style={{
                fontSize: '0.55rem',
                fontWeight: item.active ? 700 : 400,
                color: item.active ? 'var(--orange)' : 'var(--secondary-text)',
                fontFamily: 'var(--font-nunito)',
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </nav>

    </div>
  )
}
