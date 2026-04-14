'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const WaltMsg = ({ text }: { text: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid var(--orange)', flexShrink: 0 }}>
      <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 14, padding: '10px 14px', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{text}</div>
  </div>
)

const UserReply = ({ text }: { text: string }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, marginLeft: 38 }}>
    <div style={{ background: '#4da8da', color: 'white', borderRadius: 14, padding: '8px 14px', fontSize: '0.9rem', maxWidth: '60%', wordBreak: 'break-word' }}>
      {text}
    </div>
  </div>
)

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

export default function BuildProfilePage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [exp, setExp] = useState('')
  const [reason, setReason] = useState('')
  const [vehicles, setVehicles] = useState<{year: string, make: string, model: string, nickname: string, color: string, trim: string, engine: string, transmission: string, drivetrain: string, fuel_type: string, mileage: string, condition: string, title_status: string, notes: string}[]>([])
  const [newVehicle, setNewVehicle] = useState({ year: '', make: '', model: '', nickname: '', color: '', trim: '', engine: '', transmission: '', drivetrain: '', fuel_type: '', mileage: '', condition: '', title_status: '', notes: '' })
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [showMoreDetails, setShowMoreDetails] = useState(true)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [toolsDone, setToolsDone] = useState(false)
  const [vehicleSaved, setVehicleSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAddingFromGarage, setIsAddingFromGarage] = useState(false)
  const [colorBlurred, setColorBlurred] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("step") === "vehicles") {
      setStep(5)
      setIsAddingFromGarage(true)
      setAddingVehicle(true)
    }
  }, [])

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])
  }

  const addVehicle = () => {
    if (!newVehicle.year || !newVehicle.make || !newVehicle.model) return
    setVehicles(prev => [...prev, newVehicle])
    setNewVehicle({ year: '', make: '', model: '', nickname: '', color: '', trim: '', engine: '', transmission: '', drivetrain: '', fuel_type: '', mileage: '', condition: '', title_status: '', notes: '' })
    setAddingVehicle(false)
    setShowMoreDetails(false)
    setColorBlurred(false)
    setVehicleSaved(true)
  }

  const addAndFinish = () => {
    if (!newVehicle.year || !newVehicle.make || !newVehicle.model) return
    setVehicles(prev => [...prev, newVehicle])
    setNewVehicle({ year: '', make: '', model: '', nickname: '', color: '', trim: '', engine: '', transmission: '', drivetrain: '', fuel_type: '', mileage: '', condition: '', title_status: '', notes: '' })
    setAddingVehicle(false)
    setVehicleSaved(true)
  }

  const saveToSupabaseAndRedirect = async (destination: 'garage' | 'workspace') => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i]
        await supabase.from("vehicles").insert({
          user_id: user.id,
          year: parseInt(v.year),
          make: v.make,
          model: v.model,
          nickname: v.nickname || `${v.year} ${v.make} ${v.model}`,
          color: v.color || null,
          engine: v.engine || null,
          transmission: v.transmission || null,
          drivetrain: v.drivetrain || null,
          fuel_type: v.fuel_type || null,
          mileage: v.mileage ? parseInt(v.mileage) : null,
          condition: v.condition || null,
          title_status: v.title_status || null,
          notes: v.notes || null,
          is_primary: i === 0,
          type: "build",
        })
      }
    }
    if (destination === 'garage') {
      window.location.replace("/garage")
    } else {
      setStep(6)
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Save profile (skip when adding from garage to avoid overwriting existing data)
      if (!isAddingFromGarage) {
        await supabase.from('profiles').upsert({
          id: user.id, name, experience: exp, reason,
          onboarded: true, updated_at: new Date().toISOString(),
        })
      }
      // Save vehicles
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i]
        await supabase.from('vehicles').insert({
          user_id: user.id,
          year: parseInt(v.year),
          make: v.make,
          model: v.model,
          nickname: v.nickname || `${v.year} ${v.make} ${v.model}`,
          type: 'build',
          color: v.color || null,
          engine: v.engine || null,
          transmission: v.transmission || null,
          drivetrain: v.drivetrain || null,
          fuel_type: v.fuel_type || null,
          mileage: v.mileage ? parseInt(v.mileage) : null,
          condition: v.condition || null,
          title_status: v.title_status || null,
          notes: v.notes || null,
          is_primary: i === 0,
        })
      }
    }
    window.location.replace('/garage')
  }

  const AppHeader = () => (
    <>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
      </header>
    </>
  )

  const WaltBar = ({ placeholder }: { placeholder: string }) => (
    <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa' }}>{placeholder}</div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
          <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  )

  const NavBar = () => (
    <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
      <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
        {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }, { icon: '⋯', label: 'More', active: false }].map(item => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
            <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </nav>
  )

  // ── STEP 1 & OPTIONAL DETAILS ──────────────────────────────────────────────
  if (step <= 4) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)', overflowX: 'hidden' }}>
      <AppHeader />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', overflowX: 'hidden', width: '100%' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>Build Your Profile</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 14 }}>Step 1 of 3</p>
          {(name || exp || reason) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[name, exp, reason].filter(Boolean).map(t => (
                <div key={t} style={{ background: 'var(--dark-blue)', color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem' }}>{t}</div>
              ))}
            </div>
          )}

          <WaltMsg text={<>Alright, let&apos;s get to know each other. <strong>What&apos;s your first name?</strong></>} />
          {step === 1 && (
            <div style={{ marginLeft: 38, marginBottom: 16 }}>
              <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter' && name) setStep(2) }} />
              {name && <button onClick={() => setStep(2)} style={{ marginTop: 10, width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>That&apos;s me &#x2192;</button>}
            </div>
          )}

          {step >= 2 && (
            <>
              <UserReply text={name} />
              <WaltMsg text={<>Good to meet you, {name}. <strong>How much experience do you have wrenching?</strong></>} />
              {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {expOptions.map(o => (
                    <div key={o.label} onClick={() => { setExp(o.emoji + ' ' + o.label); setStep(3) }}
                      style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step >= 3 && (
            <>
              <UserReply text={exp} />
              <WaltMsg text={<>Nice &#x2014; solid starting point. <strong>What brings you to BYLDit.ai?</strong></>} />
              {step === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {reasonOptions.map(o => (
                    <div key={o.label} onClick={() => { setReason(o.emoji + ' ' + o.label); setStep(4) }}
                      style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--dark-blue)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{o.emoji}</div>
                      <strong>{o.label}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step >= 4 && (
            <>
              <UserReply text={reason} />
              <WaltMsg text="Great &#x2014; I've got what I need. Want to round out your profile? Totally optional." />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg)', border: '2px dashed var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📷</div>
                <div><p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-blue)' }}>{name}</p><p style={{ fontSize: '0.75rem', color: 'var(--light-blue)' }}>Add photo</p></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'hidden' }}>
                <input placeholder="Age" style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }} />
                <input placeholder="City, State" style={{ flex: 2, minWidth: 0, boxSizing: 'border-box', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none' }} />
              </div>
              <input placeholder="Bio &#x2014; Tell us about yourself..." style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', display: 'block', marginBottom: 10 }} />
              <input placeholder="Dream build &#x2014; What's your dream vehicle?" style={{ width: '100%', padding: '10px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', display: 'block', marginBottom: 18 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(5)} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>Skip</button>
                <button onClick={() => setStep(5)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>What&apos;s in my garage &#x2192;</button>
              </div>
            </>
          )}
        </div>
      </main>
      <WaltBar placeholder="Tell me about yourself..." />
      <NavBar />
    </div>
  )

  // ── STEP 2: WHAT'S IN YOUR GARAGE? ────────────────────────────────────────
  if (step === 5) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)', overflowX: 'hidden' }}>
      <AppHeader />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', overflowX: 'hidden', width: '100%' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>{isAddingFromGarage ? 'Add a Vehicle' : 'What\u2019s in your garage?'}</p>
          {!isAddingFromGarage && <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 14 }}>Step 2 of 3</p>}

          {!isAddingFromGarage && <WaltMsg text={<>What are you working on? <strong>Let&apos;s add your first vehicle.</strong></>} />}

          {/* Vehicle list */}
          {vehicles.map((v, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '10px 14px', marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg)', border: '1px dashed var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🚗</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-blue)' }}>{v.year} {v.make} {v.model}</p>
                {v.nickname && <p style={{ fontSize: '0.7rem', color: 'var(--light-blue)' }}>&ldquo;{v.nickname}&rdquo;</p>}
              </div>
            </div>
          ))}

          {/* Add vehicle form */}
          {addingVehicle && isAddingFromGarage ? (
            // Single clean form for adding from garage
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, background: 'white', border: '2px solid #e8750a', borderRadius: 14, padding: '12px 14px' }}>
                <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--dark-blue)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>&ldquo;The more I know, the more I can help.&rdquo;</p>
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                {(['Year *|year|text|e.g. 1968','Make *|make|text|e.g. Ford','Model *|model|text|e.g. F-250','Nickname|nickname|text|e.g. Betty Lou','Color|color|text|e.g. Oxford White','Engine|engine|text|e.g. 390 FE V8','Transmission|transmission|text|e.g. 4-speed manual'] as const).map(f => { const [label,field,type,ph] = f.split('|'); return (
                  <div key={field} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</label>
                    <input type={type} placeholder={ph} value={(newVehicle as Record<string,string>)[field]} onChange={e => setNewVehicle(p => ({...p, [field]: e.target.value}))}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>
                )})}
                {[['Drivetrain','drivetrain',['2WD','4WD','AWD']],['Fuel Type','fuel_type',['Gas','Diesel','Electric','Hybrid']],['Condition','condition',['Daily driver','Weekend car','Project (non-running)','Stored']],['Title Status','title_status',['Clean','Salvage','Rebuilt']]].map(([label,field,opts]) => (
                  <div key={field as string} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</label>
                    <select value={(newVehicle as Record<string,string>)[field as string]} onChange={e => setNewVehicle(p => ({...p, [field as string]: e.target.value}))}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }}>
                      <option value="">Select...</option>
                      {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mileage</label>
                  <input type="number" placeholder="e.g. 87000" value={newVehicle.mileage} onChange={e => setNewVehicle(p => ({...p, mileage: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</label>
                  <textarea placeholder="Anything Walt should know — mods, issues, history..." value={newVehicle.notes} onChange={e => setNewVehicle(p => ({...p, notes: e.target.value}))} rows={3}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const }} />
                </div>
              </div>
              <button onClick={addAndFinish} disabled={saving || !newVehicle.year || !newVehicle.make || !newVehicle.model}
                style={{ width: '100%', padding: '14px', background: newVehicle.year && newVehicle.make && newVehicle.model ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: newVehicle.year && newVehicle.make && newVehicle.model ? 'pointer' : 'not-allowed', boxShadow: newVehicle.year && newVehicle.make && newVehicle.model ? '0 6px 20px rgba(232,117,10,0.3)' : 'none' }}>
                {saving ? 'Adding...' : 'Add Vehicle →'}
              </button>
            </div>
          ) : addingVehicle ? (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {/* Walt tip */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, background: 'var(--bg)', border: '2px solid #e8750a', borderRadius: 14, padding: '12px 14px' }}>
                <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--dark-blue)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>&ldquo;The more I know, the more I can help.&rdquo;</p>
              </div>
              {[['Year *','year','text','e.g. 1968'],['Make *','make','text','e.g. Ford'],['Model *','model','text','e.g. F-250'],['Nickname','nickname','text','e.g. Betty Lou'],['Color','color','text','e.g. Oxford White'],['Engine','engine','text','e.g. 390 FE V8'],['Transmission','transmission','text','e.g. 4-speed manual']].map(([label,field,type,ph]) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
                  <input type={type} placeholder={ph} value={(newVehicle as Record<string,string>)[field]} onChange={e => setNewVehicle(p => ({...p, [field]: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }} />
                </div>
              ))}
              {[['Drivetrain','drivetrain',['2WD','4WD','AWD']],['Fuel Type','fuel_type',['Gas','Diesel','Electric','Hybrid']],['Condition','condition',['Daily driver','Weekend car','Project (non-running)','Stored']],['Title Status','title_status',['Clean','Salvage','Rebuilt']]].map(([label,field,opts]) => (
                <div key={field as string} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
                  <select value={(newVehicle as Record<string,string>)[field as string]} onChange={e => setNewVehicle(p => ({...p, [field as string]: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }}>
                    <option value="">Select...</option>
                    {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>Mileage</label>
                <input type="number" placeholder="e.g. 87000" value={newVehicle.mileage} onChange={e => setNewVehicle(p => ({...p, mileage: e.target.value}))}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>Notes</label>
                <textarea placeholder="Anything Walt should know — mods, issues, history..." value={newVehicle.notes} onChange={e => setNewVehicle(p => ({...p, notes: e.target.value}))} rows={3}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => { setAddingVehicle(false); setShowMoreDetails(false); setColorBlurred(false) }} style={{ flex: 1, padding: '10px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-text)', cursor: 'pointer', fontFamily: 'var(--font-nunito)' }}>Cancel</button>
                {isAddingFromGarage ? (
                  <button onClick={addAndFinish} disabled={saving} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 4px 14px rgba(232,117,10,0.25)', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Add Vehicle \u2192'}</button>
                ) : (
                  <button onClick={addVehicle} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 4px 14px rgba(232,117,10,0.25)', cursor: 'pointer' }}>Add vehicle &#x2192;</button>
                )}
              </div>
            </div>
          ) : !isAddingFromGarage ? (
            <div onClick={() => setAddingVehicle(true)} style={{ background: 'white', border: '2px dashed var(--light-blue)', borderRadius: 14, padding: '16px', marginBottom: 12, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🚗</div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--light-blue)', marginBottom: 4 }}>
                {vehicles.length === 0 ? '+ Add your first vehicle' : '+ Add another vehicle'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>Year &middot; Make &middot; Model &middot; Nickname</p>
            </div>
          ) : null}

          {!isAddingFromGarage && <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', textAlign: 'center', marginBottom: 16 }}>You can always add more vehicles later from My Garage.</p>}

          {isAddingFromGarage && vehicleSaved && !addingVehicle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => saveToSupabaseAndRedirect('garage')} disabled={saving}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Back to My Garage →'}
              </button>
              <button onClick={() => { setVehicleSaved(false); setAddingVehicle(true) }}
                style={{ width: '100%', padding: '14px', background: 'white', border: '2px solid var(--dark-blue)', borderRadius: 25, color: 'var(--dark-blue)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                + Add Another Vehicle
              </button>
            </div>
          )}
          {!isAddingFromGarage && vehicleSaved && !addingVehicle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => saveToSupabaseAndRedirect('workspace')} disabled={saving}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Set Up My Workspace →'}
              </button>
              <button onClick={() => { setVehicleSaved(false); setAddingVehicle(true) }}
                style={{ width: '100%', padding: '14px', background: 'white', border: '2px solid var(--dark-blue)', borderRadius: 25, color: 'var(--dark-blue)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                + Add Another Vehicle
              </button>
            </div>
          )}
          {!isAddingFromGarage && !vehicleSaved && !addingVehicle && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(6)} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>Skip</button>
              <button onClick={() => setStep(6)} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>Set up my workspace →</button>
            </div>
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
      <AppHeader />
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', overflowX: 'hidden', width: '100%' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 2 }}>Your Setup</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', marginBottom: 14 }}>Step 3 of 3</p>

          <WaltMsg text="Almost done. What tools do you have? I'll factor this into your build plans." />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {toolOptions.map(tool => (
              <div key={tool} onClick={() => toggleTool(tool)}
                style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${selectedTools.includes(tool) ? 'var(--dark-blue)' : 'var(--border)'}`, background: selectedTools.includes(tool) ? 'var(--dark-blue)' : 'white', color: selectedTools.includes(tool) ? 'white' : 'var(--dark-blue)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                {tool}
              </div>
            ))}
          </div>

          {!toolsDone && (
            <button onClick={() => setToolsDone(true)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>Done →</button>
          )}

          {toolsDone && (
            <>
              <WaltMsg text={<>Perfect. I&apos;ve got everything I need, {name}. Let&apos;s build something great.</>} />

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleFinish} disabled={saving} style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>Skip</button>
                <button onClick={handleFinish} disabled={saving} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #e8750a, #f4a543)', borderRadius: 25, border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', cursor: 'pointer' }}>
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
