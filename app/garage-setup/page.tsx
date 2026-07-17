'use client'

import { useEffect, useState } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { supabase } from '@/lib/supabase'
import './garage-setup-prototype.css'

type StepId = 'identity' | 'details'

type GarageForm = {
  year: string
  make: string
  model: string
  trim: string
  vin: string
  nickname: string
  color: string
  engine: string
  transmission: string
  drivetrain: string
  fuelType: string
  mileage: string
  condition: string
  titleStatus: string
  notes: string
  primaryVehicle: boolean
}

type GarageVehicle = {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  vin?: string | null
  color?: string | null
  engine?: string | null
  transmission?: string | null
  drivetrain?: string | null
  fuel_type?: string | null
  mileage?: number | null
  condition?: string | null
  title_status?: string | null
  notes?: string | null
  nickname: string
  cover_photo_url: string | null
  is_primary: boolean | null
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index))

const steps: Array<{ id: StepId; title: string; hint: string }> = [
  { id: 'identity', title: 'Vehicle Identity', hint: 'VIN, year, make, model, trim, nickname, and color' },
  { id: 'details', title: 'Vehicle Details', hint: 'Mechanical setup, condition, photo, and notes' },
]

const initialForm: GarageForm = {
  year: '',
  make: '',
  model: '',
  trim: '',
  vin: '',
  nickname: '',
  color: '',
  engine: '',
  transmission: '',
  drivetrain: '',
  fuelType: '',
  mileage: '',
  condition: '',
  titleStatus: '',
  notes: '',
  primaryVehicle: false,
}

const makeOptions = [
  'Ford',
  'Chevrolet',
  'GMC',
  'Dodge',
  'Ram',
  'Jeep',
  'Toyota',
  'Nissan',
  'Honda',
  'Harley-Davidson',
  'Indian',
  'BMW',
  'Mercedes-Benz',
  'Porsche',
]

const modelOptions = [
  'F-250',
  'F-150',
  'Ranger',
  'Bronco',
  'Mustang',
  'Camaro',
  'C10',
  'Silverado',
  'Wrangler',
  'Tacoma',
  '4Runner',
  'Altima',
]

const trimOptions = [
  'Base',
  'XL',
  'XLT',
  'Lariat',
  'Raptor',
  'Highboy',
  'Z71',
  'LT',
  'RS',
  'Rubicon',
  'Sport',
  'Custom / swapped',
]

const colorOptions = [
  'White',
  'Black',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Orange',
  'Yellow',
  'Brown',
  'Primer',
  'Patina',
  'Custom color',
]

const engineOptions = [
  'Inline-4',
  'Straight-6',
  'V6',
  'V8',
  'Diesel',
  'Hybrid',
  'Electric',
  'Small block swap',
  'Big block swap',
  'Coyote swap',
  'LS swap',
  'Other custom engine',
]

const transmissionOptions = [
  'Automatic',
  'Manual',
  'CVT',
  'Dual-clutch',
  '3-speed automatic',
  '4-speed manual',
  '5-speed manual',
  '6-speed manual',
  '10-speed automatic',
  'Other custom transmission',
]

const drivetrainOptions = [
  'FWD',
  'RWD',
  'AWD',
  '4WD',
  'Part-time 4WD',
  'Solid axle swap',
  'Custom drivetrain',
]

const fuelOptions = [
  'Gasoline',
  'Diesel',
  'Hybrid',
  'Electric',
  'E85',
  'Propane',
  'Race fuel',
  'Custom fuel setup',
]

const conditionOptions = [
  'Daily driver',
  'Weekend driver',
  'Running project',
  'Non-running project',
  'Mid-build',
  'Stored',
  'Parts vehicle',
  'Fresh purchase',
]

const titleOptions = [
  'Clean',
  'Salvage',
  'Rebuilt',
  'Bonded',
  'No title',
  'Unknown',
]

function BYLDitLogo() {
  return (
    <span className="garageLogo" aria-label="BYLDit">
      <span className="garageLogoByld">BYLD</span>
      <span className="garageLogoIt">it</span>
    </span>
  )
}

