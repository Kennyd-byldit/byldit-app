# BYLDit Current State

Last verified: July 23, 2026

This document describes what is actually present and verified in the BYLDit repository. Product briefs describe intended behavior; this file describes implemented behavior, known prototypes, verification evidence, and current limitations.

Update this file only after behavior or project state has been inspected and, where applicable, verified. Do not promote proposals, mockups, or unverified assumptions into implemented state.

## Current Phase

BYLDit is an early-stage full-stack preview with meaningful working application flows alongside design prototypes, placeholders, overlapping legacy paths, and unverified external integrations.

The repository is beyond a static mockup:

- It contains a Next.js application with Supabase authentication and persistence code.
- Users can move through account creation, profile setup, vehicle setup, garage, project creation, project planning, and project execution flows in the implementation.
- Walt has a persistent chat panel, contextual database reads, limited write actions, speech input, and text-to-speech integration code.
- AI-generated project plans can be persisted as phases and steps.

The application is not yet production-ready. Build configuration, lint health, automated tests, live-service verification, database-state verification, and several incomplete product surfaces remain unresolved.

## Technology

- Next.js 16.2.2 App Router
- React 19.2.4
- TypeScript 5
- Supabase JavaScript and SSR packages
- PostgreSQL and Supabase Auth, Storage, and Data API
- OpenAI Chat Completions integration for Walt and plan generation
- ElevenLabs text-to-speech integration
- NHTSA vehicle-data and VIN-decoding integration
- ESLint 9
- Tailwind CSS packages are installed, while much of the current UI uses CSS files and inline styles
- npm lockfile and local `node_modules` are present

## Source Organization

- `app/`: application routes, API routes, onboarding, garage, project, account, and prototype experiences
- `components/`: shared application chrome and the reusable Walt panel
- `lib/`: Supabase client, project modes, shared types, Walt context, prompt, and display helpers
- `supabase/schema.sql`: baseline application schema
- `supabase/profiles.sql`: profile table and signup trigger
- `supabase/migrations/`: incremental schema changes currently stored in the repository
- `docs/`: product knowledge, Development System, team roles, current priorities, decisions, and work coordination
- `public/`: Walt artwork, vehicle photographs, and vehicle line-art assets

## Implemented Application Areas

### Landing And Demo Entry

- `/` currently re-exports the `/landing-prototype` experience.
- The landing experience contains product marketing, example Walt interactions, and links into authentication and demo entry.
- `/demo` records a browser demo-mode flag and redirects into signup.
- Demo reset code exists and can delete an authenticated demo user through an admin client when the required Supabase configuration is available.

Demo-account creation, reset, and external configuration were not exercised during this audit.

### Authentication And Routing

- Email/password signup and signin are implemented.
- Google OAuth initiation is implemented.
- Email password-reset initiation and reset completion are implemented.
- `/auth/callback` exchanges an authentication code for a Supabase session.
- `/start` routes authenticated users based on profile completion and whether they have a saved vehicle.
- Unauthenticated application routes generally redirect to login.

Live authentication-provider configuration and end-to-end email/OAuth behavior were not verified during this audit.

### Profile Onboarding

- `/profile-setup` loads and saves a Supabase profile.
- The implemented profile captures identity, location, visibility, biography, experience, work and guidance preferences, workspace, tools, project interests, vehicle interests, and Walt notes.
- Profile completion is persisted and used during startup routing.
- `/build-profile` remains as an additional older onboarding implementation.
- `/profile-setup-prototype` remains available as a separate prototype route.

### Garage And Vehicles

- `/garage-setup` supports creating and editing persisted vehicles.
- Vehicle data includes year, make, model, trim, VIN, nickname, color, engine, transmission, drivetrain, fuel type, mileage, condition, title status, notes, primary-vehicle status, and a cover photo.
- Vehicle photos are uploaded through Supabase Storage code.
- `/add-vehicle` provides another vehicle-creation path with NHTSA makes, models, and VIN decoding.
- `/vehicle/[id]` loads, edits, VIN-decodes, updates the photo for, and deletes a saved vehicle.
- `/garage` loads the signed-in user's profile, vehicles, and projects and organizes projects into Overview, Projects, Drafts, and History.
- The garage supports multiple open vehicles, vehicle selection, layout presets, account navigation, and demo reset.

