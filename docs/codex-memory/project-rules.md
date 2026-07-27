# Project Rules

## Codex prompt economy

- Status: Active
- Scope: Workflow
- Decision: Store permanent repository rules in `AGENTS.md` or this directory instead of repeating them in every task prompt.
- Reason: Prompts can focus on the current implementation scope.
- Impact: Read relevant memory before work; update it only with explicit user authority.

## Database and migration ownership

- Status: Active
- Scope: Database
- Decision: Database and migration work is owned only by the user and ChatGPT. Codex must not create, edit, delete, or execute migrations or seeds; execute SQL; change schemas or configured databases; or create recovery scripts without explicit user instruction changing this rule.
- Reason: Database changes require explicit ownership and review.
- Impact: Codex may inspect existing schema documentation or migrations only when needed to understand an application contract.

## GitHub ownership

- Status: Active
- Scope: Workflow
- Decision: GitHub operations are owned only by the user. Codex must not push, pull, fetch, merge, rebase, create pull requests, modify remote branches, or use GitHub APIs unless explicitly authorized.
- Reason: Remote repository state is user-controlled.
- Impact: Local Git status and diffs may be inspected; commits require explicit user instruction.

## Reasoning level

- Status: Active
- Scope: Workflow
- Decision: Task prompts may assign Light, Mid, or High reasoning; the prompt author chooses the lowest reliable level.
- Reason: Reasoning level is task-specific, not a durable task result.
- Impact: Do not store a reasoning level with individual memory entries.
