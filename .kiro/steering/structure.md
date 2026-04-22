# Project Structure

```
src/
├── app/                    # Next.js App Router (pages, layouts, routes)
│   ├── layout.tsx          # Root layout (fonts, global styles)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Tailwind directives, CSS variable tokens (light/dark)
│   └── favicon.ico
├── components/
│   └── ui/                 # shadcn/ui components (Radix + Tailwind)
│       ├── button.tsx      # Uses cva for variant-based styling
│       ├── card.tsx
│       ├── sidebar.tsx     # Full sidebar system with context provider
│       └── ...             # ~45 pre-installed shadcn/ui components
├── hooks/                  # Custom React hooks
│   └── use-mobile.tsx      # Responsive breakpoint hook (768px)
└── lib/
    └── utils.ts            # cn() utility (clsx + tailwind-merge)
```

## Conventions

- **Pages & layouts** go in `src/app/` following Next.js App Router file conventions
- **shadcn/ui components** live in `src/components/ui/` — do not modify these directly; extend via composition
- **Custom components** go in `src/components/` (outside `ui/`)
- **Custom hooks** go in `src/hooks/` with `use-` prefix
- **Utility functions** go in `src/lib/utils.ts` or new files in `src/lib/`
- **All imports** use the `@/` path alias (e.g., `@/components/ui/button`, `@/lib/utils`)

## Planned Directories (from design spec)

These directories will be created as features are implemented:

- `src/dsp/` — AudioWorklet processors for the signal chain DSP engine
- `src/dsp/processors/` — Individual audio processors (preamp, power amp, cabinet, FX, etc.)
- `src/services/` — Service modules (AI engine, MIDI manager, recording, offline sync)
- `src/types/` — TypeScript type definitions (amp, fx, cabinet, signal-chain, user)
- `src/components/controls/` — Skeuomorphic UI controls (rotary knobs, toggle switches, sliders)
- `src/components/amp/` — Amp model renderers
- `src/components/fx/` — FX pedal board and pedal components
- `convex/` — Convex backend (schema, queries, mutations, actions)

## Component Patterns

- shadcn/ui components use `React.forwardRef` with `displayName`
- Variants are defined with `class-variance-authority` (cva)
- All components accept `className` prop and merge via `cn()`
- Client components are marked with `"use client"` directive
- Components compose Radix UI primitives for accessibility
