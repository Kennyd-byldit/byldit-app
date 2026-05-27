'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CreateProjectFrame,
  LoadingScreen,
  Vehicle,
  VehicleHero,
  WALT,
  getVehicleName,
  loadCreateProjectVehicle,
  supabase,
} from '../CreateProjectShared'
import {
  PROJECT_MODE_EXAMPLES,
  PROJECT_MODE_LABELS,
  PROJECT_MODE_OPENERS,
  PROJECT_MODES,
  ProjectMode,
  getPlanTypeForMode,
} from '@/lib/project-modes'

const MODE_GUIDANCE: Record<ProjectMode, string> = {
  maintenance: 'Tell Walt the service task, any brand preferences, supplies you already have, and whether you want OEM-style, budget, or premium recommendations.',
  repair: 'Tell Walt what part or system you are fixing, what symptoms you know about, and whether you already have parts.',
  upgrade: 'Tell Walt what you want to improve, what look or performance you want, and any budget or brand preferences.',
  restoration: 'Tell Walt the big goal, current condition, work environment, budget range, and what areas matter first.',
  diagnostic: 'Tell Walt the symptom, when it happens, warning lights, recent work, and what you have already checked.',
}

function isProjectMode(value: string): value is ProjectMode {
  return PROJECT_MODES.includes(value as ProjectMode)
}

