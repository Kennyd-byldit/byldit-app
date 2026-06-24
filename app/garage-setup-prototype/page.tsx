'use client'

import { useState } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
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

export default function GarageSetupPrototype() {
  const [activeStep, setActiveStep] = useState<StepId>('identity')
  const [form, setForm] = useState<GarageForm>(initialForm)
  const [photoFileName, setPhotoFileName] = useState('')

  const activeIndex = steps.findIndex(step => step.id === activeStep)
  const currentStep = steps[activeIndex]
  const vehicleName = form.nickname.trim() || [form.year, form.make, form.model].filter(Boolean).join(' ') || 'Your vehicle'
  const vehicleSummary = [form.year, form.make, form.model, form.trim].filter(Boolean).join(' ')
  const mechanicalSummary = [form.engine, form.transmission, form.drivetrain].filter(Boolean).join(' / ')

  const updateField = (field: keyof GarageForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const goNext = () => {
    if (activeStep === 'identity') setActiveStep('details')
  }

  const goBack = () => {
    if (activeStep === 'details') setActiveStep('identity')
  }

  return (
    <main className="garagePrototype">
      <nav className="garageNav">
        <a href="/profile-setup-prototype" aria-label="Back to BYLDit profile setup">
          <BYLDitLogo />
        </a>
      </nav>

      <section className="garageShell">
        <div className="garageIntro">
          <div>
            <p className="garageEyebrow">Garage Setup</p>
            <h1>Build your <BYLDitWord /> garage.</h1>
            <p>
              Add the vehicle details Walt will use for project planning, parts
              decisions, service history, and future diagnostics.
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
              <span className="previewEyebrow">Garage Card Preview</span>
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

                    <div className="garageField">
                      <label htmlFor="year">Year <span className="required">*</span></label>
                      <select
                        id="year"
                        onChange={event => updateField('year', event.target.value)}
                        value={form.year}
                      >
                        <option value="">Select year</option>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </div>
                    <SuggestedInput
                      id="make"
                      label="Make"
                      list="make-options"
                      onChange={updateField}
                      required
                      value={form.make}
                    />
                    <SuggestedInput
                      id="model"
                      label="Model"
                      list="model-options"
                      onChange={updateField}
                      required
                      value={form.model}
                    />
                    <SuggestedInput
                      id="trim"
                      label="Trim / package"
                      list="trim-options"
                      note="Choose a suggested trim or type exactly what your vehicle is."
                      onChange={updateField}
                      value={form.trim}
                    />
                    <SuggestedInput
                      id="nickname"
                      label="Vehicle nickname"
                      onChange={updateField}
                      required
                      value={form.nickname}
                    />
                    <SuggestedInput
                      id="color"
                      label="Color"
                      list="color-options"
                      onChange={updateField}
                      value={form.color}
                    />
                  </div>
                </>
              )}

              {activeStep === 'details' && (
                <>
                <div className="garageGrid">
                  <SuggestedInput
                    id="engine"
                    label="Engine"
                    list="engine-options"
                    note="Factory engine, swap, custom build, diesel, EV conversion, or unknown."
                    onChange={updateField}
                    value={form.engine}
                  />
                  <SuggestedInput
                    id="transmission"
                    label="Transmission"
                    list="transmission-options"
                    note="Factory or custom. Walt should know if it has been swapped."
                    onChange={updateField}
                    value={form.transmission}
                  />
                  <SuggestedInput
                    id="drivetrain"
                    label="Drivetrain"
                    list="drivetrain-options"
                    note="FWD, RWD, AWD, 4WD, swapped axles, or custom setup."
                    onChange={updateField}
                    value={form.drivetrain}
                  />
                  <SuggestedInput
                    id="fuelType"
                    label="Fuel type"
                    list="fuel-options"
                    onChange={updateField}
                    value={form.fuelType}
                  />
                  <SuggestedInput
                    id="mileage"
                    label="Mileage"
                    onChange={updateField}
                    type="number"
                    value={form.mileage}
                  />
                    <SuggestedInput
                      id="condition"
                      label="Vehicle Status"
                      list="condition-options"
                      onChange={updateField}
                      value={form.condition}
                    />
                    <div className="garageField">
                      <label htmlFor="titleStatus">Title status</label>
                      <select
                        id="titleStatus"
                        onChange={event => updateField('titleStatus', event.target.value)}
                        value={form.titleStatus}
                      >
                        <option value="">Select one</option>
                        {titleOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="garageField">
                      <label htmlFor="vehiclePhoto">Upload Image</label>
                      <div className="fileUploadControl">
                        <input
                          id="vehiclePhoto"
                          onChange={event => setPhotoFileName(event.target.files?.[0]?.name || '')}
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
                ) : (
                  <div className="garageFinalActions">
                    <button className="garageSecondaryButton saveAnotherButton" type="button">
                      Save & Add Another
                    </button>
                    <button className="garagePrimaryButton" type="button">
                      Save & Go to Garage
                    </button>
                  </div>
                )}
              </div>
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
