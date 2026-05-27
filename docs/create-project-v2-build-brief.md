# Create Project v2 Build Brief

Last updated: May 26, 2026

## Why This Exists

The current create-project flow proved the basic pieces of BYLDit, but it treats every project like the same fixed wizard:

`Vehicle -> Goal -> Condition -> Work -> Name -> Budget -> Build Plan`

That flow is too rigid for the real ways people work on vehicles. An oil change, a brake repair, a lift kit upgrade, a full restoration, and a stiff brake pedal diagnosis should not all feel like the same kind of project.

The new direction is:

`Select Vehicle -> Select Project Mode -> Walt Intake Conversation -> Confirm Summary -> Build Project`

This brief is the source of truth for the next architecture pass and the eventual Create Project v2 rebuild.

## Product Vision

BYLDit is not just a project tracker. BYLDit should feel like an AI-powered garage partner that remembers the user's vehicles, conversations, decisions, parts, work history, and progress.

Walt is the face of the brand. The goal is for users to say:

"I just ask Walt."

Walt should act like a ChatGPT-style automotive crew chief, but with one major difference: BYLDit saves the data, organizes the work, and carries memory forward across projects and vehicles.

## Core Flow

Create Project v2 should use a simple structure:

1. Select vehicle.
2. Select project mode.
3. Talk it through with Walt.
4. Walt summarizes what he heard.
5. User confirms with "Build This Project."
6. App creates the structured project and generated plan/checklist/log.

Use buttons for the big fork. Use Walt for the messy details.

## Project Modes

Every project should start from one of five modes.

### Maintenance

User mindset:

"I know the routine task. Help me do it correctly."

Examples:

- Oil change
- Tire rotation
- Brake service
- Battery replacement
- Filters
- Fluids
- Spark plugs

Expected output:

- Guided checklist
- Parts and supplies
- Tools
- Vehicle-specific notes
- Maintenance log
- Repeat-from-last-time support

### Repair

User mindset:

"I know what needs to be fixed or replaced."

Examples:

- Replace alternator
- Replace brake pads and rotors
- Fix leaking radiator
- Replace starter
- Repair window regulator

Expected output:

- Repair plan
- Parts and tools
- Safety notes
- Step-by-step repair guide
- Completion notes

### Upgrade

User mindset:

"I want to make something better, but I may need help choosing the right setup."

Examples:

- 3-inch lift kit
- Wheels and tires
- Lighting
- Audio
- Suspension
- Performance upgrades
- Interior upgrades

Expected output:

- Planning conversation
- Options and tradeoffs
- Brand/manufacturer suggestions
- Fitment considerations
- Budget/preferences
- Install plan

### Restoration

User mindset:

"I have a larger long-term project that needs organization."

Examples:

- Full restoration
- Body and paint
- Interior restoration
- Drivetrain rebuild
- Electrical refresh
- Frame-off or multi-phase build

Expected output:

- Phases and milestones
- Work areas
- Budget/timeline context
- Condition notes
- Project manager style guidance from Walt

### Diagnostic

User mindset:

"Something is wrong, but I do not know the cause yet."

Examples:

- Brake pedal is stiff
- Engine cranks but will not start
- Clunk over bumps
- Overheating
- Electrical issue
- Warning light
- Vibration or noise

Expected output:

- Diagnostic conversation
- Safety-aware first response
- Clarifying questions
- Possible causes
- Checks completed
- Recommended next action
- Ability to convert into a repair project once cause is known

## Walt Intake

Walt's intake conversation should not be a thin form replacement. It should be a real planning conversation that can become a project.

After mode selection, Walt asks a mode-specific opening question:

- Maintenance: "What maintenance are we doing on the [vehicle]?"
- Repair: "What are we fixing or replacing on the [vehicle]?"
- Upgrade: "What are you looking to upgrade on the [vehicle]?"
- Restoration: "What is the restoration goal for the [vehicle]?"
- Diagnostic: "Tell me what is happening. What symptom are you noticing?"

The user can answer briefly or have a longer conversation. Walt should support both.

For example, if the user selects Upgrade and says, "I want a 3-inch lift and new wheels and tires, but I don't know what to buy," Walt should be able to discuss:

- Lift kit types
- Manufacturers
- Tire size
- Wheel offset
- Rubbing/trimming risk
- Daily driver comfort
- Off-road use
- Towing
- Budget
- DIY vs shop install
- Tradeoffs

When the user is ready, Walt should ask:

"Want me to build this as a project?"

## Walt Must Not Be Too Narrow

Walt should be confident, but not falsely narrow.

Bad answer:

"Use Pennzoil 5W-30."

Better answer:

"For this vehicle, we need the correct viscosity and manufacturer spec first. Brand-wise, Pennzoil, Mobil 1, Valvoline, Castrol, and OEM oil can all be valid if they meet the spec. Want budget, OEM-style, or premium recommendations?"

Walt should separate:

1. Requirements: exact vehicle needs, specs, fitment, safety.
2. Options: OEM, aftermarket, budget, premium, performance, heavy-duty.
3. Recommendation: what Walt would choose for the user's use case.
4. Confidence: what is known, what is likely, and what must be verified.

