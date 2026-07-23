# Decision Log

This log records durable BYLDit product, technical, and operating decisions that future threads need to understand. It complements detailed feature documentation; it does not replace it.

Add an entry when a decision affects future work, multiple areas, data or architecture, product behavior, or how the project operates. Keep entries concise and link to a more detailed document when one exists.

## Entry Template

```markdown
## YYYY-MM-DD — Short decision title

- **Decision:** What was decided.
- **Reason:** Why this choice was made.
- **Affected areas:** Product, code, data, documentation, workflow, or named features.
- **Supersedes:** No, or the date and title of the earlier decision.
```

If a decision is replaced, retain the earlier entry and update its supersession status or add a cross-reference so the history remains understandable.

## 2026-07-20 — Make the BYLDit Codex project the primary working home

- **Decision:** BYLDit's primary working home is the BYLDit Codex project. Product planning, design thinking, technical discussions, development, debugging, database work, and release planning should happen through focused threads in this project. GitHub is the source of truth, and durable project knowledge must be recorded in repository files rather than depending on chat history.
- **Reason:** Multiple focused threads should be able to work effectively without sharing conversation histories or relying on one enormous conversation. Repository documentation gives every future thread durable, reviewable context.
- **Affected areas:** Project workflow, Codex thread organization, documentation, product planning, engineering, database work, debugging, and release planning.
- **Supersedes:** No.

## 2026-07-20 — Make the Development System the living operating manual

- **Decision:** `docs/DEVELOPMENT_SYSTEM.md` is the living, authoritative operating manual for how BYLDit is developed. Accepted workflow improvements, better practices, and important process decisions must be incorporated so future threads inherit the current way of working.
- **Reason:** The development system should improve through use. Keeping its accepted practices in one authoritative repository document prevents workflow knowledge from becoming trapped in a thread or frozen in the system's initial version.
- **Affected areas:** Development workflow, Codex thread organization, project documentation, process decisions, and onboarding of future threads.
- **Supersedes:** No.

## 2026-07-20 — Define BYLDit's authority and durability model

- **Decision:** BYLDit will keep both code and durable project knowledge in repository files. Codex is the project's primary working home, repository files define the project, GitHub holds the durable canonical copy and is the source of truth, local working copies are temporary working state, and threads are focused workspaces rather than permanent project memory. `docs/DEVELOPMENT_SYSTEM.md` remains the chosen name for the operating manual.
- **Reason:** This model gives BYLDit one logical home while allowing multiple focused threads to collaborate indirectly. It also makes the project resilient to changes in computers, AI models, and conversation history without confusing uncommitted local work with shared canonical state.
- **Affected areas:** Project authority, Git workflow, documentation, Codex thread usage, computer migration, onboarding, and the Development System document name.
- **Supersedes:** No.

## 2026-07-20 — Treat documentation as part of completing work

- **Decision:** When work changes durable product or technical knowledge, the relevant documentation should be updated before the change is considered complete. Code and its related documentation should normally be reviewed, committed, and pushed together, but agents may commit or push only when Kenny explicitly requests it.
- **Reason:** Keeping implementation and shared knowledge together prevents future threads from inheriting stale context while preserving deliberate user control over Git publishing actions.
- **Affected areas:** Definition of completion, documentation maintenance, Git workflow, agent permissions, and thread handoffs.
- **Supersedes:** No.

## 2026-07-20 — Define explicit completion states and standards

- **Decision:** BYLDit work will report one of four completion states: Draft, Implemented Locally, Durably Complete, or Released. A universal Definition of Done applies to all work, with additional standards for product decisions, features, bug fixes, UI/UX changes, Supabase/database changes, and releases. Testing must be proportional to the work, user-facing changes should be manually verified when practical, and partial work must not be described as complete.
- **Reason:** A shared completion vocabulary prevents code-writing, local verification, GitHub durability, and production release from being conflated. Task-specific standards improve reliability without imposing one oversized checklist on every kind of work.
- **Affected areas:** Task planning, final reports, verification, documentation, Git workflow, database operations, deployment, and releases.
- **Supersedes:** No.

## 2026-07-23 — Give the Project Lead direct-routing responsibility

- **Decision:** The BYLDit Project Lead will be the primary coordination point and may route approved work directly to existing specialist or focused Codex threads. The lead should create durable repository task briefs, send concise assignments that point to those briefs, follow progress, collect handoffs, coordinate reviews, and return only meaningful decisions, risks, and approval needs to Kenny. Kenny should not be required to transport routine prompts and responses between teammates.
- **Reason:** Direct routing reduces repetitive copy-and-paste coordination while preserving repository files as shared memory. It lets Kenny focus on product judgment and authorization instead of acting as the communication layer between threads.
- **Affected areas:** Project Lead role, team coordination, task briefs, thread messaging, handoffs, shared working-copy sequencing, and Kenny's involvement in daily workflow.
- **Supersedes:** No.

## 2026-07-23 — Name Marty as BYLDit's Project Lead

- **Decision:** BYLDit's Project Lead is named Marty. Marty is the project's primary coordination point and bus driver, operating the approved Project Lead responsibilities and direct-routing model while Kenny remains the product owner and final decision-maker.
- **Reason:** A stable personal identity makes the standing Project Lead thread easy to recognize, address, and return to while preserving a clearly defined role.
- **Affected areas:** Team roster, Project Lead thread, coordination language, task routing, and future team documentation.
- **Supersedes:** No.

## 2026-07-23 — Establish the initial standing specialist roster

