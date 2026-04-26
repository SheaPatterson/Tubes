---
inclusion: always
---

# Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated app routes (rig, live, presets, profile, settings)
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── (public)/                 # Public marketing pages
│   ├── layout.tsx                # Root layout (fonts, providers, global styles)
│   ├── globals.css               # Tailwind directives, HSL CSS variable tokens (light/dark)
│   └── favicon.ico
├── components/
│   ├── ui/                       # shadcn/ui primitives — do NOT modify directly; extend via composition
│   ├── amp/                      # Amp model renderers
│   ├── brand/                    # Brand logo components
│   ├── cabinet/                  # Cabinet/speaker components
│   ├── controls/                 # Skeuomorphic UI controls (rotary knobs, sliders, toggles)
│   ├── fx/                       # FX pedal board and pedal card components
│   └── providers/                # React context providers (e.g., Convex client)
├── data/                         # Static data definitions (amp models, cabinets, FX pedals, microphones, brand renames)
├── dsp/                          # Audio DSP layer
│   ├── processors/               # AudioWorklet processors (preamp, power amp, cabinet, FX, I/O)
│   │   └── base-processor.ts     # Abstract base class for all processors
│   └── signal-chain-manager.ts   # Orchestrates the ordered signal chain
├── hooks/                        # Custom React hooks (use- prefix)
├── lib/                          # Utility modules (cn(), serialization, security, access control, GDPR)
├── services/                     # Service singletons (AI engine, MIDI, audio interface, recording, offline)
└── types/                        # Shared TypeScript interfaces (amp, fx, cabinet, signal-chain, user, tone-stack)

convex/                           # Convex backend (schema, queries, mutations, auth)
├── schema.ts                     # Database schema definition
├── auth.ts                       # Authentication logic
├── signalChains.ts               # Signal chain CRUD
├── midiMappings.ts               # MIDI mapping persistence
├── realTimeState.ts              # Real-time collaborative state
├── subscriptions.ts              # Subscription tier management
├── userSettings.ts               # User preferences
└── __tests__/                    # Convex property tests

electron/                         # Electron desktop wrapper
├── main.ts                       # Main process entry
├── preload.ts                    # Preload script (context bridge)
├── bridges/                      # IPC bridges (audio, filesystem, MIDI)
└── electron-builder.config.ts    # Build configuration
```

## File Placement Rules

- Pages and layouts → `src/app/` using Next.js App Router file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Route groups use parenthesized folders: `(app)` for authenticated, `(auth)` for auth flows, `(public)` for marketing
- shadcn/ui components → `src/components/ui/` — never edit directly; compose or wrap them
- Custom components → `src/components/<domain>/` grouped by feature domain
- Custom hooks → `src/hooks/use-<name>.tsx`
- Utility functions → `src/lib/` (start with `utils.ts`; add new files as modules grow)
- TypeScript interfaces → `src/types/<domain>.ts`
- Static data/fixtures → `src/data/<domain>.ts`
- DSP processors → `src/dsp/processors/` extending `base-processor.ts`
- Service singletons → `src/services/<name>.ts`
- Convex backend functions → `convex/<resource>.ts`

## Import Conventions

- Always use the `@/*` path alias (maps to `./src/*`): `@/components/ui/button`, `@/lib/utils`, `@/types/amp`
- Never use relative paths that escape `src/` (e.g., `../../lib/utils`)

## Component Patterns

- Default to Server Components; add `"use client"` only when interactivity or browser APIs are needed
- shadcn/ui components use `React.forwardRef` with `displayName`
- Variants use `class-variance-authority` (cva)
- All components accept a `className` prop and merge classes via `cn()` from `@/lib/utils`
- Compose Radix UI primitives for accessible interactive elements

## Testing Conventions

- Property-based tests use `*.property.test.ts` suffix
- Unit tests live alongside source files or in a sibling `__tests__/` directory
- Convex tests go in `convex/__tests__/`
- DSP processor tests go in `src/dsp/processors/__tests__/`