The current garage is a mixed implementation:

- Its navigation and saved vehicle/project summaries are data-backed.
- The central Walt conversation shown directly in the command-center layout is illustrative rather than the reusable live Walt panel.
- Several workbench tabs display summarized or placeholder content rather than complete project functionality.
- A visible “Workbench placeholder” remains.

### Project Creation

The primary current path is:

```text
Select Vehicle → Select Project Mode → Start With Walt → Draft Project
```

- `/create-project` loads saved vehicles and supports adding a real or dream vehicle.
- `/create-project/goal` selects Maintenance, Repair, Upgrade, Restoration, or Diagnostic mode.
- `/create-project/intake` selects a starting task, creates a persisted draft project, saves structured intake fields, and routes into the project.
- Project modes map to checklist, repair plan, upgrade plan, phase plan, or diagnostic log types.
- Draft projects can be renamed, deleted, discussed with Walt, or sent to plan generation.

An older fixed wizard also remains in the repository:

```text
Goal → Condition → Work → Name → Budget → Build Plan
```

- The older path can create an active project and records a legacy structured intake payload.
- Its screens remain routable even though the primary mode-selection path now routes to Walt intake.

The complete conversational Create Project v2 experience described in `docs/create-project-v2-build-brief.md` is not finished. The current Walt intake creates a structured draft from a selected starter; it is not yet a fully natural, mode-specific intake conversation that extracts and confirms the complete project.

### Projects, Plans, And Steps

- `/projects` lists draft, active, paused, and complete projects and supports vehicle/status filtering.
- Draft and active projects can request AI plan generation.
- Draft projects can be deleted.
- `/projects/[id]` loads the project, phases, steps, and notes.
- Draft projects can be renamed, deleted, discussed with Walt, and converted into a generated plan.
- Generated plans persist phases and structured steps.
- Steps include overview/instructions, parts and materials, tools, notes, warnings, tips, reference notes, difficulty, hours, estimated cost, and DIY/shop guidance.
- Steps can be marked complete from the project or step-detail screen.
- A project can be completed after its plan is finished, with project and phase status updates and a completion note.
- `/projects/[id]/steps/[stepId]` presents step detail and supports completion.

Project-mode-specific display remains limited. The stored mode and plan type exist, but the primary project detail experience still largely uses a shared phase-and-step presentation.

### Walt

The reusable `WaltPanel` is used in project list, project detail, project-creation, and related application experiences.

Implemented Walt behavior includes:

- Persistent user and Walt messages in `walt_messages`
- Screen, vehicle, project, phase, and step context
- Context loading from profile, vehicle, project, phase, step, notes, parts, and recent messages
- OpenAI-backed replies through `/api/walt-chat`
- Browser speech recognition for hold-to-talk input where supported
- ElevenLabs-backed text-to-speech through `/api/walt-speak`
- Muting and contextual opening messages
- Limited parsed write actions:
  - Save a note
  - Add a part to an active project

Current limitations include:

- OpenAI and ElevenLabs behavior was not exercised during this audit.
- The configured model in code is `gpt-4.1-mini` through Chat Completions.
- Walt write actions are applied after the model returns a matching action for a clear user request; there is no general versioned draft/preview/approval envelope.
- Walt does not yet provide the complete durable conversational intake, memory extraction, broad project editing, diagnostic log, or repeat-maintenance behavior described in the product brief.
- The garage command-center conversation is not yet wired to the reusable live Walt panel.

### Vehicle Data

- `/api/vehicle-data` supports VIN decoding and make/model lookup through NHTSA endpoints.
- VIN input is normalized and requires 17 characters.
- NHTSA network behavior was not exercised during this audit.

### Account, Billing, And Help

- Profile settings route into the implemented profile editor.
- Password reset is implemented.
- Account, billing, and help pages have styled navigable shells.
- Email management, plan management, payment methods, invoices, support contact, privacy controls, and account deletion are placeholders or future behavior.

### Design Prototypes

The repository intentionally retains several design/prototype routes:

- `/landing-prototype`
- `/profile-setup-prototype`
- `/garage-setup-prototype`
- `/command-center-prototype`
- `/mobile-command-center-prototype`

