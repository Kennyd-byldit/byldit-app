'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import WaltPanel from '@/components/WaltPanel'
import { supabase } from '@/lib/supabase'
import { WALT_AVATAR_URL } from '@/lib/app-constants'

const WALT = WALT_AVATAR_URL

type Vehicle = {
  id: string
  nickname: string | null
  year: number
  make: string
  model: string
  trim: string | null
  vin: string | null
  cover_photo_url: string | null
  color: string | null
  engine: string | null
  fuel_type: string | null
  transmission: string | null
  drivetrain: string | null
  mileage: number | null
  condition: string | null
  notes: string | null
}

type Project = {
  id: string
  name: string
  goal_type: string
  status: string
  project_mode: string | null
  plan_type: string | null
  condition: string | null
  intake_summary: string | null
  intake_answers: Record<string, unknown> | null
  budget_estimate: number | null
  budget_actual: number | null
  cover_photo_url: string | null
  vehicle: Vehicle | null
}

type Phase = {
  id: string
  name: string
  order_index: number
  status: string
  cost_estimate: number | null
}

type Step = {
  id: string
  phase_id: string
  name: string
  instructions: string | null
  difficulty: string | null
  estimated_hours: number | null
  cost_estimate: number | null
  diy_or_shop: string | null
  status: string
  order_index: number
}

type StepDetail = {
  overview: string
  instructions: string
  parts_materials: string[]
  tools: string[]
  notes: string[]
  warnings: string[]
  tips: string[]
  reference_notes: string[]
}

const emptyStepDetail: StepDetail = {
  overview: '',
  instructions: '',
  parts_materials: [],
  tools: [],
  notes: [],
  warnings: [],
  tips: [],
  reference_notes: [],
}

const getVehicleName = (vehicle: Vehicle | null) => {
  if (!vehicle) return 'Vehicle'
  return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
}

const getProjectPhoto = (project: Project) => {
  if (project.cover_photo_url) return project.cover_photo_url
  if (project.vehicle?.cover_photo_url) return project.vehicle.cover_photo_url
  const model = project.vehicle?.model?.toLowerCase() || ''
  if (model.includes('ranger')) return '/photos/ranger-2025.jpg'
  if (model.includes('f250') || model.includes('f-250')) return '/photos/f250-hiboy-68.jpg'
  return null
}

