'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

const expOptions = [
  { emoji: '🔰', label: 'Just getting started' },
  { emoji: '🔧', label: 'Handle the basics' },
  { emoji: '⚙️', label: 'Done this before' },
  { emoji: '🏆', label: 'Blindfolded' },
]
const reasonOptions = [
  { emoji: '🚗', label: 'Project in the garage' },
  { emoji: '🔍', label: 'About to buy one' },
  { emoji: '🔧', label: 'Specific project' },
  { emoji: '🛠️', label: 'Mid-build, need help' },
]
const toolOptions = [
  'Basic hand tools', 'Floor jack', 'Jack stands', 'Air compressor',
  'Welder', 'Engine hoist', 'Paint setup', 'Diagnostic scanner',
]

type VehicleEntry = {
  year: string; make: string; model: string; nickname: string; color: string
  engine: string; transmission: string; drivetrain: string; fuel_type: string
  mileage: string; condition: string; title_status: string; notes: string
}

const emptyVehicle = (): VehicleEntry => ({
  year: '', make: '', model: '', nickname: '', color: '',
  engine: '', transmission: '', drivetrain: '', fuel_type: '',
  mileage: '', condition: '', title_status: '', notes: ''
})

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

const WaltBar = ({ placeholder }: { placeholder: string }) => (
  <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>{placeholder}</div>
      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

export default function BuildProfilePage() {
  // ── ALL STATE AT THE TOP ──────────────────────────────────────────────────
  const [step, setStep] = useState(1)

  // Step 1
  const [name, setName] = useState('')
  const [nameCommitted, setNameCommitted] = useState(false)
  const [expList, setExpList] = useState<string[]>([])
  const [expCommitted, setExpCommitted] = useState(false)
  const [reasonList, setReasonList] = useState<string[]>([])

  // Step 2
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([])
  const [newVehicle, setNewVehicle] = useState<VehicleEntry>(emptyVehicle())
  const [vehicleSaved, setVehicleSaved] = useState(false)

  // Step 3
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [toolsDone, setToolsDone] = useState(false)

  // Saving
  const [saving, setSaving] = useState(false)

  // ── HEADER ────────────────────────────────────────────────────────────────
  const goBack = () => {
    if (step === 1) {
      if (expCommitted) { setExpCommitted(false); return }
      if (nameCommitted) { setNameCommitted(false); return }
      window.location.replace('/meet-walt')
    } else if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  const Header = () => (
    <>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>← Back</button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 48 }} />
      </header>
    </>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16,
    fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4
  }

  // ── SAVE AND REDIRECT ─────────────────────────────────────────────────────
  const saveAndGo = async (destination: 'workspace' | 'garage') => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      await supabase.from('profiles').upsert({
        id: user.id, name,
        experience: expList.join(', '),
        reason: reasonList.join(', '),
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id)

      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i]
        await supabase.from('vehicles').insert({
          user_id: user.id,
          year: parseInt(v.year),
          make: v.make, model: v.model,
          nickname: v.nickname || `${v.year} ${v.make} ${v.model}`,
          color: v.color || null, engine: v.engine || null,
          transmission: v.transmission || null, drivetrain: v.drivetrain || null,
          fuel_type: v.fuel_type || null,
          mileage: v.mileage ? parseInt(v.mileage) : null,
          condition: v.condition || null, title_status: v.title_status || null,
          notes: v.notes || null, is_primary: i === 0, type: 'build',
        })
      }
    } catch (e) { console.error('Save error:', e) }

    if (destination === 'workspace') {
      setSaving(false)
      setStep(3)
    } else {
      window.location.replace('/garage')
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }
      await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id)
    } catch (e) { console.error(e) }
    window.location.replace('/garage')
  }

  // ── STEP 1: ABOUT YOU ─────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)', overflowX: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>Build Your Profile</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 16 }}>Step 1 of 3</p>

          {/* Walt intro */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
              <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Alright, let&apos;s get to know each other. <strong>What&apos;s your first name?</strong>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <input type="text" placeholder="Your first name" value={name}
              onChange={e => { setName(e.target.value); setNameCommitted(false) }}
              onKeyDown={e => { if (e.key === 'Enter' && name) setNameCommitted(true) }}
              style={{ width: '100%', padding: '12px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }} />
            {name && !nameCommitted && (
              <button onClick={() => setNameCommitted(true)}
                style={{ marginTop: 10, width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                That&apos;s me →
              </button>
            )}
          </div>

          {/* Experience */}
          {nameCommitted && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  Good to meet you, {name}. <strong>How much wrenching experience do you have?</strong>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 8, marginLeft: 2 }}>Select all that apply</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {expOptions.map(o => {
                  const val = o.emoji + ' ' + o.label
                  const selected = expList.includes(val)
                  return (
                    <div key={o.label} onClick={() => setExpList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])}
                      style={{ background: selected ? '#4da8da' : 'white', border: `1.5px solid ${selected ? '#4da8da' : 'var(--border)'}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: selected ? 'white' : 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  )
                })}
              </div>
              {!expCommitted && (
                <button onClick={() => setExpCommitted(true)}
                  style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer', marginBottom: 16 }}>
                  Next →
                </button>
              )}
            </>
          )}

          {/* Reasons */}
          {nameCommitted && expCommitted && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  Got it. <strong>What brings you to BYLDit?</strong>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 8, marginLeft: 2 }}>Select all that apply</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {reasonOptions.map(o => {
                  const val = o.emoji + ' ' + o.label
                  const selected = reasonList.includes(val)
                  return (
                    <div key={o.label} onClick={() => setReasonList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])}
                      style={{ background: selected ? '#4da8da' : 'white', border: `1.5px solid ${selected ? '#4da8da' : 'var(--border)'}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: selected ? 'white' : 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setStep(2)}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                What&apos;s in my garage →
              </button>
            </>
          )}
        </div>
      </main>
      <WaltBar placeholder="Tell me about yourself..." />
      <NavBar />
    </div>
  )

  // ── STEP 2: WHAT'S IN YOUR GARAGE ────────────────────────────────────────
  if (step === 2) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)', overflowX: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>What&apos;s in your garage?</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 16 }}>Step 2 of 3</p>

          {/* Walt tip */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
            <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, lineHeight: 1.5 }}>
              Alright {name}, let&apos;s build out your garage. Add everything you&apos;ve got — project cars, daily drivers, dream builds. <strong>The more I know, the more I can help.</strong>
            </p>
          </div>

          {/* Added vehicles */}
          {vehicles.map((v, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
              <div style={{ width: 80, flexShrink: 0 }}>
                <img src={v.model?.toLowerCase().includes('ranger') ? '/photos/ranger-2025.jpg' : '/photos/f250-hiboy-68.jpg'} alt={v.nickname || v.make}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
              </div>
              <div style={{ flex: 1, padding: '10px 14px' }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dark-blue)', marginBottom: 2 }}>{v.nickname || `${v.year} ${v.make} ${v.model}`}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>{v.year} {v.make} {v.model}</p>
              </div>
            </div>
          ))}

          {/* Vehicle form */}
          {!vehicleSaved && (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              {[['Year *', 'year', 'text', 'e.g. 1968'], ['Make *', 'make', 'text', 'e.g. Ford'], ['Model *', 'model', 'text', 'e.g. F-250'], ['Nickname', 'nickname', 'text', 'e.g. "Betty Lou"'], ['Color', 'color', 'text', 'e.g. Oxford White'], ['Engine', 'engine', 'text', 'e.g. 390 FE V8'], ['Transmission', 'transmission', 'text', 'e.g. 4-speed manual']].map(([lbl, fld, typ, ph]) => (
                <div key={fld} style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{lbl}</label>
                  <input type={typ} placeholder={ph} value={(newVehicle as Record<string,string>)[fld]}
                    onChange={e => setNewVehicle(prev => ({ ...prev, [fld]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
              {[['Drivetrain', 'drivetrain', ['2WD','4WD','AWD']], ['Fuel Type', 'fuel_type', ['Gas','Diesel','Electric','Hybrid']], ['Condition', 'condition', ['Daily driver','Weekend car','Project (non-running)','Stored']], ['Title Status', 'title_status', ['Clean','Salvage','Rebuilt']]].map(([lbl, fld, opts]) => (
                <div key={fld as string} style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{lbl}</label>
                  <select value={(newVehicle as Record<string,string>)[fld as string]}
                    onChange={e => setNewVehicle(prev => ({ ...prev, [fld as string]: e.target.value }))}
                    style={inputStyle}>
                    <option value="">Select...</option>
                    {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Mileage</label>
                <input type="number" placeholder="e.g. 87000" value={newVehicle.mileage}
                  onChange={e => setNewVehicle(prev => ({ ...prev, mileage: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea placeholder="Anything Walt should know — mods, issues, history..." value={newVehicle.notes}
                  onChange={e => setNewVehicle(prev => ({ ...prev, notes: e.target.value }))} rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
            </div>
          )}

          {/* Add vehicle button */}
          {!vehicleSaved && (
            <button
              onClick={() => {
                if (!newVehicle.year || !newVehicle.make || !newVehicle.model) return
                setVehicles(prev => [...prev, newVehicle])
                setNewVehicle(emptyVehicle())
                setVehicleSaved(true)
              }}
              disabled={!newVehicle.year || !newVehicle.make || !newVehicle.model}
              style={{ width: '100%', padding: '14px', background: newVehicle.year && newVehicle.make && newVehicle.model ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: newVehicle.year && newVehicle.make && newVehicle.model ? 'pointer' : 'not-allowed', boxShadow: newVehicle.year && newVehicle.make && newVehicle.model ? '0 6px 20px rgba(232,117,10,0.3)' : 'none', marginBottom: 12 }}>
              Add Vehicle →
            </button>
          )}

          {/* After vehicle saved */}
          {vehicleSaved && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <button onClick={() => saveAndGo('workspace')} disabled={saving}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Set Up My Workspace →'}
              </button>
              <button onClick={() => { setVehicleSaved(false); setNewVehicle(emptyVehicle()) }}
                style={{ width: '100%', padding: '14px', background: 'white', border: '2px solid var(--dark-blue)', borderRadius: 25, color: 'var(--dark-blue)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                + Add Another Vehicle
              </button>
            </div>
          )}

          {/* Skip */}
          {!vehicleSaved && vehicles.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: 12 }}>
              <span onClick={() => saveAndGo('workspace')} style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', cursor: 'pointer', textDecoration: 'underline' }}>
                Skip for now →
              </span>
            </p>
          )}
        </div>
      </main>
      <WaltBar placeholder="Tell me about your vehicles..." />
      <NavBar />
    </div>
  )

  // ── STEP 3: YOUR SETUP ────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)', overflowX: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>Your Setup</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 14 }}>Step 3 of 3</p>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
              <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
              Almost done. What tools do you have? I&apos;ll factor this into your build plans.
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {toolOptions.map(tool => {
              const selected = selectedTools.includes(tool)
              return (
                <div key={tool} onClick={() => setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])}
                  style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${selected ? '#4da8da' : 'var(--border)'}`, background: selected ? '#4da8da' : 'white', color: selected ? 'white' : 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  {tool}
                </div>
              )
            })}
          </div>

          {!toolsDone && (
            <button onClick={() => setToolsDone(true)}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
              Done →
            </button>
          )}

          {toolsDone && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
                  <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  Perfect. I&apos;ve got everything I need, {name}. Let&apos;s build something great.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleFinish} disabled={saving}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                  Skip
                </button>
                <button onClick={handleFinish} disabled={saving}
                  style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                  {saving ? 'Setting up...' : 'Head to my garage →'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <WaltBar placeholder="Ask me anything..." />
      <NavBar />
    </div>
  )
}
