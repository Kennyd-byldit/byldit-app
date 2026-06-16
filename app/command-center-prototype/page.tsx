'use client'

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import './command-center-prototype.css'

type SectionId = 'overview' | 'projects' | 'drafts' | 'history'

type WorkspaceTab = 'Plan' | 'Parts' | 'Decisions' | 'Refs' | 'Notes' | 'History'

type Vehicle = {
  id: string
  name: string
  details: string
  image: string
  photoPosition: string
  projects: number
  drafts: number
  completed: number
  savedParts: number
}

type ActiveItem = {
  section: Exclude<SectionId, 'overview'>
  id: string
} | null

const vehicles: Vehicle[] = [
  {
    id: 'terrys-rig',
    name: "Terry's Rig",
    details: '1968 Ford F-250 Highboy',
    image: '/photos/f250-hiboy-68.jpg',
    photoPosition: 'center 58%',
    projects: 1,
    drafts: 1,
    completed: 5,
    savedParts: 8,
  },
  {
    id: 'ranger',
    name: "KD's Ranger",
    details: '2025 Ford Ranger V6',
    image: '/photos/ranger-2025.jpg',
    photoPosition: 'center 52%',
    projects: 0,
    drafts: 2,
    completed: 1,
    savedParts: 4,
  },
]

const vehicleSections = [
  {
    id: 'overview',
    label: 'Overview',
    children: [],
  },
  {
    id: 'projects',
    label: 'Projects',
    children: ['Oil Change'],
  },
  {
    id: 'drafts',
    label: 'Drafts',
    children: ['3" Lift Research'],
  },
  {
    id: 'history',
    label: 'History',
    children: [],
  },
] satisfies Array<{
  id: SectionId
  label: string
  children: string[]
}>

const sectionContent: Record<
  SectionId,
  {
    headerDetail: string
    headerMode: string
    waltTitle: string
    workbenchLabel: string
    workbenchTitle: string
    status: string[]
    tabs: WorkspaceTab[]
    messages: Array<{ speaker: 'Walt' | 'You'; text: string }>
  }
> = {
  overview: {
    headerDetail: 'Vehicle Overview',
    headerMode: 'Garage',
    waltTitle: 'Vehicle-aware conversation',
    workbenchLabel: 'Vehicle Overview',
    workbenchTitle: 'Vehicle Snapshot',
    status: ['Vehicle Memory', 'Open Work'],
    tabs: ['Plan', 'Parts', 'Notes', 'History'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig open. I can help you review projects, drafts, parts, notes, and service history from the Workbench.",
      },
      {
        speaker: 'You',
        text: 'Show me what is currently open for this vehicle.',
      },
      {
        speaker: 'Walt',
        text: 'You have one active oil change project, one lift research draft, eight saved parts, and five completed project records.',
      },
    ],
  },
  projects: {
    headerDetail: 'Projects',
    headerMode: 'Vehicle',
    waltTitle: 'Projects-aware conversation',
    workbenchLabel: 'Vehicle Projects',
    workbenchTitle: 'Projects',
    status: ['Project List', 'Choose One'],
    tabs: ['Plan', 'Parts', 'Notes', 'History'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig projects open. Pick a project and I'll shift into that specific plan, parts, decisions, and notes.",
      },
      {
        speaker: 'You',
        text: 'Show me the open projects for this vehicle.',
      },
      {
        speaker: 'Walt',
        text: 'There is one open project: Oil Change. Open it when you want the full Workbench view.',
      },
    ],
  },
  drafts: {
    headerDetail: 'Drafts',
    headerMode: 'Vehicle',
    waltTitle: 'Drafts-aware conversation',
    workbenchLabel: 'Vehicle Drafts',
    workbenchTitle: 'Drafts',
    status: ['Draft List', 'In Progress'],
    tabs: ['Plan', 'Parts', 'Notes'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig drafts open. Drafts are where we can keep talking before turning something into a real project plan.",
      },
      {
        speaker: 'You',
        text: 'Show me the drafts for this vehicle.',
      },
      {
        speaker: 'Walt',
        text: 'There is one open draft: 3-inch lift research. Open it when you want to keep refining the idea.',
      },
    ],
  },
  history: {
    headerDetail: 'Project History',
    headerMode: 'Vehicle',
    waltTitle: 'History-aware conversation',
    workbenchLabel: 'Project History',
    workbenchTitle: 'Completed Projects',
    status: ['5 completed records', 'Service log'],
    tabs: ['History', 'Parts', 'Decisions', 'Refs', 'Notes'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig project history open. This is where completed projects, service notes, mileage, and parts used should live long term.",
      },
      {
        speaker: 'You',
        text: 'Show me the last maintenance record.',
      },
      {
        speaker: 'Walt',
        text: 'The most recent completed record is a brake inspection. It saved the inspection notes, no parts purchased, and a follow-up reminder to recheck pedal feel.',
      },
    ],
  },
}

