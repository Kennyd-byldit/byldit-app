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
}

type Project = {
  id: string
  name: string
  goal_type: string
  vehicle: Vehicle | null
}

type Phase = {
  id: string
  name: string
  status: string
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
}

type StepDetail = {
  overview: string
  instructions: string
  parts_materials: string[]
  tools: string[]
  warnings: string[]
  tips: string[]
  reference_notes: string[]
}

const emptyDetail: StepDetail = {
  overview: '',
  instructions: '',
  parts_materials: [],
  tools: [],
  warnings: [],
  tips: [],
  reference_notes: [],
}

const getVehicleName = (vehicle: Vehicle | null) => {
  if (!vehicle) return 'Vehicle'
  return vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
}

const formatMoney = (value: number | null) => {
  if (!value) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const parseStepDetail = (instructions: string | null): StepDetail => {
  if (!instructions) return emptyDetail
  try {
    const parsed = JSON.parse(instructions)
    return {
      overview: parsed.overview || '',
      instructions: parsed.instructions || '',
      parts_materials: Array.isArray(parsed.parts_materials) ? parsed.parts_materials : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      reference_notes: Array.isArray(parsed.reference_notes) ? parsed.reference_notes : [],
    }
  } catch {
    return { ...emptyDetail, overview: instructions }
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

function SectionList({ title, items, empty }: { title: string, items: string[], empty: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
      <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 900, marginBottom: 8 }}>{title}</p>
      {items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, index) => (
            <div key={`${title}-${index}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg)', color: 'var(--light-blue)', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>•</span>
              <p style={{ color: 'var(--dark-blue)', fontSize: '0.86rem', lineHeight: 1.45 }}>{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--secondary-text)', fontSize: '0.84rem', lineHeight: 1.45 }}>{empty}</p>
      )}
    </div>
  )
}

export default function StepDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const stepId = params.stepId as string
  const [project, setProject] = useState<Project | null>(null)
  const [phase, setPhase] = useState<Phase | null>(null)
  const [step, setStep] = useState<Step | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [waltOpen, setWaltOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadStep() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          goal_type,
          vehicle:vehicles (
            id,
            nickname,
            year,
            make,
            model
          )
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (!projectData) { window.location.replace('/projects'); return }

      const { data: stepData } = await supabase
        .from('steps')
        .select('id, phase_id, name, instructions, difficulty, estimated_hours, cost_estimate, diy_or_shop, status')
        .eq('id', stepId)
        .eq('user_id', user.id)
        .single()

      if (!stepData) { window.location.replace(`/projects/${projectId}`); return }

      const { data: phaseData } = await supabase
        .from('phases')
        .select('id, name, status')
        .eq('id', stepData.phase_id)
        .eq('user_id', user.id)
        .single()

      setProject(projectData as unknown as Project)
      setStep(stepData as Step)
      setPhase((phaseData || null) as Phase | null)
      setLoading(false)
    }
    loadStep()
  }, [projectId, stepId])

  const markComplete = async () => {
    if (!step || saving) return
    setSaving(true)
    await supabase.from('steps').update({ status: 'complete' }).eq('id', step.id)
    setStep(prev => prev ? { ...prev, status: 'complete' } : prev)
    setSaving(false)
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading step...</p>
    </div>
  )

  if (!project || !phase || !step) return null

  const detail = parseStepDetail(step.instructions)
  const waltContext = [
    `Screen: Step detail`,
    `Project: ${project.name}`,
    `Vehicle: ${getVehicleName(project.vehicle)}`,
    `Project type: ${project.goal_type}`,
    `Phase: ${phase.name}`,
    `Step: ${step.name}`,
    `Step status: ${step.status}`,
    `Overview: ${detail.overview}`,
    `Walkthrough: ${detail.instructions}`,
    `Parts/materials: ${detail.parts_materials.join(', ') || 'none listed'}`,
    `Tools: ${detail.tools.join(', ') || 'none listed'}`,
    `Warnings: ${detail.warnings.join(', ') || 'none listed'}`,
    `Tips: ${detail.tips.join(', ') || 'none listed'}`,
    'Walt should help the user understand and perform this exact step, including parts, tools, cautions, and sequencing.',
  ].join('\n')

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = `/projects/${projectId}`}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Plan
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 46 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 900, marginBottom: 4 }}>{phase.name}</p>
          <p style={{ fontSize: '1.25rem', color: 'var(--dark-blue)', fontWeight: 900, lineHeight: 1.18, marginBottom: 8 }}>{step.name}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {[step.status.replace(/_/g, ' '), step.difficulty, step.diy_or_shop, step.estimated_hours ? `${step.estimated_hours}h` : null, formatMoney(step.cost_estimate)].filter(Boolean).map(item => (
              <span key={item} style={{ background: 'white', border: '1.5px solid var(--border)', color: 'var(--dark-blue)', borderRadius: 16, padding: '4px 9px', fontSize: '0.68rem', fontWeight: 900, textTransform: item === step.status.replace(/_/g, ' ') ? 'capitalize' : 'none' }}>
                {item}
              </span>
            ))}
          </div>

          <button onClick={() => setWaltOpen(true)}
            style={{ width: '100%', minHeight: 48, background: 'var(--dark-blue)', color: 'white', border: 'none', borderRadius: 24, fontFamily: 'var(--font-nunito)', fontSize: '0.9rem', fontWeight: 900, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <img src={WALT} alt="Walt" style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid var(--orange)' }} />
            Walk me through this step
          </button>

          <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 900, marginBottom: 8 }}>Overview</p>
            <p style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', lineHeight: 1.55 }}>{detail.overview || 'Walt did not add a separate overview for this step yet.'}</p>
          </div>

          <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 900, marginBottom: 8 }}>Step walkthrough</p>
            <p style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{detail.instructions || 'No walkthrough saved yet.'}</p>
          </div>

          <SectionList title="Parts / Materials Needed" items={detail.parts_materials} empty="No parts or materials listed yet." />
          <SectionList title="Tools Needed" items={detail.tools} empty="No tools listed yet." />
          <SectionList title="Notes / Tips / Warnings" items={[...detail.warnings, ...detail.tips]} empty="No tips or warnings listed yet." />
          <SectionList title="Photos / Reference Area" items={detail.reference_notes} empty="Simple scaffold for now: add reference photos, labels, measurements, and before/after shots here in a future pass." />

          <button onClick={markComplete} disabled={saving || step.status === 'complete'}
            style={{
              width: '100%',
              minHeight: 50,
              background: step.status === 'complete' ? '#4da8da' : 'linear-gradient(135deg, #e8750a, #f4a543)',
              color: 'white',
              border: 'none',
              borderRadius: 25,
              fontFamily: 'var(--font-nunito)',
              fontSize: '0.95rem',
              fontWeight: 900,
              cursor: saving || step.status === 'complete' ? 'default' : 'pointer',
              boxShadow: step.status === 'complete' ? 'none' : '0 6px 20px rgba(232,117,10,0.3)',
              marginBottom: 8,
            }}>
            {step.status === 'complete' ? 'Step Complete' : saving ? 'Saving...' : 'Mark Step Complete'}
          </button>
        </div>
      </main>

      <NavBar />
      <WaltPanel
        open={waltOpen}
        onClose={() => setWaltOpen(false)}
        context={waltContext}
        openingLine={`Let's walk through ${step.name}.`}
        vehicleId={project.vehicle?.id}
        screen={`project-step-${step.id}`}
      />
    </div>
  )
}
