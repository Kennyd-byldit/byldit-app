'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default function ProjectPlanPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)

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

      setProject(projectData as unknown as Project)
      setPhases((phaseData || []) as Phase[])
      setSteps((stepData || []) as Step[])
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
  const completedSteps = steps.filter(step => step.status === 'complete').length
  const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0

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
          <div style={{ height: 160, marginBottom: 12, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)', background: 'var(--dark-blue)' }}>
            {projectPhoto ? (
              <img src={projectPhoto} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-blue)', fontSize: '2rem' }}>🔧</div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '34px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.15 }}>{project.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.68rem', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>{getVehicleName(project.vehicle)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Progress', value: `${progress}%` },
              { label: 'Phases', value: String(phases.length) },
              { label: 'Steps', value: String(steps.length) },
              { label: 'Budget', value: formatMoney(project.budget_estimate) },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, background: 'white', borderRadius: 12, padding: '9px 4px', textAlign: 'center', border: '1.5px solid var(--border)', minWidth: 0 }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--dark-blue)' }}>{stat.value}</p>
                <p style={{ fontSize: '0.52rem', color: 'var(--secondary-text)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 4 }}>Project type</p>
            <p style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '0.95rem' }}>{project.goal_type}</p>
            {project.condition && <p style={{ color: 'var(--secondary-text)', fontSize: '0.78rem', marginTop: 3 }}>Condition: {project.condition}</p>}
          </div>

          {phases.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'var(--dark-blue)', fontWeight: 800, marginBottom: 4 }}>No plan saved yet</p>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.82rem', lineHeight: 1.45 }}>Go back to Projects and ask Walt to create the project plan.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {phases.map((phase, phaseIndex) => (
                <div key={phase.id} style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: phase.status === 'in_progress' ? 'var(--orange)' : 'var(--dark-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                      {phaseIndex + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'var(--dark-blue)', fontWeight: 900, fontSize: '0.98rem', lineHeight: 1.2 }}>{phase.name}</p>
                      <p style={{ color: 'var(--secondary-text)', fontSize: '0.72rem', marginTop: 2 }}>{phase.status === 'in_progress' ? 'Ready to start' : 'Upcoming'} • {formatMoney(phase.cost_estimate)}</p>
                    </div>
                  </div>

                  <div style={{ padding: '4px 14px 12px' }}>
                    {(stepsByPhase[phase.id] || []).map((step, stepIndex) => (
                      <div key={step.id} style={{ padding: '12px 0', borderBottom: stepIndex === (stepsByPhase[phase.id] || []).length - 1 ? 'none' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--border)', color: 'var(--secondary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                            {stepIndex + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>{step.name}</p>
                            {step.instructions && <p style={{ color: 'var(--secondary-text)', fontSize: '0.76rem', lineHeight: 1.45, marginTop: 4 }}>{step.instructions}</p>}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                              {[step.difficulty, step.diy_or_shop, step.estimated_hours ? `${step.estimated_hours}h` : null, step.cost_estimate ? formatMoney(step.cost_estimate) : null].filter(Boolean).map(item => (
                                <span key={item} style={{ background: 'var(--bg)', color: 'var(--dark-blue)', borderRadius: 14, padding: '3px 8px', fontSize: '0.65rem', fontWeight: 800 }}>
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  )
}
