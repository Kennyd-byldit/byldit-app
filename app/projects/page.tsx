'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
  vehicle_id: string
  name: string
  goal_type: string
  condition: string | null
  budget_estimate: number | null
  cover_photo_url: string | null
  created_at: string
  vehicle: Vehicle | null
  hasPlan: boolean
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

function ProjectsContent() {
  const searchParams = useSearchParams()
  const highlightedProjectId = searchParams.get('created') || searchParams.get('project') || ''

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingProjectId, setGeneratingProjectId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data } = await supabase
        .from('projects')
        .select(`
          id,
          vehicle_id,
          name,
          goal_type,
          condition,
          budget_estimate,
          cover_photo_url,
          created_at,
          vehicle:vehicles (
            id,
            nickname,
            year,
            make,
            model,
            cover_photo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      const projectRows = (data || []) as unknown as Omit<Project, 'hasPlan'>[]
      const projectIds = projectRows.map(project => project.id)
      const { data: phases } = projectIds.length > 0
        ? await supabase.from('phases').select('project_id').in('project_id', projectIds)
        : { data: [] }
      const plannedProjectIds = new Set((phases || []).map(phase => phase.project_id as string))

      setProjects(projectRows.map(project => ({
        ...project,
        hasPlan: plannedProjectIds.has(project.id),
      })))
      setLoading(false)
    }
    loadProjects()
  }, [])

  const handleProjectAction = async (project: Project) => {
    if (project.hasPlan) {
      window.location.assign(`/projects/${project.id}`)
      return
    }

    setError('')
    setGeneratingProjectId(project.id)

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/projects/${project.id}/generate-plan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Walt could not create the project plan right now.')
      setGeneratingProjectId('')
      return
    }

    window.location.assign(`/projects/${project.id}`)
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading projects...</p>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = '/garage'}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Garage
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 62 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '18px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>Projects</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--secondary-text)', marginBottom: 14 }}>
            Active projects live here. Garage stays focused on your vehicles.
          </p>

          {searchParams.get('created') && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
              <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--orange)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
                Project created. I saved the intake notes so the next workspace pass has something real to build from.
              </p>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
              <p style={{ color: 'var(--dark-blue)', fontSize: '0.84rem', fontWeight: 700 }}>{error}</p>
            </div>
          )}

          <div onClick={() => window.location.href = '/create-project'}
            style={{ background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, padding: '13px 16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 14 }}>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Create a New Project →</p>
          </div>

          {projects.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ color: 'var(--dark-blue)', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>No active projects yet</p>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.82rem', lineHeight: 1.45 }}>Start from a vehicle in your garage and BYLDit.ai will save the project here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(project => {
                const vehicle = project.vehicle
                const photo = getProjectPhoto(project)
                const isHighlighted = highlightedProjectId === project.id

                return (
                  <div key={project.id}
                    style={{
                      background: 'white',
                      borderRadius: 14,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      border: isHighlighted ? '2px solid var(--orange)' : '1.5px solid transparent',
                    }}>
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 110, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--dark-blue)' }}>
                        {photo ? (
                          <img src={photo} alt={getVehicleName(vehicle)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 4 }}>
                            <p style={{ fontSize: '0.5rem', color: 'white', fontWeight: 700, textAlign: 'center', lineHeight: 1.3, margin: 0 }}>{vehicle ? `${vehicle.year} ${vehicle.make}` : 'Project'}</p>
                            <p style={{ fontSize: '0.5rem', color: 'var(--light-blue)', textAlign: 'center', lineHeight: 1.3, margin: 0 }}>{vehicle?.model || 'No vehicle'}</p>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, padding: '8px 0 8px 14px', minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--dark-blue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getVehicleName(vehicle)}
                        </p>
                        <p style={{ fontSize: '0.76rem', color: 'var(--secondary-text)', marginTop: 2 }}>
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle details unavailable'}
                        </p>
                        <p style={{ fontSize: '0.86rem', color: 'var(--dark-blue)', fontWeight: 700, marginTop: 8, lineHeight: 1.25 }}>
                          {project.name}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--orange)', fontWeight: 800, marginTop: 2 }}>
                          {project.goal_type}
                        </p>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>Status</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--dark-blue)', fontWeight: 800 }}>
                          {project.hasPlan ? 'Plan Ready' : 'Needs Project Plan'}
                        </p>
                      </div>
                      <button onClick={() => handleProjectAction(project)} disabled={generatingProjectId === project.id}
                        style={{ minHeight: 40, padding: '0 16px', borderRadius: 20, border: 'none', background: generatingProjectId === project.id ? '#d4e0eb' : 'var(--dark-blue)', color: 'white', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-nunito)', cursor: generatingProjectId === project.id ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                        {generatingProjectId === project.id
                          ? 'Creating...'
                          : project.hasPlan ? 'Open Project' : 'Create Project Plan'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <NavBar />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}><p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>Loading...</p></div>}>
      <ProjectsContent />
    </Suspense>
  )
}
