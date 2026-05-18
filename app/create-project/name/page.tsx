'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CreateProjectFrame,
  LoadingScreen,
  Vehicle,
  VehicleHero,
  getVehicleName,
  loadCreateProjectVehicle,
  supabase,
} from '../CreateProjectShared'

function NameContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const goals = searchParams.get('goals') || ''
  const condition = searchParams.get('condition') || ''
  const work = searchParams.get('work') || ''
  const notes = searchParams.get('notes') || ''

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [projectPhotoUrl, setProjectPhotoUrl] = useState(searchParams.get('photo') || '')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      setVehicle(result.vehicle)
      setUserId(result.userId || '')
      if (result.vehicle) {
        const firstGoal = goals.split(',').filter(Boolean)[0]
        setName(firstGoal ? `${getVehicleName(result.vehicle)} ${firstGoal}` : `${getVehicleName(result.vehicle)} Project`)
      }
      setLoading(false)
    }
    load()
  }, [vehicleId, goals])

  const cleanName = name.trim()
  const canContinue = cleanName.length >= 3
  const backHref = `/create-project/work?vehicle=${vehicleId}&goals=${encodeURIComponent(goals)}&condition=${encodeURIComponent(condition)}&work=${encodeURIComponent(work)}&notes=${encodeURIComponent(notes)}`

  const uploadProjectPhoto = async (file: File) => {
    if (!userId) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${userId}/project-cover-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(filePath, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
      setProjectPhotoUrl(data.publicUrl)
    }
    setUploadingPhoto(false)
  }

  const nextHref = useMemo(() => {
    const params = new URLSearchParams({
      vehicle: vehicleId,
      goals,
      condition,
      work,
      notes,
      name: cleanName,
      photo: projectPhotoUrl,
    })
    return `/create-project/budget?${params.toString()}`
  }, [vehicleId, goals, condition, work, notes, cleanName, projectPhotoUrl])

  if (loading) return <LoadingScreen />
  if (!vehicle) return null

  const waltContext = [
    `Screen: Create Project - Name It`,
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    `Selected goals: ${goals || 'not provided'}`,
    `Condition: ${condition || 'not provided'}`,
    `Known work details: ${work || 'none selected'}`,
    `User notes: ${notes || 'none yet'}`,
    `Draft project name: ${cleanName || 'empty'}`,
    `Project photo: ${projectPhotoUrl ? 'custom project photo selected' : 'using vehicle photo or add later'}`,
    'Walt should help explain naming or clarify the purpose of the project, but the user completes the form.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref={backHref}
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine="Name it like you would label a parts bin: clear enough to find later."
      waltPrompt="Ask Walt about naming this project..."
      vehicleId={vehicle.id}
      screen="create-project-name"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />
          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>Name this project</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>We suggested a name. Keep it, tweak it, or rename it completely.</p>

            <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                Suggested project name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Example: Scout brake refresh"
                maxLength={70}
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 14px',
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 16,
                  fontFamily: 'var(--font-nunito)',
                  outline: 'none',
                  color: 'var(--dark-blue)',
                }}
              />
              <p style={{ fontSize: '0.72rem', color: 'var(--secondary-text)', marginTop: 8, lineHeight: 1.4 }}>
                This is just the label BYLDit.ai will use around the app.
              </p>
            </div>

            <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                Project photo
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 84, height: 58, borderRadius: 10, overflow: 'hidden', background: 'var(--bg)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
                  {(projectPhotoUrl || vehicle.cover_photo_url) ? (
                    <img src={projectPhotoUrl || vehicle.cover_photo_url || ''} alt="Project cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-blue)', fontSize: '1.2rem' }}>📷</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--dark-blue)', fontSize: '0.86rem', fontWeight: 700, marginBottom: 2 }}>
                    {projectPhotoUrl ? 'Custom project photo selected' : 'Use the vehicle photo, or add one now'}
                  </p>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.72rem', lineHeight: 1.35 }}>This can be changed later from the project.</p>
                </div>
              </div>
              <label style={{ display: 'block', marginTop: 12, cursor: uploadingPhoto ? 'default' : 'pointer' }}>
                <input type="file" accept="image/*" disabled={uploadingPhoto} style={{ display: 'none' }}
                  onChange={e => { const file = e.target.files?.[0]; if (file) uploadProjectPhoto(file) }} />
                <div style={{ width: '100%', minHeight: 46, borderRadius: 25, border: '1.5px solid var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-blue)', fontWeight: 800, fontSize: '0.9rem' }}>
                  {uploadingPhoto ? 'Adding photo...' : projectPhotoUrl ? 'Change project photo' : '+ Add project photo'}
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 22, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>✓</span>
              <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
                BYLDit.ai will use this as the project label in your garage, plan, budget, and Walt&apos;s notes.
              </p>
            </div>

            <button onClick={() => { if (canContinue) window.location.href = nextHref }} disabled={!canContinue}
              style={{
                width: '100%',
                padding: '14px',
                background: canContinue ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
                borderRadius: 25,
                border: 'none',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-nunito)',
                cursor: canContinue ? 'pointer' : 'not-allowed',
                boxShadow: canContinue ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
              }}>
              Continue →
            </button>
          </div>
        </div>
      </main>
    </CreateProjectFrame>
  )
}

export default function NamePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NameContent />
    </Suspense>
  )
}
