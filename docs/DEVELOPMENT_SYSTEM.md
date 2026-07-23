# BYLDit Development System

This document is the living, authoritative operating manual for how BYLDit is developed. It defines how work is organized, how Codex threads collaborate through the repository, how decisions become durable project knowledge, and how the development workflow improves over time.

This is not a static description of the original system. Update it whenever the team accepts a better practice, learns an important workflow lesson, or makes a process decision that future threads should inherit. Git history preserves how the system evolved; this document should describe the current way of working.

All BYLDit threads must follow this manual together with the mandatory repository rules in `AGENTS.md`. If the two documents conflict, `AGENTS.md` controls until the conflict is discussed and resolved in both files.

## Purpose And Philosophy

BYLDit should have one primary working home. Product planning, design thinking, architecture, development, database work, debugging, review, priorities, and release planning should happen inside the BYLDit Codex project whenever practical. Useful work may begin elsewhere, but accepted BYLDit knowledge must return to the repository.

The repository should contain both code and knowledge. It is the institutional memory of the project: it should explain what BYLDit is, what matters now, how it is built, why important choices were made, and how work should proceed. In that sense, the project should remember and explain itself.

The Development System is part of the product. Improving how BYLDit is developed improves BYLDit itself because every future thread inherits a clearer and more reliable environment.

The system follows these principles:

- Threads are temporary; documentation is permanent.
- Conversation history supports current work but is not shared project memory.
- Important conclusions should survive changes in threads, computers, and AI models.
- Documentation should be concise, useful, and continuously maintained—not created for its own sake.
- Every kind of durable knowledge should have one logical authoritative home.
- The best workflow is one that reduces repeated explanation, prevents avoidable mistakes, and makes the next correct action easier to identify.

## Sources Of Authority

The terms "repository" and "GitHub" describe related but distinct parts of the system:

- Repository files define BYLDit's code and documented project knowledge.
- GitHub is the durable canonical copy and source of truth shared across computers and work sessions.
- A local working copy is temporary working state. Until changes are reviewed, committed, and pushed, they are not yet durable shared truth.
- Codex threads are focused workspaces. Their important conclusions become authoritative only when written into the appropriate repository files.

The desired resilience standard is that moving to a new computer or beginning a new thread should take minutes rather than days: retrieve the repository, read its entry-point documentation, and continue from its recorded state.

## Maintaining This Manual

- Propose workflow improvements in the BYLDit Development System thread when practical.
- Discuss changes that materially affect multiple thread types or the overall development process before adopting them.
- Once accepted, update this document in the same task so the improvement becomes available to future threads.
- Record consequential process decisions in `docs/DECISIONS.md`, including the reason and affected areas.
- Keep this manual focused on current operating practice. Put historical context in the decision log and rely on Git history for superseded wording.
- Correct small ambiguities or stale references when discovered; do not allow known process drift to persist solely because it originated in an earlier version.
- Prefer continuous, focused improvements over periodic rewrites of the entire system.

## Working Model

- GitHub is the source of truth for BYLDit's code and project files.
- Codex threads are focused workspaces for discussion and execution.
- Repository documentation is the shared memory between threads.
- Threads do not need shared chat history when their durable conclusions are written back to the repository.
- `docs/START_HERE.md` is the entry point for every new thread.
- This document is the authority for BYLDit's development workflow and should evolve as that workflow improves.

Use each thread for one clear objective. Name it so its purpose is easy to recognize, and begin by reading the shared project context before relying on assumptions.

## Standard Work Lifecycle

The normal BYLDit work cycle is:

```text
Orient → Select priority → Work in a focused thread
→ Verify → Update shared knowledge → Review changes
→ Commit → Push → Confirm clean working tree
```

In practice:

1. **Orient:** Read `AGENTS.md`, `docs/START_HERE.md`, this manual, current priorities, relevant decisions, and task-specific documentation.
2. **Select priority:** Confirm that the work is an agreed priority or an explicitly requested task. Do not silently promote an idea or old proposal into current work.
3. **Work in a focused thread:** Define one objective, inspect the relevant project state, and keep the change proportional to that objective.
4. **Verify:** Run checks appropriate to the work and investigate failures rather than treating execution alone as completion.
5. **Update shared knowledge:** Record changed requirements, decisions, priorities, architecture, workflow, or other durable conclusions in their authoritative files.
6. **Review changes:** Inspect the complete diff for correctness, unintended scope, consistency, and missing documentation or verification.
7. **Commit and push:** Make the reviewed state durable in GitHub when Kenny explicitly requests these actions. Code and its related documentation should normally travel together.
8. **Confirm clean state:** Identify any remaining local changes and explain whether they are intentional. A clean working tree is the preferred end state after authorized publishing, not permission for an agent to discard unrelated work.

