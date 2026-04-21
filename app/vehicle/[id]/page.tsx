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
  id: string; nickname: string | null; year: number; make: string; model: string
  color: string | null; engine: string | null; fuel_type: string | null
  transmission: string | null; drivetrain: string | null; mileage: number | null
  condition: string | null; title_status: string | null; notes: string | null; is_primary: boolean
}

const getVehiclePhoto = (v: Vehicle): string => {
  const model = v.model?.toLowerCase() || ''
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

export default function VehicleDetailPage() {
  const params = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }
      const { data } = await supabase.from('vehicles')
        .select('id, nickname, year, make, model, color, engine, fuel_type, transmission, drivetrain, mileage, condition, title_status, notes, is_primary, cover_photo_url')
        .eq('id', params.id as string).eq('user_id', user.id).single()
      if (!data) { window.location.replace('/garage'); return }
      setVehicle(data)
      setLoading(false)
    }
    load()
  }, [params.id])

  const startEdit = (field: string, current: string | number | null) => {
    setEditingField(field)
    setTempValue(current != null ? String(current) : '')
  }

  const saveField = async (field: string) => {
    if (!vehicle) return
    setSaving(true)
    const value = tempValue.trim() || null
    await supabase.from('vehicles').update({ [field]: value }).eq('id', vehicle.id)
    setVehicle(prev => prev ? { ...prev, [field]: field === 'mileage' && value ? parseInt(value) : value } as Vehicle : prev)
    setEditingField(null)
    setSaving(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  const uploadPhoto = async (file: File) => {
    if (!vehicle) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/${vehicle.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file, { upsert: true })
    if (uploadError) { console.error('Upload error:', uploadError); return }
    const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
    const publicUrl = data.publicUrl
    await supabase.from('vehicles').update({ cover_photo_url: publicUrl }).eq('id', vehicle.id)
    setVehicle(prev => prev ? { ...prev, cover_photo_url: publicUrl } as any : prev)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  const deleteVehicle = async () => {
    if (!vehicle) return
    await supabase.from('vehicles').delete().eq('id', vehicle.id)
    window.location.replace('/garage')
  }

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>Loading...</p>
    </div>
  )

  if (!vehicle) return null

  const fields: { label: string; field: string; type: 'text' | 'number' | 'select' | 'textarea'; placeholder?: string; opts?: string[] }[] = [
    { label: 'Year *', field: 'year', type: 'text', placeholder: 'e.g. 1968' },
    { label: 'Make *', field: 'make', type: 'text', placeholder: 'e.g. Ford' },
    { label: 'Model *', field: 'model', type: 'text', placeholder: 'e.g. F-250' },
    { label: 'Nickname', field: 'nickname', type: 'text', placeholder: 'e.g. "Betty Lou"' },
    { label: 'Color', field: 'color', type: 'text', placeholder: 'e.g. Oxford White' },
    { label: 'Engine', field: 'engine', type: 'text', placeholder: 'e.g. 390 FE V8, 5.0 Coyote swap' },
    { label: 'Transmission', field: 'transmission', type: 'text', placeholder: 'e.g. 4-speed manual, 10-speed auto' },
    { label: 'Mileage', field: 'mileage', type: 'number', placeholder: 'e.g. 87000' },
    { label: 'Drivetrain', field: 'drivetrain', type: 'select', opts: ['2WD', '4WD', 'AWD'] },
    { label: 'Fuel Type', field: 'fuel_type', type: 'select', opts: ['Gas', 'Diesel', 'Electric', 'Hybrid'] },
    { label: 'Condition', field: 'condition', type: 'select', opts: ['Daily driver', 'Weekend car', 'Project (non-running)', 'Stored'] },
    { label: 'Title Status', field: 'title_status', type: 'select', opts: ['Clean', 'Salvage', 'Rebuilt'] },
    { label: 'Notes', field: 'notes', type: 'textarea', placeholder: 'Anything Walt should know — mods, issues, history...' },
  ]

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--light-blue)', borderRadius: 10, fontSize: 16, fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:00 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.href = '/garage'} style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', padding: '0 4px', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>← Back</button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 32 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 14px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          <label style={{ display: 'block', cursor: 'pointer', marginBottom: 16 }}>
            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }} />
            <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 6px 20px rgba(36,80,122,0.12)' }}>
              <img src={(vehicle as any).cover_photo_url || getVehiclePhoto(vehicle)} alt={vehicle.nickname || vehicle.make}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </p>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8rem' }}>📷</span>
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>{(vehicle as any).cover_photo_url ? 'Change photo' : 'Add a photo'}</span>
              </div>
            </div>
          </label>

          {savedMsg && (
            <div style={{ background: '#4da8da', color: 'white', borderRadius: 10, padding: '8px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Saved ✓</div>
          )}

          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            {fields.map(({ label, field, type, placeholder, opts }) => {
              const currentVal = (vehicle as Record<string, unknown>)[field]
              const displayVal = currentVal != null && currentVal !== '' ? String(currentVal) : null
              const isEditing = editingField === field

              return (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>{label}</label>
                  {isEditing ? (
                    <div>
                      {type === 'select' && opts ? (
                        <select value={tempValue} onChange={e => setTempValue(e.target.value)} style={inputStyle}>
                          <option value="">Select...</option>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : type === 'textarea' ? (
                        <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows={3} placeholder={placeholder} style={{ ...inputStyle, resize: 'vertical' as const }} />
                      ) : (
                        <input type={type} value={tempValue} onChange={e => setTempValue(e.target.value)} placeholder={placeholder} style={inputStyle} autoFocus />
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => saveField(field)} disabled={saving}
                          style={{ background: '#e8750a', color: 'white', border: 'none', borderRadius: 20, padding: '5px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)' }}>
                          {saving ? '...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingField(null)}
                          style={{ background: '#d4e0eb', color: 'var(--dark-blue)', border: 'none', borderRadius: 20, padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-nunito)' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, padding: '10px 14px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '0.95rem', color: displayVal ? 'var(--dark-blue)' : '#aaa', fontStyle: displayVal ? 'normal' : 'italic', fontFamily: 'var(--font-nunito)', minHeight: 42, display: 'flex', alignItems: 'center' }}>
                        {displayVal || 'Tap Edit to add'}
                      </div>
                      <button onClick={() => startEdit(field, currentVal as string | number | null)}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: '0.75rem', color: 'var(--secondary-text)', cursor: 'pointer', fontFamily: 'var(--font-nunito)', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={() => window.location.href = '/garage'}
            style={{ width: '100%', padding: '14px', background: 'white', border: '2px solid var(--dark-blue)', borderRadius: 25, color: 'var(--dark-blue)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
            ← Back to My Garage
          </button>

          {/* Delete vehicle */}
          {!confirmDelete ? (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => setConfirmDelete(true)}
                style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-nunito)', textDecoration: 'underline' }}>
                Remove from Garage
              </button>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 14, padding: '16px', marginTop: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--dark-blue)', fontWeight: 700, marginBottom: 6 }}>Remove this vehicle?</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginBottom: 16 }}>Removing this vehicle will permanently delete all associated projects, build plans, parts, expenses, and notes. This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ flex: 1, padding: '12px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary-text)', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={deleteVehicle}
                  style={{ flex: 1, padding: '12px', background: '#e74c3c', border: 'none', borderRadius: 25, fontSize: '0.9rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-nunito)', cursor: 'pointer' }}>
                  Yes, Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>
            Ask me about {vehicle.nickname || `${vehicle.year} ${vehicle.make}`}...
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  )
}
