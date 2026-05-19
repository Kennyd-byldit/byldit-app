'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import WaltPanel from '@/components/WaltPanel'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

type Vehicle = {
  id: string
  nickname: string | null
  year: number
  make: string
  model: string
  cover_photo_url: string | null
}

type Project = {
  id: string
  name: string
  goal_type: string
  condition: string | null
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

function WaltBar({ onOpenWalt }: { onOpenWalt: () => void }) {
  return (
    <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
        <div onClick={onOpenWalt}
          style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#8395a7', cursor: 'pointer' }}>
          Ask Walt about this project...
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
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [notesCount, setNotesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<string[]>([])
  const [waltOpen, setWaltOpen] = useState(false)
  const [waltContext, setWaltContext] = useState('')
  const [waltOpeningLine, setWaltOpeningLine] = useState('Tell me where you want to start.')

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
          condition,
          budget_estimate,
          budget_actual,
          cover_photo_url,
          vehicle:vehicles (
            id,
            nickname,
            year,
            make,
            model,
            cover_photo_url
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

      const { count } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      setProject(projectData as unknown as Project)
      setPhases((phaseData || []) as Phase[])
      setSteps((stepData || []) as Step[])
      setNotesCount(count || 0)
      setLoading(false)
    }
    loadProject()
  }, [projectId])

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

  const openPhaseWalt = (phase: Phase) => {
    const phaseSteps = stepsByPhase[phase.id] || []
    setWaltContext([
      `Screen: Project phase coach`,
      `Project: ${project.name}`,
      `Vehicle: ${getVehicleName(project.vehicle)}`,
      `Project type: ${project.goal_type}`,
      `Phase: ${phase.name}`,
      `Phase status: ${phase.status}`,
      `Phase steps: ${phaseSteps.map(step => `${step.name} (${step.status})`).join(', ') || 'none'}`,
      'Walt should act like a real phase coach. Explain what this phase is about, why it matters, how the steps fit together, what to prepare, likely tools/parts, safety cautions, sequencing tips, and how the user will know they are ready to move on. Do not give a shallow one-line summary unless the user asks for that.',
    ].join('\n'))
    setWaltOpeningLine(`Let's look at ${phase.name}. I’ll give you the shape of it before you start turning bolts.`)
    setWaltOpen(true)
  }

  const openProjectWalt = () => {
    setWaltContext([
      `Screen: Project plan coach`,
      `Project: ${project.name}`,
      `Vehicle: ${getVehicleName(project.vehicle)}`,
      `Project type: ${project.goal_type}`,
      `Condition: ${project.condition || 'not specified'}`,
      `Budget estimate: ${formatMoney(project.budget_estimate)}`,
      `Phases: ${phases.map(phase => {
        const phaseSteps = stepsByPhase[phase.id] || []
        return `${phase.name} (${phase.status}, ${phaseSteps.length} steps)`
      }).join('; ') || 'none'}`,
      `Up next: ${upNext?.name || 'none'}`,
      'Walt should help the user understand the whole project plan, choose where to start, and explain the practical order of work with useful mechanical context.',
    ].join('\n'))
    setWaltOpeningLine(`I’m here with the full plan for ${project.name}. Ask me where to start or what any phase means.`)
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
            <button onClick={() => window.location.href = `/projects?project=${project.id}`}
              style={{ position: 'absolute', top: 10, right: 10, background: 'white', border: '1.5px solid var(--light-blue)', color: 'var(--light-blue)', borderRadius: 20, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
              Edit Project
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '42px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
              <p style={{ color: 'white', fontWeight: 900, fontSize: '1.08rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.15 }}>{getVehicleName(project.vehicle)}</p>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.72rem', fontWeight: 800, marginTop: 3 }}>{project.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.62rem', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>{project.goal_type}</p>
            </div>
          </div>

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

          <p style={{ fontSize: '1.05rem', color: 'var(--dark-blue)', fontWeight: 900, marginBottom: 8 }}>Phases</p>

          {phases.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'var(--dark-blue)', fontWeight: 800, marginBottom: 4 }}>No plan saved yet</p>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.82rem', lineHeight: 1.45 }}>Go back to Projects and ask Walt to create the project plan.</p>
            </div>
          ) : (
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
          )}
        </div>
      </main>

      <WaltBar onOpenWalt={openProjectWalt} />
      <NavBar />
      <WaltPanel
        open={waltOpen}
        onClose={() => setWaltOpen(false)}
        context={waltContext}
        openingLine={waltOpeningLine}
        vehicleId={project.vehicle?.id}
        screen={`project-phase-${project.id}`}
      />
    </div>
  )
}
