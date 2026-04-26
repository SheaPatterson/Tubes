---
inclusion: fileMatch
fileMatchPattern: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}']
---

# Next.js App Router Conventions

## Route Groups

Three parenthesized route groups under `src/app/`:

- `(app)` — authenticated routes (`/rig`, `/live`, `/presets`, `/profile`, `/settings`). Layout wraps children in `ConvexClientProvider` and the sidebar shell.
- `(auth)` — login/signup flows. Centered layout with brand logo.
- `(public)` — marketing and legal pages. Layout includes public navbar, mobile menu, and footer.

Do not nest route groups or create new top-level groups without explicit approval.

## Server vs Client Components

- Default to Server Components. Only add `"use client"` when the component needs interactivity, hooks, or browser APIs (Web Audio, Web MIDI, pointer events).
- All three route-group layouts are currently client components because they use `usePathname` or `useState`. Page components under `(app)` are client components due to heavy interactivity.
- Public marketing pages are client components for interactive showcases but should be refactored to Server Components with isolated client islands when possible.
- Never import Convex hooks, `useState`, `useEffect`, or browser APIs in a Server Component.

## Data & State

- Convex is the backend. Use `ConvexClientProvider` (already in the `(app)` layout) and Convex React hooks (`useQuery`, `useMutation`) for data fetching in client components.
- Do not use Next.js `fetch` or Route Handlers for data that lives in Convex.
- Local UI state (signal chain parameters, pedal toggles) uses `useState` with functional updaters for synchronous batching. Wrap handlers in `useCallback` and derived data in `useMemo`.
- For real-time parameter changes (knobs, sliders), keep updates synchronous — no `useTransition` or async patterns in the audio control path.

## File Conventions

- `page.tsx` — route entry point.
- `layout.tsx` — shared UI shell per route group.
- `loading.tsx` — Suspense fallback (use when adding async Server Components).
- `error.tsx` — error boundary at route level.
- Co-locate helper components and types within the page file when they are page-specific (see `rig/page.tsx` pattern with `Section`, `InputSettingsPanel`, etc.). Extract to `src/components/<domain>/` when reused across pages.

## Metadata & SEO

- Export `metadata` from Server Component layouts/pages using the Next.js `Metadata` type.
- Root layout sets global metadata (title, description, manifest, theme color, Open Graph, Apple Web App).
- Per-page metadata should extend, not override, the root metadata.

## Styling Patterns

- Use `cn()` from `@/lib/utils` for all conditional class merging.
- Glassmorphic card pattern used throughout: `backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]`.
- Brand accent via `var(--brand-accent)` CSS variable, not hardcoded colors.
- Section headings: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.
- Touch targets: minimum `min-h-[44px] min-w-[44px]` on interactive elements for accessibility.

## Accessibility

- All interactive elements must have `aria-label` or visible label text.
- Toggle buttons use `aria-pressed`.
- Sliders use `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- Collapsible sections announce expand/collapse state.
- Keyboard navigation: support `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` on custom slider controls.

## Performance

- Audio-related state updates must be synchronous (no `startTransition`).
- Use `useRef` for tracking non-render values like `lastUpdateRef` for latency measurement.
- Pre-compute lookup maps (e.g., `PEDAL_DEF_MAP`) outside the component or in module scope to avoid per-render allocation.
- Use `next/font` for font loading (Geist Sans, Geist Mono, Quicksand are configured in root layout).
- Service Worker registration is in the root layout via inline script — do not duplicate.

## Security

- `next.config.ts` sets security headers (HSTS, CSP, X-Frame-Options, etc.) for all routes. Do not weaken CSP directives without review.
- Microphone permission is allowed in the Permissions-Policy for audio input. Camera and geolocation are denied.

## Import Rules

- Always use `@/*` path alias. Never use relative paths that escape `src/`.
- Import UI primitives from `@/components/ui/*`. Import domain components from `@/components/<domain>/*`.
- Import types with `import type` when only used for type annotations.