This lifecycle describes the desired project state; it does not authorize agents to commit or push automatically. The explicit authorization rule in `AGENTS.md` always applies.

## Definition Of Done

"Done" must describe the actual state of the work, not merely that an agent stopped working on it. Every final report must use one of these completion states:

- **Draft:** Exploratory, proposed, or partial work that is not ready for normal use or final review.
- **Implemented Locally:** The agreed implementation is complete and appropriately verified in the local working copy, but it has not yet been committed and pushed to GitHub.
- **Durably Complete:** The implementation and related documentation have been reviewed, committed, and pushed to GitHub with Kenny's explicit authorization.
- **Released:** The durably complete change has been deployed to its intended environment and the relevant behavior has been verified there.

Do not describe partial work as implemented or complete. State what remains and use **Draft** when the agreed outcome has not been fully achieved. A task can end successfully at **Implemented Locally** when publishing was not requested; the status communicates durability, not quality.

### Universal Completion Standard

For work to be **Implemented Locally** or beyond:

1. The requested outcome and agreed scope are complete.
2. The result matches the relevant product intent, requirements, and accepted decisions.
3. Testing and verification appropriate to the work have passed, or any unavailable check and its remaining risk are clearly reported.
4. The complete diff has been reviewed for correctness, regressions, unintended scope, and accidental changes.
5. Unrelated user work has been preserved.
6. Durable product, technical, priority, or workflow knowledge affected by the change has been updated in its authoritative repository file.
7. Known limitations, unresolved issues, and follow-up work are stated explicitly.
8. The final report includes the completion status, files changed, checks performed, unresolved issues or risks, and suggested next step.

Verification should be proportional to risk. The goal is reliable evidence, not running every possible check for every change.

### Product Decisions

A product decision is complete when:

- The decision, reason, important tradeoffs, and affected behavior are clear.
- The relevant product or feature documentation reflects the accepted direction.
- `docs/DECISIONS.md` records it when it has durable significance.
- `docs/CURRENT_PRIORITIES.md` reflects any agreed change in sequencing or status.
- Open questions are preserved as open rather than silently resolved.

### Feature Work

A feature is implemented locally when:

- Its agreed behavior and acceptance criteria are implemented.
- Important success, failure, loading, empty, and permission states are handled when relevant.
- Appropriate automated checks pass.
- User-facing behavior is manually verified when practical.
- Accessibility, responsive behavior, security, and data integrity are considered in proportion to the feature.
- Related product, technical, and operational documentation is current.

### Bug Fixes

A bug fix is implemented locally when:

- The failure is reproduced or supported by concrete evidence when practical.
- The cause is understood sufficiently to justify the fix.
- The fix addresses the cause without introducing known regressions.
- A regression test is added when practical and valuable.
- The original failure scenario and affected surrounding behavior are verified.

### UI/UX Changes

A UI/UX change is implemented locally when:

- The agreed interaction and visual behavior are present.
- Relevant loading, empty, error, disabled, and success states are handled.
- Relevant screen sizes and input methods are checked.
- Accessibility basics, including keyboard use, labels, focus, contrast, and motion where applicable, are considered.
- New durable design or interaction rules are recorded in the appropriate documentation.

### Supabase And Database Changes

A database change is implemented locally when:

- Schema, migration, query, and application-type changes are consistent.
- Existing-data impact, data integrity, authorization, and Row Level Security implications are considered.
- Migration behavior is tested or otherwise validated in an appropriate safe environment.
- Destructive or difficult-to-reverse operations and rollback considerations are discussed before execution.
- Affected technical documentation is updated.

Applying a consequential migration to a shared or production environment requires Kenny's explicit approval unless he has already authorized that specific action.

### Releases

A release reaches **Released** when:

- The intended release scope is confirmed and durably complete.
- Required automated and manual checks pass.
- Database, configuration, secrets, and environment changes are accounted for.
- Known risks and rollback or recovery considerations are documented.
- The target environment is deployed successfully.
- Critical intended behavior is verified in that environment.
- Release notes and project status are updated when applicable.