const itemContent = {
  oilChange: {
    headerDetail: 'Oil Change',
    headerMode: 'Maintenance',
    waltTitle: 'Project-aware conversation',
    workbenchLabel: 'Project Workbench',
    workbenchTitle: 'Oil Change',
    status: ['Active Project', 'Step 2 Up Next'],
    tabs: ['Plan', 'Parts', 'Decisions', 'Refs', 'Notes', 'History'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig, the oil change project, and the service history pulled in. Last time you wanted to compare filter options before saving the parts.",
      },
      {
        speaker: 'You',
        text: 'Show me the current oil change plan and what parts we have saved.',
      },
      {
        speaker: 'Walt',
        text: 'You have one maintenance phase with five steps. I saved premium synthetic oil, a Motorcraft-style filter option, a drain plug washer note, and a reminder to log mileage when the work is complete.',
      },
    ],
  },
  liftResearch: {
    headerDetail: '3" Lift Research',
    headerMode: 'Draft',
    waltTitle: 'Draft-building conversation',
    workbenchLabel: 'Draft Workbench',
    workbenchTitle: '3" Lift Research',
    status: ['Open Draft', 'Needs Decisions'],
    tabs: ['Plan', 'Parts', 'Decisions', 'Refs', 'Notes'],
    messages: [
      {
        speaker: 'Walt',
        text: "This lift research draft is still open. We have not generated a full project plan yet, so I'm keeping the conversation focused on goals, parts, fitment, and decisions.",
      },
      {
        speaker: 'You',
        text: 'What still needs to be decided before this becomes a project?',
      },
      {
        speaker: 'Walt',
        text: 'We still need to decide lift height, wheel and tire goals, shock preference, budget range, and whether this is mostly road comfort or trail capability.',
      },
    ],
  },
  brakeDiagnosis: {
    headerDetail: 'Brake Pedal Diagnosis',
    headerMode: 'Completed',
    waltTitle: 'History-record conversation',
    workbenchLabel: 'Completed Project',
    workbenchTitle: 'Brake Pedal Diagnosis',
    status: ['Completed', 'Service Record'],
    tabs: ['History', 'Parts', 'Decisions', 'Refs', 'Notes'],
    messages: [
      {
        speaker: 'Walt',
        text: "I have Terry's Rig brake pedal diagnosis record open. This is the completed project history and what we saved from that work.",
      },
      {
        speaker: 'You',
        text: 'What did we save from that project?',
      },
      {
        speaker: 'Walt',
        text: 'We saved the inspection notes, no purchased parts, and a reminder to recheck pedal feel after the truck sits overnight.',
      },
    ],
  },
} satisfies Record<
  string,
  {
    headerDetail: string
    headerMode: string
    waltTitle: string
    workbenchLabel: string
    workbenchTitle: string
    status: string[]
    tabs: WorkspaceTab[]
    messages: Array<{ speaker: 'Walt' | 'You'; text: string }>
  }
>

const projectSteps = [
  { title: 'Prepare vehicle and workspace', status: 'Complete' },
  { title: 'Warm engine and drain oil', status: 'Up Next' },
  { title: 'Replace filter and inspect seal', status: 'Not Started' },
  { title: 'Refill and verify level', status: 'Not Started' },
  { title: 'Save mileage and service notes', status: 'Not Started' },
]