function titleFromInput(input: string) {
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

function buildProjectName(vehicle: Vehicle, mode: ProjectMode, input: string) {
  const taskName = titleFromInput(input)
  if (taskName === 'New Project') return `${getVehicleName(vehicle)} ${PROJECT_MODE_LABELS[mode]}`
  return `${getVehicleName(vehicle)} ${taskName}`
}

function buildSummary(vehicle: Vehicle, mode: ProjectMode, input: string) {
  const vehicleName = getVehicleName(vehicle)
  const trimmed = input.trim()

  if (!trimmed) {
    return `Walt will set this up as a ${PROJECT_MODE_LABELS[mode].toLowerCase()} project for ${vehicleName}.`
  }

  if (mode === 'maintenance') {
    return `Walt will set this up as a maintenance project for ${vehicleName}: ${trimmed}. The plan should stay checklist-style, include parts/supplies/tools, and leave room for brand or OEM-vs-aftermarket recommendations.`
  }

  if (mode === 'diagnostic') {
    return `Walt will start this as a diagnostic project for ${vehicleName}: ${trimmed}. The plan should begin with safety checks, symptom questions, tests, likely causes, and next actions before assuming a repair.`
  }

  if (mode === 'upgrade') {
    return `Walt will set this up as an upgrade project for ${vehicleName}: ${trimmed}. The plan should capture options, fitment, parts, tradeoffs, budget preferences, and installation sequence.`
  }

  if (mode === 'repair') {
    return `Walt will set this up as a repair project for ${vehicleName}: ${trimmed}. The plan should confirm the issue, list parts and tools, guide the repair, and include testing before completion.`
  }

  return `Walt will set this up as a restoration project for ${vehicleName}: ${trimmed}. The plan can use phases, milestones, work areas, condition notes, and long-term build sequencing.`
}

function IntakeContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const modeParam = searchParams.get('mode') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [waltOpen, setWaltOpen] = useState(false)

  const mode = isProjectMode(modeParam) ? modeParam : null
  const planType = getPlanTypeForMode(mode)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      if (!mode) { window.location.replace(`/create-project/goal?vehicle=${vehicleId}`); return }
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      setVehicle(result.vehicle)
      setUserId(result.userId || '')
      setLoading(false)
    }
    load()
  }, [vehicleId, mode])

  const summary = useMemo(() => vehicle && mode ? buildSummary(vehicle, mode, userInput) : '', [vehicle, mode, userInput])
  const projectName = useMemo(() => vehicle && mode ? buildProjectName(vehicle, mode, userInput) : '', [vehicle, mode, userInput])
  const canBuild = Boolean(vehicle && mode && userInput.trim().length >= 3 && !creating)

  const addExample = (example: string) => {
    setUserInput(current => current.trim() ? `${current.trim()}, ${example.toLowerCase()}` : example)
  }

  const createProject = async () => {
    if (!vehicle || !mode || !userId || !canBuild) return
    setCreating(true)
    setError('')

    const intakeAnswers = {
      source: 'walt_guided_intake_v1',
      project_mode: mode,
      plan_type: planType,
      user_description: userInput.trim(),
      walt_opening: PROJECT_MODE_OPENERS[mode],
      walt_summary: summary,
      project_name: projectName,
    }

    const insertPayload = {
      vehicle_id: vehicle.id,
      user_id: userId,
      name: projectName,
      goal_type: PROJECT_MODE_LABELS[mode],
      project_mode: mode,
      plan_type: planType,
      condition: null,
      intake_summary: summary,
      intake_answers: intakeAnswers,
      budget_estimate: null,
      status: 'active',
      cover_photo_url: vehicle.cover_photo_url,
    }

    const { data, error: projectError } = await supabase
      .from('projects')
      .insert(insertPayload)
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
        'Walt-guided intake',
        `Mode: ${PROJECT_MODE_LABELS[mode]}`,
        `User said: ${userInput.trim()}`,
        `Walt summary: ${summary}`,
      ].join('\n'),
      author: 'user',
    })

    await supabase.from('walt_messages').insert([
      {
        user_id: userId,
        project_id: data.id,
        vehicle_id: vehicle.id,
        role: 'walt',
        content: `${PROJECT_MODE_OPENERS[mode]} ${MODE_GUIDANCE[mode]}`,
        screen: 'create-project-intake',
      },
      {
        user_id: userId,
        project_id: data.id,
        vehicle_id: vehicle.id,
        role: 'user',
        content: userInput.trim(),
        screen: 'create-project-intake',
      },
      {
        user_id: userId,
        project_id: data.id,
        vehicle_id: vehicle.id,
        role: 'walt',
        content: summary,
        screen: 'create-project-intake',
      },
    ])

    window.location.replace(`/projects?created=${data.id}`)
  }

  if (loading) return <LoadingScreen />
  if (!vehicle || !mode) return null

  const waltContext = [
    'Screen: Create Project - Walt Intake',
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    `Project mode: ${PROJECT_MODE_LABELS[mode]}`,
    `Plan type: ${planType}`,
    `User intake so far: ${userInput || 'none yet'}`,
    `Current summary: ${summary || 'none yet'}`,
    'Walt should help the user talk through the project before creating it. Walt can answer questions, compare options, and clarify what should be saved.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref={`/create-project/goal?vehicle=${vehicleId}`}
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine={`${PROJECT_MODE_OPENERS[mode]} ${MODE_GUIDANCE[mode]}`}
      waltPrompt="Ask Walt before building..."
      vehicleId={vehicle.id}
      screen="create-project-intake"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />

          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 4 }}>
              {PROJECT_MODE_LABELS[mode]}
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
              Talk it through with Walt
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 14 }}>
              Start simple. Walt will save the important details into the project memory.
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
              <img src={WALT} alt="Walt" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--orange)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.86rem', color: 'white', margin: 0, lineHeight: 1.5, fontWeight: 800 }}>
                  {PROJECT_MODE_OPENERS[mode]}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)', margin: '4px 0 0', lineHeight: 1.45 }}>
                  {MODE_GUIDANCE[mode]}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {PROJECT_MODE_EXAMPLES[mode].map(example => (
                <button
                  key={example}
                  onClick={() => addExample(example)}
                  style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--dark-blue)', borderRadius: 18, padding: '7px 10px', fontSize: '0.74rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}
                >
                  {example}
                </button>
              ))}
            </div>

            <textarea
              value={userInput}
              onChange={event => setUserInput(event.target.value)}
              placeholder="Example: Oil change. I want good synthetic oil options and filter recommendations, but I do not want to be locked into one brand."
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: 14,
                padding: '12px 14px',
                color: 'var(--dark-blue)',
                fontSize: 16,
                lineHeight: 1.45,
                fontFamily: 'var(--font-nunito)',
                outline: 'none',
                marginBottom: 14,
              }}
            />

            {userInput.trim().length > 0 && (
              <div style={{ background: 'white', borderRadius: 14, padding: '13px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1.5px solid var(--border)', marginBottom: 14 }}>
                <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 5 }}>
                  Walt summary
                </p>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.86rem', lineHeight: 1.45, fontWeight: 700, marginBottom: 10 }}>
                  {summary}
                </p>
                <p style={{ color: 'var(--secondary-text)', fontSize: '0.74rem', lineHeight: 1.4 }}>
                  Project name: <strong style={{ color: 'var(--dark-blue)' }}>{projectName}</strong>
                </p>
              </div>
            )}

            {error && (
              <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 700 }}>{error}</p>
              </div>
            )}

            <button
              onClick={createProject}
              disabled={!canBuild}
              style={{
                width: '100%',
                padding: '14px',
                background: canBuild ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: canBuild ? 'pointer' : 'not-allowed',
                boxShadow: canBuild ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}
            >
              {creating ? 'Building project...' : 'Build This Project →'}
            </button>
          </div>
        </div>
      </main>
    </CreateProjectFrame>
  )
}

export default function CreateProjectIntakePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <IntakeContent />
    </Suspense>
  )
}
