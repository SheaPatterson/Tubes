---
inclusion: always
---

# Product Context — Amp Simulation Platform

A cross-platform guitar amplifier and effects simulation app for guitarists and musicians. Competes with Positive Grid Bias, IK Multimedia AmpliTube, and Softube.

## Domain Model

The core abstraction is a **signal chain** — an ordered pipeline of audio processing nodes:

```
Input → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet (+ Mic) → Output
```

Each node maps to a DSP processor in `src/dsp/processors/` and a corresponding UI component. The chain is persisted as a `SignalChainState` (see `src/types/signal-chain.ts`) and synced cross-device via Convex.

### Key Domain Entities

| Entity | Type file | Data file | Description |
|---|---|---|---|
| Amp model | `src/types/amp.ts` | `src/data/amp-models.ts` | Simulated amplifier with channels, tube type, and tone controls |
| FX pedal | `src/types/fx.ts` | `src/data/fx-pedals.ts` | Effect pedal with category, controls, and visual config |
| Cabinet | `src/types/cabinet.ts` | `src/data/cabinets.ts` | Speaker cabinet with IR data and mic configuration |
| Microphone | `src/types/cabinet.ts` | `src/data/microphones.ts` | Mic type, position, and distance from speaker |
| Signal chain | `src/types/signal-chain.ts` | — | Full chain state combining all nodes above |

### Brand Renaming Convention

Real gear brands are renamed for legal reasons. Always use the renamed brand in UI, data, and code. The mapping lives in `src/data/brand-rename.ts`:

| Original | Renamed |
|---|---|
| MXR | MAC |
| BOSS | KING |
| Electro-Harmonix | Manhattan |
| Ibanez | TOKYO |

When adding new gear, follow this pattern: define the `originalBrand` for internal reference and use the `FxBrandRename` / `brandRename` field for all user-facing output.

## Subscription Tiers

Defined as `SubscriptionTier` in `src/types/user.ts`. Tier gating is enforced via `tierRequired` on gear definitions.

| Tier | Value | Access |
|---|---|---|
| Free | `'free'` | 1 amp model, 3 FX pedals, 1 cabinet |
| Classic | `'classic'` | All gear, CPU-based DSP |
| Next Gen | `'next_gen'` | Classic + cloud AI neural network tonal enhancement |

When adding new gear or features, always assign a `tierRequired` value. Default to `'classic'` unless the feature involves AI processing (`'next_gen'`) or is intentionally free-tier.

## Delivery Targets

- Next.js web app deployed to Vercel (primary)
- PWA with offline support (Service Workers + IndexedDB)
- Electron desktop app (Mac + Windows) wrapping the Next.js app
- Android app (planned)

Code that touches platform-specific APIs (audio devices, MIDI, filesystem) must go through the bridge layer in `electron/bridges/` or the service layer in `src/services/`. Never import Electron or native APIs directly in React components.

## Audio & Performance Constraints

- Target latency: sub-15ms round-trip (input to monitored output)
- All DSP runs in `AudioWorklet` processors — never on the main thread
- DSP processors extend `base-processor.ts` in `src/dsp/processors/`
- The `SignalChainManager` (`src/dsp/signal-chain-manager.ts`) orchestrates node ordering and connections
- Avoid allocations in the audio render loop (no `new`, no closures, no GC pressure)

## UI Design Language

- Skeuomorphic amp and pedal controls (rotary knobs, sliders, toggle switches) in `src/components/controls/`
- Glassmorphic chrome accents on amp panels
- Each gear piece has a `VisualConfig` type defining colors, knob styles, fonts, and SVG logo paths
- Pedal board uses drag-and-drop reordering (@dnd-kit/core)
- Dark mode is the default; light mode supported via HSL CSS variable tokens

## Key Application Routes

| Route group | Path examples | Purpose |
|---|---|---|
| `(app)` | `/rig`, `/live`, `/presets`, `/profile`, `/settings` | Authenticated app — requires login |
| `(auth)` | `/login`, `/signup` | Authentication flows |
| `(public)` | `/`, `/about`, `/how-it-works`, `/privacy` | Marketing and legal pages |

## Real-Time & Sync

- Convex handles all backend state: signal chains, MIDI mappings, user settings, subscriptions, real-time collaborative state
- Cross-device sync uses CRDT semantics provided by Convex
- Live performance mode exposes quick-access preset slots with minimal UI latency

## MIDI Integration

- Web MIDI API for controller input
- MIDI mappings are persisted in Convex (`convex/midiMappings.ts`)
- Mappings bind a MIDI CC/note to a specific parameter on any node in the signal chain

## Recording

- Built-in recording engine supporting WAV, MP3, and FLAC output
- Recording service lives in `src/services/`
- Captures the post-cabinet output node