Deployment requires Kenny's explicit approval unless he has already authorized that specific release action.

## Recommended Thread Types

`docs/TEAM.md` is the authoritative roster and routing guide for BYLDit's standing team. Detailed responsibilities and authority live in the linked role files.

These standing role threads provide continuity and domain ownership. BYLDit may also use temporary focused Feature Build, Bug, Code Review, or Release threads for bounded work. A standing specialist advises and protects its domain; it does not automatically own every end-to-end implementation that touches that domain.

### Marty — Project Lead

Marty is BYLDit's Project Lead, primary coordination point, and bus driver. His complete role and authority are defined in `docs/roles/MARTY_PROJECT_LEAD.md`. Kenny can bring Marty product ideas, priority questions, cross-domain questions, feature requests, bugs with unclear ownership, and requests for project status or next steps.

Marty is responsible for direct routing:

- Identify the teammate or focused thread that should own the next action.
- Turn approved work into a concise durable task brief with objective, owner, context, scope, exclusions, acceptance criteria, verification, dependencies, and expected handoff evidence.
- Send the assignment directly to the appropriate existing Codex thread when that capability is available, rather than requiring Kenny to relay routine prompts and responses.
- Point assignments to authoritative repository files instead of embedding all important context in messages.
- Follow routed work, collect structured handoffs, coordinate reviews, and reconcile outcomes with shared documentation and current priorities.
- Bring Kenny the product judgments, material tradeoffs, risks, approvals, or unresolved questions that require his authority.
- Sequence edits to a shared working copy so teammates do not collide unless isolated branches or worktrees have been deliberately established.

Kenny remains the product owner and final decision-maker. Direct-routing authority does not authorize Marty to make major product decisions, expand approved scope materially, commit, push, deploy, apply consequential migrations, or perform destructive actions without the approval required elsewhere in this manual and `AGENTS.md`.

Routine coordination should not make Kenny the message transport between teammates. Direct messages coordinate work; repository files preserve the durable assignment, decisions, status, and outcome.

### Product Planning

Use for product direction, requirements, user flows, scope, acceptance criteria, and prioritization. Write accepted requirements into a feature brief or other product document, record durable decisions, and update priorities when ordering changes.

### Feature Build

Use for implementing one bounded feature or implementation slice. Ground the work in an agreed brief or clearly stated outcome. Keep unrelated refactors out of scope unless discussed first.

### UI/UX

Use for interaction design, visual direction, information architecture, accessibility, responsive behavior, and design review. Write accepted behavior into the relevant product documentation so implementation threads do not depend on design-chat history.

### Supabase/Database

Use for schema design, migrations, queries, authorization policies, data integrity, and persistence architecture. Record decisions that affect data shape, ownership, security, migrations, or future features.

### Bugs

Use for reproducing, diagnosing, fixing, and verifying a specific defect or tightly related defect group. Capture durable lessons only when they affect future implementation or operation.

### Code Review

Use for reviewing a defined diff, branch, pull request, or implementation slice. Keep findings tied to evidence and the intended behavior. Follow-up implementation may stay in the same thread when it directly addresses the review, or move to the originating Feature Build thread.

### Releases

Use for release scope, readiness, migrations, verification, rollout, rollback considerations, and release notes. Reconcile completed work and unresolved risks with `docs/CURRENT_PRIORITIES.md`.

## Continue Or Start A New Thread

Continue an existing thread when:

- The objective has not changed.
- New work is a direct follow-up to the same feature, bug, review, or release.
- Existing conversation context materially helps and remains manageable.
- The work does not need a different specialist focus or independent deliverable.

Start a new thread when:

- The objective or deliverable changes.
- A product discussion becomes a separately scoped implementation effort.
- Work moves into a distinct specialty, such as UI/UX or database architecture.
- A separate bug, feature slice, review, or release needs independent tracking.
- The current thread has become too broad for a new participant to understand quickly.

Do not create a new thread solely to avoid documenting decisions. Do not keep unrelated work in one thread solely because it concerns BYLDit.

## Decision And Knowledge Flow

When a thread produces shared knowledge:

