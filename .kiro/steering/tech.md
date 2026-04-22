# Tech Stack & Build System

## Core Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS 3 with `tailwindcss-animate` plugin
- **UI Components**: shadcn/ui (New York style, Radix UI primitives)
- **Icons**: lucide-react
- **Backend**: Convex (reactive database, real-time sync, auth, functions)
- **AI Engine**: FastAPI (separate service, neural network processing)
- **Forms**: react-hook-form + zod (via @hookform/resolvers)
- **Charts**: recharts
- **Toasts**: sonner
- **Fonts**: Geist (sans + mono) via next/font; Quicksand for body text (brand requirement)
- **Desktop**: Electron (wraps Next.js via BrowserWindow)
- **Audio**: Web Audio API (AudioWorklet for DSP processing)
- **MIDI**: Web MIDI API
- **Drag & Drop**: @dnd-kit/core (planned for pedal board)
- **Offline**: Service Workers + IndexedDB local cache

## Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Common Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run Next.js linting
```

## Key Configuration Files

- `components.json` — shadcn/ui config (New York style, RSC enabled, neutral base color, CSS variables)
- `tailwind.config.ts` — Tailwind config with custom design tokens (HSL CSS variables for theming)
- `postcss.config.mjs` — PostCSS with Tailwind plugin
- `next.config.ts` — Next.js config with Dyad component tagger (dev only)
- `tsconfig.json` — TypeScript strict mode, bundler module resolution

## CSS Theming

Colors are defined as HSL CSS variables in `src/app/globals.css` with light/dark mode support. Reference them via Tailwind classes like `bg-background`, `text-foreground`, `bg-primary`, etc. The full token set includes sidebar-specific variables.

## Utility Function

`cn()` from `src/lib/utils.ts` merges Tailwind classes using `clsx` + `tailwind-merge`. Use it for all conditional class composition.