This matters for oil, filters, brake pads, rotors, batteries, tires, lift kits, spark plugs, fluids, tools, and nearly everything else.

## Structured Data From Conversation

The conversation should feel natural, but it must produce structured data behind the scenes.

Save project-level fields such as:

- Project mode
- Vehicle id
- Project name
- Goal summary
- Intake summary
- Budget or budget range
- User priorities
- Symptoms
- Known issue or target system
- Desired upgrade outcome
- Restoration condition and goals
- Work environment
- DIY vs shop preference
- User skill level
- Parts preferences
- Selected parts
- Open questions
- Walt confidence notes

The app should not force the user through separate rigid pages for condition, budget, work environment, and preferences when Walt can collect those naturally in conversation.

## Conversation Memory

Every Walt intake conversation should be saved long term with the project.

Users should be able to revisit an old project and see:

- What they asked
- What Walt recommended
- What options were discussed
- Why they chose certain parts
- What was completed
- What notes were saved
- What issues happened

This is crucial because BYLDit should be more than a one-off answer. It should be a durable project memory system.

## Vehicle History

Completed projects should feed vehicle history.

Walt should be able to use prior projects later.

Example:

"Last time on this Ranger, you used Mobil 1 5W-30, a Motorcraft filter, and logged it at 8,240 miles. Want to repeat that setup, change brands, or update mileage?"

Vehicle history should eventually include:

- Maintenance events
- Repair history
- Upgrade history
- Diagnostic history
- Parts used
- Brands used
- Quantities
- Mileage
- Dates
- Photos
- Notes
- Lessons learned

## Repeat Maintenance

Repeat maintenance is a core use case.

The first oil change may involve a longer Walt conversation. The second oil change on the same vehicle should be much faster because Walt can reference the previous project.

Possible repeat flow:

1. User selects vehicle.
2. User selects Maintenance.
3. User says "oil change."
4. Walt checks history.
5. Walt says, "You've done this before. Want to repeat the last setup?"

Options:

- Repeat last setup
- Change brands/parts
- Ask Walt for new recommendations
- Update mileage and log completion

## Diagnostic To Repair

Diagnostic projects are different because the user does not know the root cause yet.

Diagnostic flow:

1. User selects vehicle.
2. User selects Diagnostic.
3. User describes symptom.
4. Walt gives safety-aware first guidance.
5. Walt asks clarifying questions.
6. Walt builds a diagnostic log.
7. User completes checks.
8. Walt narrows possible causes.
9. When cause is known, BYLDit can convert or branch into a Repair project.

Example:

"Brake pedal is stiff and I can't push it."

Walt should ask about:

- Engine on or off
- Whether the pedal softens after startup
- Warning lights
- Brake fluid level
- Recent brake work
- Hissing noises
- Vacuum/booster behavior where relevant
- Safety concerns

Diagnostic should not be forced into a normal phase/step plan too early.

## Project Output By Mode

The project detail experience should eventually adapt by mode.

- Maintenance: checklist / guided to-do / maintenance log
- Repair: repair sequence with parts, tools, safety, and steps
- Upgrade: options, decisions, parts list, fitment checks, install plan
- Restoration: phases, milestones, long-term progress
- Diagnostic: diagnostic log, questions, tests, possible causes, next action

The database can still use shared tables behind the scenes, but the user-facing experience should fit the type of work.

## Existing App Impact

This does not mean throwing away the current app.

Keep:

- Garage
- Vehicle profile data
- Projects table
- Projects list
- Project detail page
- Walt panel foundation
- Supabase-backed data
- Phases and steps as a useful backend structure for larger work
- Parts, notes, photos, expenses, and progress concepts

Change:

- Create-project should no longer be one fixed wizard for every job.
- Goal page should become project mode selection.
- Condition/work/budget/name screens should be replaced or reduced by Walt-guided intake.
- Plan generation should be mode-aware.
- Project display should become mode-aware over time.

## First Build Slice

Do not rebuild everything at once.

Recommended first implementation:

1. Add project mode support in the data model.
2. Save structured intake summary and full intake transcript.
3. Replace the beginning of create-project with Vehicle -> Mode.
4. Build one shared Walt Intake screen.
5. Support Maintenance first as the proof-of-concept mode.
6. Create a project from the Walt intake summary.
7. Route into the existing project detail flow for now.

Once Maintenance feels right, expand to Repair, Upgrade, Restoration, and Diagnostic.

## Architecture Questions For Next Pass

Before UI work, decide:

- Should `project_mode` live directly on `projects`?
- Should intake details be columns on `projects`, a JSONB field, or a dedicated `project_intake` table?
- Where should the full Walt intake transcript live?
- How should extracted structured memory be stored?
- How do completed projects write into vehicle history?
- How should repeat maintenance query prior projects?
- How should diagnostic projects convert into repair projects?
- Which fields are needed now, and which can wait?

## Build Principle

Do not make the app prettier while preserving the wrong mental model.

The next build should make BYLDit understand what kind of automotive work the user is doing, let Walt help shape the project through conversation, and save enough memory that the app gets smarter the next time the user comes back.
