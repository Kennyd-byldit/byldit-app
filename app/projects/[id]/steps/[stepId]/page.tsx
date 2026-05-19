'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  color: string | null
  engine: string | null
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
  condition: string | null
  budget_estimate: number | null
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
  notes: string[]
  warnings: string[]
  tips: string[]
  reference_notes: string[]
}

const emptyDetail: StepDetail = {
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

const formatMoney = (value: number | null) => {
  if (!value) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const formatVehicleContext = (vehicle: Vehicle | null) => {
  if (!vehicle) return 'Vehicle: not available'
  return [
    `Vehicle: ${getVehicleName(vehicle)} (${vehicle.year} ${vehicle.make} ${vehicle.model})`,
    vehicle.color ? `Color: ${vehicle.color}` : '',
    vehicle.engine ? `Engine: ${vehicle.engine}` : '',
    vehicle.transmission ? `Transmission: ${vehicle.transmission}` : '',
    vehicle.drivetrain ? `Drivetrain: ${vehicle.drivetrain}` : '',
    vehicle.mileage ? `Mileage: ${vehicle.mileage}` : '',
    vehicle.condition ? `Garage condition: ${vehicle.condition}` : '',
    vehicle.notes ? `Garage notes: ${vehicle.notes}` : '',
  ].filter(Boolean).join('\n')
}

const getVehicleDescriptor = (vehicle: Vehicle | null) => {
  if (!vehicle) return 'this vehicle'
  const engine = vehicle.engine ? ` with the ${vehicle.engine}` : ''
  const drivetrain = vehicle.drivetrain ? `, ${vehicle.drivetrain}` : ''
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${engine}${drivetrain}`
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
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      reference_notes: Array.isArray(parsed.reference_notes) ? parsed.reference_notes : [],
    }
  } catch {
    return { ...emptyDetail, overview: instructions }
  }
}

const withFallbackDetail = (detail: StepDetail, project: Project, phase: Phase, step: Step): StepDetail => ({
  overview: detail.overview || `${step.name} is part of ${phase.name} for ${project.name} on ${getVehicleDescriptor(project.vehicle)}. This step should be handled in order so the work stays safe, traceable, and ready for the next task.`,
  instructions: detail.instructions || `Before starting ${step.name}, confirm ${getVehicleDescriptor(project.vehicle)} is safely supported, the work area is clear, and the phase order still makes sense for the vehicle's current condition. Review any garage notes, document what you find, label parts as they come off, and use Walt for vehicle-specific part/spec checks before committing to the work.`,
  parts_materials: detail.parts_materials.length > 0 ? detail.parts_materials : [`Use the ${project.vehicle?.engine ? `${project.vehicle.engine} engine and ` : ''}${project.vehicle?.year || ''} ${project.vehicle?.make || ''} ${project.vehicle?.model || 'vehicle'} profile to confirm the exact parts, fluids, seals, gaskets, fasteners, and consumables for this step.`],
  tools: detail.tools.length > 0 ? detail.tools : [`Start with safety gear, lighting, containers, labels, and the standard hand tools for this area of the ${project.vehicle?.make || 'vehicle'}; ask Walt for likely vehicle-specific socket sizes or specialty tools before teardown.`],
  notes: detail.notes.length > 0 ? detail.notes : [`Use the saved vehicle/project context here: ${project.condition || project.vehicle?.condition || 'condition not specified'}. Capture current condition before disassembly and keep anything removed grouped by side, location, and order.`],
  warnings: detail.warnings.length > 0 ? detail.warnings : [`For ${getVehicleDescriptor(project.vehicle)}, verify safety-critical specs before final assembly: torque, fluid type/capacity, wiring, brake, fuel, suspension, and drivetrain details as applicable.`],
  tips: detail.tips.length > 0 ? detail.tips : ['Work slowly enough that the next step stays obvious. Bag and label hardware as you go, and take reference photos before anything comes apart.'],
  reference_notes: detail.reference_notes.length > 0 ? detail.reference_notes : ['Capture before photos, close-ups of routing/orientation, part numbers, fastener locations, labels, and any measurements you may need during reassembly.'],
})

const firstLines = (text: string, maxLength: number) => (
  text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text
)

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

function WaltBar({ onOpenWalt }: { onOpenWalt: () => void }) {
  return (
    <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
        <div onClick={onOpenWalt}
          style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#8395a7', cursor: 'pointer' }}>
          Ask Walt about this step...
        </div>
        <button onClick={onOpenWalt}
          style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', padding: 0, background: 'white', flexShrink: 0, cursor: 'pointer' }}>
          <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>
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
  const [notes, setNotes] = useState<string[]>([])
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
          condition,
          budget_estimate,
          vehicle:vehicles (
            id,
            nickname,
            year,
            make,
            model,
            color,
            engine,
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

      const { data: noteData } = await supabase
        .from('notes')
        .select('content')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setProject(projectData as unknown as Project)
      setStep(stepData as Step)
      setPhase((phaseData || null) as Phase | null)
      setNotes((noteData || []).map(note => note.content as string).filter(Boolean))
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

  const detail = withFallbackDetail(parseStepDetail(step.instructions), project, phase, step)
  const waltContext = [
    `Screen: Step detail`,
    `Project: ${project.name}`,
    formatVehicleContext(project.vehicle),
    `Project type: ${project.goal_type}`,
    `Project condition/intake: ${project.condition || 'not specified'}`,
    `Budget estimate: ${formatMoney(project.budget_estimate) || 'not specified'}`,
    `Project notes and intake details: ${notes.join('\n---\n') || 'none saved'}`,
    `Phase: ${phase.name}`,
    `Step: ${step.name}`,
    `Step status: ${step.status}`,
    `Overview: ${detail.overview}`,
    `Walkthrough: ${detail.instructions}`,
    `Parts/materials: ${detail.parts_materials.join(', ') || 'none listed'}`,
    `Tools: ${detail.tools.join(', ') || 'none listed'}`,
    `Notes: ${detail.notes.join(', ') || 'none listed'}`,
    `Warnings: ${detail.warnings.join(', ') || 'none listed'}`,
    `Tips: ${detail.tips.join(', ') || 'none listed'}`,
    `Reference notes: ${detail.reference_notes.join(', ') || 'none listed'}`,
    'Walt should act like a mechanic standing beside the user for this exact vehicle and project. Explain this exact step in detail: what it is, why it matters, prep, sequence, parts/materials, tools, cautions, common mistakes, done-checks, and what to do next. Use the vehicle engine/transmission/drivetrain/notes when relevant. If a common spec is likely for this vehicle, provide it carefully and tell the user what to verify. Do not give a shallow one-line answer unless the user explicitly asks for a short version.',
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
            <p style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', lineHeight: 1.55 }}>{firstLines(detail.overview, 900)}</p>
          </div>

          <div style={{ background: 'white', borderRadius: 14, padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 900, marginBottom: 8 }}>Step walkthrough</p>
            <p style={{ color: 'var(--dark-blue)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{detail.instructions}</p>
          </div>

          <SectionList title="Parts / Materials Needed" items={detail.parts_materials} empty="No parts or materials listed yet." />
          <SectionList title="Tools Needed" items={detail.tools} empty="No tools listed yet." />
          <SectionList title="Notes" items={detail.notes} empty="No supporting notes saved yet." />
          <SectionList title="Tips and Warnings" items={[...detail.tips, ...detail.warnings]} empty="No tips or warnings listed yet." />
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

      <WaltBar onOpenWalt={() => setWaltOpen(true)} />
      <NavBar />
      <WaltPanel
        open={waltOpen}
        onClose={() => setWaltOpen(false)}
        context={waltContext}
        openingLine={`Let's walk through ${step.name}.`}
        speakOpeningOnOpen
        vehicleId={project.vehicle?.id}
        screen={`project-step-${step.id}`}
      />
    </div>
  )
}
