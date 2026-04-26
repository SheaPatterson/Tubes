---
inclusion: manual
---

# Generating a Task List from a PRD

## Goal

Guide an AI assistant in creating a step-by-step task list in Markdown based on an existing PRD. The task list should be actionable by a junior developer working in this codebase.

## Output

- Format: Markdown (`.md`)
- Location: `/tasks/`
- Filename: `tasks-[prd-file-name].md` (e.g., `tasks-prd-user-profile-editing.md`)

## Process

1. **Receive PRD Reference:** The user points to a specific PRD file.
2. **Analyze PRD:** Read and analyze functional requirements, user stories, and technical considerations from the PRD.
3. **Phase 1 — Parent Tasks:** Generate high-level tasks (typically ~5) required to implement the feature. Present them to the user without sub-tasks. Ask: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
4. **Wait for Confirmation:** Pause until the user responds with "Go".
5. **Phase 2 — Sub-Tasks:** Break each parent task into smaller, actionable sub-tasks that cover the implementation details implied by the PRD.
6. **Identify Relevant Files:** List files that will be created or modified, including corresponding test files. Follow the project's file placement rules (see below).
7. **Generate Final Output:** Combine parent tasks, sub-tasks, relevant files, and notes into the output format.
8. **Save Task List:** Save to `/tasks/tasks-[prd-file-name].md`.

## Project-Specific Conventions

When generating tasks and identifying files, follow these project rules:

### File Placement

- Pages/layouts → `src/app/` using App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Route groups: `(app)` = authenticated, `(auth)` = auth flows, `(public)` = marketing
- shadcn/ui primitives → `src/components/ui/` — never edit directly; compose or wrap
- Custom components → `src/components/<domain>/`
- Custom hooks → `src/hooks/use-<name>.tsx`
- Utilities → `src/lib/`
- TypeScript interfaces → `src/types/<domain>.ts`
- Static data/fixtures → `src/data/<domain>.ts`
- DSP processors → `src/dsp/processors/` extending `base-processor.ts`
- Service singletons → `src/services/<name>.ts`
- Convex backend → `convex/<resource>.ts`

### Imports

- Always use `@/*` path alias (maps to `./src/*`)
- Never use relative paths that escape `src/`

### Component Patterns

- Default to Server Components; use `"use client"` only when interactivity or browser APIs are needed
- Merge classes via `cn()` from `@/lib/utils`
- Use `class-variance-authority` (cva) for variants
- Compose Radix UI primitives for accessible interactive elements

### Testing

- Test runner: **Vitest** (run with `pnpm test` or `pnpm vitest --run`)
- Property-based tests: **fast-check** — use `*.property.test.ts` suffix
- Unit tests live alongside source files or in a sibling `__tests__/` directory
- Convex tests → `convex/__tests__/`
- DSP processor tests → `src/dsp/processors/__tests__/`

### Domain-Specific Rules

- Brand renaming: use renamed brands in all UI, data, and code (mapping in `src/data/brand-rename.ts`)
- Subscription tiers: always assign `tierRequired` to new gear/features; default to `'classic'`
- DSP code: no allocations in the audio render loop (no `new`, no closures, no GC pressure)
- Platform APIs (audio, MIDI, filesystem): access through `electron/bridges/` or `src/services/`, never directly in components

### Code Style

- TypeScript strict mode; prefer interfaces over types
- Functional and declarative patterns; avoid classes (except DSP processors)
- Named exports for components and utilities
- Descriptive variable names with auxiliary verbs (e.g., `isLoaded`, `hasError`)
- Tailwind for all styling; mobile-first approach

## Output Format

The generated task list must follow this structure:

```markdown
## Relevant Files

- `src/components/domain/feature.tsx` - Brief description of purpose.
- `src/components/domain/__tests__/feature.test.ts` - Unit tests for feature.
- `src/types/domain.ts` - TypeScript interfaces for the feature.
- `convex/resource.ts` - Convex backend functions.
- `convex/__tests__/resource.property.test.ts` - Property-based tests for resource.

### Notes

- Unit tests live alongside source files or in a sibling `__tests__/` directory.
- Property-based tests use `*.property.test.ts` suffix with fast-check.
- Run tests with `pnpm test` (executes `vitest --run`).

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 Sub-task description
  - [ ] 1.2 Sub-task description
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 Sub-task description
- [ ] 3.0 Parent Task Title
```

## Interaction Model

Pause after generating parent tasks to get user confirmation ("Go") before generating sub-tasks. This ensures the high-level plan aligns with expectations before adding detail.

## Target Audience

The primary reader is a junior developer. Requirements should be explicit, unambiguous, and avoid unexplained jargon.