1. Identify the conclusion: what was decided, learned, completed, or blocked.
2. Update the most specific authoritative document, such as a feature brief.
3. Add an entry to `docs/DECISIONS.md` when the conclusion is a durable product or technical decision.
4. Update `docs/CURRENT_STATE.md` after verified implementation changes alter actual application behavior.
5. Update `docs/CURRENT_PRIORITIES.md` when agreed work changes state, order, or blockage.
6. Include the documentation updates in the same change when practical.
7. End the thread with the final report required by `AGENTS.md`.

Prefer concise, current documentation over transcripts. If a newer decision replaces an older one, preserve the history in the decision log and mark the supersession clearly.

## Task Briefs And Handoffs

`docs/work/README.md` defines BYLDit's authoritative task-brief and handoff system. Use it for material work that crosses threads, requires sequential ownership, must preserve approved scope, or needs durable acceptance and verification evidence.

Marty owns task routing and the accuracy of task control information. The accountable owner owns execution and its handoff evidence. Mitch independently evaluates completion evidence when quality or release review is required.

Task workflow status and Definition-of-Done completion state are different. **Ready For Review** does not mean **Durably Complete**, and a task brief does not authorize implementation merely because it exists.

## Documentation Ownership

Durable knowledge should live in the most specific document that owns it. Avoid maintaining the same rule or requirement in multiple places unless a short cross-reference is necessary for navigation or enforcement.

The current core documents are:

- `AGENTS.md`: mandatory repository-wide instructions for agents.
- `docs/START_HERE.md`: entry point and task-based reading guide.
- `docs/DEVELOPMENT_SYSTEM.md`: authoritative operating manual for how BYLDit is developed.
- `docs/TEAM.md`: authoritative team roster, routing guide, and index of detailed role definitions.
- `docs/CHAT_STARTERS.md`: authoritative initialization and resumption prompts for standing teammate threads.
- `docs/work/README.md`: task-brief, routing, handoff, and work-record conventions.
- `docs/CURRENT_STATE.md`: repository-wide description of actual implemented and verified behavior.
- `docs/CURRENT_PRIORITIES.md`: current goals, sequencing, active work, blockers, and recent completions.
- `docs/DECISIONS.md`: historical record of durable decisions and their reasons.
- Feature briefs: authoritative requirements and context for a specific product area.

Create another living document only when accepted knowledge needs a durable home that the existing structure cannot provide cleanly. Likely future documents may cover product vision, roadmap, architecture, database design, UI system, Walt, release process, or project history. Their possible value is not, by itself, a reason to create empty documents.

When adding a document:

1. Define what knowledge it owns.
2. Link it from `docs/START_HERE.md` where relevant.
3. Move or reference existing knowledge instead of duplicating it.
4. Assign responsibility for keeping it current through the normal work lifecycle.

## Agent Collaboration Standard

Agents should behave as long-term project collaborators rather than isolated code generators. They should:

- Inspect existing knowledge and implementation before making assumptions.
- Explain consequential choices and distinguish facts, decisions, recommendations, and open questions.
- Proactively surface relevant risks, inconsistencies, and opportunities to improve the product or workflow.
- Reuse and improve authoritative information rather than creating parallel documentation.
- Leave the codebase and its shared knowledge easier for the next thread to understand.
- Recommend process improvements when experience reveals a better practice, then update this manual after the improvement is accepted.

Proactive advice does not override the user's authority or expand the scope of a task. Material changes still require the discussion and authorization described in `AGENTS.md`.

## Continuous Improvement

The Development System is never "finished." Its standard is not whether it has many rules, but whether its current rules improve continuity, quality, clarity, and autonomy.

When a workflow lesson emerges:

1. Describe the observed problem or opportunity.
2. Recommend a specific improvement and explain its tradeoffs.
3. Confirm the change when it materially affects how the project is developed.
4. Update this manual to describe the new current practice.
5. Record a consequential process decision in `docs/DECISIONS.md`.
6. Remove or revise obsolete guidance so the manual does not accumulate contradictions.

Do not turn isolated preferences or one-time exceptions into permanent policy without evidence that future work will benefit.

## Suggested Thread Opening

A new thread can begin with:

> Read `AGENTS.md` and `docs/START_HERE.md`, then inspect the relevant project files. This thread is for [one objective]. Before changing anything, identify the applicable priorities, decisions, and feature documentation.

The prompt may add task-specific constraints, but repository instructions remain in effect.