Prototype presence must not be treated as proof that the equivalent production workflow is integrated or data-backed.

## API And External-Service Boundaries

The code references these environment-backed services:

- Supabase public URL and public/anonymous key
- Supabase service-role key for privileged demo reset and optional Walt intro-audio caching
- OpenAI API key
- ElevenLabs API key

No environment files are committed in the repository. This audit did not inspect credentials or verify configured remote services.

The application also uses:

- NHTSA public vehicle APIs
- A public Supabase Assets URL for Walt artwork

## Database State In The Repository

The committed SQL defines these application tables:

- `profiles`
- `vehicles`
- `projects`
- `phases`
- `steps`
- `parts`
- `expenses`
- `notes`
- `flags`
- `photos`
- `walt_messages`

The repository includes:

- User ownership through `user_id` or profile ID
- Foreign keys and cascade/set-null behavior
- Status and type constraints
- RLS enablement and owner policies in the baseline SQL
- A private `photos` bucket definition with user-folder upload and select policies
- A signup trigger that creates a profile
- Incremental migrations for vehicle detail/identity fields, Walt context, project mode/intake memory, draft status, and profile onboarding fields

Important limits:

- The actual remote Supabase schema, applied migration history, grants, RLS policies, Storage configuration, and advisor status were not inspected.
- The repository has baseline SQL plus incremental migrations rather than a clearly verified, fully migration-controlled baseline.
- Application code obtains public URLs for uploaded photos, while the baseline SQL defines the `photos` bucket as private. Actual deployed Storage behavior and intended access model require verification.
- The public `handle_new_user` security-definer function and its execution privileges require a focused Supabase security review.
- Plan generation inserts phases and steps sequentially rather than through an explicitly atomic database transaction; a mid-operation failure may require cleanup or recovery design.

These observations describe repository state and required verification; they are not confirmation of a live-database defect.

## Verification Snapshot

Verification performed July 23, 2026:

### Production build

Command equivalent:

```text
next build --webpack
```

Result:

- Next.js compilation passed.
- TypeScript passed.
- Static page generation began.
- The build failed while prerendering `/add-vehicle` because `NEXT_PUBLIC_SUPABASE_URL` was not available in the current environment.

The repository therefore does not currently have a clean environment-independent production build in this workspace.

### Lint

Command equivalent:

```text
eslint .
```

Result:

- Failed with 7 errors and 70 warnings.
- Errors are currently concentrated in:
  - `app/add-vehicle/page.tsx`
  - `app/meet-walt/page.tsx`
  - `components/WaltPanel.tsx`
- Warnings are primarily unoptimized `<img>` usage, plus a WaltPanel hook dependency warning.

### Automated tests

- No application test or specification files were found outside dependencies and build output.
- No automated unit, integration, browser, database, or end-to-end suite is currently established in the repository.

### Manual and live-service verification

- No authenticated browser flow was executed during this documentation audit.
- Supabase, OpenAI, ElevenLabs, NHTSA, email, OAuth, Storage, and production deployment behavior were not verified.

## Known Limitations And Risks

- Lint does not pass.
- The production build currently requires Supabase public environment configuration during prerender.
- Automated regression coverage is absent.
- Live database state and security posture are not verified against committed SQL.
- Several real and prototype routes overlap, increasing product and maintenance ambiguity.
- The main garage command center is only partially wired to live workbench and Walt behavior.
- Create Project v2 is only partially implemented.
- Project detail is not yet meaningfully mode-specific.
- Walt's safe write surface is limited and lacks a general preview/approval/undo contract.
- External provider reliability, cost, privacy, rate limits, and failure behavior have not been verified.
- Account, billing, support contact, privacy, and delete-account controls remain incomplete.
- No production deployment or release verification was performed during this audit.

## Documentation Authority

- `docs/CURRENT_STATE.md` owns the repository-wide description of what is actually implemented and verified.
- `docs/CURRENT_PRIORITIES.md` owns agreed current sequencing and work status.
- `docs/create-project-v2-build-brief.md` owns the intended Create Project v2 product direction.
- `docs/DECISIONS.md` owns durable decision history.
- `docs/DEVELOPMENT_SYSTEM.md` owns how BYLDit is developed.

When implementation changes, update this document only after the new behavior and its verification state are known.
