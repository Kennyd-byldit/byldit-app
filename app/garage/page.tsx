'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { supabase } from '@/lib/supabase'
import '../command-center-prototype/command-center-prototype.css'

type Profile = {
  first_name: string | null
  handle: string | null
  name: string | null
}

type Vehicle = {
  id: string
  nickname: string | null
  year: number
  make: string
  model: string
  trim: string | null
  is_primary: boolean | null
  color: string | null
  engine: string | null
  transmission: string | null
  drivetrain: string | null
  fuel_type: string | null
  mileage: number | null
  condition: string | null
  cover_photo_url: string | null
}

type Project = {
  id: string
  vehicle_id: string
  name: string
  goal_type: string
  status: string
}

type SectionId = 'overview' | 'projects' | 'drafts' | 'history'
type WorkbenchTab = 'Plan' | 'Parts' | 'Decisions' | 'Refs' | 'Notes' | 'History'

const sections: Array<{ id: SectionId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'history', label: 'History' },
]

function BYLDitLogo() {
  return (
    <span className="ccLogo" aria-label="BYLDit">
      <span className="ccLogoByld">BYLD</span>
      <span className="ccLogoIt">it</span>
    </span>
  )
}

function WaltName() {
  return <span className="ccWaltName">Walt</span>
}

function getVehicleName(vehicle?: Vehicle | null) {
  if (!vehicle) return 'Vehicle'
  return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
}

function getVehicleDetails(vehicle?: Vehicle | null) {
  if (!vehicle) return ''
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')
}

function getVehiclePhoto(vehicle?: Vehicle | null) {
  if (!vehicle) return '/line-art/highboy-1-transparent.png'
  if (vehicle.cover_photo_url) return vehicle.cover_photo_url
  const model = vehicle.model.toLowerCase()
  if (model.includes('ranger')) return '/photos/ranger-2025.jpg'
  if (model.includes('f-250') || model.includes('f250')) return '/photos/f250-hiboy-68.jpg'
  return '/line-art/highboy-1-transparent.png'
}

function getVehiclePhotoPosition(vehicle?: Vehicle | null) {
  if (!vehicle) return 'center'
  const model = vehicle.model.toLowerCase()
  if (model.includes('ranger')) return 'center 52%'
  if (model.includes('f-250') || model.includes('f250')) return 'center 58%'
  return 'center'
}

function sectionProjects(projects: Project[], section: SectionId) {
  if (section === 'projects') {
    return projects.filter(project => project.status !== 'draft' && project.status !== 'complete')
  }

  if (section === 'drafts') {
    return projects.filter(project => project.status === 'draft')
  }

  if (section === 'history') {
    return projects.filter(project => project.status === 'complete')
  }

  return []
}

function sectionCount(projects: Project[], section: SectionId) {
  return sectionProjects(projects, section).length
}

