'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BottomNav, LoadingScreen, MobileAppFrame, MobileHeader, VehicleHero } from '@/components/AppChrome'
import { supabase } from '@/lib/supabase'
import { getVehicleName } from '@/lib/vehicle-display'
import type { VehicleSummary } from '@/lib/types'
import {
  PROJECT_MODE_EXAMPLES,
  PROJECT_MODE_LABELS,
  PROJECT_MODE_OPENERS,
  PROJECT_MODES,
  ProjectMode,
  getPlanTypeForMode,
} from '@/lib/project-modes'

type Vehicle = VehicleSummary

const CUSTOM_STARTER = 'Something Else'

const MODE_GUIDANCE: Record<ProjectMode, string> = {
  maintenance: 'Walt can talk through parts, brands, tools, service intervals, and what to verify before turning it into a checklist.',
  repair: 'Walt can sort the known issue, likely parts, tools, safety checks, and the repair path before turning it into a plan.',
  upgrade: 'Walt can compare options, fitment, brands, budget, and install approach before turning it into a build plan.',
  restoration: 'Walt can shape phases, priorities, budget, work environment, and milestones before turning it into a larger plan.',
  diagnostic: 'Walt can start with safety, ask focused questions, narrow the symptom, and turn the findings into the right next project.',
}

function isProjectMode(value: string): value is ProjectMode {
  return PROJECT_MODES.includes(value as ProjectMode)
}

function cleanTitle(input: string) {
  const cleaned = input
    .replace(/[^\w\s/&+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)

  if (!cleaned) return 'New Project'

  return cleaned
    .split(' ')
    .map(word => word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function buildProjectName(vehicle: Vehicle, mode: ProjectMode, selectedStarter: string) {
  const task = selectedStarter === CUSTOM_STARTER ? '' : selectedStarter
  const title = cleanTitle(task)
  if (title === 'New Project') return `${getVehicleName(vehicle)} ${PROJECT_MODE_LABELS[mode]} Draft`
  return `${getVehicleName(vehicle)} ${title}`
}

function buildIntakeSummary(vehicle: Vehicle, mode: ProjectMode, selectedStarter: string) {
  const starterLine = selectedStarter === CUSTOM_STARTER
    ? 'The user chose a custom task and will describe the work to Walt.'
    : `The user selected ${selectedStarter} as the starting task.`

  return `${PROJECT_MODE_LABELS[mode]} draft project for ${getVehicleName(vehicle)}. ${starterLine}`
}

function IntakeContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const modeParam = searchParams.get('mode') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedStarter, setSelectedStarter] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const mode = isProjectMode(modeParam) ? modeParam : null
  const planType = getPlanTypeForMode(mode)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      if (!mode) { window.location.replace(`/create-project/goal?vehicle=${vehicleId}`); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, trim, cover_photo_url')
        .eq('id', vehicleId)
        .eq('user_id', user.id)
        .single()

      if (!data) { window.location.replace('/create-project'); return }
      setVehicle(data as Vehicle)
      setUserId(user.id)
      setLoading(false)
    }
    load()
  }, [vehicleId, mode])

  const starters = useMemo(() => mode ? [...PROJECT_MODE_EXAMPLES[mode], CUSTOM_STARTER] : [], [mode])
  const canStart = Boolean(vehicle && mode && selectedStarter && !creating)
  const projectName = useMemo(
    () => vehicle && mode ? buildProjectName(vehicle, mode, selectedStarter) : '',
    [vehicle, mode, selectedStarter]
  )
  const intakeSummary = useMemo(
    () => vehicle && mode ? buildIntakeSummary(vehicle, mode, selectedStarter) : '',
    [vehicle, mode, selectedStarter]
  )

  const selectStarter = (starter: string) => {
    setSelectedStarter(starter)
    setError('')
  }

  const createProject = async () => {
    if (!vehicle || !mode || !userId || !canStart) return
    setCreating(true)
    setError('')

    const intakeAnswers = {
      source: 'start_with_walt_draft_v1',
      project_mode: mode,
      plan_type: planType,
      highlighted_task: selectedStarter === CUSTOM_STARTER ? null : selectedStarter,
      custom_task_requested: selectedStarter === CUSTOM_STARTER,
      project_name: projectName,
    }

    const { data, error: projectError } = await supabase
      .from('projects')
      .insert({
        vehicle_id: vehicle.id,
        user_id: userId,
        name: projectName,
        goal_type: PROJECT_MODE_LABELS[mode],
        project_mode: mode,
        plan_type: planType,
        condition: null,
        intake_summary: intakeSummary,
        intake_answers: intakeAnswers,
        budget_estimate: null,
        status: 'draft',
        cover_photo_url: vehicle.cover_photo_url,
      })
      .select('id')
      .single()

    if (projectError || !data) {
      setError('Something stopped the project from being created. Try again in a minute.')
      setCreating(false)
      return
    }

    await supabase.from('notes').insert({
      project_id: data.id,
      user_id: userId,
      content: [
        'Start with Walt draft created',
        `Mode: ${PROJECT_MODE_LABELS[mode]}`,
        selectedStarter === CUSTOM_STARTER ? 'Starter: Something else' : `Starter: ${selectedStarter}`,
        `Summary: ${intakeSummary}`,
      ].filter(Boolean).join('\n'),
      author: 'user',
    })

    window.location.replace(`/projects/${data.id}?walt=start`)
  }

  if (loading) return <LoadingScreen />
  if (!vehicle || !mode) return null

  return (
    <MobileAppFrame>
      <MobileHeader backHref={`/create-project/goal?vehicle=${vehicleId}`} />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />

          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 4 }}>
              {PROJECT_MODE_LABELS[mode]}
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
              Start with Walt
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 14 }}>
              Pick the closest starting point. Walt will create a draft project first, then you can talk through details, parts, tools, and decisions inside that project.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {starters.map(example => {
                const isSelected = selectedStarter === example
                return (
                  <button
                    key={example}
                    onClick={() => selectStarter(example)}
                    style={{
                      border: `1.5px solid ${isSelected ? 'var(--orange)' : 'var(--border)'}`,
                      background: isSelected ? '#fff1e6' : 'white',
                      color: 'var(--dark-blue)',
                      borderRadius: 18,
                      padding: '8px 11px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-nunito)',
                      cursor: 'pointer',
                    }}
                  >
                    {example}
                  </button>
                )
              })}
            </div>

            <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '14px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: selectedStarter ? 'var(--orange)' : '#d4e0eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  {selectedStarter ? '✓' : '1'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>
                    {selectedStarter ? `${selectedStarter} selected` : PROJECT_MODE_OPENERS[mode]}
                  </p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.74rem', lineHeight: 1.35, margin: '2px 0 0' }}>
                    {selectedStarter === CUSTOM_STARTER
                      ? 'Walt will ask what you are working on and shape the draft from there.'
                      : selectedStarter
                        ? 'Walt will use this as the starting context, then you can ask questions before confirming the plan.'
                        : MODE_GUIDANCE[mode]}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 700 }}>{error}</p>
              </div>
            )}

            <button
              onClick={createProject}
              disabled={!canStart}
              style={{
                width: '100%',
                padding: '14px',
                background: canStart ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: canStart ? 'pointer' : 'not-allowed',
                boxShadow: canStart ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}
            >
              {creating ? 'Starting draft...' : 'Start with Walt →'}
            </button>
          </div>
        </div>
      </main>
      <BottomNav active="Projects" />
    </MobileAppFrame>
  )
}

export default function CreateProjectIntakePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <IntakeContent />
    </Suspense>
  )
}
