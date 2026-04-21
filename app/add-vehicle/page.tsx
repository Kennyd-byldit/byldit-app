'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

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

export default function AddVehiclePage() {
  const [vehicle, setVehicle] = useState({
    year: '', make: '', model: '', nickname: '', color: '',
    engine: '', transmission: '', drivetrain: '', fuel_type: '',
    mileage: '', condition: '', title_status: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [fromCreateProject, setFromCreateProject] = useState(false)
  const [isDream, setIsDream] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'create-project') setFromCreateProject(true)
    if (params.get('type') === 'dream') setIsDream(true)
  }, [])
  const [error, setError] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (file: File) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const tempId = Date.now().toString()
      const filePath = `${user.id}/new-${tempId}.${ext}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file, { upsert: true })
      if (uploadError) { console.error('Upload error:', uploadError); return }
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
      setPhotoUrl(data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  const update = (field: string, value: string) =>
    setVehicle(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!vehicle.year || !vehicle.make || !vehicle.model) {
      setError('Year, Make, and Model are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data: existing } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      const isFirst = !existing || existing.length === 0

      const { error: insertError } = await supabase.from('vehicles').insert({
        user_id: user.id,
        year: parseInt(vehicle.year),
        make: vehicle.make,
        model: vehicle.model,
        nickname: vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        color: vehicle.color || null,
        engine: vehicle.engine || null,
        transmission: vehicle.transmission || null,
        drivetrain: vehicle.drivetrain || null,
        fuel_type: vehicle.fuel_type || null,
        mileage: vehicle.mileage ? parseInt(vehicle.mileage) : null,
        condition: vehicle.condition || null,
        title_status: vehicle.title_status || null,
        notes: vehicle.notes || null,
        is_primary: isFirst,
        cover_photo_url: photoUrl || null,
        type: 'build',
      })

      if (insertError) {
        setError('Something went wrong. Try again.')
        setSaving(false)
        return
      }

      if (fromCreateProject) {
        // Pass the new vehicle id to create-project goal screen
        const { data: newVehicles } = await supabase.from('vehicles').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        const newId = newVehicles?.[0]?.id
        window.location.replace(newId ? `/create-project/goal?vehicle=${newId}` : '/create-project')
      } else {
        window.location.replace('/garage')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'var(--bg)',
    border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16,
    fontFamily: 'var(--font-nunito)', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.7rem', color: 'var(--secondary-text)',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      {/* Status bar */}
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      {/* Header */}
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.replace('/garage')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>← Back</button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 48 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 16 }}>Add a Vehicle</p>

          {/* Walt tip */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, background: 'var(--dark-blue)', borderRadius: 14, padding: '12px 14px' }}>
            <img src={WALT} alt="Walt" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e8750a', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'white', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>&ldquo;The more I know, the more I can help.&rdquo;</p>
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>}

          {/* Photo upload */}
          <label style={{ display: 'block', cursor: 'pointer', marginBottom: 16 }}>
            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
            <div style={{ height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative', background: 'var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: '2rem' }}>📷</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', fontWeight: 700 }}>{uploading ? 'Uploading...' : 'Add a photo'}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>Tap to take or choose a photo</span>
                </div>
              )}
              {photoUrl && (
                <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '5px 12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>📷 Change</span>
                </div>
              )}
            </div>
          </label>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            {/* Required fields */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Year *</label>
              <input type="text" placeholder="e.g. 1968" value={vehicle.year} onChange={e => update('year', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Make *</label>
              <input type="text" placeholder="e.g. Ford" value={vehicle.make} onChange={e => update('make', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Model *</label>
              <input type="text" placeholder="e.g. F-250" value={vehicle.model} onChange={e => update('model', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nickname</label>
              <input type="text" placeholder='e.g. "Betty Lou"' value={vehicle.nickname} onChange={e => update('nickname', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Color</label>
              <input type="text" placeholder="e.g. Oxford White" value={vehicle.color} onChange={e => update('color', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Engine</label>
              <input type="text" placeholder="e.g. 390 FE V8, 5.0 Coyote swap" value={vehicle.engine} onChange={e => update('engine', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Transmission</label>
              <input type="text" placeholder="e.g. 4-speed manual" value={vehicle.transmission} onChange={e => update('transmission', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Drivetrain</label>
              <select value={vehicle.drivetrain} onChange={e => update('drivetrain', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="2WD">2WD</option>
                <option value="4WD">4WD</option>
                <option value="AWD">AWD</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Fuel Type</label>
              <select value={vehicle.fuel_type} onChange={e => update('fuel_type', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Gas">Gas</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mileage</label>
              <input type="number" placeholder="e.g. 87000" value={vehicle.mileage} onChange={e => update('mileage', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Condition</label>
              <select value={vehicle.condition} onChange={e => update('condition', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Daily driver">Daily driver</option>
                <option value="Weekend car">Weekend car</option>
                <option value="Project (non-running)">Project (non-running)</option>
                <option value="Stored">Stored</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title Status</label>
              <select value={vehicle.title_status} onChange={e => update('title_status', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="Clean">Clean</option>
                <option value="Salvage">Salvage</option>
                <option value="Rebuilt">Rebuilt</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea placeholder="Anything Walt should know — mods, issues, history..." value={vehicle.notes} onChange={e => update('notes', e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !vehicle.year || !vehicle.make || !vehicle.model}
            style={{
              width: '100%', padding: '14px',
              background: vehicle.year && vehicle.make && vehicle.model ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              borderRadius: 25, border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700,
              fontFamily: 'var(--font-nunito)', cursor: vehicle.year && vehicle.make && vehicle.model ? 'pointer' : 'not-allowed',
              boxShadow: vehicle.year && vehicle.make && vehicle.model ? '0 6px 20px rgba(232,117,10,0.3)' : 'none'
            }}>
            {saving ? 'Saving...' : fromCreateProject ? 'Add to garage & start my build →' : 'Add to My Garage →'}
          </button>
        </div>
      </main>

      {/* Walt bar */}
      <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>Ask me about your garage...</div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0, cursor: 'pointer' }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  )
}
