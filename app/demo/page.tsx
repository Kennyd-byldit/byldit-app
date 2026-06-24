'use client'

import './demo.css'
import { useEffect, useMemo, useState } from 'react'
import { WALT_AVATAR_URL } from '@/lib/app-constants'

type DemoVehicle = {
  color: string
  drivetrain: string
  engine: string
  make: string
  model: string
  name: string
  notes: string
  photo: string
  status: string
  trim: string
  year: string
}

type DemoProject = {
  mode: string
  name: string
}

type DemoState = {
  experience: string
  name: string
  project: DemoProject | null
  vehicle: DemoVehicle | null
}

const storageKey = 'byldit-demo-state-v1'

const emptyState: DemoState = {
  experience: '',
  name: '',
  project: null,
  vehicle: null,
}

const emptyVehicle: DemoVehicle = {
  color: '',
  drivetrain: '',
  engine: '',
  make: '',
  model: '',
  name: '',
  notes: '',
  photo: '',
  status: '',
  trim: '',
  year: '',
}

function loadStoredDemoState() {
  if (typeof window === 'undefined') return emptyState

  const stored = window.sessionStorage.getItem(storageKey)
  if (!stored) return emptyState

  try {
    return JSON.parse(stored) as DemoState
  } catch {
    window.sessionStorage.removeItem(storageKey)
    return emptyState
  }
}

function getStartingScreen(demoState: DemoState) {
  if (demoState.project) return 'project'
  if (demoState.vehicle) return 'garage'
  if (demoState.name) return 'vehicle'
  return 'start'
}

const starterVehicle: DemoVehicle = {
  color: 'Seafoam Green',
  drivetrain: '4WD',
  engine: 'V8',
  make: 'Ford',
  model: 'F-250 Highboy',
  name: "Terry's Rig",
  notes: 'Demo truck for showing garage memory, projects, and Walt context.',
  photo: '/photos/f250-hiboy-68.jpg',
  status: 'Project Build',
  trim: 'Highboy',
  year: '1968',
}

function Logo() {
  return (
    <span className="demoLogo" aria-label="BYLDit demo home">
      <span className="demoLogoByld">BYLD</span>
      <span className="demoLogoIt">it</span>
    </span>
  )
}

function DemoHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="demoHeader">
      <a href="/landing-prototype" aria-label="Back to landing page">
        <Logo />
      </a>
      <div className="demoHeaderActions">
        <span className="demoBadge">Sandbox Demo</span>
        <button className="demoReset" onClick={onReset} type="button">
          Reset Demo
        </button>
      </div>
    </header>
  )
}

