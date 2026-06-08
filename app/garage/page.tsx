'use client'
import { useEffect, useState } from 'react'
import WaltPanel from '@/components/WaltPanel'
import { supabase } from '@/lib/supabase'
import { WALT_AVATAR_URL } from '@/lib/app-constants'

const WALT = WALT_AVATAR_URL

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => { if (item.label === 'Projects') window.location.href = '/projects' }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

const WaltBar = ({ onOpenWalt }: { onOpenWalt: () => void }) => (
  <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
      <div onClick={onOpenWalt} style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>Ask me about your garage...</div>
      <div onClick={onOpenWalt} style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

type Vehicle = { id: string, nickname: string, year: number, make: string, model: string, trim: string|null, is_primary: boolean, color: string|null, engine: string|null, transmission: string|null, drivetrain: string|null, fuel_type: string|null, mileage: number|null, condition: string|null, cover_photo_url: string|null }
type Project = { id: string, vehicle_id: string, name: string, goal_type: string, status: string }

const getCompletion = (v: Vehicle) => {
  const fields = [v.color, v.engine, v.transmission, v.drivetrain, v.mileage, v.condition]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

const getVehiclePhoto = (vehicle: Vehicle): string | null => {
  if (vehicle.cover_photo_url) return vehicle.cover_photo_url
  const model = vehicle.model?.toLowerCase() || ""
  if (model.includes("ranger")) return "/photos/ranger-2025.jpg"
  if (model.includes("f250") || model.includes("f-250")) return "/photos/f250-hiboy-68.jpg"
  return null // no photo available
}

const hasVehiclePhoto = (vehicle: Vehicle): boolean => {
  return getVehiclePhoto(vehicle) !== null
}

export default function GaragePage() {
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleProjects, setVehicleProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.history.pushState(null, "", window.location.href)
    const handlePop = () => { window.history.pushState(null, "", window.location.href) }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [])

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      setUserId(user.id)

      const [{ data: profile }, { data: vehicleData }, { data: projects }] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('vehicles').select('id, nickname, year, make, model, trim, is_primary, color, engine, transmission, drivetrain, fuel_type, mileage, condition, cover_photo_url').eq('user_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('projects').select('id, vehicle_id, name, goal_type, status').eq('user_id', user.id).in('status', ['draft', 'active', 'paused']).order('created_at', { ascending: false }),
      ])

      setUserName(profile?.name || user.email?.split('@')[0] || 'there')
      setVehicles(vehicleData || [])
      setVehicleProjects(projects || [])
      setLoading(false)
    }
    loadUser()
  }, [])

  async function uploadVehiclePhoto(vehicleId: string, file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/${vehicleId}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(filePath, file, { upsert: true })
    if (error) { console.error('Upload error:', error); return }
    const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
    await supabase.from('vehicles').update({ cover_photo_url: data.publicUrl }).eq('id', vehicleId)
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, cover_photo_url: data.publicUrl } : v))
  }

  async function setPrimary(vehicleId: string) {
    // Optimistic update
    setVehicles(prev => prev.map(v => ({ ...v, is_primary: v.id === vehicleId })))

    // Update Supabase: set target true, all others false
    await supabase.from('vehicles').update({ is_primary: false }).eq('user_id', userId).neq('id', vehicleId)
    await supabase.from('vehicles').update({ is_primary: true }).eq('id', vehicleId)
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={WALT} alt="Walt" style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--orange)', marginBottom: 12 }} />
        <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading your garage...</p>
      </div>
    </div>
  )

  const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0]
  const activeProjects = vehicleProjects.filter(project => project.status !== 'draft')
  const draftProjects = vehicleProjects.filter(project => project.status === 'draft')
  const hasVehicleActivity = vehicleProjects.length > 0
  const getVehicleActiveProjects = (vehicleId: string) => activeProjects.filter(project => project.vehicle_id === vehicleId)
  const getVehicleDrafts = (vehicleId: string) => draftProjects.filter(project => project.vehicle_id === vehicleId)
  const getVehicleActiveProject = (vehicleId: string) => getVehicleActiveProjects(vehicleId)[0]
  const getVehicleDraft = (vehicleId: string) => getVehicleDrafts(vehicleId)[0]
  const openVehicleActivity = (vehicleId: string, status: 'draft' | 'active', projects: Project[]) => {
    if (projects.length === 1) {
      window.location.assign(`/projects/${projects[0].id}`)
      return
    }

    window.location.assign(`/projects?vehicle=${vehicleId}&status=${status}`)
  }
  const activityLabel = (project: Project, suffix: string) => {
    const cleanName = project.name.replace(/\s+(draft|project)$/i, '').trim()
    return `${cleanName || project.goal_type} ${suffix}`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>11:32 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ width: 36 }} />
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <button onClick={() => setDrawerOpen(true)}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '2px solid var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark-blue)', fontFamily: 'var(--font-nunito)', lineHeight: 1 }}>
            {userName ? userName[0].toUpperCase() : '?'}
          </span>
        </button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {vehicles.length === 0 ? (
            // ── EMPTY GARAGE ─────────────────────────────────────────────────
            <div style={{ paddingTop: 20 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--dark-blue)', lineHeight: 1 }}>Welcome,</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)' }}>{userName}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '12px 16px', fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>
                  Your garage is empty. Let&apos;s fix that &mdash; add your first vehicle and we&apos;ll shape the project together.
                </div>
              </div>
              <div onClick={() => window.location.href = '/add-vehicle'} style={{ background: 'white', border: '2px dashed var(--light-blue)', borderRadius: 16, padding: '28px 20px', cursor: 'pointer', textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚗</div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--light-blue)', marginBottom: 4 }}>+ Add your first vehicle</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Year &middot; Make &middot; Model &middot; Nickname</p>
              </div>
              <div onClick={() => window.location.href = '/create-project'}
                style={{ background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, padding: '13px 16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Create a New Project →</p>
              </div>
            </div>

          ) : (
            // ── GARAGE WITH VEHICLES ──────────────────────────────────────────
            <>
              {/* 1. Hero Photo Card */}
              <div style={{ height: 160, marginBottom: 8, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)', background: 'var(--border)' }}>
                <img src={primaryVehicle && getVehiclePhoto(primaryVehicle) ? getVehiclePhoto(primaryVehicle)! : "/photos/f250-hiboy-68.jpg"} alt={primaryVehicle?.nickname || "My Vehicle"} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }} />
                {primaryVehicle && (getVehicleActiveProject(primaryVehicle.id) || getVehicleDraft(primaryVehicle.id)) && (
                  <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 5 }}>
                    {getVehicleActiveProject(primaryVehicle.id) && (
                      <div style={{ background: 'var(--dark-blue)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>ACTIVE</div>
                    )}
                    {getVehicleDraft(primaryVehicle.id) && (
                      <div style={{ background: 'var(--orange)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>DRAFT</div>
                    )}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
                    {primaryVehicle?.nickname || (primaryVehicle ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}` : 'My Vehicle')}
                  </p>
                  {primaryVehicle && (
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Welcome / Welcome Back */}
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <p style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--light-blue)', lineHeight: 1 }}>
                  Welcome,
                </p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-blue)', letterSpacing: -0.5, lineHeight: 1.15 }}>{userName}</p>
              </div>

              {/* 4. CTA */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div onClick={() => window.location.href = '/create-project'}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, padding: '12px 10px', textAlign: 'center', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', minHeight: 58, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Create a New Project →</p>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.66rem', marginTop: 2 }}>Start from a vehicle</p>
                </div>
                {hasVehicleActivity && (
                  <div onClick={() => window.location.href = '/projects'}
                    style={{ flex: 1, background: 'white', border: '1.5px solid var(--light-blue)', borderRadius: 25, padding: '12px 10px', textAlign: 'center', cursor: 'pointer', minHeight: 58, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--light-blue)', fontWeight: 800, fontSize: '0.9rem' }}>See Projects</p>
                    <p style={{ color: 'var(--secondary-text)', fontSize: '0.66rem', marginTop: 2 }}>
                      {activeProjects.length} active{draftProjects.length ? `, ${draftProjects.length} draft${draftProjects.length === 1 ? '' : 's'}` : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* 6. All vehicle cards */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 10 }}>
                {vehicles.map(v => {
                  const vehicleActiveProjects = getVehicleActiveProjects(v.id)
                  const vehicleDrafts = getVehicleDrafts(v.id)
                  const activeProject = vehicleActiveProjects[0]
                  const draftProject = vehicleDrafts[0]
                  const activeLabel = vehicleActiveProjects.length === 1 && activeProject
                    ? activityLabel(activeProject, 'Project')
                    : vehicleActiveProjects.length > 1 ? `${vehicleActiveProjects.length} Active Projects` : ''
                  const draftLabel = vehicleDrafts.length === 1 && draftProject
                    ? activityLabel(draftProject, 'Draft')
                    : vehicleDrafts.length > 1 ? `${vehicleDrafts.length} Open Drafts` : ''
                  return (
                  <div
                    key={v.id}
                    onClick={() => window.location.href = '/vehicle/' + v.id}
                    style={{ background: 'white', borderRadius: 14, marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 110, height: 70, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                        {hasVehiclePhoto(v) ? (
                          <img src={getVehiclePhoto(v)!} alt={v.nickname || v.make} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--dark-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '4px' }}>
                            <p style={{ fontSize: '0.5rem', color: 'white', fontWeight: 700, textAlign: 'center', lineHeight: 1.3, margin: 0 }}>{v.year} {v.make}</p>
                            <p style={{ fontSize: '0.5rem', color: 'var(--light-blue)', textAlign: 'center', lineHeight: 1.3, margin: 0 }}>{v.model}</p>
                          </div>
                        )}

                      </div>
                      <div style={{ flex: 1, padding: '10px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark-blue)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.nickname || `${v.year} ${v.make} ${v.model}`}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: 3 }}>{v.year} {v.make} {v.model}</p>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4, cursor: 'pointer' }}
                          onClick={e => e.stopPropagation()}>
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) uploadVehiclePhoto(v.id, f) }} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--light-blue)', fontWeight: 600 }}>
                            📷 {hasVehiclePhoto(v) ? 'Change photo' : 'Add photo'}
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setPrimary(v.id) }}
                        style={{ alignSelf: 'center', marginRight: 12, fontSize: '1.3rem', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                        aria-label={v.is_primary ? 'Featured vehicle' : 'Set as featured'}
                      >
                        <span style={{ color: v.is_primary ? "#e8750a" : "#d4e0eb", fontSize: "1.4rem", lineHeight: 1 }}>★</span>
                      </button>
                    </div>
                    <div style={{ borderTop: "1px solid var(--border)", padding: "8px 14px" }}>
                      {/* Row 1: progress bar + Edit Profile pill on same line */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, background: "#d4e0eb", borderRadius: 4, height: 4 }}>
                          <div style={{ width: getCompletion(v) + "%", height: "100%", background: getCompletion(v) === 100 ? "#4da8da" : "#e8750a", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: getCompletion(v) === 100 ? "#4da8da" : "#e8750a", flexShrink: 0 }}>{getCompletion(v)}%</span>
                        <div onClick={(e) => { e.stopPropagation(); window.location.href = "/vehicle/" + v.id }}
                          style={{ marginLeft: 4, background: "white", border: "1.5px solid var(--light-blue)", borderRadius: 20, padding: "3px 10px", cursor: "pointer", flexShrink: 0 }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--light-blue)", fontWeight: 700 }}>Edit {v.nickname || v.make}</span>
                        </div>
                      </div>
                      {/* Row 2: Walt message */}
                      {getCompletion(v) === 100 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <img src={WALT} alt="Walt" style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #e8750a", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", color: "#4da8da", fontWeight: 700 }}>Great job! Profile complete.</span>
                        </div>
                      ) : (
                        <div onClick={(e) => { e.stopPropagation(); window.location.href = "/vehicle/" + v.id }}
                          style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, cursor: "pointer" }}>
                          <img src={WALT} alt="Walt" style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #e8750a", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", color: "var(--secondary-text)", fontStyle: "italic" }}>&quot;The more I know, the more I can help.&quot;</span>
                        </div>
                      )}
                      {(activeProject || draftProject) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {activeProject && (
                            <button onClick={(e) => { e.stopPropagation(); openVehicleActivity(v.id, 'active', vehicleActiveProjects) }}
                              style={{ flex: 1, minHeight: 38, borderRadius: 20, border: 'none', background: 'var(--dark-blue)', color: 'white', fontFamily: 'var(--font-nunito)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', minWidth: 0, padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {activeLabel} →
                            </button>
                          )}
                          {draftProject && (
                            <button onClick={(e) => { e.stopPropagation(); openVehicleActivity(v.id, 'draft', vehicleDrafts) }}
                              style={{ flex: 1, minHeight: 38, borderRadius: 20, border: 'none', background: 'var(--orange)', color: 'white', fontFamily: 'var(--font-nunito)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', minWidth: 0, padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {draftLabel} →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* 7. Add to My Garage */}
              <div onClick={() => window.location.href = "/add-vehicle"} style={{ border: '2px dashed var(--light-blue)', borderRadius: 25, padding: '11px', textAlign: 'center', cursor: 'pointer' }}>
                <span style={{ color: 'var(--light-blue)', fontWeight: 700, fontSize: '0.9rem' }}>+ Add to My Garage</span>
              </div>
            </>
          )}

        </div>
      </main>

      <WaltBar onOpenWalt={() => setWaltOpen(true)} />
      <NavBar />

      {/* Overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
      )}

      {/* Slide-up drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'white', borderRadius: '20px 20px 0 0',
        padding: '0 0 32px',
        transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        fontFamily: 'var(--font-nunito)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d4e0eb' }} />
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)' }}>{userName ? userName[0].toUpperCase() : '?'}</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark-blue)' }}>{userName}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>BYLDit.ai member</p>
          </div>
        </div>

        {/* Menu items */}
        {[
          { label: 'My Profile', icon: '👤', section: 'Account' },
          { label: 'Billing & Subscription', icon: '💳', section: null },
          { label: 'Notifications', icon: '🔔', section: 'Settings' },
          { label: 'Units', icon: '📏', section: null },
          { label: 'FAQ / Help', icon: '❓', section: 'Help' },
          { label: 'About BYLDit.ai', icon: 'ℹ️', section: null },
          { label: 'Send Feedback', icon: '💬', section: null },
        ].map((item, i, arr) => (
          <div key={item.label}>
            {item.section && (
              <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, padding: '16px 24px 6px', fontWeight: 700 }}>{item.section}</p>
            )}
            <div onClick={() => setDrawerOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--dark-blue)', fontWeight: 500 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--secondary-text)', fontSize: '0.9rem' }}>›</span>
            </div>
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: 8, background: 'var(--bg)', margin: '8px 0' }} />

        {/* Log Out */}
        <div onClick={async () => {
          await supabase.auth.signOut()
          window.location.replace('/login')
        }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>🚪</span>
          <span style={{ fontSize: '0.95rem', color: '#e74c3c', fontWeight: 700 }}>Log Out</span>
        </div>
      </div>

      {/* Walt Panel */}
      <WaltPanel
        open={waltOpen}
        onClose={() => setWaltOpen(false)}
        context={`User: ${userName}\nVehicles:\n${vehicles.map(v => [
          `- ${v.nickname || `${v.year} ${v.make} ${v.model}`}`,
          `  Identity: ${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
          v.engine ? `  Engine: ${v.engine}` : '',
          v.transmission ? `  Transmission: ${v.transmission}` : '',
          v.drivetrain ? `  Drivetrain: ${v.drivetrain}` : '',
          v.fuel_type ? `  Fuel: ${v.fuel_type}` : '',
          v.condition ? `  Status: ${v.condition}` : '',
        ].filter(Boolean).join('\n')).join('\n') || 'none'}\nScreen: Garage`}
        openingLine={`Talk to me, ${userName}.`}
      />
    </div>
  )
}
