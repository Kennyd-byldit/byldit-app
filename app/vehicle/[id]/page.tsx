'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  color: string | null
  engine: string | null
  fuel_type: string | null
  transmission: string | null
  drivetrain: string | null
  mileage: number | null
  condition: string | null
  title_status: string | null
  notes: string | null
  is_primary: boolean
}

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }, { icon: '⋯', label: 'More', active: false }].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

const WaltBar = ({ nickname }: { nickname: string }) => (
  <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>
        Ask me about {nickname || 'this vehicle'}...
      </div>
      <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
        <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  </div>
)

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [tempValue, setTempValue] = useState('')

  useEffect(() => {
    async function load() {
      if (!id) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, color, engine, fuel_type, transmission, drivetrain, mileage, condition, title_status, notes, is_primary')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!data) { window.location.replace('/garage'); return }

      setVehicle(data)
      setFieldValues({
        nickname: data.nickname || '',
        color: data.color || '',
        engine: data.engine || '',
        transmission: data.transmission || '',
        drivetrain: data.drivetrain || '',
        fuel_type: data.fuel_type || '',
        mileage: data.mileage != null ? String(data.mileage) : '',
        condition: data.condition || '',
        title_status: data.title_status || '',
        notes: data.notes || '',
      })
      setLoading(false)
    }
    load()
  }, [id])

  function startEdit(field: string) {
    setTempValue(fieldValues[field] || '')
    setEditingField(field)
  }

  async function saveField(field: string) {
    const value = tempValue
    await supabase.from('vehicles').update({ [field]: value || null }).eq('id', vehicle!.id)
    setFieldValues(prev => ({ ...prev, [field]: value }))
    setEditingField(null)
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={WALT} alt="Walt" style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--orange)', marginBottom: 12 }} />
        <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', fontSize: '0.9rem' }}>Loading vehicle...</p>
      </div>
    </div>
  )

  if (!vehicle) return null

  const displayName = fieldValues.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const model = vehicle.model?.toLowerCase() || ''
  const photoSrc = model.includes('ranger') ? '/photos/ranger-2025.jpg' : '/photos/f250-hiboy-68.jpg'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 16,
    color: 'var(--dark-blue)',
    fontFamily: 'var(--font-nunito)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const saveCancelButtons = (field: string) => (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button onClick={() => saveField(field)} style={{ background: '#e8750a', color: 'white', border: 'none', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save</button>
      <button onClick={() => setEditingField(null)} style={{ background: '#d4e0eb', color: 'var(--dark-blue)', border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
    </div>
  )

  const editButton = (field: string) => (
    <button onClick={() => startEdit(field)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem', color: 'var(--secondary-text)', cursor: 'pointer', fontFamily: 'var(--font-nunito)', marginLeft: 12, flexShrink: 0 }}>Edit</button>
  )

  const fieldRow = (label: string, field: string, inputEl: React.ReactNode) => {
    const val = fieldValues[field]
    return (
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</p>
          {editingField === field ? (
            <div>
              {inputEl}
              {saveCancelButtons(field)}
            </div>
          ) : (
            <p style={{ fontSize: '0.95rem', color: val ? 'var(--dark-blue)' : 'var(--secondary-text)', fontWeight: val ? 600 : 400, fontStyle: val ? 'normal' : 'italic' }}>
              {val || 'Tap Edit to add'}
            </p>
          )}
        </div>
        {editingField !== field && editButton(field)}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>

      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:00 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>

      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => window.location.href = '/garage'}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1, position: 'absolute', left: 16 }}
          aria-label="Back to garage"
        >
          ←
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
            BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
          </span>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Hero photo */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <img
              src={photoSrc}
              alt={displayName}
              style={{ height: 180, width: '100%', objectFit: 'cover', objectPosition: 'center 35%', borderRadius: 16, display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 16px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', borderRadius: '0 0 16px 16px' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '1.15rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{displayName}</p>
            </div>
          </div>

          {/* Field card */}
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginTop: 12 }}>

            {/* Read-only: Vehicle */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>VEHICLE</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--dark-blue)', fontWeight: 600 }}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
            </div>

            {fieldRow('Nickname', 'nickname',
              <input style={inputStyle} value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus />
            )}

            {fieldRow('Color', 'color',
              <input style={inputStyle} value={tempValue} onChange={e => setTempValue(e.target.value)} autoFocus />
            )}

            {fieldRow('Engine', 'engine',
              <input style={inputStyle} value={tempValue} onChange={e => setTempValue(e.target.value)} placeholder="e.g. 390 FE V8, 5.0 Coyote swap" autoFocus />
            )}

            {fieldRow('Transmission', 'transmission',
              <input style={inputStyle} value={tempValue} onChange={e => setTempValue(e.target.value)} placeholder="e.g. 4-speed manual, 10-speed auto" autoFocus />
            )}

            {fieldRow('Drivetrain', 'drivetrain',
              <select style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }} value={tempValue} onChange={e => setTempValue(e.target.value)}>
                <option value="">Select...</option>
                <option>2WD</option>
                <option>4WD</option>
                <option>AWD</option>
              </select>
            )}

            {fieldRow('Fuel Type', 'fuel_type',
              <select style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }} value={tempValue} onChange={e => setTempValue(e.target.value)}>
                <option value="">Select...</option>
                <option>Gas</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            )}

            {fieldRow('Mileage', 'mileage',
              <input style={inputStyle} type="number" value={tempValue} onChange={e => setTempValue(e.target.value)} inputMode="numeric" autoFocus />
            )}

            {fieldRow('Condition', 'condition',
              <select style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }} value={tempValue} onChange={e => setTempValue(e.target.value)}>
                <option value="">Select...</option>
                <option>Daily driver</option>
                <option>Weekend car</option>
                <option>Project (non-running)</option>
                <option>Stored</option>
              </select>
            )}

            {fieldRow('Title Status', 'title_status',
              <select style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }} value={tempValue} onChange={e => setTempValue(e.target.value)}>
                <option value="">Select...</option>
                <option>Clean</option>
                <option>Salvage</option>
                <option>Rebuilt</option>
              </select>
            )}

            {fieldRow('Notes', 'notes',
              <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={tempValue} onChange={e => setTempValue(e.target.value)} rows={3} autoFocus />
            )}

          </div>

        </div>
      </main>

      <WaltBar nickname={displayName} />
      <NavBar />
    </div>
  )
}
