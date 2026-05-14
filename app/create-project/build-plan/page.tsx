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

function currencyLabel(value: string) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return 'Decide later'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number)
}

function BuildPlanContent() {
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicle') || ''
  const goals = searchParams.get('goals') || ''
  const condition = searchParams.get('condition') || ''
  const work = searchParams.get('work') || ''
  const notes = searchParams.get('notes') || ''
  const projectName = searchParams.get('name') || ''
  const projectPhotoUrl = searchParams.get('photo') || ''
  const budget = searchParams.get('budget') || ''
  const budgetMode = searchParams.get('budgetMode') || 'estimate'

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function load() {
      const result = await loadCreateProjectVehicle(vehicleId)
      if (result.needsRedirect) { window.location.replace(result.needsRedirect); return }
      if (!projectName.trim()) { window.location.replace('/create-project'); return }
      setVehicle(result.vehicle)
      setUserId(result.userId || '')
      setLoading(false)
    }
    load()
  }, [vehicleId, projectName])

  const goalList = goals.split(',').filter(Boolean)
  const workList = work.split(',').filter(Boolean)
  const budgetEstimate = budgetMode === 'later' || !budget ? null : Number(budget)
  const backHref = `/create-project/budget?${new URLSearchParams({ vehicle: vehicleId, goals, condition, work, notes, name: projectName, photo: projectPhotoUrl }).toString()}`
  const reviewPhoto = projectPhotoUrl || vehicle?.cover_photo_url || ''

  const setupNote = useMemo(() => [
    `Create Project intake`,
    `Goals: ${goalList.join(', ') || 'Not provided'}`,
    `Condition: ${condition || 'Not provided'}`,
    `Work details: ${workList.join(', ') || 'Not provided'}`,
    `Budget: ${budgetMode === 'later' ? 'Decide later' : currencyLabel(budget)}`,
    `Project photo: ${projectPhotoUrl ? 'Custom project photo' : vehicle?.cover_photo_url ? 'Vehicle photo' : 'Add later'}`,
    notes ? `Notes: ${notes}` : '',
  ].filter(Boolean).join('\n'), [goalList, condition, workList, budgetMode, budget, projectPhotoUrl, vehicle?.cover_photo_url, notes])

  const createProject = async () => {
    if (!vehicle || !userId || creating) return
    setCreating(true)
    setError('')

    const { data, error: projectError } = await supabase
      .from('projects')
      .insert({
        vehicle_id: vehicle.id,
        user_id: userId,
        name: projectName.trim(),
        goal_type: goalList.join(', ') || 'Custom / Other',
        condition: condition || null,
        budget_estimate: budgetEstimate,
        status: 'active',
        cover_photo_url: projectPhotoUrl || vehicle.cover_photo_url,
      })
      .select('id')
      .single()

    if (projectError || !data) {
      setError('Something stopped the project from being created. Try again in a minute.')
      setCreating(false)
      return
    }

    if (setupNote.trim()) {
      await supabase.from('notes').insert({
        project_id: data.id,
        user_id: userId,
        content: setupNote,
        author: 'user',
      })
    }

    setProjectId(data.id)
    setCreating(false)
  }

  if (loading) return <LoadingScreen />
  if (!vehicle) return null

  const waltContext = [
    `Screen: Create Project - Build My Plan handoff`,
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    `Project name: ${projectName}`,
    `Selected goals: ${goals || 'not provided'}`,
    `Condition: ${condition || 'not provided'}`,
    `Known work details: ${work || 'none selected'}`,
    `User notes: ${notes || 'none yet'}`,
    `Budget: ${budgetMode === 'later' ? 'decide later' : currencyLabel(budget)}`,
    `Project photo: ${projectPhotoUrl ? 'custom project photo selected' : vehicle.cover_photo_url ? 'using vehicle photo' : 'add later'}`,
    'Walt should explain what happens next and help the user feel oriented. Do not pretend the full generated build plan exists yet.',
  ].join('\n')

  return (
    <CreateProjectFrame
      backHref={backHref}
      waltOpen={waltOpen}
      onOpenWalt={() => setWaltOpen(true)}
      onCloseWalt={() => setWaltOpen(false)}
      waltContext={waltContext}
      waltOpeningLine="We have enough to start the project shell. The full plan comes next, once BYLDit.ai knows how KD wants that engine shaped."
      waltPrompt="Ask Walt what happens next..."
      vehicleId={vehicle.id}
      screen="create-project-build-plan"
    >
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <VehicleHero vehicle={vehicle} />
          <div style={{ padding: '0 18px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
              {projectId ? 'Project started' : 'Ready to build your plan'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 16 }}>
              {projectId ? 'The setup is saved. Walt has the intake notes for the next pass.' : 'Check the details before BYLDit.ai starts the project.'}
            </p>

            <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 92, height: 64, borderRadius: 12, overflow: 'hidden', background: 'var(--bg)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
                  {reviewPhoto ? (
                    <img src={reviewPhoto} alt="Project cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--light-blue)', fontSize: '1.25rem' }}>📷</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>Project photo</p>
                  <p style={{ fontSize: '0.92rem', color: 'var(--dark-blue)', fontWeight: 800, lineHeight: 1.3 }}>
                    {projectPhotoUrl ? 'Custom photo selected' : reviewPhoto ? 'Using vehicle photo' : 'Add later'}
                  </p>
                </div>
              </div>
              {[
                { label: 'Name', value: projectName },
                { label: 'Goal', value: goalList.join(', ') || 'Not provided' },
                { label: 'Condition', value: condition || 'Not provided' },
                { label: 'Work to include', value: workList.join(', ') || (notes ? 'Captured in your notes' : 'Not provided') },
                { label: 'Budget', value: budgetMode === 'later' ? 'Decide later' : currencyLabel(budget) },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 0', borderBottom: item.label === 'Budget' ? 'none' : '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontSize: '0.92rem', color: 'var(--dark-blue)', fontWeight: 700, lineHeight: 1.35 }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, background: projectId ? '#4da8da' : 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
              <img src="https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png" alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
                {projectId
                  ? 'Good. The project shell is in place. Next pass can turn this intake into phases, steps, parts, and budget tracking.'
                  : 'I’ll keep the plan honest: scope, budget, and what needs to happen first. For now we’re saving the handoff cleanly.'}
              </p>
            </div>

            {error && (
              <div style={{ background: '#fff1e6', border: '1.5px solid var(--orange)', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
                <p style={{ color: 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 700 }}>{error}</p>
              </div>
            )}

            {!projectId ? (
              <button onClick={createProject} disabled={creating}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: creating ? '#d4e0eb' : 'linear-gradient(135deg, #e8750a, #f4a543)',
                  borderRadius: 25,
                  border: 'none',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-nunito)',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  boxShadow: creating ? 'none' : '0 6px 20px rgba(232,117,10,0.3)',
                }}>
                {creating ? 'Starting project...' : 'Build My Plan →'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => window.location.href = '/garage'}
                  style={{ flex: 1, padding: '13px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-blue)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                  Garage
                </button>
                <button onClick={() => window.location.href = `/vehicle/${vehicle.id}`}
                  style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer', boxShadow: '0 6px 20px rgba(232,117,10,0.3)' }}>
                  View Vehicle
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </CreateProjectFrame>
  )
}

export default function BuildPlanPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BuildPlanContent />
    </Suspense>
  )
}
