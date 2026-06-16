'use client'

import { useState } from 'react'
import './mobile-command-center-prototype.css'

type MobileView = 'garage' | 'walt' | 'workbench'

const vehicles = [
  {
    id: 'terrys-rig',
    name: "Terry's Rig",
    details: '1968 Ford F-250 Highboy',
    image: '/photos/f250-hiboy-68.jpg',
    meta: '1 project · 1 draft · 5 history',
  },
  {
    id: 'ranger',
    name: "KD's Ranger",
    details: '2025 Ford Ranger V6',
    image: '/photos/ranger-2025.jpg',
    meta: '0 projects · 2 drafts · 1 history',
  },
]

const workbenchSteps = [
  { title: 'Prepare vehicle and workspace', status: 'Complete' },
  { title: 'Warm engine and drain oil', status: 'Up next' },
  { title: 'Replace filter and inspect seal', status: 'Not started' },
]

function BYLDitLogo() {
  return (
    <span className="mobileLogo" aria-label="BYLDit">
      <span>BYLD</span>
      <strong>it</strong>
    </span>
  )
}

export default function MobileCommandCenterPrototype() {
  const [activeView, setActiveView] = useState<MobileView>('garage')
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0])
  const [openVehicleId, setOpenVehicleId] = useState<string | null>(null)

  return (
    <main className="mobilePrototypePage">
      <section className="phoneShell" aria-label="Mobile command center sketch">
        <div className="phoneStatusBar">
          <span>9:41</span>
          <span>BYLDit</span>
        </div>

        <header className="mobileTopBar">
          <BYLDitLogo />
          <button className="mobileProfileButton" type="button" aria-label="Open profile settings and billing">
            K
          </button>
        </header>

        {activeView !== 'garage' ? (
          <section className="mobileContextCard">
            <div>
              <p>Current Context</p>
              <h1>{selectedVehicle.name}</h1>
              <span>Oil Change / Maintenance</span>
            </div>
            <img src="/avatars/walt-v1.png" alt="" />
          </section>
        ) : null}

        <div className="mobileScreen">
          {activeView === 'garage' ? (
            <GarageView
              openVehicleId={openVehicleId}
              selectedVehicleId={selectedVehicle.id}
              setActiveView={setActiveView}
              setOpenVehicleId={setOpenVehicleId}
              setSelectedVehicle={setSelectedVehicle}
            />
          ) : null}

          {activeView === 'walt' ? <WaltView /> : null}

          {activeView === 'workbench' ? <WorkbenchView /> : null}
        </div>

        <nav className="mobileBottomNav" aria-label="Mobile command center navigation">
          <button
            className={activeView === 'garage' ? 'active' : ''}
            onClick={() => setActiveView('garage')}
            type="button"
          >
            <span>▣</span>
            Garage
          </button>
          <button
            className={activeView === 'walt' ? 'active' : ''}
            onClick={() => setActiveView('walt')}
            type="button"
          >
            <img src="/avatars/walt-v1.png" alt="" />
            Walt
          </button>
          <button
            className={activeView === 'workbench' ? 'active' : ''}
            onClick={() => setActiveView('workbench')}
            type="button"
          >
            <span>▤</span>
            Workbench
          </button>
        </nav>
      </section>

      <aside className="mobileSketchNotes">
        <p className="eyebrow">Mobile Sketch</p>
        <h2>Same command center, phone-sized flow.</h2>
        <p>
          The phone version keeps the same mental model, but splits Garage, Walt,
          and Workbench into focused screens instead of squeezing three desktop
          panels onto one display.
        </p>
      </aside>
    </main>
  )
}

