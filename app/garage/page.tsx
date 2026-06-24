'use client'

import { useEffect, useMemo, useState } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { supabase } from '@/lib/supabase'
import './garage-command-center.css'

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

type GarageSection = 'overview' | 'projects' | 'drafts' | 'history'

const sections: Array<{ id: GarageSection; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'history', label: 'History' },
]

function BYLDitLogo() {
  return (
    <span className="ccRealLogo" aria-label="BYLDit">
      <span className="ccRealLogoByld">BYLD</span>
      <span className="ccRealLogoIt">it</span>
    </span>
  )
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

export default function GaragePage() {
  const [activeSection, setActiveSection] = useState<GarageSection>('overview')
  const [activeVehicleId, setActiveVehicleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let cancelled = false

    const loadGarage = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.replace('/login?mode=signin')
        return
      }

      const [{ data: profileData }, { data: vehicleData }, { data: projectData }] = await Promise.all([
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
  const activeProjects = vehicleProjects.filter(project => project.status !== 'draft' && project.status !== 'complete')
  const draftProjects = vehicleProjects.filter(project => project.status === 'draft')
  const historyProjects = vehicleProjects.filter(project => project.status === 'complete')
  const userLabel = profile?.handle || profile?.first_name || profile?.name || 'Your'

  const sectionRows = activeSection === 'projects'
    ? activeProjects
    : activeSection === 'drafts'
      ? draftProjects
      : activeSection === 'history'
        ? historyProjects
        : []

  if (loading) {
    return (
      <main className="ccRealLoading">
        <img src={WALT_AVATAR_URL} alt="Walt" />
        <p>Loading your garage command center...</p>
      </main>
    )
  }

  if (!vehicles.length) {
    return (
      <main className="ccRealEmpty">
        <BYLDitLogo />
        <h1>Your garage is ready for its first vehicle.</h1>
        <p>Add your first car, truck, motorcycle, or project vehicle to unlock the command center.</p>
        <a href="/garage-setup">Add Vehicle</a>
      </main>
    )
  }

  return (
    <main className="ccRealShell">
      <aside className="ccRealGarage" aria-label="Garage">
        <BYLDitLogo />
        <div className="ccRealGarageTitle">
          <span>Garage</span>
          <h1>{userLabel}&apos;s Garage</h1>
        </div>

        <div className="ccRealVehicleList">
          {vehicles.map(vehicle => (
            <article
              className={vehicle.id === activeVehicle?.id ? 'ccRealVehicle active' : 'ccRealVehicle'}
              key={vehicle.id}
              onClick={() => {
                setActiveVehicleId(vehicle.id)
                setActiveSection('overview')
              }}
            >
              <img src={getVehiclePhoto(vehicle)} alt={getVehicleName(vehicle)} />
              <div className="ccRealVehicleInfo">
                <strong>{getVehicleName(vehicle)}</strong>
                <span>{getVehicleDetails(vehicle)}</span>
              </div>
              <button
                onClick={event => {
                  event.stopPropagation()
                  window.location.href = `/vehicle/${vehicle.id}`
                }}
                type="button"
              >
                Edit
              </button>
            </article>
          ))}
        </div>

        <a className="ccRealAddVehicle" href="/garage-setup">Add Vehicle</a>

        <div className="ccRealProfileCard">
          <div className="ccRealInitial">{(profile?.first_name || profile?.handle || 'K')[0]?.toUpperCase()}</div>
          <div>
            <strong>{profile?.first_name || profile?.handle || 'Kenny'}</strong>
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
            Sign Out
          </button>
        </div>
      </aside>

      <section className="ccRealHeader">
        <div>
          <span>{getVehicleName(activeVehicle)}</span>
          <h2>{activeSection === 'overview' ? 'Vehicle Overview' : sections.find(section => section.id === activeSection)?.label}</h2>
        </div>
        <nav aria-label="Vehicle command center sections">
          {sections.map(section => (
            <button
              className={activeSection === section.id ? 'active' : ''}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </section>

      <section className="ccRealWalt" aria-label="Walt conversation">
        <header>
          <div>
            <span>Ask Walt</span>
            <h2>Vehicle-aware conversation</h2>
          </div>
          <img src={WALT_AVATAR_URL} alt="Walt" />
        </header>

        <div className="ccRealWaltCallout">
          <img src={WALT_AVATAR_URL} alt="" />
          <p>
            I know this is {getVehicleName(activeVehicle)}. I can use its saved
            details while we plan projects, compare parts, and build history.
          </p>
        </div>

        <div className="ccRealMessages">
          <article className="walt">
            <img src={WALT_AVATAR_URL} alt="" />
            <p>
              I have {getVehicleName(activeVehicle)} open. Pick Overview,
              Projects, Drafts, or History and I&apos;ll stay in that context.
            </p>
          </article>
          <article className="user">
            <span>{(profile?.first_name || 'You')[0]?.toUpperCase()}</span>
            <p>Show me what is currently saved for this vehicle.</p>
          </article>
        </div>

        <div className="ccRealMessageBox">
          <span>Ask Walt about this vehicle, project, part, or decision...</span>
          <button type="button">Send</button>
        </div>
      </section>

      <section className="ccRealWorkbench" aria-label="Workbench">
        <header>
          <span>Project Workbench</span>
          <h2>{activeSection === 'overview' ? getVehicleName(activeVehicle) : sections.find(section => section.id === activeSection)?.label}</h2>
          <p>
            The workbench is the next area we&apos;ll build out. For now, this
            shows the selected vehicle context and any saved project records.
          </p>
        </header>

        {activeSection === 'overview' ? (
          <div className="ccRealSnapshot">
            <article>
              <span>Vehicle</span>
              <strong>{getVehicleDetails(activeVehicle)}</strong>
            </article>
            <article>
              <span>Engine</span>
              <strong>{activeVehicle?.engine || 'Not set yet'}</strong>
            </article>
            <article>
              <span>Drivetrain</span>
              <strong>{activeVehicle?.drivetrain || 'Not set yet'}</strong>
            </article>
            <article>
              <span>Status</span>
              <strong>{activeVehicle?.condition || 'Not set yet'}</strong>
            </article>
          </div>
        ) : (
          <div className="ccRealList">
            {sectionRows.length ? sectionRows.map(project => (
              <a href={`/projects/${project.id}`} key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.goal_type} · {project.status}</span>
                </div>
                <span>Open</span>
              </a>
            )) : (
              <p className="ccRealEmptyList">
                Nothing saved here yet for {getVehicleName(activeVehicle)}.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