const savedParts = [
  { name: 'Premium synthetic oil', detail: 'Saved as preferred option' },
  { name: 'Oil filter', detail: 'Compare OEM-style vs premium' },
  { name: 'Drain plug washer', detail: 'Confirm before checkout' },
]

const decisions = [
  "Use the same oil weight unless Walt finds a vehicle-specific reason to change.",
  "Save final brand, filter, and mileage to the vehicle's service history.",
]

const draftTasks = [
  'Confirm lift height and tire size target',
  'Compare Bilstein, Fox, and Rancho shock options',
  'Decide whether the project should prioritize stance, comfort, or capability',
]

const historyRecords = [
  { title: 'Brake pedal diagnosis', detail: 'Completed inspection notes saved' },
  { title: 'Battery replacement', detail: 'Parts and install date logged' },
  { title: 'Initial garage profile', detail: 'Vehicle details and photos saved' },
]

const waltNotes = [
  'Keep upgrades reversible when possible.',
  'User prefers clean road manners over aggressive off-road setup.',
  'Ask before adding suggested parts to the selected parts list.',
]

function BYLDitLogo() {
  return (
    <span className="ccLogo" aria-label="BYLDit">
      <span className="ccLogoByld">BYLD</span>
      <span className="ccLogoIt">it</span>
    </span>
  )
}

function WaltName() {
  return <span className="ccWaltName">Walt</span>
}

function getSectionCount(sectionId: SectionId, vehicle: Vehicle) {
  if (sectionId === 'projects') {
    return vehicle.projects
  }

  if (sectionId === 'drafts') {
    return vehicle.drafts
  }

  if (sectionId === 'history') {
    return vehicle.completed
  }

  return null
}

function personalizeMessage(message: string, vehicle: Vehicle) {
  return message
    .replaceAll("Terry's Rig", vehicle.name)
    .replaceAll('this truck', 'this vehicle')
}

