'use client'

import { useState } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import './profile-setup-prototype.css'

type StepId = 'identity' | 'background' | 'workspace'

type ProfileForm = {
  firstName: string
  lastName: string
  handle: string
  state: string
  city: string
  visibility: 'private' | 'public'
  bio: string
  experience: string
  workStyle: string
  guidanceStyle: string
  workspace: string[]
  tools: string[]
  projectInterests: string[]
  vehicleInterests: string[]
  waltNotes: string
}

const steps: Array<{ id: StepId; title: string; hint: string }> = [
  { id: 'identity', title: 'Identity', hint: 'Private info and display name' },
  { id: 'background', title: 'Background', hint: 'Experience and interests' },
  { id: 'workspace', title: 'Workspace', hint: 'Tools, space, and Walt style' },
]

const initialForm: ProfileForm = {
  firstName: '',
  lastName: '',
  handle: '',
  state: '',
  city: '',
  visibility: 'private',
  bio: '',
  experience: '',
  workStyle: '',
  guidanceStyle: '',
  workspace: [],
  tools: [],
  projectInterests: [],
  vehicleInterests: [],
  waltNotes: '',
}

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
]

const workspaceOptions = [
  'Driveway',
  'Home garage',
  'Detached shop',
  'Shared workspace',
  'Storage unit',
  'Professional shop access',
  'Lift access',
  'Outdoor space',
]

const toolOptions = [
  'Basic hand tools',
  'Floor jack',
  'Jack stands',
  'Torque wrench',
  'Diagnostic scanner',
  'Air compressor',
  'Impact tools',
  'Welder',
  'Engine hoist',
  'Paint/body setup',
  'Battery charger',
  'Multimeter',
]

const projectOptions = [
  'Maintenance',
  'Diagnostics',
  'Repairs',
  'Upgrades',
  'Restorations',
  'Performance',
  'Suspension',
  'Wheels and tires',
  'Interior',
  'Paint and body',
]

const vehicleOptions = [
  'Classic trucks',
  'Modern trucks',
  'Muscle cars',
  'Imports',
  'Motorcycles',
  'Off-road builds',
  'Daily drivers',
  'Diesels',
  'Hot rods',
  'Restomods',
]

function BYLDitLogo() {
  return (
    <span className="profileLogo" aria-label="BYLDit">
      <span className="profileLogoByld">BYLD</span>
      <span className="profileLogoIt">it</span>
    </span>
  )
}

