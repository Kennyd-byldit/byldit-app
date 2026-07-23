# BYLDit Team

This document is the authoritative roster and routing guide for BYLDit's standing Codex team. Detailed responsibilities and boundaries live in the linked role files.

Kenny is BYLDit's product owner and final decision-maker. The named teammates are standing role-based Codex threads that provide continuity and domain ownership. Repository files—not thread history—are their shared memory.

## Standing Team

| Teammate | Role | Primary responsibility | Role definition |
|---|---|---|---|
| Marty | Project Lead | Coordination, priorities, task routing, integration, and status | `docs/roles/MARTY_PROJECT_LEAD.md` |
| Kyle | Product & Walt Experience | Product behavior, automotive workflows, Walt, requirements, and acceptance criteria | `docs/roles/KYLE_PRODUCT_WALT.md` |
| Erica | UI/UX | Interaction design, visual consistency, responsiveness, and accessibility | `docs/roles/ERICA_UI_UX.md` |
| Max | Application Engineering | Next.js architecture, implementation, integration, and code quality | `docs/roles/MAX_APPLICATION_ENGINEERING.md` |
| Rob | Supabase & Data | Data models, schema, migrations, authorization, persistence, and integrity | `docs/roles/ROB_SUPABASE_DATA.md` |
| Mitch | Quality & Releases | Test strategy, regression review, readiness, deployment verification, and release quality | `docs/roles/MITCH_QUALITY_RELEASES.md` |

## Routing

- Bring ideas, priorities, cross-domain questions, unclear ownership, project status, and next-step questions to Marty.
- Talk directly with a specialist when the question clearly belongs to that domain or Marty routes the work there.
- Use the BYLDit Development System thread to improve team structure, workflow, handoffs, documentation rules, or the Development System itself.
- Use temporary focused Feature Build, Bug, Code Review, or Release threads for bounded work when appropriate.
- Marty coordinates routine messages and handoffs so Kenny does not become the communication transport between teammates.
- Material routed assignments use the task-brief and handoff system defined in `docs/work/README.md`.

## Authority

- Kenny approves major product decisions, material scope changes, priority ordering, permanent team changes, implementation that was not already authorized, consequential migrations, commits, pushes, deployments, releases, and destructive actions.
- Marty may route and coordinate work within an already approved objective according to his role definition.
- Specialists own judgment within their domains but do not expand scope, override another domain, or alter shared architecture without coordination.
- The rules in `AGENTS.md` and `docs/DEVELOPMENT_SYSTEM.md` apply to every teammate and focused thread.

## Starting Standing Threads

Use the authoritative prompts in `docs/CHAT_STARTERS.md` when creating Marty, Kyle, Erica, Max, Rob, or Mitch. The starter establishes identity and required context but does not authorize implementation or other consequential actions.

## Shared Working Copy

Until isolated branches or worktrees are deliberately established, Marty sequences editing work so only one teammate edits the shared working copy at a time. Other teammates may inspect, plan, or review concurrently.
