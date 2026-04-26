---
inclusion: manual
---

# Generating a Product Requirements Document (PRD)

## Purpose

Guide an AI assistant in producing a clear, actionable PRD for this amp simulation platform. The PRD must be detailed enough for a junior developer to implement the feature without ambiguity.

## Process

1. **Receive prompt** — The user describes a feature or capability.
2. **Ask clarifying questions** — One round of 3–5 targeted questions to fill gaps. Focus on *what* and *why*, not *how*. Skip areas the user already covered. Only ask a second round if the feature is unusually complex.
3. **Generate PRD** — Produce the document using the structure below, incorporating the user's answers.
4. **Save PRD** — Write to `/tasks/prd-[feature-name].md` (kebab-case). Do **not** begin implementation.

## Clarifying Question Areas

Adapt to the prompt. Probe whichever of these are unclear:

| Area | What to ask |
|---|---|
| Problem / Goal | What user problem does this solve? Desired outcome? |
| Target User | Which segment — free-tier hobbyist, classic-tier gigging musician, next-gen power user? |
| Core Actions | Key actions the user should perform. |
| Acceptance Criteria | How do we know the feature is done and correct? |
| Scope / Non-Goals | What should this feature explicitly *not* do? |
| Data & Entities | Which domain entities are involved (amp models, FX pedals, cabinets, signal chains, MIDI mappings)? What data is read, written, or displayed? |
| Subscription Tier | Which tier(s) get access? Default `'classic'` unless AI-powered (`'next_gen'`) or intentionally free. |
| Platform Scope | Web-only, PWA-compatible, or must also work in Electron? Offline requirements? |
| UI Pattern | Skeuomorphic controls, glassmorphic panels, or standard shadcn/ui components? Dark-mode-first. |
| Edge Cases | Error states, empty states, offline behavior, latency constraints. |

## PRD Structure

Each PRD must contain these sections:

1. **Overview** — One paragraph: what the feature is and what problem it solves.
2. **Goals** — 3–5 specific, measurable objectives.
3. **User Stories** — Format: *As a [user type], I want to [action] so that [benefit].*
4. **Functional Requirements** — Numbered list of concrete capabilities using imperative language (e.g., "The system must allow users to reorder FX pedals via drag-and-drop.").
5. **Non-Goals (Out of Scope)** — Explicit list of what this feature will *not* include.
6. **Design Considerations** *(optional)* — UI patterns, component references, mockup links. Note whether skeuomorphic controls or standard UI primitives apply.
7. **Technical Considerations** *(optional)* — Constraints, dependencies, or architectural notes. Reference the project-specific rules below when relevant.
8. **Success Metrics** — How success is measured (latency targets, engagement, error reduction, etc.).
9. **Open Questions** — Remaining unknowns or deferred decisions.

## Project-Specific Rules for PRD Authors

These rules are already documented in the always-included `product.md` and `structure.md` steering files. Reference them by name rather than duplicating details, but ensure the PRD accounts for:

- **Signal chain model** — Features touching audio processing must reference the signal chain pipeline (`Input → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet + Mic → Output`) and relevant DSP processors.
- **Audio performance** — Real-time audio features must note the sub-15 ms latency target and zero-allocation constraint in the render loop.
- **Subscription tiers** — Always specify `tierRequired`. Default `'classic'`; use `'next_gen'` for AI features, `'free'` only when intentional.
- **Brand renaming** — New gear must use renamed brands per `src/data/brand-rename.ts`. Never expose original brand names in UI or data.
- **Platform APIs** — Access audio, MIDI, and filesystem through `electron/bridges/` or `src/services/`. Never import Electron or native APIs directly in React components.
- **Convex backend** — Features requiring persistence or real-time sync should reference the relevant Convex resource files in `convex/`.
- **UI conventions** — Dark-mode-first. Skeuomorphic controls for gear interaction (`src/components/controls/`). shadcn/ui primitives for standard UI. Compose via `cn()` and cva. Never edit `src/components/ui/` directly.
- **File placement** — Follow the rules in `structure.md`. Pages in `src/app/`, components in `src/components/<domain>/`, types in `src/types/`, data in `src/data/`, hooks in `src/hooks/`.

## Writing Guidelines

- **Audience** — Primary reader is a junior developer. Be explicit and unambiguous. Define domain terms on first use (e.g., "signal chain," "IR data," "MIDI CC").
- **Tone** — Concise and precise. Favor short sentences over long paragraphs. No marketing language.
- **Scope** — The PRD is a planning artifact only. Do not include implementation code or pseudo-code.
- **Length** — Keep it as short as possible while covering all sections. Precision over volume.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name].md` (kebab-case)

## Rules

1. Do **not** start implementing the feature. The PRD is a planning artifact only.
2. Always ask clarifying questions before generating the PRD.
3. Incorporate the user's answers into the final PRD.
4. Do **not** duplicate content already covered by `product.md` or `structure.md` — reference those docs instead.
