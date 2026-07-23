# Start Here

This is the entry point for every new BYLDit Codex thread.

BYLDit is an application for planning and managing automotive restoration, maintenance, repair, upgrade, and diagnostic projects. Codex is its primary working home, repository files define its code and project knowledge, and GitHub holds the durable canonical copy. Local working copies and Codex threads are working environments; neither should be the only place important project knowledge lives.

The repository should contain both code and knowledge. It should allow a new thread—or a newly configured computer—to understand the project and become productive without reconstructing old conversations.

## Read For Every Task

Before proposing or making changes, read:

1. `AGENTS.md` for repository-wide working rules.
2. `docs/DEVELOPMENT_SYSTEM.md` for the authoritative operating model used to develop BYLDit.
3. `docs/TEAM.md` for the standing team, routing, and role ownership.
4. `docs/CURRENT_PRIORITIES.md` for agreed priorities and active work.
5. `docs/CURRENT_STATE.md` for what is actually implemented and verified.
6. `docs/DECISIONS.md` for durable product, technical, and process decisions.
7. The assigned task brief under `docs/work/`, when one exists.
8. The relevant implementation and its Git history or current worktree state as needed.

If these documents are incomplete or disagree with the repository, call that out rather than guessing silently.

## Read By Task Type

### Product planning

- Read `docs/DEVELOPMENT_SYSTEM.md`.
- Read relevant feature briefs and decision entries.
- For Create Project v2 or Walt intake work, read `docs/create-project-v2-build-brief.md`.

### Feature development

- Read the feature's brief or specification, relevant decisions, and nearby code.
- Consult the bundled Next.js guide required by `AGENTS.md` before writing Next.js code.
- Check related schema and Supabase code when the feature reads or writes persistent data.

### UI/UX work

- Read the relevant product brief, existing page and component code, and shared styles.
- Confirm whether the task changes product behavior or only presentation. Record durable behavior decisions when necessary.

### Supabase or database work

- Read relevant files in `supabase/`, `lib/supabase.ts`, and the types and features that use the affected data.
- Check `docs/DECISIONS.md` for data-model decisions.
- Discuss destructive migrations, data loss risks, and broad schema changes before implementing them.

### Bugs and debugging

- Read the affected code and any feature brief that defines expected behavior.
- Reproduce or gather evidence before changing code when practical.
- Record a decision only if the fix establishes a durable product or architectural rule.

### Code review

- Read the change, its stated goal, relevant documentation, and tests.
- Evaluate correctness, regressions, security, data integrity, accessibility, and missing verification in proportion to the change.

### Releases

- Read current priorities, recently completed work, unresolved issues, and the release's relevant feature documentation.
- Verify that documentation and migrations match the code being released.

## Write Shared Knowledge Back

Before completing a thread, write important outcomes to the appropriate repository file:

- Product or technical decisions go in `docs/DECISIONS.md` and, when applicable, the relevant feature brief.
- Priority and status changes go in `docs/CURRENT_PRIORITIES.md`.
- Verified changes to actual application behavior go in `docs/CURRENT_STATE.md`.
- Stable feature requirements belong in the relevant feature documentation.
- Accepted workflow improvements and process decisions belong in `docs/DEVELOPMENT_SYSTEM.md`, the living operating manual for how BYLDit is developed.
- Routed work updates its task brief and uses the handoff system in `docs/work/` when ownership changes or material evidence must be preserved.
- Standing teammate threads are initialized or resumed with the prompts in `docs/CHAT_STARTERS.md`.

Do not copy the entire conversation into the repository. Capture the conclusion, its reason, its impact, and any unresolved questions so a future thread can resume quickly.
