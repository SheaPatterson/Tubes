---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# Performance Optimization Guidelines

Rules for writing performant code in this amp simulation platform. Audio latency target is sub-15ms round-trip.

## Core Principles

- Measure before optimizing — profile the critical path first
- Prefer algorithmic improvements (O(n) over O(n²)) before micro-optimizations
- Balance performance with readability; don't sacrifice clarity without benchmarks
- Cache expensive computations; use `useMemo`/`useCallback` where re-renders are measurable

## AudioWorklet / DSP Rules (Critical Path)

All DSP runs in `AudioWorklet` processors under `src/dsp/processors/`. These are the strictest performance constraints in the codebase.

- Never allocate in the audio render loop — no `new`, no object literals, no array spreads, no closures
- Pre-allocate buffers and reuse them via object pooling patterns
- Use `Float32Array` typed arrays for sample data; avoid generic arrays
- Use `ParameterSmoother` (from `base-processor.ts`) for parameter changes to avoid zipper noise — never set values directly per-sample
- Avoid branching in inner sample loops; prefer branchless math (`clamp`, `lerp` from `base-processor.ts`)
- Never use `structuredClone`, `JSON.parse/stringify`, or `Map`/`Set` in the audio thread
- Keep processor `process()` methods minimal — no logging, no string operations, no error handling beyond early return

## React / Next.js Performance

- Default to Server Components; add `"use client"` only when interactivity or browser APIs are needed
- Avoid re-renders on skeuomorphic controls (`src/components/controls/`) — these are visually expensive. Memoize with `React.memo` and stable callbacks
- Use `useCallback` for event handlers passed to knob/slider/toggle components
- Colocate state as low as possible; avoid lifting state that only one control needs
- For Convex subscriptions, select only the fields you need — don't subscribe to entire documents when you only read one property
- Lazy-load heavy components (amp model renderer, pedal board) with `next/dynamic`

## TypeScript Patterns

- Prefer `interface` over `type` for object shapes (better error messages, faster compiler checks)
- Use `as const` for static lookup tables (amp models, FX pedals, cabinets) to enable narrow types without runtime cost
- Avoid `any` — it disables the compiler's ability to catch performance-related type errors
- Use discriminated unions over runtime type checks where possible

## Data Structure Selection

- Use `Map` over plain objects for dynamic key lookups (O(1) with better memory behavior for frequent add/delete)
- Use `Set` for membership checks instead of `Array.includes` (O(1) vs O(n))
- For ordered pedal lists, use arrays — but avoid `filter`/`map` chains that create intermediate arrays in hot paths
- For MIDI mapping lookups, use `Map<number, MappingTarget>` keyed by CC number

## Async & Concurrency

- Use `Promise.all` for independent parallel fetches; avoid sequential `await` in loops
- For batched Convex mutations, group related writes into a single mutation function
- Use controlled concurrency (batch size limit) when loading multiple IR files or presets

## Memory Management

- Avoid closures that capture large scopes in long-lived callbacks (event listeners, MIDI handlers)
- Clean up `AudioWorkletNode` connections and event listeners in `dispose()` methods
- Use `WeakRef` or explicit cleanup for cached audio buffers that may be swapped out
- In service singletons (`src/services/`), implement `dispose()` and call it on unmount

## Bundle Size

- Import only what you need from `lucide-react` — each icon is tree-shakeable but only if imported individually
- Avoid barrel file re-exports (`index.ts`) for large component directories
- Use `next/dynamic` with `ssr: false` for components that depend on Web Audio or Web MIDI APIs