const formatMoney = (value: number | null) => {
  if (!value) return 'TBD'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const formatVehicleContext = (vehicle: Vehicle | null) => {
  if (!vehicle) return 'Vehicle: not available'
  return [
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''})`,
    vehicle.vin ? `VIN: ${vehicle.vin}` : '',
    vehicle.color ? `Color: ${vehicle.color}` : '',
    vehicle.engine ? `Engine: ${vehicle.engine}` : '',
    vehicle.fuel_type ? `Fuel: ${vehicle.fuel_type}` : '',
    vehicle.transmission ? `Transmission: ${vehicle.transmission}` : '',
    vehicle.drivetrain ? `Drivetrain: ${vehicle.drivetrain}` : '',
    vehicle.mileage ? `Mileage: ${vehicle.mileage}` : '',
    vehicle.condition ? `Garage condition: ${vehicle.condition}` : '',
    vehicle.notes ? `Garage notes: ${vehicle.notes}` : '',
  ].filter(Boolean).join('\n')
}

const parseStepDetail = (instructions: string | null): StepDetail => {
  if (!instructions) return emptyStepDetail
  try {
    const parsed = JSON.parse(instructions)
    return {
      overview: parsed.overview || '',
      instructions: parsed.instructions || '',
      parts_materials: Array.isArray(parsed.parts_materials) ? parsed.parts_materials : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      reference_notes: Array.isArray(parsed.reference_notes) ? parsed.reference_notes : [],
    }
  } catch {
    return { ...emptyStepDetail, overview: instructions }
  }
}

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[
        { icon: '🏠', label: 'Garage', active: false },
        { icon: '🔧', label: 'Projects', active: true },
        { icon: '🔩', label: 'Parts', active: false },
        { icon: '📋', label: "Walt's Notes", active: false },
      ].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => {
            if (item.label === 'Garage') window.location.href = '/garage'
            if (item.label === 'Projects') window.location.href = '/projects'
          }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

function WaltBar({ onOpenWalt, prompt }: { onOpenWalt: () => void, prompt: string }) {
  return (
    <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
        <div onClick={onOpenWalt}
          style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#8395a7', cursor: 'pointer' }}>
          {prompt}
        </div>
        <button onClick={onOpenWalt}
          style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', padding: 0, background: 'white', flexShrink: 0, cursor: 'pointer' }}>
          <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>
    </div>
  )
}

export default function ProjectPlanPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const planJustGenerated = searchParams.get('plan') === 'generated'
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [notesCount, setNotesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<string[]>([])
  const [waltOpen, setWaltOpen] = useState(false)
  const [waltContext, setWaltContext] = useState('')
  const [waltOpeningLine, setWaltOpeningLine] = useState('Tell me where you want to start.')
  const [waltScreen, setWaltScreen] = useState(`project-plan-${projectId}`)
  const [waltPhaseId, setWaltPhaseId] = useState<string | undefined>()
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [deletingDraft, setDeletingDraft] = useState(false)
  const [confirmGenerate, setConfirmGenerate] = useState(false)
  const [renamingDraft, setRenamingDraft] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [savingDraftName, setSavingDraftName] = useState(false)
  const [projectError, setProjectError] = useState('')
  const autoOpenedDraftRef = useRef(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadProject() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          goal_type,
          status,
          project_mode,
          plan_type,
          condition,
          intake_summary,
          intake_answers,
          budget_estimate,
          budget_actual,
          cover_photo_url,
          vehicle:vehicles (
            id,
            nickname,
            year,
            make,
            model,
            trim,
            vin,
            cover_photo_url,
            color,
            engine,
            fuel_type,
            transmission,
            drivetrain,
            mileage,
            condition,
            notes
          )
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (!projectData) { window.location.replace('/projects'); return }

      const { data: phaseData } = await supabase
        .from('phases')
        .select('id, name, order_index, status, cost_estimate')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      const phaseIds = (phaseData || []).map(phase => phase.id)
      const { data: stepData } = phaseIds.length > 0
        ? await supabase
          .from('steps')
          .select('id, phase_id, name, instructions, difficulty, estimated_hours, cost_estimate, diy_or_shop, status, order_index')
          .in('phase_id', phaseIds)
          .eq('user_id', user.id)
          .order('order_index', { ascending: true })
        : { data: [] }

      const { data: noteData, count } = await supabase
        .from('notes')
        .select('content', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setProject(projectData as unknown as Project)
      setDraftName((projectData as unknown as Project).name)
      setPhases((phaseData || []) as Phase[])
      setSteps((stepData || []) as Step[])
      setNotes((noteData || []).map(note => note.content as string).filter(Boolean))
      setNotesCount(count || 0)
      setLoading(false)
    }
    loadProject()
  }, [projectId])

  useEffect(() => {
    if (loading || !project || autoOpenedDraftRef.current || searchParams.get('walt') !== 'start') return
    if (project.status !== 'draft' || phases.length > 0) return

    autoOpenedDraftRef.current = true
    const vehicleName = getVehicleName(project.vehicle)
    const starter = typeof project.intake_answers?.highlighted_task === 'string'
      ? project.intake_answers.highlighted_task
      : ''

    const timer = window.setTimeout(() => {
      setWaltContext([
        'Screen: Start with Walt draft project',
        `Project: ${project.name}`,
        `Draft status: ${project.status}`,
        formatVehicleContext(project.vehicle),
        `Project type: ${project.goal_type}`,
        project.project_mode ? `Project mode: ${project.project_mode}` : '',
        project.plan_type ? `Plan type: ${project.plan_type}` : '',
        starter ? `Selected starter: ${starter}` : 'Selected starter: custom task',
        project.intake_summary ? `Intake summary: ${project.intake_summary}` : '',
        `Saved notes: ${notes.join('\n---\n') || 'none yet'}`,
        'This is now a real draft project. Walt may save useful parts, notes, choices, and decisions to this project. Ask practical questions, compare options, and help the user decide when they are ready to generate the plan.',
      ].filter(Boolean).join('\n'))
      setWaltOpeningLine(starter
        ? `I started a draft for ${starter} on ${vehicleName}. Tell me what you want to figure out first, and I’ll save the useful stuff here as we go.`
        : `I started a draft for ${vehicleName}. Tell me exactly what you’re working on, and I’ll help shape it into a project.`
      )
      setWaltScreen(`project-draft-${project.id}`)
      setWaltPhaseId(undefined)
      setWaltOpen(true)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loading, notes, phases.length, project, searchParams])

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading project plan...</p>
    </div>
  )

  if (!project) return null

  const projectPhoto = getProjectPhoto(project)
  const stepsByPhase = steps.reduce<Record<string, Step[]>>((acc, step) => {
    acc[step.phase_id] = [...(acc[step.phase_id] || []), step]
    return acc
  }, {})
  const completedPhases = phases.filter(phase => {
    const phaseSteps = stepsByPhase[phase.id] || []
    return phaseSteps.length > 0 && phaseSteps.every(step => step.status === 'complete')
  }).length
  const upNext = steps.find(step => step.status !== 'complete')
  const isDraft = project.status === 'draft' && phases.length === 0
  const waltBarPrompt = isDraft
    ? `Continue with Walt about ${project.name}...`
    : `Ask Walt about ${project.name}...`

  const buildDraftContext = () => {
    const starter = typeof project.intake_answers?.highlighted_task === 'string'
      ? project.intake_answers.highlighted_task
      : ''

    return [
      'Screen: Start with Walt draft project',
      `Project: ${project.name}`,
      `Draft status: ${project.status}`,
      formatVehicleContext(project.vehicle),
      `Project type: ${project.goal_type}`,
      project.project_mode ? `Project mode: ${project.project_mode}` : '',
      project.plan_type ? `Plan type: ${project.plan_type}` : '',
      starter ? `Selected starter: ${starter}` : 'Selected starter: custom task',
      project.intake_summary ? `Intake summary: ${project.intake_summary}` : '',
      `Saved notes: ${notes.join('\n---\n') || 'none yet'}`,
      'This is now a real draft project. Walt may save useful parts, notes, choices, and decisions to this project. Ask practical questions, compare options, and help the user decide when they are ready to generate the plan.',
    ].filter(Boolean).join('\n')
  }

  const openDraftWalt = () => {
    const starter = typeof project.intake_answers?.highlighted_task === 'string'
      ? project.intake_answers.highlighted_task
      : ''
    const vehicleName = getVehicleName(project.vehicle)

    setWaltContext(buildDraftContext())
    setWaltOpeningLine(starter
      ? `I started a draft for ${starter} on ${vehicleName}. Tell me what you want to figure out first, and I’ll save the useful stuff here as we go.`
      : `I started a draft for ${vehicleName}. Tell me exactly what you’re working on, and I’ll help shape it into a project.`
    )
    setWaltScreen(`project-draft-${project.id}`)
    setWaltPhaseId(undefined)
    setWaltOpen(true)
  }

  const generateProjectPlan = async () => {
    setProjectError('')
    setGeneratingPlan(true)

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/projects/${project.id}/generate-plan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setProjectError(data.error || 'Walt could not generate the project plan right now.')
      setGeneratingPlan(false)
      return
    }

    window.location.assign(`/projects/${project.id}?plan=generated`)
  }

  const saveDraftName = async () => {
    if (!project || !isDraft) return
    const nextName = draftName.trim()
    if (!nextName) {
      setProjectError('Give this draft a name before saving.')
      return
    }

    setProjectError('')
    setSavingDraftName(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.replace('/login')
      return
    }

    const { error } = await supabase
      .from('projects')
      .update({ name: nextName })
      .eq('id', project.id)
      .eq('user_id', user.id)
      .eq('status', 'draft')

    if (error) {
      setProjectError('Could not rename that draft yet. Please try again.')
      setSavingDraftName(false)
      return
    }

    setProject({ ...project, name: nextName })
    setRenamingDraft(false)
    setSavingDraftName(false)
  }

  const deleteDraft = async () => {
    if (!window.confirm('Delete this draft project?')) return
    setProjectError('')
    setDeletingDraft(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.replace('/login')
      return
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)
      .eq('user_id', user.id)
      .eq('status', 'draft')

    if (error) {
      setProjectError('Could not delete that draft yet. Please try again.')
      setDeletingDraft(false)
      return
    }

    window.location.assign('/projects')
  }

  const openPhaseWalt = (phase: Phase) => {
    const phaseSteps = stepsByPhase[phase.id] || []
    setWaltContext([
      `Screen: Project phase coach`,
      `Project: ${project.name}`,
      formatVehicleContext(project.vehicle),
      `Project type: ${project.goal_type}`,
      `Project condition/intake: ${project.condition || 'not specified'}`,
      `Budget estimate: ${formatMoney(project.budget_estimate)}`,
      `Project notes and intake details: ${notes.join('\n---\n') || 'none saved'}`,
      `Phase: ${phase.name}`,
      `Phase status: ${phase.status}`,
      `Phase steps and saved detail: ${phaseSteps.map(step => {
        const detail = parseStepDetail(step.instructions)
        return [
          `${step.name} (${step.status})`,
          detail.overview ? `overview: ${detail.overview}` : '',
          detail.parts_materials.length ? `parts/materials: ${detail.parts_materials.join(', ')}` : '',
          detail.tools.length ? `tools: ${detail.tools.join(', ')}` : '',
          detail.warnings.length ? `warnings: ${detail.warnings.join(', ')}` : '',
        ].filter(Boolean).join(' | ')
      }).join('\n') || 'none'}`,
      'Walt should act like a real phase coach for this exact vehicle and project. Explain what this phase is about, why it matters, how the steps fit together, what to prepare, likely tools/parts, safety cautions, sequencing tips, and how the user will know they are ready to move on. Use vehicle engine/transmission/drivetrain/notes when relevant. Do not give a shallow one-line summary unless the user asks for that.',
    ].join('\n'))
    setWaltOpeningLine(`Let's look at ${phase.name}. I’ll give you the shape of it before you start turning bolts.`)
    setWaltScreen(`project-phase-${phase.id}`)
    setWaltPhaseId(phase.id)
    setWaltOpen(true)
  }

  const openProjectWalt = () => {
    if (isDraft) {
      openDraftWalt()
      return
    }

    setWaltContext([
      `Screen: Project plan coach`,
      `Project: ${project.name}`,
      formatVehicleContext(project.vehicle),
      `Project type: ${project.goal_type}`,
      `Condition: ${project.condition || 'not specified'}`,
      `Budget estimate: ${formatMoney(project.budget_estimate)}`,
      `Project notes and intake details: ${notes.join('\n---\n') || 'none saved'}`,
      `Phases: ${phases.map(phase => {
        const phaseSteps = stepsByPhase[phase.id] || []
        return `${phase.name} (${phase.status}, ${phaseSteps.length} steps)`
      }).join('; ') || 'none'}`,
      `Up next: ${upNext?.name || 'none'}`,
      'Walt should help the user understand the whole project plan, choose where to start, and explain the practical order of work with useful mechanical context.',
    ].join('\n'))
    setWaltOpeningLine(`I’m here with the full plan for ${project.name}. Ask me where to start or what any phase means.`)
    setWaltScreen(`project-plan-${project.id}`)
    setWaltPhaseId(undefined)
    setWaltOpen(true)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = '/projects'}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Projects
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 66 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ height: 170, marginBottom: 10, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)', background: 'var(--dark-blue)' }}>
            {projectPhoto ? (
              <img src={projectPhoto} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-blue)', fontSize: '2rem' }}>🔧</div>
            )}
            {!isDraft && (
              <button onClick={() => window.location.href = `/projects?project=${project.id}`}
                style={{ position: 'absolute', top: 10, right: 10, background: 'white', border: '1.5px solid var(--light-blue)', color: 'var(--light-blue)', borderRadius: 20, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                Edit Project
              </button>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '42px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
              <p style={{ color: 'white', fontWeight: 900, fontSize: '1.08rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.15 }}>{getVehicleName(project.vehicle)}</p>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.72rem', fontWeight: 800, marginTop: 3 }}>{project.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.62rem', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>
                {project.goal_type}{isDraft ? ' • Draft' : ''}
              </p>
            </div>
          </div>

          {projectError && (
            <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
              <p style={{ color: 'var(--dark-blue)', fontSize: '0.84rem', fontWeight: 700 }}>{projectError}</p>
            </div>
          )}

          {planJustGenerated && !isDraft && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px', marginBottom: 12 }}>
              <img src={WALT} alt="Walt" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--orange)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 900, margin: 0 }}>Plan generated</p>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.78rem', lineHeight: 1.45, margin: '2px 0 0' }}>
                  Walt turned your draft into phases and steps. Review the plan below, then open Walt when you want help working through it.
                </p>
              </div>
            </div>
          )}

          {!isDraft && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[
                { label: 'My Plan', value: `${completedPhases}/${phases.length}` },
                { label: "Walt's Notes", value: String(notesCount) },
                { label: 'Budget', value: `${formatMoney(project.budget_actual || 0)} / ${formatMoney(project.budget_estimate)}` },
                { label: 'Up Next', value: upNext ? '1' : '0' },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, background: 'white', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1.5px solid var(--border)', minWidth: 0 }}>
                  <p style={{ fontSize: stat.label === 'Budget' ? '0.68rem' : '0.95rem', fontWeight: 900, color: 'var(--dark-blue)', lineHeight: 1.1 }}>{stat.value}</p>
                  <p style={{ fontSize: '0.5rem', color: 'var(--secondary-text)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.35, marginTop: 3 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {upNext && (
            <div onClick={() => window.location.href = `/projects/${project.id}/steps/${upNext.id}`}
              style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '12px 14px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={WALT} alt="Walt" style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--orange)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>Up Next</p>
                <p style={{ fontSize: '0.88rem', fontWeight: 800, lineHeight: 1.25 }}>{upNext.name}</p>
              </div>
              <span style={{ fontSize: '1.1rem', color: 'var(--light-blue)' }}>›</span>
            </div>
          )}

          {isDraft ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#fff1e6', border: '1.5px solid #f4c08b', borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                <p style={{ color: 'var(--orange)', fontSize: '0.68rem', fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Draft in Progress</p>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.88rem', fontWeight: 800, lineHeight: 1.35, margin: 0 }}>
                  Walt is still helping shape this into a project plan. Use the Walt bar below to continue the conversation, or generate the plan when you are ready.
                </p>
              </div>
              <div style={{ border: '1.5px solid var(--border)', borderRadius: 12, padding: '11px 12px', marginBottom: 12 }}>
                <p style={{ color: 'var(--secondary-text)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Draft Name</p>
                {renamingDraft ? (
                  <div>
                    <input
                      value={draftName}
                      onChange={event => setDraftName(event.target.value)}
                      maxLength={80}
                      style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 11px', fontSize: 16, fontFamily: 'var(--font-nunito)', color: 'var(--dark-blue)', outline: 'none', marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setDraftName(project.name); setRenamingDraft(false); setProjectError('') }} disabled={savingDraftName}
                        style={{ minHeight: 34, padding: '0 12px', borderRadius: 17, border: '1.5px solid var(--border)', background: 'white', color: 'var(--dark-blue)', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: savingDraftName ? 'not-allowed' : 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={saveDraftName} disabled={savingDraftName}
                        style={{ minHeight: 34, padding: '0 12px', borderRadius: 17, border: 'none', background: savingDraftName ? '#d4e0eb' : 'var(--orange)', color: 'white', fontSize: '0.76rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: savingDraftName ? 'not-allowed' : 'pointer' }}>
                        {savingDraftName ? 'Saving...' : 'Save Name'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ flex: 1, color: 'var(--dark-blue)', fontSize: '0.98rem', fontWeight: 900, lineHeight: 1.25, margin: 0 }}>{project.name}</p>
                    <button onClick={() => { setDraftName(project.name); setRenamingDraft(true) }}
                      style={{ border: '1.5px solid var(--orange)', color: 'var(--orange)', background: 'white', borderRadius: 16, padding: '6px 10px', fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: 'pointer', flexShrink: 0 }}>
                      Rename
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--dark-blue)', fontWeight: 900, fontSize: '0.98rem', margin: 0 }}>Draft Actions</p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.76rem', lineHeight: 1.4, margin: '2px 0 0' }}>
                    Generate the plan when this draft is ready, or delete it if you no longer need it.
                  </p>
                </div>
              </div>
              <button onClick={() => setConfirmGenerate(true)} disabled={generatingPlan || deletingDraft || savingDraftName}
                style={{ width: '100%', minHeight: 42, borderRadius: 22, border: 'none', background: generatingPlan ? '#d4e0eb' : 'var(--dark-blue)', color: 'white', fontSize: '0.88rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: generatingPlan ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
                {generatingPlan ? 'Generating plan...' : 'Generate Plan'}
              </button>
              {generatingPlan && (
                <div style={{ background: '#eaf4fb', border: '1.5px solid #c6dff0', borderRadius: 12, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #c6dff0', borderTopColor: 'var(--dark-blue)', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ color: 'var(--dark-blue)', fontSize: '0.78rem', fontWeight: 800, margin: 0 }}>Walt is building your plan...</p>
                </div>
              )}
              <button onClick={deleteDraft} disabled={deletingDraft || generatingPlan || savingDraftName}
                style={{ width: '100%', minHeight: 38, borderRadius: 19, border: '1.5px solid #f0c8c2', background: 'white', color: '#b42318', fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: deletingDraft ? 'not-allowed' : 'pointer' }}>
                {deletingDraft ? 'Deleting...' : 'Delete Draft'}
              </button>
            </div>
          ) : phases.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'var(--dark-blue)', fontWeight: 800, marginBottom: 4 }}>No plan saved yet</p>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.82rem', lineHeight: 1.45 }}>Ask Walt to generate the project plan when the intake is ready.</p>
              <button onClick={generateProjectPlan} disabled={generatingPlan}
                style={{ marginTop: 12, minHeight: 40, padding: '0 16px', borderRadius: 20, border: 'none', background: generatingPlan ? '#d4e0eb' : 'var(--dark-blue)', color: 'white', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: generatingPlan ? 'not-allowed' : 'pointer' }}>
                {generatingPlan ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '1.05rem', color: 'var(--dark-blue)', fontWeight: 900, marginBottom: 8 }}>Phases</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {phases.map((phase, phaseIndex) => {
                  const phaseSteps = stepsByPhase[phase.id] || []
                  const completeCount = phaseSteps.filter(step => step.status === 'complete').length
                  const isExpanded = expandedPhaseIds.includes(phase.id)

                  return (
                    <div key={phase.id} style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => setExpandedPhaseIds(prev => prev.includes(phase.id) ? prev.filter(id => id !== phase.id) : [...prev, phase.id])}
                        style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: phase.status === 'in_progress' ? 'var(--orange)' : 'var(--dark-blue)', color: 'white', fontWeight: 900, fontSize: '0.82rem', flexShrink: 0, cursor: 'pointer' }}>
                        {isExpanded ? '−' : phaseIndex + 1}
                      </button>
                      <div onClick={() => setExpandedPhaseIds(prev => prev.includes(phase.id) ? prev.filter(id => id !== phase.id) : [...prev, phase.id])}
                        style={{ flex: 1, cursor: 'pointer' }}>
                        <p style={{ color: 'var(--dark-blue)', fontWeight: 900, fontSize: '0.96rem', lineHeight: 1.2 }}>{phase.name}</p>
                        <p style={{ color: 'var(--secondary-text)', fontSize: '0.72rem', marginTop: 2 }}>
                          {phase.status === 'in_progress' ? 'Ready to start' : 'Upcoming'} • {completeCount}/{phaseSteps.length} steps • {formatMoney(phase.cost_estimate)}
                        </p>
                      </div>
                      <button onClick={() => openPhaseWalt(phase)}
                        style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--orange)', overflow: 'hidden', padding: 0, background: 'white', cursor: 'pointer', flexShrink: 0 }}>
                        <img src={WALT} alt="Ask Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)' }}>
                        {phaseSteps.map((step, stepIndex) => (
                          <div key={step.id} onClick={() => window.location.href = `/projects/${project.id}/steps/${step.id}`}
                            style={{ padding: '12px 0', borderBottom: stepIndex === phaseSteps.length - 1 ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--border)', color: step.status === 'complete' ? 'var(--light-blue)' : 'var(--secondary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                              {step.status === 'complete' ? '✓' : stepIndex + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.3 }}>{step.name}</p>
                              <p style={{ color: 'var(--secondary-text)', fontSize: '0.68rem', marginTop: 3 }}>
                                {step.difficulty || 'Moderate'} • {step.diy_or_shop || 'Either'}{step.estimated_hours ? ` • ${step.estimated_hours}h` : ''}
                              </p>
                            </div>
                            <span style={{ color: 'var(--light-blue)', fontSize: '1rem', paddingTop: 2 }}>›</span>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <WaltBar onOpenWalt={openProjectWalt} prompt={waltBarPrompt} />
      <NavBar />
      {confirmGenerate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '18px 16px', maxWidth: 360, width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.22)' }}>
            <p style={{ color: 'var(--dark-blue)', fontSize: '1rem', fontWeight: 900, marginBottom: 5 }}>Generate this plan now?</p>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.82rem', lineHeight: 1.45, marginBottom: 14 }}>
              Walt will turn this draft into a project plan with phases and steps. You can still ask Walt questions after the plan is created.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmGenerate(false)} disabled={generatingPlan}
                style={{ minHeight: 38, padding: '0 14px', borderRadius: 19, border: '1.5px solid var(--border)', background: 'white', color: 'var(--dark-blue)', fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: generatingPlan ? 'not-allowed' : 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { setConfirmGenerate(false); generateProjectPlan() }} disabled={generatingPlan}
                style={{ minHeight: 38, padding: '0 14px', borderRadius: 19, border: 'none', background: generatingPlan ? '#d4e0eb' : 'var(--dark-blue)', color: 'white', fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-nunito)', cursor: generatingPlan ? 'not-allowed' : 'pointer' }}>
                Generate Plan
              </button>
            </div>
          </div>
        </div>
      )}
      <WaltPanel
        open={waltOpen}
        onClose={() => setWaltOpen(false)}
        context={waltContext}
        openingLine={waltOpeningLine}
        speakOpeningOnOpen={waltScreen.startsWith('project-phase-')}
        vehicleId={project.vehicle?.id}
        projectId={project.id}
        phaseId={waltPhaseId}
        screen={waltScreen}
      />
    </div>
  )
}