export default function GaragePage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview')
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('Plan')
  const [activeVehicleId, setActiveVehicleId] = useState('')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let cancelled = false

    const loadGarage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.replace('/login?mode=signin')
        return
      }

      const [{ data: profileData }, { data: vehicleData }, { data: projectData }] =
        await Promise.all([
          supabase.from('profiles').select('first_name, handle, name').eq('id', user.id).maybeSingle(),
          supabase
            .from('vehicles')
            .select('id, nickname, year, make, model, trim, is_primary, color, engine, transmission, drivetrain, fuel_type, mileage, condition, cover_photo_url')
            .eq('user_id', user.id)
            .order('is_primary', { ascending: false })
            .order('created_at', { ascending: true }),
          supabase
            .from('projects')
            .select('id, vehicle_id, name, goal_type, status')
            .eq('user_id', user.id)
            .in('status', ['draft', 'active', 'paused', 'complete'])
            .order('created_at', { ascending: false }),
        ])

      if (cancelled) return

      const savedVehicles = vehicleData || []
      setProfile(profileData || null)
      setVehicles(savedVehicles)
      setProjects(projectData || [])
      setActiveVehicleId(savedVehicles[0]?.id || '')
      setLoading(false)
    }

    loadGarage()

    return () => {
      cancelled = true
    }
  }, [])

  const activeVehicle = useMemo(
    () => vehicles.find(vehicle => vehicle.id === activeVehicleId) || vehicles[0] || null,
    [activeVehicleId, vehicles]
  )

  const vehicleProjects = useMemo(
    () => projects.filter(project => project.vehicle_id === activeVehicle?.id),
    [activeVehicle?.id, projects]
  )

  const selectedProject = activeProjectId
    ? vehicleProjects.find(project => project.id === activeProjectId) || null
    : null
  const visibleProjects = sectionProjects(vehicleProjects, activeSection)
  const userLabel = profile?.handle || profile?.first_name || profile?.name || 'Your'
  const firstName = profile?.first_name || profile?.handle || 'Kenny'

  const workbenchTitle = selectedProject
    ? selectedProject.name
    : activeSection === 'overview'
      ? getVehicleName(activeVehicle)
      : sections.find(section => section.id === activeSection)?.label || 'Workbench'
  const workbenchLabel = selectedProject
    ? selectedProject.status === 'draft'
      ? 'Draft Workbench'
      : selectedProject.status === 'complete'
        ? 'Completed Project'
        : 'Project Workbench'
    : activeSection === 'overview'
      ? 'Vehicle Overview'
      : `Vehicle ${workbenchTitle}`
  const headerMode = selectedProject
    ? selectedProject.goal_type || selectedProject.status
    : activeSection === 'overview'
      ? 'Garage'
      : 'Vehicle'
  const waltTitle = selectedProject
    ? 'Project-aware conversation'
    : activeSection === 'overview'
      ? 'Vehicle-aware conversation'
      : `${workbenchTitle}-aware conversation`
  const tabs: WorkbenchTab[] = selectedProject
    ? ['Plan', 'Parts', 'Decisions', 'Refs', 'Notes', 'History']
    : activeSection === 'history'
      ? ['History', 'Parts', 'Notes']
      : ['Plan', 'Parts', 'Notes', 'History']

  const selectVehicle = (vehicleId: string) => {
    if (vehicleId === activeVehicleId) {
      setIsVehicleMenuOpen(current => !current)
      return
    }

    setActiveVehicleId(vehicleId)
    setIsVehicleMenuOpen(true)
    setActiveSection('overview')
    setActiveProjectId(null)
    setActiveTab('Plan')
  }

  const selectSection = (sectionId: SectionId) => {
    setActiveSection(sectionId)
    setActiveProjectId(null)
    setActiveTab(sectionId === 'history' ? 'History' : 'Plan')
  }

  const selectProject = (project: Project, sectionId: SectionId) => {
    setActiveSection(sectionId)
    setActiveProjectId(project.id)
    setActiveTab(sectionId === 'history' ? 'History' : 'Plan')
  }

  if (loading) {
    return (
      <main className="commandCenterPage loadingCommandCenter">
        <img src={WALT_AVATAR_URL} alt="Walt" />
        <p>Loading your garage command center...</p>
      </main>
    )
  }

  if (!vehicles.length) {
    return (
      <main className="commandCenterPage emptyCommandCenter">
        <BYLDitLogo />
        <h1>Your garage is ready for its first vehicle.</h1>
        <p>Add your first car, truck, motorcycle, or project vehicle to unlock the command center.</p>
        <a className="orangeButton" href="/garage-setup">Add Vehicle</a>
      </main>
    )
  }

  return (
    <main className="commandCenterPage">
      <aside className="garageRail" aria-label="Garage navigation">
        <div className="railHeader">
          <BYLDitLogo />
        </div>

        <div className="railTitleBlock">
          <h1>{userLabel}&apos;s Garage</h1>
        </div>

        <div className="railScroll">
          <div className="vehicleList">
            {vehicles.map(vehicle => {
              const vehicleSpecificProjects = projects.filter(project => project.vehicle_id === vehicle.id)

              return (
                <div className="vehicleGroup" key={vehicle.id}>
                  <article className={vehicle.id === activeVehicle?.id ? 'vehicleCard selected' : 'vehicleCard'}>
                    <button className="vehicleCardMain" onClick={() => selectVehicle(vehicle.id)} type="button">
                      <img
                        src={getVehiclePhoto(vehicle)}
                        alt=""
                        style={{ objectPosition: getVehiclePhotoPosition(vehicle) }}
                      />
                    </button>
                    <div className="vehicleCardBody">
                      <button className="vehicleInfoButton" onClick={() => selectVehicle(vehicle.id)} type="button">
                        <span>
                          <h2>{getVehicleName(vehicle)}</h2>
                          <p>{getVehicleDetails(vehicle)}</p>
                        </span>
                      </button>
                      <button
                        className="vehicleEditButton"
                        onClick={() => {
                          window.location.href = `/vehicle/${vehicle.id}`
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                    </div>
                  </article>

                  {vehicle.id === activeVehicle?.id && isVehicleMenuOpen ? (
                    <nav className="vehicleSectionList" aria-label="Selected vehicle sections">
                      <div className="sectionListHeader">
                        <div>
                          <span>{getVehicleName(vehicle)}</span>
                          <strong>Selected Vehicle</strong>
                        </div>
                        <button onClick={() => setIsVehicleMenuOpen(false)} type="button">
                          Hide
                        </button>
                      </div>
                      {sections.map(section => {
                        const rows = sectionProjects(vehicleSpecificProjects, section.id)
                        const count = sectionCount(vehicleSpecificProjects, section.id)
                        const sectionActive = activeSection === section.id && !activeProjectId

                        return (
                          <div className="sectionGroup" key={section.id}>
                            <button
                              className={sectionActive ? 'sectionLink active' : 'sectionLink'}
                              onClick={() => selectSection(section.id)}
                              type="button"
                            >
                              <span>{section.label}</span>
                              {count ? <strong>{count}</strong> : null}
                            </button>
                            {activeSection === section.id && rows.length ? (
                              <div className="sectionChildren">
                                {rows.map(project => (
                                  <button
                                    className="childLink"
                                    data-active={activeProjectId === project.id ? 'true' : undefined}
                                    key={project.id}
                                    onClick={() => selectProject(project, section.id)}
                                    type="button"
                                  >
                                    <span>{project.name}</span>
                                    <small>
                                      {section.id === 'drafts'
                                        ? 'Draft Workbench'
                                        : section.id === 'history'
                                          ? 'Project History'
                                          : 'Project Workbench'}
                                    </small>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </nav>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="railFooter">
          <div className="railActions">
            <button
              className="quietButton"
              onClick={() => {
                window.location.href = '/garage-setup'
              }}
              type="button"
            >
              Add Vehicle
            </button>
          </div>
          <div className="accountStrip">
            <div className="accountAvatar">{firstName[0]?.toUpperCase()}</div>
            <div>
              <strong>{firstName}</strong>
              <span>Profile & billing</span>
            </div>
            <button
              aria-label="Sign out"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.replace('/')
              }}
              type="button"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      <div className="mainWorkspace" style={{ '--first-panel-width': '40%' } as CSSProperties}>
        <header className="globalWorkspaceHeader">
          <div className="globalContext">
            <h2>
              {getVehicleName(activeVehicle)} <span>/</span> {workbenchTitle}{' '}
              <span>/</span> <strong>{headerMode}</strong>
            </h2>
          </div>
          <div className="layoutPresets" aria-label="Viewing options">
            <span>Viewing Options</span>
            <button className="active" type="button">Workbench</button>
            <button type="button">Walt Focus</button>
          </div>
        </header>

        <section className="waltCenter" aria-label="Walt conversation">
          <header className="workspaceHeader">
            <div>
              <p className="eyebrow">Ask Walt</p>
              <h2>{waltTitle}</h2>
            </div>
          </header>

          <div className="waltScroll">
            <div className="chatTimeline">
              <article className="chatMessage walt">
                <img src={WALT_AVATAR_URL} alt="" />
                <div>
                  <span><WaltName /></span>
                  <p>
                    I have {getVehicleName(activeVehicle)} open. Pick Overview,
                    Projects, Drafts, or History and I&apos;ll stay in that context.
                  </p>
                </div>
              </article>
              <article className="chatMessage user">
                <div className="userAvatar">{firstName[0]?.toUpperCase()}</div>
                <div>
                  <span>You</span>
                  <p>Show me what is currently saved for this vehicle.</p>
                </div>
              </article>
              <article className="chatMessage walt">
                <img src={WALT_AVATAR_URL} alt="" />
                <div>
                  <span><WaltName /></span>
                  <p>
                    This garage has {vehicleProjects.filter(project => project.status !== 'draft' && project.status !== 'complete').length}
                    {' '}active projects, {vehicleProjects.filter(project => project.status === 'draft').length}
                    {' '}drafts, and {vehicleProjects.filter(project => project.status === 'complete').length}
                    {' '}completed project records for this vehicle.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <form className="waltComposer">
            <label htmlFor="waltPrompt">Message Walt</label>
            <div>
              <input
                id="waltPrompt"
                placeholder="Ask Walt about this vehicle, project, part, or decision..."
                type="text"
              />
              <button type="button">Send</button>
            </div>
          </form>
        </section>

        <button className="workspaceResizeHandle" type="button" aria-label="Resize Walt and workbench panels">
          <span />
        </button>

        <aside className="workbenchPanel" aria-label="Project workbench">
          <div className="workbenchSticky">
            <div className="workbenchTop">
              <div>
                <p className="eyebrow">{workbenchLabel}</p>
                <h2>{workbenchTitle}</h2>
              </div>
            </div>
            <div className="workbenchStatus">
              <span>{selectedProject ? selectedProject.status : activeSection === 'overview' ? 'Vehicle Memory' : `${visibleProjects.length} saved`}</span>
              <span>{activeSection === 'overview' ? 'Garage' : headerMode}</span>
            </div>
            <nav className="workbenchTabs" aria-label="Workbench tabs">
              {tabs.map(tab => (
                <button
                  className={activeTab === tab ? 'active' : ''}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="workbenchContent">
            {activeSection === 'overview' ? (
              <section className="overviewGrid">
                <article className="overviewCard primary">
                  <p className="eyebrow">Vehicle Snapshot</p>
                  <h3>{getVehicleDetails(activeVehicle)}</h3>
                  <p>
                    {activeVehicle?.engine || 'Engine not set'} ·{' '}
                    {activeVehicle?.drivetrain || 'Drivetrain not set'} ·{' '}
                    {activeVehicle?.condition || 'Status not set'}
                  </p>
                </article>
                <article className="overviewCard">
                  <h3>Projects</h3>
                  <p>{sectionCount(vehicleProjects, 'projects')} active project records.</p>
                </article>
                <article className="overviewCard">
                  <h3>Drafts</h3>
                  <p>{sectionCount(vehicleProjects, 'drafts')} open draft ideas.</p>
                </article>
                <article className="overviewCard">
                  <h3>History</h3>
                  <p>{sectionCount(vehicleProjects, 'history')} completed records.</p>
                </article>
              </section>
            ) : selectedProject ? (
              <section className="projectPlanCard">
                <div className="phaseHeader">
                  <div>
                    <p className="eyebrow">{selectedProject.status}</p>
                    <h3>{selectedProject.name}</h3>
                  </div>
                  <span>{selectedProject.goal_type || 'Project'}</span>
                </div>
                <div className="projectStep upNext">
                  <div>
                    <strong>Workbench placeholder</strong>
                    <span>
                      This is where the full plan, parts, decisions, references,
                      notes, and history will live next.
                    </span>
                  </div>
                </div>
              </section>
            ) : visibleProjects.length ? (
              <section className="projectListPanel">
                {visibleProjects.map(project => (
                  <button
                    className="projectListCard"
                    key={project.id}
                    onClick={() => selectProject(project, activeSection)}
                    type="button"
                  >
                    <div>
                      <strong>{project.name}</strong>
                      <span>{project.goal_type || project.status}</span>
                    </div>
                    <span>Open</span>
                  </button>
                ))}
              </section>
            ) : (
              <section className="projectPlanCard">
                <div className="phaseHeader">
                  <div>
                    <p className="eyebrow">{workbenchLabel}</p>
                    <h3>Nothing saved here yet.</h3>
                  </div>
                </div>
                <p className="emptyWorkbenchNote">
                  Start with Walt or create a project when you are ready to add work
                  to {getVehicleName(activeVehicle)}.
                </p>
              </section>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