function BYLDitWord() {
  return (
    <span className="profileBrandWord" aria-label="BYLDit">
      <span className="profileBrandWordByld">BYLD</span>
      <span className="profileBrandWordIt">it</span>
    </span>
  )
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const summary = selected.length ? selected.join(', ') : 'Select all that apply'

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
      return
    }
    onChange([...selected, option])
  }

  return (
    <div className="multiSelect">
      <span className="multiSelectLabel">{label}</span>
      <button
        className="multiSelectButton"
        type="button"
        onClick={() => setOpen(current => !current)}
      >
        <span>{summary}</span>
        <span className="multiSelectChevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="multiSelectMenu">
          {options.map(option => (
            <label className="multiSelectOption" key={option}>
              <input
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                type="checkbox"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className="selectedChips">
          {selected.map(item => (
            <span className="selectedChip" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfileSetupPrototype() {
  const [activeStep, setActiveStep] = useState<StepId>('identity')
  const [form, setForm] = useState<ProfileForm>(initialForm)

  const activeIndex = steps.findIndex(step => step.id === activeStep)
  const currentStep = steps[activeIndex]
  const firstName = form.firstName.trim() || 'your first name'
  const handle = form.handle.trim() || 'your handle'
  const garageName = `${handle}'s Garage`

  const updateField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const goNext = () => {
    if (activeStep === 'identity') setActiveStep('background')
    if (activeStep === 'background') setActiveStep('workspace')
  }

  const goBack = () => {
    if (activeStep === 'workspace') setActiveStep('background')
    if (activeStep === 'background') setActiveStep('identity')
  }

  return (
    <main className="profilePrototype">
      <nav className="profileNav">
        <a href="/landing-prototype" aria-label="Back to BYLDit landing page">
          <BYLDitLogo />
        </a>
      </nav>

      <section className="profileShell">
        <div className="profileIntro">
          <div>
            <p className="profileEyebrow">Get Started</p>
            <h1>Create your <BYLDitWord /> profile.</h1>
            <p>
              Set up your private account details, display name, and garage
              background Walt will use across <BYLDitWord />.
            </p>
          </div>

          <aside className="waltIntroCard">
            <img src={WALT_AVATAR_URL} alt="Walt" />
            <div>
              <strong>Walt Ready</strong>
              <p>
                Tell me a little about yourself so I can understand how you
                work and what kind of help you need.
              </p>
            </div>
          </aside>
        </div>

        <div className="profileLayout">
          <aside>
            <div className="profileStepper" aria-label="Profile setup steps">
              {steps.map((step, index) => (
                <button
                  className={step.id === activeStep ? 'stepButton active' : 'stepButton'}
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  type="button"
                >
                  <span className="stepNumber">{index + 1}</span>
                  <span>
                    <span className="stepTitle">{step.title}</span>
                    <span className="stepHint">{step.hint}</span>
                  </span>
                </button>
              ))}
            </div>

          </aside>

          <section className="profileFormCard">
            <header className="formHeader">
              <p>Step {activeIndex + 1} of {steps.length}</p>
              <h2>{currentStep.title}</h2>
              <span>{currentStep.hint}</span>
            </header>

            <form className="profileForm">
              {activeStep === 'identity' && (
                <>
                  <div className="formGrid">
                    <div className="field">
                      <label htmlFor="firstName">
                        First name <span className="fieldNote">(Walt will refer to you as this)</span> <span className="required">*</span>
                      </label>
                      <input
                        id="firstName"
                        onChange={event => updateField('firstName', event.target.value)}
                        placeholder=""
                        type="text"
                        value={form.firstName}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="lastName">Last name <span className="required">*</span></label>
                      <input
                        id="lastName"
                        onChange={event => updateField('lastName', event.target.value)}
                        placeholder=""
                        type="text"
                        value={form.lastName}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="handle">Display name / handle <span className="required">*</span></label>
                      <input
                        id="handle"
                        onChange={event => updateField('handle', event.target.value)}
                        placeholder=""
                        type="text"
                        value={form.handle}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="state">State / region <span className="required">*</span></label>
                      <select
                        id="state"
                        onChange={event => updateField('state', event.target.value)}
                        value={form.state}
                      >
                        <option value="">Select state</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        onChange={event => updateField('city', event.target.value)}
                        placeholder="Optional"
                        type="text"
                        value={form.city}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="profilePhoto">Profile photo</label>
                      <input id="profilePhoto" type="file" />
                    </div>

                    <div className="field full">
                      <label htmlFor="bio">Short bio</label>
                      <textarea
                        id="bio"
                        onChange={event => updateField('bio', event.target.value)}
                        placeholder="Anything you share with Walt about yourself will help him along the way."
                        value={form.bio}
                      />
                    </div>

                    <div className="field full">
                      <label>Profile visibility</label>
                      <div className="visibilityBox">
                        <div>
                          <strong>{form.visibility === 'private' ? 'Private profile' : 'Public profile'}</strong>
                          <span>Private by default. Public profile features can be turned on later.</span>
                        </div>
                        <button
                          aria-label="Toggle profile visibility"
                          className="toggle"
                          onClick={() => updateField('visibility', form.visibility === 'private' ? 'public' : 'private')}
                          type="button"
                        >
                          <span
                            className="toggleKnob"
                            style={{ transform: form.visibility === 'public' ? 'translateX(26px)' : 'translateX(0)' }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeStep === 'background' && (
                <>
                  <div className="formGrid">
                    <div className="field">
                      <label htmlFor="experience">Experience level <span className="required">*</span></label>
                      <select
                        id="experience"
                        onChange={event => updateField('experience', event.target.value)}
                        value={form.experience}
                      >
                        <option value="">Select one</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Comfortable with basics">Comfortable with basics</option>
                        <option value="Experienced DIY">Experienced DIY</option>
                        <option value="Advanced builder">Advanced builder</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="workStyle">Preferred work style</label>
                      <select
                        id="workStyle"
                        onChange={event => updateField('workStyle', event.target.value)}
                        value={form.workStyle}
                      >
                        <option value="">Select one</option>
                        <option value="Mostly alone">Mostly alone</option>
                        <option value="With friends or family">With friends or family</option>
                        <option value="With a shop">With a shop</option>
                        <option value="Mix of DIY and shop help">Mix of DIY and shop help</option>
                      </select>
                    </div>

                    <div className="field full">
                      <MultiSelect
                        label="Project interests"
                        onChange={values => updateField('projectInterests', values)}
                        options={projectOptions}
                        selected={form.projectInterests}
                      />
                    </div>

                    <div className="field full">
                      <MultiSelect
                        label="Vehicle interests"
                        onChange={values => updateField('vehicleInterests', values)}
                        options={vehicleOptions}
                        selected={form.vehicleInterests}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeStep === 'workspace' && (
                <>
                  <div className="formGrid">
                    <div className="field full">
                      <MultiSelect
                        label="Workspace setup"
                        onChange={values => updateField('workspace', values)}
                        options={workspaceOptions}
                        selected={form.workspace}
                      />
                    </div>

                    <div className="field full">
                      <MultiSelect
                        label="Tools available"
                        onChange={values => updateField('tools', values)}
                        options={toolOptions}
                        selected={form.tools}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="guidanceStyle">Walt guidance style</label>
                      <select
                        id="guidanceStyle"
                        onChange={event => updateField('guidanceStyle', event.target.value)}
                        value={form.guidanceStyle}
                      >
                        <option value="">Select one</option>
                        <option value="Step-by-step">Step-by-step</option>
                        <option value="Balanced">Balanced</option>
                        <option value="Quick checklist">Quick checklist</option>
                        <option value="Detailed teaching">Detailed teaching</option>
                      </select>
                    </div>

                    <div className="field full">
                      <label htmlFor="waltNotes">Anything Walt should know?</label>
                      <textarea
                        id="waltNotes"
                        onChange={event => updateField('waltNotes', event.target.value)}
                        placeholder="Comfort level, things you avoid, how you like to learn, or anything else."
                        value={form.waltNotes}
                      />
                    </div>
                  </div>

                  <div className="completionPanel">
                    <img src={WALT_AVATAR_URL} alt="Walt" />
                    <div>
                      <strong>Profile Ready</strong>
                      <p>
                        Once this is wired into the real app, Walt can talk to
                        {` ${firstName}`} while {garageName} becomes the
                        starting point for the garage.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="formActions">
                <button
                  className="secondaryButton"
                  disabled={activeStep === 'identity'}
                  onClick={goBack}
                  style={{ opacity: activeStep === 'identity' ? 0.45 : 1 }}
                  type="button"
                >
                  Back
                </button>

                {activeStep !== 'workspace' ? (
                  <button className="primaryButton" onClick={goNext} type="button">
                    Continue
                  </button>
                ) : (
                  <button className="primaryButton" type="button">
                    Preview Complete
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
