'use client'

import type { ReactNode } from 'react'
import { APP_NAV_ITEMS, WALT_AVATAR_URL } from '@/lib/app-constants'
import { getVehicleName, getVehiclePhoto } from '@/lib/vehicle-display'
import type { VehicleSummary } from '@/lib/types'

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>{label}</p>
    </div>
  )
}

export function MobileHeader({
  backHref,
  backLabel = 'Back',
  onBack,
  rightWidth = 48,
}: {
  backHref?: string
  backLabel?: string
  onBack?: () => void
  rightWidth?: number
}) {
  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    if (backHref) window.location.href = backHref
  }

  return (
    <>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={handleBack}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← {backLabel}
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: rightWidth }} />
      </header>
    </>
  )
}

export function BottomNav({ active = 'Garage' }: { active?: string }) {
  return (
    <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
      <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
        {APP_NAV_ITEMS.map(item => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: item.href ? 'pointer' : 'default' }}
            onClick={() => { if (item.href) window.location.href = item.href }}>
            <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
            <div style={{ fontSize: '0.55rem', fontWeight: item.label === active ? 700 : 400, color: item.label === active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </nav>
  )
}

export function WaltEntryBar({ onOpenWalt, prompt }: { onOpenWalt?: () => void, prompt?: string }) {
  return (
    <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
        <div onClick={onOpenWalt} style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#8395a7', fontFamily: 'var(--font-nunito)', cursor: onOpenWalt ? 'pointer' : 'default' }}>
          {prompt || 'Ask Walt about this step...'}
        </div>
        <div onClick={onOpenWalt} style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: onOpenWalt ? 'pointer' : 'default' }}>
          <img src={WALT_AVATAR_URL} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  )
}

export function MobileAppFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      {children}
    </div>
  )
}

export function VehicleHero({ vehicle }: { vehicle: VehicleSummary }) {
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
