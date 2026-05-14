'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CreateProjectFrame,
  LoadingScreen,
  Vehicle,
  VehicleHero,
  getVehicleName,
  loadCreateProjectVehicle,
} from '../CreateProjectShared'

function NameContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const goals = searchParams.get('goals') || ''
  const condition = searchParams.get('condition') || ''
  const work = searchParams.get('work') || ''
  const notes = searchParams.get('notes') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      setVehicle(result.vehicle)
      if (result.vehicle) {
        const firstGoal = goals.split(',').filter(Boolean)[0]
        setName(firstGoal ? `${getVehicleName(result.vehicle)} ${firstGoal}` : `${getVehicleName(result.vehicle)} Build`)
      }
      setLoading(false)
    }
    load()
  }, [vehicleId, goals])

  const cleanName = name.trim()
  const canContinue = cleanName.length >= 3
  const backHref = `/create-project/work?vehicle=${vehicleId}&goals=${encodeURIComponent(goals)}&condition=${encodeURIComponent(condition)}&work=${encodeURIComponent(work)}&notes=${encodeURIComponent(notes)}`

  const nextHref = useMemo(() => {
    const params = new URLSearchParams({
      vehicle: vehicleId,
      goals,
      condition,
      work,
      notes,
      name: cleanName,
    })
    return `/create-project/budget?${params.toString()}`
  }, [vehicleId, goals, condition, work, notes, cleanName])

  if (loading) return <LoadingScreen />
  if (!vehicle) return null

  const waltContext = [
    `Screen: Create Project - Name It`,
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    `Selected goals: ${goals || 'not provided'}`,
    `Condition: ${condition || 'not provided'}`,
    `Known work details: ${work || 'none selected'}`,
    `User notes: ${notes || 'none yet'}`,
    `Draft project name: ${cleanName || 'empty'}`,
    'Walt should help explain naming or clarify the purpose of the project, but the user completes the form.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref={backHref}
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine="Name it like you would label a parts bin: clear enough to find later."
      waltPrompt="Ask Walt about naming this build..."
      vehicleId={vehicle.id}
      screen="create-project-name"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />
          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>Name this project</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>Keep it simple. You can change it later.</p>

            <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                Project name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Example: Scout brake refresh"
                maxLength={70}
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 16,
                  fontFamily: 'var(--font-nunito)',
                  outline: 'none',
                  color: 'var(--dark-blue)',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 22, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>✓</span>
              <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
                BYLDit.ai will use this as the project label in your garage, plan, budget, and Walt&apos;s notes.
              </p>
            </div>

            <button onClick={() => { if (canContinue) window.location.href = nextHref }} disabled={!canContinue}
              style={{
                width: '100%',
                padding: '14px',
                background: canContinue ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                boxShadow: canContinue ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}>
              Continue →
            </button>
          </div>
        </div>
      </main>
    </CreateProjectFrame>
  )
}

export default function NamePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NameContent />
    </Suspense>
  )
}