- **Decision:** BYLDit's initial standing team will consist of Marty as Project Lead plus five specialists: Kyle for Product & Walt Experience, Erica for UI/UX, Max for Application Engineering, Rob for Supabase & Data, and Mitch for Quality & Releases. Detailed role boundaries will be defined separately. Temporary focused threads may still own bounded feature, bug, review, or release work.
- **Reason:** These roles cover the durable product and engineering domains BYLDit needs while keeping the permanent team small enough to coordinate. Combining standing domain specialists with temporary focused work prevents both knowledge loss and excessive handoffs.
- **Affected areas:** Team structure, specialist threads, task routing, domain ownership, feature implementation, quality, and releases.
- **Supersedes:** No.

## 2026-07-23 — Approve Marty's complete Project Lead role

- **Decision:** Marty's approved role includes primary communication with Kenny, project coordination, priority management, work sequencing, durable task briefs, direct routing within approved objectives, handoff collection, integration planning, documentation consistency, readiness assessment, and final status reporting. Marty may coordinate routine work without making Kenny the message transport, but Kenny retains approval over major product decisions, material scope changes, priorities, new user-owned threads, unapproved implementation, consequential migrations, publishing, deployment, releases, and destructive actions.
- **Reason:** A complete written role gives Marty enough authority to reduce coordination burden while preserving Kenny's product ownership and control over consequential actions.
- **Affected areas:** Project leadership, communication, task routing, specialist coordination, shared documentation, working-copy safety, approvals, and completion reporting.
- **Supersedes:** No.

## 2026-07-23 — Approve Kyle's Product & Walt Experience role

- **Decision:** Kyle owns BYLDit's product behavior, user journeys, feature requirements, project-mode behavior, Walt's product experience and conversational boundaries, product-facing memory, terminology, acceptance criteria, and product-fidelity review. Kyle owns what Walt should accomplish and how the experience should behave, but not Walt's technical AI implementation, data architecture, visual design, verification strategy, or release authority.
- **Reason:** Separating product intent from design, implementation, data, and quality gives Walt and BYLDit coherent behavior without allowing one specialist to dictate every layer. Kyle's automotive trust rules also require Walt to distinguish requirements, options, recommendations, and confidence without inventing vehicle-specific facts.
- **Affected areas:** Product planning, Walt, automotive guidance, project modes, requirements, acceptance criteria, product documentation, specialist boundaries, and implementation review.
- **Supersedes:** No.

## 2026-07-23 — Approve the remaining standing specialist roles

- **Decision:** Erica owns UI/UX intent and review; Max owns Next.js application architecture and implementation; Rob owns Supabase, durable data, migrations, authorization, and data integrity; and Mitch owns independent quality assessment, Definition-of-Done evidence, and release-readiness recommendations. Each specialist may act within an approved objective but must coordinate cross-domain work through Marty and preserve Kenny's approval authority over material scope, publishing, shared or production changes, and release actions.
- **Reason:** Explicit domain ownership lets specialists develop durable expertise without allowing product, design, application, data, and quality authority to collapse into one role. The boundaries create useful checks while Marty coordinates the complete outcome.
- **Affected areas:** UI/UX, application engineering, Next.js, Supabase, database security, testing, accessibility, release readiness, task routing, approvals, and team handoffs.
- **Supersedes:** No.

## 2026-07-23 — Establish durable task briefs and structured handoffs

- **Decision:** BYLDit will use repository task briefs for material work that crosses threads, involves multiple teammates, preserves approved scope, requires sequential ownership, or needs durable acceptance and verification evidence. Marty owns routing and task control information; each accountable owner provides a structured handoff; and Mitch independently evaluates completion evidence when required. Workflow status is distinct from Definition-of-Done completion state, and a brief does not authorize implementation without recorded approval.
- **Reason:** Durable briefs and handoffs allow Marty to route work directly without making Kenny relay routine messages, while keeping scope, authority, evidence, ownership, and actual completion understandable to future threads.
- **Affected areas:** Task planning, direct routing, approvals, specialist handoffs, editing sequence, verification, completion reporting, shared memory, and work-record retention.
- **Supersedes:** No.

## 2026-07-23 — Standardize standing teammate chat initialization

- **Decision:** Marty, Kyle, Erica, Max, Rob, and Mitch will each use an authoritative repository chat starter that establishes identity, required reading, ownership boundaries, coordination expectations, and first-response behavior. Starting a teammate thread provides role context but does not authorize implementation or consequential actions.
- **Reason:** Standard starters let every standing thread initialize consistently from durable repository knowledge without requiring Kenny to reconstruct role instructions or depend on earlier conversation history.
- **Affected areas:** Teammate onboarding, role continuity, thread creation, shared memory, approval boundaries, and first-response behavior.
- **Supersedes:** No.

## 2026-07-23 — Separate actual implementation state from product intent

- **Decision:** `docs/CURRENT_STATE.md` is the authoritative repository-wide description of what BYLDit actually implements and what has been verified. It must distinguish data-backed behavior, prototypes, placeholders, intended product direction, unknown live-service state, and failed or unavailable verification. It is updated only after implementation state has been inspected and, where applicable, verified.
- **Reason:** Future threads need to know the difference between what BYLDit intends to become and what the current code and environments demonstrably support. A dedicated current-state document prevents proposals and prototypes from being mistaken for integrated behavior.
- **Affected areas:** Shared memory, teammate orientation, implementation handoffs, verification, product planning, technical planning, debugging, and release readiness.
- **Supersedes:** No.
