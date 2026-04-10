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
  cover_photo_url: string | null
}

const getVehiclePhoto = (vehicle: Vehicle): string => {
  const model = vehicle.model?.toLowerCase() || ''
  if (model.includes('ranger')) return '/photos/ranger-2025.jpg'
  if (model.includes('f250') || model.includes('f-250')) return '/photos/f250-hiboy-68.jpg'
  return '/photos/f250-hiboy-68.jpg'
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

const FieldRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-nunito)' }}>{label}</div>
    <div style={{ fontSize: '0.95rem', color: value ? 'var(--dark-blue)' : 'var(--secondary-text)', fontWeight: value ? 600 : 400, fontStyle: value ? 'normal' : 'italic', marginTop: 2 }}>
      {value ?? '—'}
    </div>
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 16,
  color: 'var(--dark-blue)',
  fontFamily: 'var(--font-nunito)',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
}

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Edit form state
  const [form, setForm] = useState({
    nickname: '',
    color: '',
    engine: '',
    transmission: '',
    drivetrain: '',
    fuel_type: '',
    mileage: '',
    condition: '',
    title_status: '',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      if (!id) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('vehicles')
        .select('id, nickname, year, make, model, color, engine, fuel_type, transmission, drivetrain, mileage, condition, title_status, notes, is_primary, cover_photo_url')
        .eq('id', id)
        .single()

      if (!data) { window.location.href = '/garage'; return }

      // Verify ownership
      const { data: owned } = await supabase
        .from('vehicles')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!owned) { window.location.href = '/garage'; return }

      setVehicle(data)
      setForm({
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

  const handleSave = async () => {
    if (!vehicle) return
    setSaving(true)
    await supabase.from('vehicles').update({
      nickname: form.nickname || null,
      color: form.color || null,
      engine: form.engine || null,
      transmission: form.transmission || null,
      drivetrain: form.drivetrain || null,
      fuel_type: form.fuel_type || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      condition: form.condition || null,
      title_status: form.title_status || null,
      notes: form.notes || null,
    }).eq('id', vehicle.id)

    // Refresh vehicle data
    const { data } = await supabase
      .from('vehicles')
      .select('id, nickname, year, make, model, color, engine, fuel_type, transmission, drivetrain, mileage, condition, title_status, notes, is_primary, cover_photo_url')
      .eq('id', vehicle.id)
      .single()

    if (data) setVehicle(data)
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

  const displayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`

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

      {/* Saved toast */}
      {saved && (
        <div style={{ background: '#22c55e', color: 'white', textAlign: 'center', padding: '8px', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
          Saved!
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Hero photo */}
          <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 12, boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
            <img
              src={getVehiclePhoto(vehicle)}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 16px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '1.15rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{displayName}</p>
            </div>
          </div>

          {/* Detail card */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(36,80,122,0.08)', marginBottom: 16 }}>

            {editing ? (
              // ── EDIT MODE ──────────────────────────────────────────────────
              <>
                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Nickname</p>
                <input
                  style={{ ...inputStyle, marginBottom: 16 }}
                  value={form.nickname}
                  onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                  placeholder="e.g. Big Blue"
                />

                {/* Year / Make / Model — read only */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Year / Make / Model</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--dark-blue)', fontWeight: 600 }}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
                </div>

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Color</p>
                <input
                  style={{ ...inputStyle, marginBottom: 16 }}
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  placeholder="e.g. Oxford White"
                />

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Engine</p>
                <input
                  style={{ ...inputStyle, marginBottom: 16 }}
                  value={form.engine}
                  onChange={e => setForm(f => ({ ...f, engine: e.target.value }))}
                  placeholder="e.g. 6.7L Power Stroke"
                />

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Transmission</p>
                <input
                  style={{ ...inputStyle, marginBottom: 16 }}
                  value={form.transmission}
                  onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))}
                  placeholder="e.g. 6-speed auto"
                />

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Drivetrain</p>
                <select
                  style={{ ...selectStyle, marginBottom: 16 }}
                  value={form.drivetrain}
                  onChange={e => setForm(f => ({ ...f, drivetrain: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option>2WD</option>
                  <option>4WD</option>
                  <option>AWD</option>
                </select>

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Fuel Type</p>
                <select
                  style={{ ...selectStyle, marginBottom: 16 }}
                  value={form.fuel_type}
                  onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option>Gas</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mileage</p>
                <input
                  style={{ ...inputStyle, marginBottom: 16 }}
                  value={form.mileage}
                  onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))}
                  placeholder="e.g. 85000"
                  inputMode="numeric"
                />

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Condition</p>
                <select
                  style={{ ...selectStyle, marginBottom: 16 }}
                  value={form.condition}
                  onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option>Daily driver</option>
                  <option>Weekend car</option>
                  <option>Project non-running</option>
                  <option>Stored</option>
                </select>

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Title Status</p>
                <select
                  style={{ ...selectStyle, marginBottom: 16 }}
                  value={form.title_status}
                  onChange={e => setForm(f => ({ ...f, title_status: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option>Clean</option>
                  <option>Salvage</option>
                  <option>Rebuilt</option>
                </select>

                <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</p>
                <textarea
                  style={{ ...inputStyle, marginBottom: 16, minHeight: 80, resize: 'vertical' }}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Anything else worth knowing..."
                />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setEditing(false)}
                    style={{ flex: 1, background: 'white', border: '1.5px solid var(--border)', borderRadius: 50, padding: '12px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--dark-blue)', cursor: 'pointer', fontFamily: 'var(--font-nunito)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #e8750a, #f4a543)', border: 'none', borderRadius: 50, padding: '12px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'white', cursor: saving ? 'default' : 'pointer', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', fontFamily: 'var(--font-nunito)', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes →'}
                  </button>
                </div>
              </>
            ) : (
              // ── VIEW MODE ──────────────────────────────────────────────────
              <>
                <FieldRow label="Nickname" value={vehicle.nickname} />
                <FieldRow label="Year / Make / Model" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
                <FieldRow label="Color" value={vehicle.color} />
                <FieldRow label="Engine" value={vehicle.engine} />
                <FieldRow label="Transmission" value={vehicle.transmission} />
                <FieldRow label="Drivetrain" value={vehicle.drivetrain} />
                <FieldRow label="Fuel Type" value={vehicle.fuel_type} />
                <FieldRow label="Mileage" value={vehicle.mileage != null ? vehicle.mileage.toLocaleString() + ' mi' : null} />
                <FieldRow label="Condition" value={vehicle.condition} />
                <FieldRow label="Title Status" value={vehicle.title_status} />
                <FieldRow label="Notes" value={vehicle.notes} />

                <button
                  onClick={() => setEditing(true)}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #e8750a, #f4a543)', border: 'none', borderRadius: 50, padding: '14px 16px', fontSize: '0.95rem', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 6px 20px rgba(232,117,10,0.3)', fontFamily: 'var(--font-nunito)', marginTop: 4 }}
                >
                  Edit Vehicle →
                </button>
              </>
            )}
          </div>

        </div>
      </main>

      <WaltBar nickname={displayName} />
      <NavBar />
    </div>
  )
}