function WaltIntro() {
  return (
    <aside className="demoPhone" aria-label="Demo Walt conversation preview">
      <div className="demoPhoneScreen">
        <div className="demoPhoneTop">
          <img className="demoWaltAvatar" src={WALT_AVATAR_URL} alt="Walt" />
          <div>
            <strong>Walt</strong>
            <p className="demoMuted">AI Crew Cheef</p>
          </div>
        </div>
        <div className="demoPhoneBody">
          <div className="demoBubble user">
            I want to show someone how BYLDit works from scratch.
          </div>
          <div className="demoBubble walt">
            Perfect. This is the sandbox, so you can build a profile, add a vehicle,
            start a project, and reset it without touching the real database.
          </div>
          <div className="demoBubble user">Can we start over anytime?</div>
          <div className="demoBubble walt">
            Yep. Hit Reset Demo and I&apos;ll wipe this browser-only demo clean.
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function DemoPage() {
  const initialState = useMemo(() => loadStoredDemoState(), [])
  const [state, setState] = useState<DemoState>(initialState)
  const [screen, setScreen] = useState<'start' | 'profile' | 'vehicle' | 'garage' | 'project'>(() => getStartingScreen(initialState))
  const [vehicleDraft, setVehicleDraft] = useState<DemoVehicle>(initialState.vehicle || starterVehicle)
  const [projectDraft, setProjectDraft] = useState<DemoProject>(
    initialState.project || { mode: 'Maintenance', name: 'Oil Change' }
  )

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const resetDemo = () => {
    window.sessionStorage.removeItem(storageKey)
    setState(emptyState)
    setVehicleDraft(starterVehicle)
    setProjectDraft({ mode: 'Maintenance', name: 'Oil Change' })
    setScreen('start')
  }

  const saveProfile = () => {
    setState(prev => ({
      ...prev,
      experience: prev.experience || 'Handle the basics',
      name: prev.name || 'Kenny',
    }))
    setScreen('vehicle')
  }

  const saveVehicle = () => {
    setState(prev => ({ ...prev, vehicle: vehicleDraft }))
    setScreen('garage')
  }

  const saveProject = () => {
    setState(prev => ({ ...prev, project: projectDraft }))
    setScreen('project')
  }

  const displayName = state.name || 'Kenny'
  const vehicle = state.vehicle
  const project = state.project

  const demoProgress = useMemo(() => {
    if (project) return 'Project ready'
    if (vehicle) return 'Garage ready'
    if (state.name) return 'Profile ready'
    return 'Fresh demo'
  }, [project, state.name, vehicle])

  return (
    <div className="demoShell">
      <DemoHeader onReset={resetDemo} />
      <main className="demoMain">
        {screen === 'start' && (
          <section className="demoHero">
            <div>
              <p className="demoEyebrow">Private Sandbox</p>
              <h1>Run the BYLDit demo without touching real data.</h1>
              <p>
                Use this lane to show the first-time experience, build a fake garage,
                start a fake project, and reset everything instantly. The normal
                Get Started and Sign In paths still use real accounts.
              </p>
              <div className="demoActions">
                <button className="demoPrimary" onClick={() => setScreen('profile')} type="button">
                  Start Demo
                </button>
                <a className="demoSecondary" href="/landing-prototype">
                  Back to Landing
                </a>
              </div>
            </div>
            <WaltIntro />
          </section>
        )}

        {screen === 'profile' && (
          <section className="demoPanel">
            <div className="demoStepHeader">
              <img src={WALT_AVATAR_URL} alt="Walt" />
              <div>
                <p className="demoEyebrow">Step 1</p>
                <h1>Build a demo profile.</h1>
                <p className="demoPanelLead">
                  This feels like onboarding, but it only saves in this browser session.
                </p>
              </div>
            </div>
            <div className="demoFormGrid">
              <div className="demoField">
                <label>First name</label>
                <input
                  value={state.name}
                  onChange={event => setState(prev => ({ ...prev, name: event.target.value }))}
                  placeholder="Kenny"
                />
              </div>
              <div className="demoField">
                <label>Experience level</label>
                <select
                  value={state.experience}
                  onChange={event => setState(prev => ({ ...prev, experience: event.target.value }))}
                >
                  <option value="">Choose one...</option>
                  <option>Just getting started</option>
                  <option>Handle the basics</option>
                  <option>Done this before</option>
                  <option>Blindfolded</option>
                </select>
              </div>
            </div>
            <div className="demoChoiceGrid">
              {['Maintenance', 'Diagnostics', 'Repairs', 'Upgrades'].map(choice => (
                <button
                  className={`demoChoice ${choice === 'Maintenance' ? 'active' : ''}`}
                  key={choice}
                  type="button"
                >
                  {choice}
                </button>
              ))}
            </div>
            <div className="demoActions">
              <button className="demoPrimary" onClick={saveProfile} type="button">
                Continue to Garage
              </button>
              <button className="demoSecondary" onClick={() => setScreen('start')} type="button">
                Back
              </button>
            </div>
          </section>
        )}

        {screen === 'vehicle' && (
          <section className="demoPanel">
            <div className="demoStepHeader">
              <img src={WALT_AVATAR_URL} alt="Walt" />
              <div>
                <p className="demoEyebrow">Step 2</p>
                <h1>Add a demo vehicle.</h1>
                <p className="demoPanelLead">
                  Show how BYLDit collects useful vehicle context for Walt.
                </p>
              </div>
            </div>
            <div className="demoFormGrid">
              {[
                ['year', 'Year'],
                ['make', 'Make'],
                ['model', 'Model'],
                ['trim', 'Trim'],
                ['engine', 'Engine'],
                ['drivetrain', 'Drivetrain'],
                ['color', 'Color'],
                ['status', 'Status'],
                ['name', 'Nickname'],
              ].map(([key, label]) => (
                <div className="demoField" key={key}>
                  <label>{label}</label>
                  <input
                    value={vehicleDraft[key as keyof DemoVehicle]}
                    onChange={event => setVehicleDraft(prev => ({ ...prev, [key]: event.target.value }))}
                  />
                </div>
              ))}
              <div className="demoField full">
                <label>Notes for Walt</label>
                <textarea
                  value={vehicleDraft.notes}
                  onChange={event => setVehicleDraft(prev => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>
            <div className="demoActions" style={{ marginTop: 20 }}>
              <button className="demoPrimary" onClick={saveVehicle} type="button">
                Save Demo Vehicle
              </button>
              <button className="demoSecondary" onClick={() => setScreen('profile')} type="button">
                Back
              </button>
            </div>
          </section>
        )}

        {screen === 'garage' && vehicle && (
          <section>
            <p className="demoEyebrow">{demoProgress}</p>
            <div className="demoGarageGrid">
              <article className="demoVehicleCard">
                <div className="demoVehicleImage">
                  <img src={vehicle.photo || '/photos/f250-hiboy-68.jpg'} alt={vehicle.name} />
                </div>
                <div className="demoVehicleText">
                  <h2>{vehicle.name}</h2>
                  <p className="demoMuted">
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </p>
                  <p className="demoMuted">
                    {vehicle.engine} · {vehicle.drivetrain} · {vehicle.status}
                  </p>
                </div>
              </article>
              <section className="demoWorkbench">
                <p className="demoEyebrow">{displayName}&apos;s Demo Garage</p>
                <h2>Garage overview</h2>
                <p className="demoMuted">
                  Walt knows this vehicle in the demo, but none of this has been written to Supabase.
                </p>
                <div className="demoTabs">
                  <span className="demoTab active">Overview</span>
                  <span className="demoTab">Projects</span>
                  <span className="demoTab">Drafts</span>
                  <span className="demoTab">History</span>
                </div>
                <div className="demoActions">
                  <button className="demoPrimary" onClick={() => setScreen('project')} type="button">
                    Start Demo Project
                  </button>
                  <button className="demoSecondary" onClick={() => setScreen('vehicle')} type="button">
                    Edit Vehicle
                  </button>
                </div>
              </section>
            </div>
          </section>
        )}

        {screen === 'project' && vehicle && (
          <section className="demoPanel">
            <div className="demoStepHeader">
              <img src={WALT_AVATAR_URL} alt="Walt" />
              <div>
                <p className="demoEyebrow">Step 3</p>
                <h1>Start a demo project.</h1>
                <p className="demoPanelLead">
                  Show how Walt turns vehicle context into a structured project workbench.
                </p>
              </div>
            </div>
            <div className="demoFormGrid">
              <div className="demoField">
                <label>Project name</label>
                <input
                  value={projectDraft.name}
                  onChange={event => setProjectDraft(prev => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="demoField">
                <label>Project mode</label>
                <select
                  value={projectDraft.mode}
                  onChange={event => setProjectDraft(prev => ({ ...prev, mode: event.target.value }))}
                >
                  <option>Maintenance</option>
                  <option>Diagnostics</option>
                  <option>Repair</option>
                  <option>Upgrade</option>
                  <option>Restoration</option>
                </select>
              </div>
            </div>
            <div className="demoProjectList" style={{ marginTop: 20 }}>
              <article className="demoProjectCard">
                <h3>{project?.name || projectDraft.name}</h3>
                <p className="demoMuted">
                  {vehicle.name} · {project?.mode || projectDraft.mode}
                </p>
              </article>
              <div className="demoPhase">
                <p className="demoEyebrow">Phase 1</p>
                <h3>Maintenance Service</h3>
                {['Prepare vehicle and workspace', 'Warm engine and drain oil', 'Replace filter and inspect seal', 'Refill and verify level'].map((step, index) => (
                  <div className="demoStep" key={step}>
                    <strong>{step}</strong>
                    <span>{index === 0 ? 'Complete' : index === 1 ? 'Up Next' : 'Not Started'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="demoActions" style={{ marginTop: 20 }}>
              <button className="demoPrimary" onClick={saveProject} type="button">
                Save Demo Project
              </button>
              <button className="demoSecondary" onClick={() => setScreen('garage')} type="button">
                Back to Garage
              </button>
            </div>
          </section>
        )}
      </main>
      <nav className="demoFooterNav" aria-label="Demo mobile navigation">
        <button onClick={() => setScreen(state.vehicle ? 'garage' : 'vehicle')} type="button">
          Garage
        </button>
        <button onClick={() => setScreen('start')} type="button">
          Walt
        </button>
        <button onClick={() => setScreen(state.vehicle ? 'project' : 'vehicle')} type="button">
          Workbench
        </button>
      </nav>
    </div>
  )
}