function BYLDitWord() {
  return (
    <span className="garageBrandWord" aria-label="BYLDit">
      <span className="garageBrandWordByld">BYLD</span>
      <span className="garageBrandWordIt">it</span>
    </span>
  )
}

function SuggestedInput({
  id,
  label,
  list,
  note,
  onChange,
  required = false,
  span = false,
  type = 'text',
  value,
}: {
  id: keyof GarageForm
  label: string
  list?: string
  note?: string
  onChange: (field: keyof GarageForm, value: string) => void
  required?: boolean
  span?: boolean
  type?: string
  value: string
}) {
  return (
    <div className={span ? 'garageField full' : 'garageField'}>
      <label htmlFor={id}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={id}
        list={list}
        onChange={event => onChange(id, event.target.value)}
        placeholder=""
        type={type}
        value={value}
      />
      {note && <span className="garageFieldHelp">{note}</span>}
    </div>
  )
}

function BYLDitDataList({ id, options }: { id: string; options: string[] }) {
  return (
    <datalist id={id}>
      {options.map(option => (
        <option key={option} value={option} />
      ))}
    </datalist>
  )
}

function GaragePickerField({
  id,
  label,
  note,
  onChange,
  openPicker,
  options,
  required = false,
  setOpenPicker,
  span = false,
  value,
}: {
  id: keyof GarageForm
  label: string
  note?: string
  onChange: (field: keyof GarageForm, value: string) => void
  openPicker: string | null
  options: string[]
  required?: boolean
  setOpenPicker: (id: string | null) => void
  span?: boolean
  value: string
}) {
  const open = openPicker === id

  const chooseOption = (option: string) => {
    onChange(id, option)
    setOpenPicker(null)
  }

  return (
    <div className={span ? 'garageField full' : 'garageField'}>
      <label htmlFor={id}>
        {label} {required && <span className="required">*</span>}
      </label>
      <div className={open ? 'garageCombo open' : 'garageCombo'}>
        <input
          id={id}
          onChange={event => onChange(id, event.target.value)}
          onFocus={() => setOpenPicker(id)}
          placeholder="Type or choose"
          type="text"
          value={value}
        />
        <button
          aria-label={`Choose ${label}`}
          onClick={() => setOpenPicker(open ? null : id)}
          type="button"
        >
          <span aria-hidden="true" />
        </button>
        {open && (
          <div className="garageComboMenu">
            {options.map(option => (
              <button
                className={value === option ? 'selected' : ''}
                key={option}
                onClick={() => chooseOption(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {note && <span className="garageFieldHelp">{note}</span>}
    </div>
  )
}

export default function GarageSetupPrototype() {
  const [activeStep, setActiveStep] = useState<StepId>('identity')
  const [form, setForm] = useState<GarageForm>(initialForm)
  const [savedVehicles, setSavedVehicles] = useState<GarageVehicle[]>([])
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [openPicker, setOpenPicker] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeIndex = steps.findIndex(step => step.id === activeStep)
  const currentStep = steps[activeIndex]
  const vehicleName = form.nickname.trim() || [form.year, form.make, form.model].filter(Boolean).join(' ') || 'Your vehicle'
  const vehicleSummary = [form.year, form.make, form.model, form.trim].filter(Boolean).join(' ')
  const mechanicalSummary = [form.engine, form.transmission, form.drivetrain].filter(Boolean).join(' / ')
  const hasSavedVehicles = savedVehicles.length > 0
  const isEditingVehicle = Boolean(editingVehicleId)

  const updateField = (field: keyof GarageForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
    setError('')
  }

  const goToPreviousPage = () => {
    window.location.href = isEditingVehicle ? '/garage' : '/profile-setup'
  }

  const goNext = () => {
    setOpenPicker(null)
    if (activeStep === 'identity') {
      if (!form.year || !form.make.trim() || !form.model.trim() || !form.nickname.trim()) {
        setError('Year, make, model, and vehicle nickname are required.')
        return
      }
      setActiveStep('details')
    }
  }

  const goBack = () => {
    setOpenPicker(null)
    if (activeStep === 'details') setActiveStep('identity')
  }

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) window.location.replace('/login?mode=signup')

      if (user) {
        const { data } = await supabase
          .from('vehicles')
          .select('id, year, make, model, trim, nickname, cover_photo_url, is_primary')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        setSavedVehicles((data || []) as GarageVehicle[])

        const vehicleToEdit = new URLSearchParams(window.location.search).get('edit')
        if (vehicleToEdit) {
          const { data: editVehicle } = await supabase
            .from('vehicles')
            .select('id, year, make, model, trim, vin, color, engine, transmission, drivetrain, fuel_type, mileage, condition, title_status, notes, nickname, cover_photo_url, is_primary')
            .eq('id', vehicleToEdit)
            .eq('user_id', user.id)
            .maybeSingle()

          if (editVehicle) {
            setEditingVehicleId(editVehicle.id)
            setForm({
              year: editVehicle.year ? String(editVehicle.year) : '',
              make: editVehicle.make || '',
              model: editVehicle.model || '',
              trim: editVehicle.trim || '',
              vin: editVehicle.vin || '',
              nickname: editVehicle.nickname || '',
              color: editVehicle.color || '',
              engine: editVehicle.engine || '',
              transmission: editVehicle.transmission || '',
              drivetrain: editVehicle.drivetrain || '',
              fuelType: editVehicle.fuel_type || '',
              mileage: editVehicle.mileage ? String(editVehicle.mileage) : '',
              condition: editVehicle.condition || '',
              titleStatus: editVehicle.title_status || '',
              notes: editVehicle.notes || '',
              primaryVehicle: Boolean(editVehicle.is_primary),
            })
          }
        }
      }
    }

    verifyUser()
  }, [])

  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('.garageCombo')) return
      setOpenPicker(null)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPicker(null)
    }

    document.addEventListener('mousedown', closePicker)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closePicker)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const uploadVehiclePhoto = async (userId: string, vehicleId: string) => {
    if (!photoFile) return null

    const ext = photoFile.name.split('.').pop() || 'jpg'
    const filePath = `${userId}/${vehicleId}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, photoFile, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('photos').getPublicUrl(filePath)
    return data.publicUrl
  }

  const saveVehicle = async (destination: 'again' | 'garage') => {
    if (!form.year || !form.make.trim() || !form.model.trim() || !form.nickname.trim()) {
      setError('Year, make, model, and vehicle nickname are required.')
      setActiveStep('identity')
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.replace('/login?mode=signup')
        return
      }

      if (form.primaryVehicle) {
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('user_id', user.id)
      }

      const vehiclePayload = {
        user_id: user.id,
        year: Number(form.year),
        make: form.make.trim(),
        model: form.model.trim(),
        trim: form.trim.trim() || null,
        vin: form.vin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || null,
        nickname: form.nickname.trim(),
        color: form.color.trim() || null,
        engine: form.engine.trim() || null,
        transmission: form.transmission.trim() || null,
        drivetrain: form.drivetrain.trim() || null,
        fuel_type: form.fuelType.trim() || null,
        mileage: form.mileage ? Number(form.mileage) : null,
        condition: form.condition.trim() || null,
        title_status: form.titleStatus || null,
        notes: form.notes.trim() || null,
        is_primary: form.primaryVehicle,
        type: 'garage',
      }

      const vehicleMutation = editingVehicleId
        ? supabase
          .from('vehicles')
          .update(vehiclePayload)
          .eq('id', editingVehicleId)
          .eq('user_id', user.id)
          .select('id, year, make, model, trim, nickname, cover_photo_url, is_primary')
          .single()
        : supabase
          .from('vehicles')
          .insert(vehiclePayload)
          .select('id, year, make, model, trim, nickname, cover_photo_url, is_primary')
          .single()

      const { data: vehicle, error: insertError } = await vehicleMutation

      if (insertError) throw insertError

      const coverPhotoUrl = await uploadVehiclePhoto(user.id, vehicle.id)
      if (coverPhotoUrl) {
        await supabase
          .from('vehicles')
          .update({ cover_photo_url: coverPhotoUrl })
          .eq('id', vehicle.id)
      }

      const savedVehicle = {
        ...(vehicle as GarageVehicle),
        cover_photo_url: coverPhotoUrl || vehicle.cover_photo_url,
      }

      setSavedVehicles(current => (
        editingVehicleId
          ? current.map(item => (
            item.id === savedVehicle.id
              ? savedVehicle
              : form.primaryVehicle
                ? { ...item, is_primary: false }
                : item
          ))
          : form.primaryVehicle
            ? [...current.map(item => ({ ...item, is_primary: false })), savedVehicle]
            : [...current, savedVehicle]
      ))

      if (destination === 'garage' || editingVehicleId) {
        await supabase
          .from('profiles')
          .update({ onboarded: true, updated_at: new Date().toISOString() })
          .eq('id', user.id)
        window.location.replace('/garage')
        return
      }

      setForm(initialForm)
      setPhotoFile(null)
      setPhotoFileName('')
      setActiveStep('identity')
      setSaving(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Something stopped the vehicle from saving.')
      setSaving(false)
    }
  }

  return (
    <main className="garagePrototype">
      <nav className="garageNav">
        <button className="garageBackLogo" onClick={goToPreviousPage} type="button" aria-label="Back to previous page">
          <BYLDitLogo />
        </button>
      </nav>

      <section className="garageShell">
        <div className="garageIntro">
          <div>
            <p className="garageEyebrow">{isEditingVehicle ? 'Vehicle Settings' : hasSavedVehicles ? 'Garage Setup' : 'Next Step: Garage Setup'}</p>
            <h1>{isEditingVehicle ? 'Edit this vehicle.' : hasSavedVehicles ? 'Add another vehicle.' : 'Add your first vehicle.'}</h1>
            <p>
              {isEditingVehicle
                ? 'Update the saved details for this vehicle. Walt will use the latest information when helping with projects, parts decisions, and diagnostics.'
                : hasSavedVehicles
                ? 'Keep building your garage. Walt will use every saved vehicle for project planning, parts decisions, service history, and future diagnostics.'
                : 'Your profile is saved. Now build the garage Walt will use for project planning, parts decisions, service history, and future diagnostics.'}
            </p>
          </div>

          <aside className="garageWaltCard">
            <img src={WALT_AVATAR_URL} alt="Walt" />
            <div>
              <p>
                <span>Walt</span> will use these details when helping with
                projects for this vehicle.
              </p>
            </div>
          </aside>
        </div>

        <div className="garageLayout">
          <aside className="garageSide">
            {hasSavedVehicles && (
              <div className="savedGaragePanel">
                <span className="previewEyebrow">Your Garage</span>
                <div className="savedGarageList">
                  {savedVehicles.map(vehicle => (
                    <article className="savedGarageCard" key={vehicle.id}>
                      <div
                        className="savedGaragePhoto"
                        style={vehicle.cover_photo_url ? { backgroundImage: `url(${vehicle.cover_photo_url})` } : undefined}
                      >
                        {vehicle.is_primary && <span className="primaryPreviewCheck" aria-label="Primary vehicle">✓</span>}
                      </div>
                      <div className="savedGarageInfo">
                        <strong>{vehicle.nickname}</strong>
                        <span>{[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="garageStepper" aria-label="Garage setup steps">
              {steps.map((step, index) => (
                <button
                  className={step.id === activeStep ? 'garageStepButton active' : 'garageStepButton'}
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  type="button"
                >
                  <span className="garageStepNumber">{index + 1}</span>
                  <span>
                    <span className="garageStepTitle">{step.title}</span>
                    <span className="garageStepHint">{step.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="vehicleCardPreview">
              <span className="previewEyebrow">{isEditingVehicle ? 'Updated Card Preview' : hasSavedVehicles ? 'New Vehicle Preview' : 'Garage Card Preview'}</span>
              <div className="previewPhoto">
                {form.primaryVehicle && <span className="primaryPreviewCheck" aria-label="Primary vehicle">✓</span>}
              </div>
              <div className="previewTitleRow">
                <strong>{vehicleName}</strong>
                <div className="previewBadges">
                  <span>{form.make || 'Make'}</span>
                </div>
              </div>
              <p>{vehicleSummary || 'Year, make, model, and trim will appear here.'}</p>
              {mechanicalSummary && <small>{mechanicalSummary}</small>}
            </div>
          </aside>

          <section className="garageFormCard">
            <header className={`garageFormHeader ${activeStep === 'identity' ? 'identityHeader' : 'detailsHeader'}`}>
              <p>Step {activeIndex + 1} of {steps.length}</p>
              <h2>{currentStep.title}</h2>
              <span>{currentStep.hint}</span>
            </header>

            <form className="garageForm">
              {activeStep === 'identity' && (
                <>
                  <div className="apiAssistPanel">
                    <div>
                      <strong>Smart vehicle lookup</strong>
                      <span>
                        Have the VIN? Enter it below and <BYLDitWord /> can help
                        prefill factory details when available. No VIN? Skip it
                        and enter the vehicle manually.
                      </span>
                    </div>
                  </div>

                  <div className="garageGrid">
                    <SuggestedInput
                      id="vin"
                      label="VIN"
                      note="Optional. Prefilled fields stay editable if this vehicle has changed since factory."
                      onChange={(field, value) => updateField(field, value.toUpperCase())}
                      span
                      value={form.vin}
                    />

                    <div className="manualEntryDivider">
                      <span>Enter manually</span>
                    </div>

                    <GaragePickerField
                      id="year"
                      label="Year"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={years}
                      required
                      setOpenPicker={setOpenPicker}
                      value={form.year}
                    />
                    <GaragePickerField
                      id="make"
                      label="Make"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={makeOptions}
                      required
                      setOpenPicker={setOpenPicker}
                      value={form.make}
                    />
                    <GaragePickerField
                      id="model"
                      label="Model"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={modelOptions}
                      required
                      setOpenPicker={setOpenPicker}
                      value={form.model}
                    />
                    <GaragePickerField
                      id="trim"
                      label="Trim / package"
                      note="Choose a suggested trim or type exactly what your vehicle is."
                      onChange={updateField}
                      openPicker={openPicker}
                      options={trimOptions}
                      setOpenPicker={setOpenPicker}
                      value={form.trim}
                    />
                    <SuggestedInput
                      id="nickname"
                      label="Vehicle nickname"
                      onChange={updateField}
                      required
                      value={form.nickname}
                    />
                    <GaragePickerField
                      id="color"
                      label="Color"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={colorOptions}
                      setOpenPicker={setOpenPicker}
                      value={form.color}
                    />
                  </div>
                </>
              )}

              {activeStep === 'details' && (
                <>
                <div className="garageGrid">
                  <GaragePickerField
                    id="engine"
                    label="Engine"
                    note="Factory engine, swap, custom build, diesel, EV conversion, or unknown."
                    onChange={updateField}
                    openPicker={openPicker}
                    options={engineOptions}
                    setOpenPicker={setOpenPicker}
                    value={form.engine}
                  />
                  <GaragePickerField
                    id="transmission"
                    label="Transmission"
                    note="Factory or custom. Walt should know if it has been swapped."
                    onChange={updateField}
                    openPicker={openPicker}
                    options={transmissionOptions}
                    setOpenPicker={setOpenPicker}
                    value={form.transmission}
                  />
                  <GaragePickerField
                    id="drivetrain"
                    label="Drivetrain"
                    note="FWD, RWD, AWD, 4WD, swapped axles, or custom setup."
                    onChange={updateField}
                    openPicker={openPicker}
                    options={drivetrainOptions}
                    setOpenPicker={setOpenPicker}
                    value={form.drivetrain}
                  />
                  <GaragePickerField
                    id="fuelType"
                    label="Fuel type"
                    onChange={updateField}
                    openPicker={openPicker}
                    options={fuelOptions}
                    setOpenPicker={setOpenPicker}
                    value={form.fuelType}
                  />
                  <SuggestedInput
                    id="mileage"
                    label="Mileage"
                    onChange={updateField}
                    type="number"
                    value={form.mileage}
                  />
                    <GaragePickerField
                      id="condition"
                      label="Vehicle Status"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={conditionOptions}
                      setOpenPicker={setOpenPicker}
                      value={form.condition}
                    />
                    <GaragePickerField
                      id="titleStatus"
                      label="Title status"
                      onChange={updateField}
                      openPicker={openPicker}
                      options={titleOptions}
                      setOpenPicker={setOpenPicker}
                      value={form.titleStatus}
                    />
                    <div className="garageField">
                      <label htmlFor="vehiclePhoto">Upload Image</label>
                      <div className="fileUploadControl">
                        <input
                          id="vehiclePhoto"
                          onChange={event => {
                            const file = event.target.files?.[0] || null
                            setPhotoFile(file)
                            setPhotoFileName(file?.name || '')
                          }}
                          type="file"
                        />
                        <label htmlFor="vehiclePhoto">Select File</label>
                        <span>{photoFileName || 'No file selected'}</span>
                      </div>
                    </div>
                    <div className="garageField full">
                      <label htmlFor="notes">Notes for Walt</label>
                      <textarea
                        id="notes"
                        onChange={event => updateField('notes', event.target.value)}
                        placeholder="Anything Walt should know: previous work, weird symptoms, known issues, modifications, goals, or history."
                        value={form.notes}
                      />
                    </div>
                    <div className="garageField full">
                      <label>Vehicle priority</label>
                      <div className={form.primaryVehicle ? 'primaryBox active' : 'primaryBox'}>
                        <div>
                          <strong>{form.primaryVehicle ? 'Primary vehicle' : 'Not primary'}</strong>
                          <span>Mark this as the main vehicle in the garage.</span>
                        </div>
                        <button
                          aria-label="Toggle primary vehicle"
                          className={form.primaryVehicle ? 'garageToggle active' : 'garageToggle'}
                          onClick={() => setForm(current => ({ ...current, primaryVehicle: !current.primaryVehicle }))}
                          type="button"
                        >
                          <span
                            className="garageToggleKnob"
                            style={{ transform: form.primaryVehicle ? 'translateX(26px)' : 'translateX(0)' }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="garageActions">
                <button
                  className="garageSecondaryButton"
                  disabled={activeStep === 'identity'}
                  onClick={goBack}
                  style={{ opacity: activeStep === 'identity' ? 0.45 : 1 }}
                  type="button"
                >
                  Back
                </button>

	                {activeStep !== 'details' ? (
	                  <button className="garagePrimaryButton" onClick={goNext} type="button">
	                    Next Step
	                  </button>
	                ) : isEditingVehicle ? (
	                  <button className="garagePrimaryButton" disabled={saving} onClick={() => saveVehicle('garage')} type="button">
	                    {saving ? 'Saving...' : 'Save Vehicle'}
	                  </button>
	                ) : (
	                  <div className="garageFinalActions">
                    <button className="garageSecondaryButton saveAnotherButton" disabled={saving} onClick={() => saveVehicle('again')} type="button">
                      {saving ? 'Saving...' : 'Save & Add Another'}
                    </button>
                    <button className="garagePrimaryButton" disabled={saving} onClick={() => saveVehicle('garage')} type="button">
                      {saving ? 'Saving...' : 'Save & Go to Garage'}
                    </button>
                  </div>
                )}
              </div>
              {error && <p className="garageFormError">{error}</p>}
            </form>
          </section>
        </div>
      </section>

      <BYLDitDataList id="make-options" options={makeOptions} />
      <BYLDitDataList id="model-options" options={modelOptions} />
      <BYLDitDataList id="trim-options" options={trimOptions} />
      <BYLDitDataList id="color-options" options={colorOptions} />
      <BYLDitDataList id="engine-options" options={engineOptions} />
      <BYLDitDataList id="transmission-options" options={transmissionOptions} />
      <BYLDitDataList id="drivetrain-options" options={drivetrainOptions} />
      <BYLDitDataList id="fuel-options" options={fuelOptions} />
      <BYLDitDataList id="condition-options" options={conditionOptions} />
    </main>
  )
}
