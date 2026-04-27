'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const WALT = 'https://bvhdfoemvsrosmlslfro.supabase.co/storage/v1/object/public/Assets/walt-v1.png'

const YEARS = Array.from({ length: 2026 - 1899 }, (_, i) => 2026 - i) // 2026 down to 1900

const COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Dark Blue', 'Navy',
  'Green', 'Brown', 'Beige', 'Gold', 'Orange', 'Yellow', 'Maroon',
  'Bronze', 'Copper', 'Purple', 'Other'
]

const ENGINES = [
  '4-Cylinder', 'Straight-6', 'V6', 'V8', 'V10', 'V12',
  'Electric', 'Hybrid', 'Diesel', 'Other / Custom'
]

const TRANSMISSIONS = [
  'Automatic', 'Manual', 'CVT', 'Dual-Clutch (DCT)', 'Semi-Auto', 'Other / Custom'
]

const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD']

const STATUSES = ['Daily Driver', 'Weekend Car', 'Project Build', 'In Storage']

const NavBar = () => (
  <nav style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '6px 0 4px', flexShrink: 0 }}>
    <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
      {[{ icon: '🏠', label: 'Garage', active: true }, { icon: '🔧', label: 'Projects', active: false }, { icon: '🔩', label: 'Parts', active: false }, { icon: '📋', label: "Walt's Notes", active: false }].map(item => (
        <div key={item.label} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => { if (item.label === 'Garage') window.location.href = '/garage' }}>
          <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
          <div style={{ fontSize: '0.55rem', fontWeight: item.active ? 700 : 400, color: item.active ? 'var(--orange)' : 'var(--secondary-text)', fontFamily: 'var(--font-nunito)' }}>{item.label}</div>
        </div>
      ))}
    </div>
  </nav>
)