export default function CommandCenterPrototype() {
  const [waltWidth, setWaltWidth] = useState(38)
  const [viewMode, setViewMode] = useState('Workbench')
  const [activeSection, setActiveSection] = useState<SectionId>('projects')
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Plan')
  const [activeVehicleId, setActiveVehicleId] = useState(vehicles[0].id)
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(true)
  const [isWorkbenchFirst, setIsWorkbenchFirst] = useState(false)
  const [activeItem, setActiveItem] = useState<ActiveItem>(null)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)

  const activeVehicle =
    vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0]
  const editingVehicle = editingVehicleId
    ? vehicles.find((vehicle) => vehicle.id === editingVehicleId)
    : null
  const activeContent =
    activeItem?.id && activeItem.id in itemContent
      ? itemContent[activeItem.id as keyof typeof itemContent]
      : sectionContent[activeSection]
  const selectedGarageItem = activeItem?.id ?? activeSection

  const setPreset = useCallback((mode: string, width: number) => {
    setViewMode(mode)
    setWaltWidth(width)
  }, [])

  const selectSection = useCallback((sectionId: SectionId) => {
    const nextContent = sectionContent[sectionId]
    setActiveSection(sectionId)
    setActiveTab(nextContent.tabs[0])
    setActiveItem(null)
  }, [])

  const selectVehicle = useCallback((vehicleId: string) => {
    if (vehicleId === activeVehicleId) {
      setIsVehicleMenuOpen((current) => !current)
      return
    }

    setActiveVehicleId(vehicleId)
    setIsVehicleMenuOpen(true)
    setActiveSection('overview')
    setActiveTab(sectionContent.overview.tabs[0])
    setActiveItem(null)
  }, [activeVehicleId])

  const selectItem = useCallback((section: Exclude<SectionId, 'overview'>, id: string) => {
    const nextContent = itemContent[id as keyof typeof itemContent]
    if (!nextContent) {
      return
    }

    setActiveSection(section)
    setActiveItem({ section, id })
    setActiveTab(nextContent.tabs[0])
  }, [])

  const startResize = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const workspace = event.currentTarget.closest('.mainWorkspace')
      if (!(workspace instanceof HTMLElement)) {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      const workspaceBox = workspace.getBoundingClientRect()

      const resize = (moveEvent: globalThis.PointerEvent) => {
        const firstPanelWidth =
          ((moveEvent.clientX - workspaceBox.left) / workspaceBox.width) * 100
        const nextWaltWidth = isWorkbenchFirst
          ? 100 - firstPanelWidth
          : firstPanelWidth
        const nextWidth = Math.min(66, Math.max(30, nextWaltWidth))
        setWaltWidth(nextWidth)
        setViewMode('Custom')
      }

      const stopResize = () => {
        window.removeEventListener('pointermove', resize)
        window.removeEventListener('pointerup', stopResize)
      }

      window.addEventListener('pointermove', resize)
      window.addEventListener('pointerup', stopResize)
    },
    [isWorkbenchFirst],
  )

  const workspaceStyle = {
    '--first-panel-width': `${isWorkbenchFirst ? 100 - waltWidth : waltWidth}%`,
  } as CSSProperties

  const suggestionPrompts = useMemo(() => {
    if (activeSection === 'drafts') {
      if (activeItem?.section === 'drafts') {
        return ['What decisions are left?', 'Compare lift kits', 'Build the draft']
      }

      return ['Show open drafts', 'Start new draft', 'What needs attention?']
    }

    if (activeSection === 'projects') {
      if (activeItem?.section === 'projects') {
        return ['Show parts', 'Walk me through step 2', 'Compare filter options']
      }

      return ['Show open projects', 'Start with Walt', 'What is up next?']
    }

    if (activeSection === 'history') {
      if (activeItem?.section === 'history') {
        return ['Show record notes', 'Find parts used', 'Summarize follow-ups']
      }

      return ['Show last service', 'Find parts used', 'Summarize history']
    }

    if (activeSection === 'overview') {
      return ['Show open work', 'Summarize garage', 'What needs attention?']
    }

    return ['Show parts', 'Walk me through step 2', 'Compare filter options']
  }, [activeSection, activeItem])

  const openOverviewProject = useCallback(() => {
    selectItem('projects', 'oilChange')
  }, [selectItem])

  const openOverviewDraft = useCallback(() => {
    selectItem('drafts', 'liftResearch')
  }, [selectItem])

  const openOverviewHistoryRecord = useCallback(() => {
    selectItem('history', 'brakeDiagnosis')
  }, [selectItem])

  return (
    <main className="commandCenterPage">
      <aside className="garageRail" aria-label="Garage navigation">
        <div className="railHeader">
          <BYLDitLogo />
        </div>

        <div className="railTitleBlock">
          <h1>KD&apos;s Garage</h1>
        </div>

        <div className="railScroll">
          <div className="vehicleList">
            {vehicles.map((vehicle) => (
              <div className="vehicleGroup" key={vehicle.id}>
                <article
                  className={
                    vehicle.id === activeVehicle.id
                      ? 'vehicleCard selected'
                      : 'vehicleCard'
                  }
                >
                  <button
                    className="vehicleCardMain"
                    onClick={() => selectVehicle(vehicle.id)}
                    type="button"
                  >
                    <img
                      src={vehicle.image}
                      alt=""
                      style={{ objectPosition: vehicle.photoPosition }}
                    />
                  </button>
                  <div className="vehicleCardBody">
                    <button
                      className="vehicleInfoButton"
                      onClick={() => selectVehicle(vehicle.id)}
                      type="button"
                    >
                      <span>
                        <h2>{vehicle.name}</h2>
                        <p>{vehicle.details}</p>
                      </span>
                    </button>
                    <button
                      className="vehicleEditButton"
                      type="button"
                      onClick={() => setEditingVehicleId(vehicle.id)}
                      aria-label={`Edit ${vehicle.name} vehicle details and photo`}
                    >
                      Edit
                    </button>
                  </div>
                </article>

                {vehicle.id === activeVehicle.id && isVehicleMenuOpen ? (
                  <nav
                    className="vehicleSectionList"
                    aria-label="Selected vehicle sections"
                  >
                    <div className="sectionListHeader">
                      <div>
                        <span>{vehicle.name}</span>
                        <strong>Selected Vehicle</strong>
                      </div>
                      <button
                        aria-label="Collapse selected vehicle menu"
                        onClick={() => setIsVehicleMenuOpen(false)}
                        type="button"
                      >
                        Hide
                      </button>
                    </div>
                    {vehicleSections.map((section) => {
                      const count = getSectionCount(section.id, vehicle)

                      return (
                        <div className="sectionGroup" key={section.label}>
                          <button
                            className={
                              selectedGarageItem === section.id
                                ? 'sectionLink active'
                                : 'sectionLink'
                            }
                            onClick={() => selectSection(section.id)}
                            type="button"
                          >
                            <span>{section.label}</span>
                            {count ? <strong>{count}</strong> : null}
                          </button>
                          {activeSection === section.id &&
                          section.children.length ? (
                            <div className="sectionChildren">
                              {section.children.map((child) => (
                                <button
                                  className="childLink active"
                                  data-active={
                                    (section.id === 'drafts' &&
                                      selectedGarageItem === 'liftResearch') ||
                                    (section.id === 'projects' &&
                                      selectedGarageItem === 'oilChange')
                                      ? 'true'
                                      : undefined
                                  }
                                  onClick={() => {
                                    if (section.id === 'drafts') {
                                      selectItem('drafts', 'liftResearch')
                                      return
                                    }

                                    if (section.id === 'projects') {
                                      selectItem('projects', 'oilChange')
                                    }
                                  }}
                                  type="button"
                                  key={child}
                                >
                                  <span>{child}</span>
                                  <small>
                                    {section.id === 'drafts'
                                      ? 'Draft Workbench'
                                      : 'Project Workbench'}
                                  </small>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </nav>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="railFooter">
          <div className="railActions">
            <button className="quietButton" type="button">
              Add Vehicle
            </button>
          </div>
          <div className="accountStrip">
            <div className="accountAvatar">K</div>
            <div>
              <strong>Kenny</strong>
              <span>Profile & billing</span>
            </div>
            <button type="button" aria-label="Open settings">
              ⚙
            </button>
          </div>
        </div>
      </aside>

      <div className="mainWorkspace" style={workspaceStyle}>
        <header className="globalWorkspaceHeader">
          <div className="globalContext">
            <h2>
              {activeVehicle.name} <span>/</span> {activeContent.headerDetail}{' '}
              <span>/</span> <strong>{activeContent.headerMode}</strong>
            </h2>
          </div>
          <div className="layoutPresets" aria-label="Viewing options">
            <span>Viewing Options</span>
            <button
              className={viewMode === 'Balanced' ? 'active' : ''}
              onClick={() => setPreset('Balanced', 48)}
              type="button"
            >
              Balanced
            </button>
            <button
              className={viewMode === 'Workbench' ? 'active' : ''}
              onClick={() => setPreset('Workbench', 38)}
              type="button"
            >
              Workbench
            </button>
            <button
              className={viewMode === 'Walt Focus' ? 'active' : ''}
              onClick={() => setPreset('Walt Focus', 62)}
              type="button"
            >
              Walt Focus
            </button>
            <button
              className="swapButton"
              onClick={() => setIsWorkbenchFirst((current) => !current)}
              type="button"
            >
              Swap
            </button>
          </div>
        </header>

        {!isWorkbenchFirst ? (
          <>
            <WaltPanel
              activeContent={activeContent}
              activeVehicle={activeVehicle}
              suggestionPrompts={suggestionPrompts}
            />
            <ResizeHandle startResize={startResize} />
            <WorkbenchPanel
              activeContent={activeContent}
              activeItem={activeItem}
              activeSection={activeSection}
              activeTab={activeTab}
              activeVehicle={activeVehicle}
              openOverviewDraft={openOverviewDraft}
              openOverviewHistoryRecord={openOverviewHistoryRecord}
              openOverviewProject={openOverviewProject}
              setActiveTab={setActiveTab}
            />
          </>
        ) : (
          <>
            <WorkbenchPanel
              activeContent={activeContent}
              activeItem={activeItem}
              activeSection={activeSection}
              activeTab={activeTab}
              activeVehicle={activeVehicle}
              openOverviewDraft={openOverviewDraft}
              openOverviewHistoryRecord={openOverviewHistoryRecord}
              openOverviewProject={openOverviewProject}
              setActiveTab={setActiveTab}
            />
            <ResizeHandle startResize={startResize} />
            <WaltPanel
              activeContent={activeContent}
              activeVehicle={activeVehicle}
              suggestionPrompts={suggestionPrompts}
            />
          </>
        )}
      </div>

      {editingVehicle ? (
        <VehicleEditDrawer
          vehicle={editingVehicle}
          onClose={() => setEditingVehicleId(null)}
        />
      ) : null}
    </main>
  )
}

function VehicleEditDrawer({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle
  onClose: () => void
}) {
  return (
    <div className="vehicleEditOverlay" role="presentation">
      <aside
        className="vehicleEditDrawer"
        aria-label={`Edit ${vehicle.name} vehicle details and photo`}
      >
        <header className="vehicleEditHeader">
          <div>
            <p className="eyebrow">Garage Vehicle</p>
            <h2>Edit {vehicle.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close vehicle editor">
            ×
          </button>
        </header>

        <div className="vehicleEditScroll">
          <section className="vehicleEditPhoto">
            <img
              src={vehicle.image}
              alt=""
              style={{ objectPosition: vehicle.photoPosition }}
            />
            <div>
              <h3>Vehicle Photo</h3>
              <p>Replace the garage card image or upload a better angle.</p>
              <button type="button">Upload New Photo</button>
            </div>
          </section>

          <section className="vehicleEditSection">
            <h3>Vehicle Identity</h3>
            <div className="vehicleEditGrid">
              <label>
                Nickname
                <input defaultValue={vehicle.name} />
              </label>
              <label>
                Year
                <input defaultValue={vehicle.id === 'ranger' ? '2025' : '1968'} />
              </label>
              <label>
                Make
                <input defaultValue="Ford" />
              </label>
              <label>
                Model
                <input defaultValue={vehicle.id === 'ranger' ? 'Ranger' : 'F-250'} />
              </label>
              <label>
                Trim
                <input defaultValue={vehicle.id === 'ranger' ? 'V6' : 'Highboy'} />
              </label>
              <label>
                Color
                <input defaultValue={vehicle.id === 'ranger' ? 'White' : 'Blue'} />
              </label>
            </div>
          </section>

          <section className="vehicleEditSection">
            <h3>Powertrain & Details</h3>
            <div className="vehicleEditGrid">
              <label>
                Engine
                <input defaultValue={vehicle.id === 'ranger' ? 'V6' : 'V8'} />
              </label>
              <label>
                Drivetrain
                <input defaultValue="4WD" />
              </label>
              <label>
                VIN
                <input defaultValue="Add VIN" />
              </label>
              <label>
                Mileage
                <input defaultValue="Add mileage" />
              </label>
            </div>
          </section>

          <section className="vehicleEditSection">
            <h3>Vehicle Notes</h3>
            <textarea defaultValue="Keep this vehicle's profile current so Walt can make better project and parts recommendations." />
          </section>
        </div>

        <footer className="vehicleEditFooter">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={onClose}>
            Save Vehicle
          </button>
        </footer>
      </aside>
    </div>
  )
}

function ResizeHandle({
  startResize,
}: {
  startResize: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      className="workspaceResizeHandle"
      onPointerDown={startResize}
      type="button"
      aria-label="Resize Walt and workbench panels"
    >
      <span />
    </button>
  )
}

function WaltPanel({
  activeContent,
  activeVehicle,
  suggestionPrompts,
}: {
  activeContent: (typeof sectionContent)[SectionId]
  activeVehicle: Vehicle
  suggestionPrompts: string[]
}) {
  return (
    <section className="waltCenter" aria-label="Walt conversation">
      <header className="workspaceHeader">
        <div>
          <p className="eyebrow">Ask Walt</p>
          <h2>{activeContent.waltTitle}</h2>
        </div>
        <div className="panelControls" aria-label="Walt panel controls">
          <button type="button" aria-label="Focus Walt panel">
            ⤢
          </button>
          <button type="button" aria-label="New Walt thread">
            +
          </button>
        </div>
      </header>

      <div className="waltScroll">
        <div className="chatTimeline">
          {activeContent.messages.map((message) => (
            <article
              className={
                message.speaker === 'Walt' ? 'chatMessage walt' : 'chatMessage user'
              }
              key={message.text}
            >
              {message.speaker === 'Walt' ? (
                <img src="/avatars/walt-v1.png" alt="" />
              ) : (
                <div className="userAvatar">K</div>
              )}
              <div>
                <span>{message.speaker === 'Walt' ? <WaltName /> : 'You'}</span>
                <p>{personalizeMessage(message.text, activeVehicle)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="suggestionRow" aria-label="Suggested Walt prompts">
        {suggestionPrompts.map((prompt) => (
          <button type="button" key={prompt}>
            {prompt}
          </button>
        ))}
      </div>

      <form className="waltComposer">
        <label htmlFor="waltPrompt">Message Walt</label>
        <div>
          <input
            id="waltPrompt"
            placeholder="Ask Walt about this project, step, part, or decision..."
            type="text"
          />
          <button type="button">Send</button>
        </div>
      </form>
    </section>
  )
}

function WorkbenchPanel({
  activeContent,
  activeItem,
  activeSection,
  activeTab,
  activeVehicle,
  openOverviewDraft,
  openOverviewHistoryRecord,
  openOverviewProject,
  setActiveTab,
}: {
  activeContent: (typeof sectionContent)[SectionId]
  activeItem: ActiveItem
  activeSection: SectionId
  activeTab: WorkspaceTab
  activeVehicle: Vehicle
  openOverviewDraft: () => void
  openOverviewHistoryRecord: () => void
  openOverviewProject: () => void
  setActiveTab: (tab: WorkspaceTab) => void
}) {
  return (
    <aside className="workbenchPanel" aria-label="Project workbench">
      <div className="workbenchSticky">
        <div className="workbenchTop">
          <div>
            <p className="eyebrow">{activeContent.workbenchLabel}</p>
            <h2>
              {activeSection === 'overview'
                ? activeVehicle.name
                : activeContent.workbenchTitle}
            </h2>
          </div>
          <div className="panelControls" aria-label="Workbench panel controls">
            <button type="button" aria-label="Expand workbench">
              ⤢
            </button>
            <button type="button" aria-label="Collapse workbench">
              ›
            </button>
          </div>
        </div>
        <div className="workbenchStatus">
          {activeContent.status.map((status) => (
            <span key={status}>{status}</span>
          ))}
        </div>

        <div className="workbenchTabs" aria-label="Workbench sections">
          {activeContent.tabs.map((tab) => (
            <button
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
              type="button"
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="workbenchScroll">
        {activeSection === 'overview' ? (
          <>
            <section className="planCard">
              <div className="planCardHeader">
                <div>
                  <span>Garage Snapshot</span>
                  <h3>{activeVehicle.name} Activity</h3>
                </div>
                <strong>Today</strong>
              </div>
              <div className="overviewGrid">
                <article>
                  <strong>{activeVehicle.projects}</strong>
                  <span>Projects</span>
                </article>
                <article>
                  <strong>{activeVehicle.drafts}</strong>
                  <span>Drafts</span>
                </article>
                <article>
                  <strong>{activeVehicle.savedParts}</strong>
                  <span>Saved Parts</span>
                </article>
                <article>
                  <strong>{activeVehicle.completed}</strong>
                  <span>Completed</span>
                </article>
              </div>
              <div className="overviewActions">
                <button type="button">Start with Walt</button>
                <button type="button">Start Project</button>
              </div>
            </section>
            <section className="benchCard">
              <div className="benchCardHeader">
                <h3>Vehicle Parts & Notes</h3>
                <a href="#">Open</a>
              </div>
              {savedParts.map((part) => (
                <article className="partRow" key={part.name}>
                  <div>
                    <h4>{part.name}</h4>
                    <p>{part.detail}</p>
                  </div>
                  <button type="button">Open</button>
                </article>
              ))}
            </section>
          </>
        ) : null}

        {activeSection === 'projects' && !activeItem ? (
          <section className="benchCard">
            <div className="benchCardHeader">
              <h3>Open Projects</h3>
              <a href="#">Start Project</a>
            </div>
            <article className="partRow featuredRow">
              <div>
                <h4>Oil Change</h4>
                <p>Maintenance project with one phase and five steps.</p>
              </div>
              <button onClick={openOverviewProject} type="button">
                Open
              </button>
            </article>
          </section>
        ) : null}

        {activeSection === 'projects' && activeItem?.id === 'oilChange' ? (
          <>
            <section className="planCard">
              <div className="planCardHeader">
                <div>
                  <span>Phase 1</span>
                  <h3>Maintenance Service</h3>
                </div>
                <strong>1 of 1</strong>
              </div>
              <div className="stepList">
                {projectSteps.map((step) => (
                  <article
                    className={
                      step.status === 'Up Next' ? 'stepItem upNext' : 'stepItem'
                    }
                    key={step.title}
                  >
                    <div>
                      <h4>{step.title}</h4>
                      <p>{step.status}</p>
                    </div>
                    <span aria-hidden="true" />
                  </article>
                ))}
              </div>
            </section>

            <section className="benchCard">
              <div className="benchCardHeader">
                <h3>Project Parts</h3>
                <a href="#">View all</a>
              </div>
              {savedParts.map((part) => (
                <article className="partRow" key={part.name}>
                  <div>
                    <h4>{part.name}</h4>
                    <p>{part.detail}</p>
                  </div>
                  <button type="button">Open</button>
                </article>
              ))}
            </section>

            <section className="benchCard">
              <div className="benchCardHeader">
                <h3>Saved Decisions & Notes</h3>
                <a href="#">Add note</a>
              </div>
              <ul className="decisionList">
                {decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {activeSection === 'drafts' && !activeItem ? (
          <section className="benchCard">
            <div className="benchCardHeader">
              <h3>Open Drafts</h3>
              <a href="#">New Draft</a>
            </div>
            <article className="partRow featuredRow">
              <div>
                <h4>3&quot; Lift Research</h4>
                <p>Fitment, budget, wheel and tire decisions still open.</p>
              </div>
              <button onClick={openOverviewDraft} type="button">
                Open
              </button>
            </article>
          </section>
        ) : null}

        {activeSection === 'drafts' && activeItem?.id === 'liftResearch' ? (
          <>
            <section className="planCard">
              <div className="planCardHeader">
                <div>
                  <span>Draft Builder</span>
                  <h3>Open Questions</h3>
                </div>
                <strong>Draft</strong>
              </div>
              <div className="stepList">
                {draftTasks.map((task) => (
                  <article className="stepItem upNext" key={task}>
                    <div>
                      <h4>{task}</h4>
                      <p>Needs Walt intake</p>
                    </div>
                    <span aria-hidden="true" />
                  </article>
                ))}
              </div>
            </section>
            <section className="benchCard">
              <div className="benchCardHeader">
                <h3>Draft Parts & Notes</h3>
                <a href="#">Review</a>
              </div>
              <ul className="decisionList">
                {waltNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {activeSection === 'history' && !activeItem ? (
          <section className="benchCard">
            <div className="benchCardHeader">
              <h3>Completed Projects</h3>
              <a href="#">Export</a>
            </div>
            {historyRecords.map((record) => (
              <article className="partRow" key={record.title}>
                <div>
                  <h4>{record.title}</h4>
                  <p>{record.detail}</p>
                </div>
                <button
                  onClick={
                    record.title === 'Brake pedal diagnosis'
                      ? openOverviewHistoryRecord
                      : undefined
                  }
                  type="button"
                >
                  View
                </button>
              </article>
            ))}
          </section>
        ) : null}

        {activeSection === 'history' && activeItem?.id === 'brakeDiagnosis' ? (
          <section className="benchCard">
            <div className="benchCardHeader">
              <h3>Brake Pedal Diagnosis</h3>
              <a href="#">Export</a>
            </div>
            <ul className="decisionList">
              <li>Completed inspection notes saved.</li>
              <li>No parts were purchased for this diagnostic project.</li>
              <li>Follow-up reminder saved: recheck pedal feel after sitting.</li>
            </ul>
          </section>
        ) : null}
      </div>
    </aside>
  )
}
