# BYLDit Repository Instructions

These instructions apply to every Codex agent and every task in this repository.

## Start With Project Context

Before making changes:

1. Read `docs/START_HERE.md`.
2. Follow `docs/DEVELOPMENT_SYSTEM.md`, the authoritative operating manual for how BYLDit is developed.
3. Read `docs/CURRENT_PRIORITIES.md` and the task-specific documents identified in `docs/START_HERE.md`.
4. Check `docs/DECISIONS.md` for decisions that affect the work.
5. Inspect the relevant implementation and current Git state before proposing or editing anything.

Repository files are BYLDit's durable shared memory. Do not assume that context from another Codex thread is available unless it has been recorded in the repository.

## Change Safely

- Keep changes focused on the requested outcome.
- Act like a long-term collaborator: surface relevant risks, opportunities, and workflow improvements instead of waiting for the user to identify every concern.
- Make recommendations when they would improve the product, implementation, or development process, while clearly distinguishing recommendations from agreed decisions.
- Discuss broad, destructive, architectural, or cross-cutting changes with the user before making them.
- Preserve useful existing behavior and documentation unless the task explicitly replaces them.
- Do not discard or overwrite unrelated work in a dirty worktree.
- Do not commit or push unless the user explicitly requests it.

## Product And Technical Documentation

- Update the relevant repository documentation whenever a product or technical decision changes.
- Update `docs/DEVELOPMENT_SYSTEM.md` whenever an accepted workflow improvement or process decision changes how BYLDit is developed.
- Record durable decisions in `docs/DECISIONS.md` when they affect future work or multiple threads.
- Update `docs/CURRENT_PRIORITIES.md` when the status or ordering of agreed work changes.
- Update `docs/CURRENT_STATE.md` after verified implementation changes alter what the application actually does.
- Keep feature-specific source-of-truth documents current rather than duplicating their content across files.
- Prefer concise, high-value project knowledge over transcripts or documentation created only for completeness.

## Verification

- Run testing appropriate to the work performed. This can include focused tests, linting, type checks, builds, database validation, or manual UI verification.
- If a relevant test cannot be run, explain why and identify the remaining risk.
- Documentation-only changes require at minimum a review of links, consistency, and the final diff.

## Final Report

Every completed task must end with a concise summary containing:

- Completion status: Draft, Implemented Locally, Durably Complete, or Released, as defined in `docs/DEVELOPMENT_SYSTEM.md`.
- Files changed.
- Tests or checks run and their results.
- Unresolved issues or risks.
- The suggested next step.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