export default function AddVehiclePage() {
  const [fromCreateProject, setFromCreateProject] = useState(false)
  const [isDream, setIsDream] = useState(false)

  // Form state
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [nickname, setNickname] = useState('')
  const [engine, setEngine] = useState('')
  const [transmission, setTransmission] = useState('')
  const [drivetrain, setDrivetrain] = useState('')
  const [status, setStatus] = useState('')
  const [mileage, setMileage] = useState('')
  const [notes, setNotes] = useState('')

  // API data
  const [makes, setMakes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)

  // Photo
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'create-project') setFromCreateProject(true)
    if (params.get('type') === 'dream') setIsDream(true)
  }, [])

  // Load makes when year selected
  useEffect(() => {
    if (!year) { setMakes([]); setMake(''); setModels([]); setModel(''); return }
    setLoadingMakes(true)
    setMake('')
    setModels([])
    setModel('')
    fetch(`/api/vehicle-data?type=makes&year=${year}`)
      .then(r => r.json())
      .then(d => { setMakes(d.makes || []); setLoadingMakes(false) })
      .catch(() => setLoadingMakes(false))
  }, [year])

  // Load models when make selected
  useEffect(() => {
    if (!year || !make) { setModels([]); setModel(''); return }
    setLoadingModels(true)
    setModel('')
    fetch(`/api/vehicle-data?type=models&year=${year}&make=${encodeURIComponent(make)}`)
      .then(r => r.json())
      .then(d => { setModels(d.models || []); setLoadingModels(false) })
      .catch(() => setLoadingModels(false))
  }, [make])

  // No auto-photo — user uploads their own
  // photoUrl stays empty until user taps to upload
  useEffect(() => {
    if (!year && !make && !model) setPhotoUrl('')
  }, [year, make, model])

  const handlePhotoUpload = async (file: File) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/custom-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file, { upsert: true })
      if (uploadError) return
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
      setPhotoUrl(data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  const canSave = year && make && model && color && nickname && status

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.replace('/login'); return }

      const { data: existing } = await supabase.from('vehicles').select('id').eq('user_id', user.id).limit(1)
      const isFirst = !existing || existing.length === 0

      const { error: insertError } = await supabase.from('vehicles').insert({
        user_id: user.id,
        year: parseInt(year),
        make, model,
        nickname,
        color: color || null,
        engine: engine || null,
        transmission: transmission || null,
        drivetrain: drivetrain || null,
        mileage: mileage ? parseInt(mileage) : null,
        condition: status || null,
        notes: notes || null,
        cover_photo_url: photoUrl || null,
        is_primary: isFirst,
        type: isDream ? 'dream' : 'build',
      })

      if (insertError) { setError('Something went wrong. Try again.'); setSaving(false); return }

      if (fromCreateProject) {
        const { data: newVehicle } = await supabase.from('vehicles').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        window.location.replace(newVehicle?.[0]?.id ? `/create-project/goal?vehicle=${newVehicle[0].id}` : '/create-project')
      } else {
        window.location.replace('/garage')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'white',
    border: '1.5px solid var(--border)', borderRadius: 12, fontSize: 16,
    fontFamily: 'var(--font-nunito)', outline: 'none', color: 'var(--dark-blue)',
    appearance: 'none', WebkitAppearance: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    color: 'var(--dark-blue)', marginBottom: 6
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ background: 'var(--bg)', padding: '6px 16px 4px', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)', fontWeight: 600 }}>10:12 AM</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--dark-blue)' }}>📶 🔋</span>
      </div>
      <header style={{ background: 'var(--dark-blue)', padding: '12px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => window.location.replace(fromCreateProject ? '/create-project' : '/garage')}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-nunito)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic', color: 'white' }}>
          BYLD<span style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, fontStyle: 'normal', color: 'var(--light-blue)' }}>it</span>
        </span>
        <div style={{ width: 48 }} />
      </header>

      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 18px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-blue)', marginBottom: 4 }}>
            {isDream ? 'Plan a Dream Build' : 'Add a Vehicle'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginBottom: 20 }}>
            Tell me about your ride
          </p>

          {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>}

          {/* SECTION 1: Identity */}
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 14 }}>Identity</p>

            {/* Year */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Year <span style={{ color: 'var(--orange)' }}>*</span></label>
              <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
                <option value="">Select year...</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Make */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Make <span style={{ color: 'var(--orange)' }}>*</span></label>
              <select value={make} onChange={e => setMake(e.target.value)} style={selectStyle} disabled={!year || loadingMakes}>
                <option value="">{loadingMakes ? 'Loading...' : year ? 'Select make...' : 'Select year first'}</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Model */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Model <span style={{ color: 'var(--orange)' }}>*</span></label>
              <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle} disabled={!make || loadingModels}>
                <option value="">{loadingModels ? 'Loading...' : make ? 'Select model...' : 'Select make first'}</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Color <span style={{ color: 'var(--orange)' }}>*</span></label>
              <select value={color} onChange={e => setColor(e.target.value)} style={selectStyle}>
                <option value="">Select color...</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Nickname */}
            <div>
              <label style={labelStyle}>Nickname <span style={{ color: 'var(--orange)' }}>*</span></label>
              <input type="text" placeholder='e.g. "Betty Lou"' value={nickname} onChange={e => setNickname(e.target.value)}
                style={{ ...selectStyle, fontFamily: 'var(--font-nunito)' }} />
            </div>
          </div>

          {/* PHOTO — shows placeholder once year/make/model filled, replaces with real photo on upload */}
          {(year && make && model) && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...labelStyle, marginBottom: 8 }}>Photo</label>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
                <div style={{ height: 180, borderRadius: 14, overflow: 'hidden', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {photoUrl ? (
                    <>
                      <img src={photoUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '5px 12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>📷 Change</span>
                      </div>
                      {nickname && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 14px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))' }}>
                          <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{nickname}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--dark-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ fontSize: '2.5rem' }}>🚗</span>
                      <p style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>{year} {make} {model}</p>
                      {nickname && <p style={{ color: 'var(--light-blue)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>&ldquo;{nickname}&rdquo;</p>}
                      <div style={{ marginTop: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem' }}>📷</span>
                        <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>{uploading ? 'Uploading...' : 'Tap to add a photo'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* SECTION 2: Details */}
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 14 }}>Details</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Engine</label>
              <select value={engine} onChange={e => setEngine(e.target.value)} style={selectStyle}>
                <option value="">Select engine...</option>
                {ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              {engine === 'Other / Custom' && (
                <input type="text" placeholder="Describe your engine..." style={{ ...selectStyle, marginTop: 8 }}
                  onChange={e => setEngine(e.target.value)} />
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Transmission</label>
              <select value={transmission} onChange={e => setTransmission(e.target.value)} style={selectStyle}>
                <option value="">Select transmission...</option>
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {transmission === 'Other / Custom' && (
                <input type="text" placeholder="Describe your transmission..." style={{ ...selectStyle, marginTop: 8 }}
                  onChange={e => setTransmission(e.target.value)} />
              )}
            </div>

            <div>
              <label style={labelStyle}>Drivetrain</label>
              <select value={drivetrain} onChange={e => setDrivetrain(e.target.value)} style={selectStyle}>
                <option value="">Select drivetrain...</option>
                {DRIVETRAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* SECTION 3: About */}
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 14 }}>About This Vehicle</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Vehicle Status <span style={{ color: 'var(--orange)' }}>*</span></label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
                <option value="">Select status...</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mileage</label>
              <input type="number" placeholder="e.g. 87,000" value={mileage} onChange={e => setMileage(e.target.value)}
                style={{ ...selectStyle, fontFamily: 'var(--font-nunito)' }} />
            </div>

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea placeholder="Anything Walt should know — mods, issues, history..." value={notes}
                onChange={e => setNotes(e.target.value)} rows={3}
                style={{ ...selectStyle, resize: 'vertical' as const, lineHeight: '1.4' }} />
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={!canSave || saving}
            style={{
              width: '100%', padding: '14px',
              background: canSave ? 'linear-gradient(135deg, #e8750a, #f4a543)' : '#d4e0eb',
              borderRadius: 25, border: 'none', color: 'white',
              fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-nunito)',
              cursor: canSave ? 'pointer' : 'not-allowed',
              boxShadow: canSave ? '0 6px 20px rgba(232,117,10,0.3)' : 'none',
            }}>
            {saving ? 'Saving...' : fromCreateProject ? 'Add to garage & start my build →' : 'Add to My Garage →'}
          </button>

          <p style={{ fontSize: '0.7rem', color: 'var(--secondary-text)', textAlign: 'center', marginTop: 10 }}>
            * Required fields
          </p>
        </div>
      </main>

      {/* Walt bar */}
      <div style={{ background: 'white', padding: '8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 25, padding: '10px 16px', fontSize: '0.85rem', color: '#aaa', fontFamily: 'var(--font-nunito)' }}>
            Ask me about your vehicle...
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--orange)', flexShrink: 0 }}>
            <img src={WALT} alt="Walt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  )
}
