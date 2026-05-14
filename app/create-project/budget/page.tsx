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

const BUDGET_OPTIONS = [
  { label: 'Under $500', value: '500', helper: 'Small fixes, service, inspection work' },
  { label: '$500 - $2,500', value: '2500', helper: 'Parts, cleanup, focused repairs' },
  { label: '$2,500 - $10,000', value: '10000', helper: 'Major systems or staged upgrades' },
  { label: '$10,000+', value: '15000', helper: 'Deep restoration or serious modifications' },
]

function BudgetContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const goals = searchParams.get('goals') || ''
  const condition = searchParams.get('condition') || ''
  const work = searchParams.get('work') || ''
  const notes = searchParams.get('notes') || ''
  const projectName = searchParams.get('name') || ''
  const projectPhotoUrl = searchParams.get('photo') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState('')
  const [customBudget, setCustomBudget] = useState('')
  const [decideLater, setDecideLater] = useState(false)
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      if (!projectName.trim()) { window.location.replace('/create-project'); return }
      setVehicle(result.vehicle)
      setLoading(false)
    }
    load()
  }, [vehicleId, projectName])

  const chosenBudget = decideLater ? '' : (customBudget.trim() || budget)
  const canContinue = decideLater || chosenBudget.length > 0
  const backHref = `/create-project/name?vehicle=${vehicleId}&goals=${encodeURIComponent(goals)}&condition=${encodeURIComponent(condition)}&work=${encodeURIComponent(work)}&notes=${encodeURIComponent(notes)}&photo=${encodeURIComponent(projectPhotoUrl)}`

  const nextHref = useMemo(() => {
    const params = new URLSearchParams({
      vehicle: vehicleId,
      goals,
      condition,
      work,
      notes,
      name: projectName,
      photo: projectPhotoUrl,
      budget: chosenBudget,
      budgetMode: decideLater ? 'later' : 'estimate',
    })
    return `/create-project/build-plan?${params.toString()}`
  }, [vehicleId, goals, condition, work, notes, projectName, projectPhotoUrl, chosenBudget, decideLater])

  if (loading) return <LoadingScreen />
  if (!vehicle) return null

  const waltContext = [
    `Screen: Create Project - Budget`,
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    `Project name: ${projectName}`,
    `Selected goals: ${goals || 'not provided'}`,
    `Condition: ${condition || 'not provided'}`,
    `Known work details: ${work || 'none selected'}`,
    `User notes: ${notes || 'none yet'}`,
    `Project photo: ${projectPhotoUrl ? 'custom project photo selected' : 'using vehicle photo or add later'}`,
    `Budget selection: ${decideLater ? 'decide later' : chosenBudget || 'empty'}`,
    'Walt should help explain tradeoffs and set expectations, not force a budget.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref={backHref}
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine="A budget is a guardrail, not a promise. Pick the lane you want me planning inside."
      waltPrompt="Ask Walt about budget range..."
      vehicleId={vehicle.id}
      screen="create-project-budget"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />
          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>Set a starting budget</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>A rough number helps BYLDit.ai shape the first plan.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {BUDGET_OPTIONS.map(option => {
                const selected = budget === option.value && !customBudget && !decideLater
                return (
                  <button key={option.value}
                    onClick={() => { setBudget(option.value); setCustomBudget(''); setDecideLater(false) }}
                    style={{
                      minHeight: 58,
                      width: '100%',
                      padding: '12px 14px',
                      textAlign: 'left',
                      background: selected ? '#4da8da' : 'white',
                      border: `1.5px solid ${selected ? '#4da8da' : 'var(--border)'}`,
                      borderRadius: 14,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-nunito)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                    <span style={{ display: 'block', color: selected ? 'white' : 'var(--dark-blue)', fontWeight: 800, fontSize: '0.95rem' }}>{option.label}</span>
                    <span style={{ display: 'block', color: selected ? 'rgba(255,255,255,0.88)' : 'var(--secondary-text)', fontSize: '0.73rem', marginTop: 2 }}>{option.helper}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                Or enter a number
              </label>
              <input
                inputMode="numeric"
                value={customBudget}
                onChange={e => {
                  const next = e.target.value.replace(/[^\d]/g, '')
                  setCustomBudget(next)
                  setDecideLater(false)
                }}
                placeholder="Example: 7500"
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

            <button onClick={() => { setDecideLater(true); setBudget(''); setCustomBudget('') }}
              style={{
                width: '100%',
                minHeight: 48,
                marginBottom: 22,
                background: decideLater ? '#24507a' : 'white',
                border: `1.5px solid ${decideLater ? '#24507a' : 'var(--border)'}`,
                borderRadius: 25,
                color: decideLater ? 'white' : 'var(--dark-blue)',
                fontSize: '0.9rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: 'pointer',
              }}>
              I&apos;ll decide later
            </button>

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

export default function BudgetPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BudgetContent />
    </Suspense>
  )
}
