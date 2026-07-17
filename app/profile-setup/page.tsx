'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WALT_AVATAR_URL } from '@/lib/app-constants'
import { supabase } from '@/lib/supabase'
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

function RequiredMark() {
  return <span className="requiredDot" aria-label="required field" />
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

function PickerField({
  id,
  label,
  multiple = false,
  openPicker,
  options,
  setOpenPicker,
  selected,
  onChange,
  required = false,
}: {
  id: string
  label: string
  multiple?: boolean
  openPicker: string | null
  options: string[]
  setOpenPicker: (id: string | null) => void
  selected: string | string[]
  onChange: (value: string | string[]) => void
  required?: boolean
}) {
  const open = openPicker === id
  const selectedValues = Array.isArray(selected) ? selected : selected ? [selected] : []
  const summary = selectedValues.length
    ? selectedValues.length > 2
      ? `${selectedValues.slice(0, 2).join(', ')} +${selectedValues.length - 2}`
      : selectedValues.join(', ')
    : multiple
      ? 'Select all that apply'
      : 'Select one'

  const toggleOption = (option: string) => {
    if (!multiple) {
      onChange(option)
      setOpenPicker(null)
      return
    }

    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(item => item !== option))
      return
    }

    onChange([...selectedValues, option])
  }

  return (
    <div className="profilePicker">
      <span className="profilePickerLabel">
        {label}
        {required && <RequiredMark />}
      </span>
      <button
        className={open ? 'profilePickerButton open' : 'profilePickerButton'}
        type="button"
        onClick={() => setOpenPicker(open ? null : id)}
      >
        {multiple && selectedValues.length > 0 ? (
          <span className="profilePickerSelection">
            {selectedValues.slice(0, 3).map(item => (
              <span className="profilePickerChip" key={item}>{item}</span>
            ))}
            {selectedValues.length > 3 && <span className="profilePickerMore">+{selectedValues.length - 3}</span>}
          </span>
        ) : (
          <span>{summary}</span>
        )}
        <span className="profilePickerChevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="profilePickerMenu">
          {options.map(option => (
            <button
              className={selectedValues.includes(option) ? 'profilePickerOption selected' : 'profilePickerOption'}
              key={option}
              onClick={() => toggleOption(option)}
              type="button"
            >
              <span className="profilePickerCheck" aria-hidden="true">
                {multiple ? '✓' : '•'}
              </span>
              <span>{option}</span>
            </button>
          ))}
          {multiple && (
            <div className="profilePickerDoneRow">
              <button className="profilePickerDone" onClick={() => setOpenPicker(null)} type="button">
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProfileSetupContent() {
  const searchParams = useSearchParams()
  const [activeStep, setActiveStep] = useState<StepId>('identity')
  const [form, setForm] = useState<ProfileForm>(initialForm)
  const [openPicker, setOpenPicker] = useState<string | null>(null)
  const [profilePhotoName, setProfilePhotoName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const activeIndex = steps.findIndex(step => step.id === activeStep)
  const currentStep = steps[activeIndex]
  const firstName = form.firstName.trim() || 'your first name'
  const handle = form.handle.trim() || 'your handle'
  const garageName = `${handle}'s Garage`
  const openedFromGarage = searchParams.get('from') === 'garage'
  const pageEyebrow = openedFromGarage ? 'Settings' : 'Get Started'
  const pageTitle = openedFromGarage ? 'Profile settings.' : <>Create your <BYLDitWord /> profile.</>
  const pageIntro = openedFromGarage
    ? <>Update your identity, background, and workspace details that Walt uses across <BYLDitWord />.</>
    : <>Set up your private account details, display name, and garage background Walt will use across <BYLDitWord />.</>
  const waltTitle = openedFromGarage ? 'Walt Context' : 'Walt Ready'
  const waltIntro = openedFromGarage
    ? 'Update anything that has changed. I will use the latest profile details when helping in your garage.'
    : 'Tell me a little about yourself so I can understand how you work and what kind of help you need.'

  const updateField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm(current => ({ ...current, [field]: value }))
    setError('')
  }

  const goNext = () => {
    setOpenPicker(null)
    if (activeStep === 'identity') {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.handle.trim() || !form.state.trim()) {
        setError('First name, last name, display name, and state are required.')
        return
      }
      setActiveStep('background')
    }
    if (activeStep === 'background') {
      if (!form.experience.trim()) {
        setError('Select an experience level before continuing.')
        return
      }
      setActiveStep('workspace')
    }
  }

  const goBack = () => {
    setOpenPicker(null)
    if (activeStep === 'workspace') setActiveStep('background')
    if (activeStep === 'background') setActiveStep('identity')
  }

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.replace('/login?mode=signup')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, handle, state, city, visibility, bio, experience, work_style, guidance_style, workspace, tools, project_interests, vehicle_interests, walt_notes')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled || !data) return

      setForm({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        handle: data.handle || '',
        state: data.state || '',
        city: data.city || '',
        visibility: data.visibility === 'public' ? 'public' : 'private',
        bio: data.bio || '',
        experience: data.experience || '',
        workStyle: data.work_style || '',
        guidanceStyle: data.guidance_style || '',
        workspace: data.workspace || [],
        tools: data.tools || [],
        projectInterests: data.project_interests || [],
        vehicleInterests: data.vehicle_interests || [],
        waltNotes: data.walt_notes || '',
      })
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('.profilePicker')) return
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

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.handle.trim() || !form.state.trim() || !form.experience.trim()) {
      setError('Finish the required profile fields before continuing.')
      return
    }

    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.replace('/login?mode=signup')
      return
    }

    const { error: saveError } = await supabase.from('profiles').upsert({
      id: user.id,
      name: form.firstName.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      handle: form.handle.trim(),
      state: form.state,
      city: form.city.trim() || null,
      visibility: form.visibility,
      bio: form.bio.trim() || null,
      experience: form.experience,
      work_style: form.workStyle || null,
      guidance_style: form.guidanceStyle || null,
      workspace: form.workspace,
      tools: form.tools,
      project_interests: form.projectInterests,
      vehicle_interests: form.vehicleInterests,
      walt_notes: form.waltNotes.trim() || null,
      profile_completed: true,
      onboarded: false,
      updated_at: new Date().toISOString(),
    })

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    window.location.href = openedFromGarage ? '/garage' : '/garage-setup'
  }

  return (
    <main className="profilePrototype">
      <nav className="profileNav">
	        <a href={openedFromGarage ? '/garage' : '/landing-prototype'} aria-label={openedFromGarage ? 'Back to garage' : 'Back to BYLDit landing page'}>
          <BYLDitLogo />
        </a>
      </nav>

      <section className="profileShell">
        <div className="profileIntro">
          <div>
            <p className="profileEyebrow">{pageEyebrow}</p>
            <h1>{pageTitle}</h1>
            <p>{pageIntro}</p>
          </div>

          <aside className="waltIntroCard">
            <img src={WALT_AVATAR_URL} alt="Walt" />
            <div>
              <strong>{waltTitle}</strong>
              <p>{waltIntro}</p>
            </div>
          </aside>
        </div>

        {openedFromGarage && (
          <nav className="profileSettingsNav" aria-label="Settings sections">
            <a className="active" href="/profile-setup?from=garage">Profile</a>
            <a href="/billing">Billing</a>
            <a href="/account-settings">Account</a>
            <a href="/help-support">Help & Support</a>
          </nav>
        )}

        <div className="profileLayout">
          <aside>
            <div className="profileStepper" aria-label={openedFromGarage ? 'Profile settings sections' : 'Profile setup steps'}>
              {steps.map((step, index) => (
                <button
                  className={step.id === activeStep ? 'stepButton active' : 'stepButton'}
                  key={step.id}
                  onClick={() => {
                    setOpenPicker(null)
                    setActiveStep(step.id)
                  }}
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
	                        First name <span className="fieldNote">(Walt will refer to you as this)</span> <RequiredMark />
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
	                      <label htmlFor="lastName">Last name <RequiredMark /></label>
                      <input
                        id="lastName"
                        onChange={event => updateField('lastName', event.target.value)}
                        placeholder=""
                        type="text"
                        value={form.lastName}
                      />
                    </div>

	                    <div className="field">
	                      <label htmlFor="handle">Display name / handle <RequiredMark /></label>
                      <input
                        id="handle"
                        onChange={event => updateField('handle', event.target.value)}
                        placeholder=""
                        type="text"
                        value={form.handle}
                      />
                    </div>

                    <div className="field">
                      <PickerField
	                        id="state"
	                        label="State / region"
	                        onChange={value => updateField('state', value as string)}
	                        openPicker={openPicker}
	                        options={states}
                          required
	                        selected={form.state}
                        setOpenPicker={setOpenPicker}
                      />
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
                      <div className="profileFileUploadControl">
                        <input
                          id="profilePhoto"
                          onChange={event => setProfilePhotoName(event.target.files?.[0]?.name || '')}
                          type="file"
                        />
                        <label htmlFor="profilePhoto">Select File</label>
                        <span>{profilePhotoName || 'No file selected'}</span>
                      </div>
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
                      <PickerField
	                        id="experience"
	                        label="Experience level"
	                        onChange={value => updateField('experience', value as string)}
	                        openPicker={openPicker}
	                        options={['Beginner', 'Comfortable with basics', 'Experienced DIY', 'Advanced builder', 'Professional']}
                          required
	                        selected={form.experience}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>

                    <div className="field">
                      <PickerField
                        id="workStyle"
                        label="Preferred work style"
                        onChange={value => updateField('workStyle', value as string)}
                        openPicker={openPicker}
                        options={['Mostly alone', 'With friends or family', 'With a shop', 'Mix of DIY and shop help']}
                        selected={form.workStyle}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>

                    <div className="field full">
                      <PickerField
                        id="projectInterests"
                        label="Project interests"
                        multiple
                        onChange={values => updateField('projectInterests', values as string[])}
                        openPicker={openPicker}
                        options={projectOptions}
                        selected={form.projectInterests}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>

                    <div className="field full">
                      <PickerField
                        id="vehicleInterests"
                        label="Vehicle interests"
                        multiple
                        onChange={values => updateField('vehicleInterests', values as string[])}
                        openPicker={openPicker}
                        options={vehicleOptions}
                        selected={form.vehicleInterests}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeStep === 'workspace' && (
                <>
                  <div className="formGrid">
                    <div className="field full">
                      <PickerField
                        id="workspace"
                        label="Workspace setup"
                        multiple
                        onChange={values => updateField('workspace', values as string[])}
                        openPicker={openPicker}
                        options={workspaceOptions}
                        selected={form.workspace}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>

                    <div className="field full">
                      <PickerField
                        id="tools"
                        label="Tools available"
                        multiple
                        onChange={values => updateField('tools', values as string[])}
                        openPicker={openPicker}
                        options={toolOptions}
                        selected={form.tools}
                        setOpenPicker={setOpenPicker}
                      />
                    </div>

                    <div className="field">
                      <PickerField
                        id="guidanceStyle"
                        label="Walt guidance style"
                        onChange={value => updateField('guidanceStyle', value as string)}
                        openPicker={openPicker}
                        options={['Step-by-step', 'Balanced', 'Quick checklist', 'Detailed teaching']}
                        selected={form.guidanceStyle}
                        setOpenPicker={setOpenPicker}
                      />
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
	                        {openedFromGarage
                            ? `Save these changes and I will use the latest details when helping ${firstName} in ${garageName}.`
                            : `Once this is wired into the real app, Walt can talk to ${firstName} while ${garageName} becomes the starting point for the garage.`}
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
	                    {openedFromGarage ? 'Next Section' : 'Continue'}
	                  </button>
	                ) : (
	                  <button className="primaryButton" disabled={saving} onClick={saveProfile} type="button">
	                    {saving ? 'Saving...' : openedFromGarage ? 'Save Profile' : 'Save Profile & Build Garage'}
	                  </button>
                )}
              </div>
              {error && <p className="formError">{error}</p>}
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}

export default function ProfileSetupPrototype() {
  return (
    <Suspense fallback={null}>
      <ProfileSetupContent />
    </Suspense>
  )
}
