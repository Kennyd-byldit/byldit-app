# BYLDit Work Coordination

This directory contains durable task briefs and handoffs for work that needs to cross Codex threads, involve multiple teammates, preserve an approved scope, or survive beyond one conversation.

The system should reduce repeated explanation and copy-and-paste coordination. It should not create paperwork for every small task.

## When A Task Brief Is Required

Marty should create a task brief when work:

- Will be routed to another teammate or focused thread.
- Involves more than one standing specialist.
- Has material scope, exclusions, dependencies, or approval boundaries.
- Needs acceptance criteria or verification that should survive the current conversation.
- Will use sequential handoffs.
- Is likely to pause and resume later.
- Could be misunderstood as authorization for broader work.

A small, single-thread, low-risk task may remain in the thread prompt when its outcome and constraints are already clear. Durable decisions and status changes still belong in their authoritative project documents.

## Directory Structure

Use this structure as work is created:

```text
docs/work/
  README.md
  TASK_BRIEF_TEMPLATE.md
  HANDOFF_TEMPLATE.md
  active/
    short-task-name/
      TASK.md
      handoffs/
        teammate-or-stage.md
  completed/
    short-task-name/
      TASK.md
      handoffs/
        teammate-or-stage.md
```

Create `active/` and `completed/` task directories only when they are needed. Do not add empty placeholder directories.

Use a short, stable, lowercase kebab-case task name. Avoid dates in the directory name unless two tasks would otherwise be ambiguous. Moving an entire task directory from `active/` to `completed/` preserves its internal relative links.

## Two Different Kinds Of Status

Task briefs track two concepts that must not be confused.

### Workflow status

- **Proposed:** The brief is being shaped and is not authorization to implement.
- **Awaiting Approval:** The brief is ready for a decision from Kenny.
- **Approved:** Kenny approved the stated objective and scope, but work has not started.
- **Active:** The assigned work is in progress.
- **Blocked:** Work cannot proceed without a named decision, dependency, approval, or external change.
- **Ready For Review:** The owner has handed off the work, but integration or verification is incomplete.
- **Closed:** The approved objective reached its target completion state or was explicitly cancelled with the outcome recorded.

### Completion state

Use the Definition of Done from `docs/DEVELOPMENT_SYSTEM.md`:

- Draft
- Implemented Locally
- Durably Complete
- Released

For example, a task may be **Ready For Review** while claiming **Implemented Locally**. Mitch and Marty determine whether the evidence supports that claim. A **Closed** task must state the completion state actually reached.

## Approval Is Explicit

A task brief is not implementation authorization merely because it exists.

- The brief must state what Kenny approved, the approval date, and the approved completion target.
- Approval applies only to the documented objective and scope.
- Material scope changes return the brief to **Awaiting Approval**.
- Discussion, planning, or review authorization does not imply implementation authorization.
- Commit, push, deployment, release, consequential migration, destructive action, paid service, and new user-owned thread permissions remain separate unless the brief records Kenny's explicit authorization for that specific action.

## Standard Workflow

1. **Intake:** Kenny brings an idea or request to Marty, or a clearly owned request directly to a specialist.
2. **Brief:** Marty creates a brief from `TASK_BRIEF_TEMPLATE.md` when the work meets the criteria above.
3. **Approval:** Marty identifies the decisions and authorization needed from Kenny. The brief records the result.
4. **Routing:** Marty assigns one accountable owner, identifies supporting roles, sets the editing sequence, and sends the existing thread a concise pointer to the brief.
5. **Orientation:** The owner reads `AGENTS.md`, `docs/START_HERE.md`, its role file, the task brief, and the brief's required sources before acting.
6. **Execution:** The owner performs only the approved stage and keeps durable discoveries in the appropriate project files.
7. **Handoff:** The owner uses `HANDOFF_TEMPLATE.md` when work changes owner, requires independent review, or has material evidence to preserve.
8. **Review:** Marty coordinates product, design, engineering, data, or quality review. Mitch independently evaluates completion evidence when required.
9. **Correction:** Findings return to the appropriate owner without silently expanding scope.
10. **Closure:** Marty records the supported completion state, unresolved items, documentation updates, and next action. The task directory moves to `completed/` when the approved objective is complete or explicitly cancelled.
11. **Publication:** Commit, push, deployment, or release occurs only after Kenny's explicit authorization and the required evidence.

## Ownership And Editing

- Every task has one accountable owner at a time.
- Supporting teammates advise or review; they do not silently take ownership.
- Each handoff names the next owner or decision-maker.
- Until isolated worktrees or branches are established, Marty sequences edits so only one teammate edits the shared working copy at a time.
- A handoff does not prove integration. The receiving owner must inspect the current files and Git state.
- Do not claim another teammate's work exists or passes until it is present in the current working copy and verified.

## Direct-Routing Message

Marty should send a short message rather than reproducing the full assignment:

```text
You own the [role or stage] work for [task name]. Read your role file and
docs/work/active/[task-name]/TASK.md, then complete only the approved scope.
Return a handoff using docs/work/HANDOFF_TEMPLATE.md. Do not expand scope or
edit shared files outside the documented sequence without coordinating with me.
```

Messages coordinate work. The task brief, handoffs, decisions, priorities, and relevant feature documents preserve it.

## Maintaining Work Records

- Keep the task brief concise and current; do not paste thread transcripts into it.
- Record confirmed decisions, not every idea considered.
- Link to authoritative documents instead of copying their contents.
- Keep implementation detail in code, technical documentation, or handoffs where it belongs.
- Move a task to `completed/` only after its outcome and actual completion state are recorded.
- Retain completed task records when their scope, handoffs, exclusions, or evidence will help future work. Git history is sufficient for trivial completed tasks.