function GarageView({
  openVehicleId,
  selectedVehicleId,
  setActiveView,
  setOpenVehicleId,
  setSelectedVehicle,
}: {
  openVehicleId: string | null
  selectedVehicleId: string
  setActiveView: (view: MobileView) => void
  setOpenVehicleId: (vehicleId: string | null) => void
  setSelectedVehicle: (vehicle: (typeof vehicles)[number]) => void
}) {
  return (
    <section className="mobileViewPanel">
      <div className="mobileSectionHeader">
        <p>Garage</p>
        <h2>KD&apos;s Garage</h2>
      </div>

      <div className="mobileVehicleStack">
        {vehicles.map((vehicle) => (
          <article
            className={
              vehicle.id === selectedVehicleId && vehicle.id === openVehicleId
                ? 'mobileVehicleCard selected'
                : 'mobileVehicleCard'
            }
            key={vehicle.id}
          >
            <button
              className="mobileVehicleButton"
              onClick={() => {
                setSelectedVehicle(vehicle)
                setOpenVehicleId(openVehicleId === vehicle.id ? null : vehicle.id)
              }}
              type="button"
            >
              <img src={vehicle.image} alt="" />
            </button>
            <div className="mobileVehicleBody">
              <button
                className="mobileVehicleInfo"
                onClick={() => {
                  setSelectedVehicle(vehicle)
                  setOpenVehicleId(openVehicleId === vehicle.id ? null : vehicle.id)
                }}
                type="button"
              >
                <span>
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.details}</p>
                </span>
              </button>
              <button
                className="mobileVehicleEdit"
                type="button"
                aria-label={`Edit ${vehicle.name} vehicle details and photo`}
              >
                Edit
              </button>
            </div>
            {vehicle.id === selectedVehicleId && vehicle.id === openVehicleId ? (
              <div className="mobileBucketGrid">
                <button type="button">Overview</button>
                <button onClick={() => setActiveView('workbench')} type="button">
                  Projects
                </button>
                <button type="button">Drafts</button>
                <button type="button">History</button>
              </div>
            ) : null}
          </article>
        ))}
        <button className="mobileAddVehicleButton" type="button">
          Add Vehicle
        </button>
      </div>
    </section>
  )
}

function WaltView() {
  return (
    <section className="mobileViewPanel mobileWaltView">
      <div className="mobileSectionHeader">
        <p>Ask Walt</p>
        <h2>Project-aware conversation</h2>
      </div>

      <article className="mobileChatBubble walt">
        <img src="/avatars/walt-v1.png" alt="" />
        <p>
          I have Terry&apos;s Rig and the oil change project open. Want to review
          the plan, parts, or next step?
        </p>
      </article>
      <article className="mobileChatBubble user">
        <p>Walk me through the next step.</p>
      </article>
      <article className="mobileChatBubble walt">
        <img src="/avatars/walt-v1.png" alt="" />
        <p>
          Step 2 is warming the engine and draining the oil. I&apos;ll keep the
          parts and notes connected to this project.
        </p>
      </article>

      <div className="mobilePromptChips">
        <button type="button">Show parts</button>
        <button type="button">Next step</button>
        <button type="button">Save note</button>
      </div>

      <div className="mobileComposer">
        <span>Ask Walt about this project...</span>
        <button type="button">Talk</button>
      </div>
    </section>
  )
}

function WorkbenchView() {
  return (
    <section className="mobileViewPanel">
      <div className="mobileSectionHeader">
        <p>Workbench</p>
        <h2>Oil Change</h2>
      </div>

      <div className="mobileWorkbenchTabs">
        <button className="active" type="button">
          Plan
        </button>
        <button type="button">Parts</button>
        <button type="button">Notes</button>
        <button type="button">History</button>
      </div>

      <section className="mobileWorkbenchCard">
        <div>
          <p>Phase 1</p>
          <h3>Maintenance Service</h3>
        </div>
        {workbenchSteps.map((step) => (
          <article
            className={step.status === 'Up next' ? 'mobileStep upNext' : 'mobileStep'}
            key={step.title}
          >
            <div>
              <h4>{step.title}</h4>
              <span>{step.status}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="mobileWorkbenchCard">
        <div>
          <p>Parts</p>
          <h3>Saved for this project</h3>
        </div>
        <article className="mobilePartRow">
          <span>Premium synthetic oil</span>
          <button type="button">Open</button>
        </article>
        <article className="mobilePartRow">
          <span>Oil filter</span>
          <button type="button">Open</button>
        </article>
      </section>
    </section>
  )
}
