'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CreateProjectFrame,
  LoadingScreen,
  Vehicle,
  VehicleHero,
  getVehicleName,
  loadCreateProjectVehicle,
} from '../CreateProjectShared'
import {
  PROJECT_MODE_DESCRIPTIONS,
  PROJECT_MODE_EXAMPLES,
  PROJECT_MODE_LABELS,
  PROJECT_MODES,
  ProjectMode,
} from '@/lib/project-modes'

const MODE_ICONS: Record<ProjectMode, string> = {
  maintenance: '🧰',
  repair: '🔧',
  upgrade: '⚙️',
  restoration: '🏁',
  diagnostic: '🔎',
}

function ModeContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState<ProjectMode | null>(null)
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      setVehicle(result.vehicle)
      setLoading(false)
    }
    load()
  }, [vehicleId])

  const continueToIntake = () => {
    if (!selectedMode) return
    window.location.href = `/create-project/intake?vehicle=${vehicleId}&mode=${selectedMode}`
  }

  if (loading) return <LoadingScreen />
  if (!vehicle) return null

  const waltContext = [
    'Screen: Create Project - Project Mode',
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    'The user is choosing what kind of automotive work this is before Walt collects intake details.',
    'Walt should explain the difference between Maintenance, Repair, Upgrade, Restoration, and Diagnostic in plain language.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref="/create-project"
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine="This choice sets the shape of the project. Pick the kind of work first, then I’ll help talk through the details."
      waltPrompt="Ask Walt which mode fits..."
      vehicleId={vehicle.id}
      screen="create-project-mode"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />

          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
              What kind of project is this?
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>
              Pick the big category. Walt will collect the details next.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {PROJECT_MODES.map(mode => {
                const isSelected = selectedMode === mode
                return (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    style={{
                      width: '100%',
                      background: isSelected ? '#eaf6fc' : 'white',
                      border: `1.5px solid ${isSelected ? 'var(--light-blue)' : 'var(--border)'}`,
                      borderRadius: 14,
                      padding: '13px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-nunito)',
                      boxShadow: isSelected ? '0 4px 14px rgba(77,168,218,0.16)' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: isSelected ? 'var(--light-blue)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>
                      {MODE_ICONS[mode]}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', color: 'var(--dark-blue)', fontWeight: 800, fontSize: '0.95rem', marginBottom: 3 }}>
                        {PROJECT_MODE_LABELS[mode]}
                      </span>
                      <span style={{ display: 'block', color: 'var(--secondary-text)', fontSize: '0.78rem', lineHeight: 1.35, marginBottom: 5 }}>
                        {PROJECT_MODE_DESCRIPTIONS[mode]}
                      </span>
                      <span style={{ display: 'block', color: 'var(--orange)', fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.35 }}>
                        {PROJECT_MODE_EXAMPLES[mode].join(' • ')}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={continueToIntake}
              disabled={!selectedMode}
              style={{
                width: '100%',
                padding: '14px',
                background: selectedMode ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: selectedMode ? 'pointer' : 'not-allowed',
                boxShadow: selectedMode ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}
            >
              Talk it through with Walt →
            </button>
          </div>
        </div>
      </main>
    </CreateProjectFrame>
  )
}

export default function CreateProjectGoalPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ModeContent />
    </Suspense>
  )
}
