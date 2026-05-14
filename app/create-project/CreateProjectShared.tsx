'use client'
import WaltPanel from '@/components/WaltPanel'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

export type Vehicle = {
  id: string
  nickname: string | null
  year: number
  make: string
  model: string
  cover_photo_url: string | null
}

export const getVehicleName = (vehicle: Vehicle) =>
  vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`

export const getVehiclePhoto = (vehicle: Vehicle): string | null => {
  if (vehicle.cover_photo_url) return vehicle.cover_photo_url
  const model = vehicle.model?.toLowerCase() || ''
  if (model.includes('ranger')) return '/photos/ranger-2025.jpg'
  if (model.includes('f250') || model.includes('f-250')) return '/photos/f250-hiboy-68.jpg'
  return null
}

export const LoadingScreen = ({ label = 'Loading...' }: { label?: string }) => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
    <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>{label}</p>
  </div>
)

export const Header = ({ backHref }: { backHref: string }) => (
  <>
    <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
    </div>
    <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <button onClick={() => window.location.href = backHref}
        style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back
      </button>
      <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
        BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
      </span>
      <div style={{ width: 48 }} />
    </header>
  </>
)

export const NavBar = () => (
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

export const WaltBar = ({ onOpenWalt, prompt }: { onOpenWalt: () => void, prompt?: string }) => (
  <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
      <div onClick={onOpenWalt} style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#8395a7', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
        {prompt || 'Ask Walt about this step...'}
      </div>
      <div onClick={onOpenWalt} style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

export const VehicleHero = ({ vehicle }: { vehicle: Vehicle }) => {
  const photo = getVehiclePhoto(vehicle)

  return (
    <div style={{ padding: '12px 14px 16px' }}>
      <div style={{ height: 150, position: 'relative', overflow: 'hidden', borderRadius: 16, boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
        {photo ? (
          <img src={photo} alt={getVehicleName(vehicle)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--dark-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', margin: 0 }}>{vehicle.year} {vehicle.make}</p>
            <p style={{ color: 'var(--light-blue)', fontSize: '0.85rem', margin: 0 }}>{vehicle.model}</p>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 16px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
          <p style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
            {getVehicleName(vehicle)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.65rem', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        </div>
      </div>
    </div>
  )
}

export const CreateProjectFrame = ({
  backHref,
  children,
  waltOpen,
  onOpenWalt,
  onCloseWalt,
  waltContext,
  waltOpeningLine,
  waltPrompt,
  vehicleId,
  screen,
}: {
  backHref: string
  children: React.ReactNode
  waltOpen: boolean
  onOpenWalt: () => void
  onCloseWalt: () => void
  waltContext: string
  waltOpeningLine: string
  waltPrompt?: string
  vehicleId?: string
  screen: string
}) => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
    <Header backHref={backHref} />
    {children}
    <WaltBar onOpenWalt={onOpenWalt} prompt={waltPrompt} />
    <NavBar />
    <WaltPanel
      open={waltOpen}
      onClose={onCloseWalt}
      context={waltContext}
      openingLine={waltOpeningLine}
      vehicleId={vehicleId}
      screen={screen}
    />
  </div>
)

export async function loadCreateProjectVehicle(vehicleId: string) {
  if (!vehicleId) return { vehicle: null, needsRedirect: '/create-project' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { vehicle: null, needsRedirect: '/login' }

  const { data } = await supabase
    .from('vehicles')
    .select('id, nickname, year, make, model, cover_photo_url')
    .eq('id', vehicleId)
    .eq('user_id', user.id)
    .single()

  if (!data) return { vehicle: null, needsRedirect: '/create-project' }
  return { vehicle: data as Vehicle, needsRedirect: null, userId: user.id }
}
