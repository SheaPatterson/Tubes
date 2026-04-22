# Implementation Plan: Amp Simulation Platform

## Overview

This plan implements the Amp Simulation Platform in incremental phases: core types and data layer first, then the DSP engine, UI controls, Convex backend, service integrations (AI, MIDI, recording, offline), pages and layouts, and finally cross-platform packaging. Each task builds on previous work so there is no orphaned code. TypeScript is used throughout with Next.js 15 App Router, Tailwind CSS, shadcn/ui, Convex, and Web Audio API AudioWorklet.

## Tasks

- [x] 1. Set up project foundation, types, and constants
  - [x] 1.1 Create core TypeScript type definitions
    - Create `src/types/amp.ts` with `AmpModel`, `AmpParameters`, `AmpChannel`, `PowerAmpTubeType`, `AmpControlDefinition`, `ToggleSwitchDefinition`, `AmpVisualConfig`, `KnobPosition`
    - Create `src/types/fx.ts` with `FxPedalDefinition`, `FxPedalInstance`, `FxControlDefinition`, `FxCategory`, `FxBrandRename`, `FxPedalVisualConfig`
    - Create `src/types/cabinet.ts` with `Cabinet`, `Speaker`, `MicPosition`, `MicConfiguration`, `MicType`, `MicPreset`
    - Create `src/types/signal-chain.ts` with `SignalChainState`, `InputSettings`, `PreampTubeConfig`, `AmplifierConfig`, `CabinetConfig`, `OutputSettings`, `SavedSignalChain`
    - Create `src/types/user.ts` with `UserProfile`, `Subscription`, `SubscriptionTier`
    - Create `src/types/tone-stack.ts` with `ToneStackJSON`, `FxChainJSON` serialization types
    - _Requirements: 2.1, 3.6, 3.7, 5.1, 6.1, 7.1, 8.1, 25.1, 25.5_

  - [x] 1.2 Create amp model and FX pedal data constants
    - Create `src/data/amp-models.ts` defining all 7 amp models (Winston CHL, US Steel Plate, Twanger Banger, Fizzle 0505, Fuzzy AcidTrip, Blitzkrieg Warfare, Berlin Wall) with their channels, preamp stage counts, power amp tube types, control definitions, toggle switches, and visual configs
    - Create `src/data/fx-pedals.t a    s` defining all FX pedals under Brand_Rename identities (MAC, KING, Manhattan, TOKYO) with controls, categories, and tier requirements
    - Create `src/data/cabinets.ts` defining all 7 cabinets (Winston 4x12, Winston 4x12V, Winston 2x12V, Fuzzy 4x12, Fuzzy 2x12, US Steel 4x12, Twanger 1)
    - Create `src/data/microphones.ts` defining condenser, ribbon, and dynamic mic types with frequency response data
    - Create `src/data/brand-rename.ts` with the brand rename mapping (MXR→MAC, BOSS→KING, Electro-Harmonix→Manhattan, Ibanez→TOKYO)
    - _Requirements: 3.1, 6.1, 7.1, 8.1, 19.1_

  - [x] 1.3 Install additional dependencies
    - Install `convex`, `@dnd-kit/core`, `@dnd-kit/sortable`, `fast-check` (dev), `vitest` (dev), `@testing-library/react` (dev)
    - Configure Vitest in `vitest.config.ts` with path aliases matching tsconfig
    - Add `"test"` script to `package.json`
    - _Requirements: 20.1, 6.5_

  - [x] 1.4 Set up Quicksand font and global design tokens
    - Add Quicksand font via `next/font/google` in `src/app/layout.tsx`
    - Update `src/app/globals.css` with glassmorphic design tokens (backdrop-blur, glass-bg variables) and brand color tokens
    - Update metadata in layout.tsx for the Amp Simulation Platform
    - _Requirements: 14.7, 19.2, 19.3_

- [x] 2. Implement subscription tier access control and serialization logic
  - [x] 2.1 Implement subscription tier access control module
    - Create `src/lib/access-control.ts` with `checkContentAccess(tier, contentType, contentId)` function
    - Enforce Free tier limits: exactly 1 amp, 3 pedals, 1 cabinet
    - Classic and Next Gen tiers allow all content
    - Return upgrade prompt info when access is denied
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.7_

  - [x] 2.2 Write property test for subscription tier access control
    - **Property 1: Subscription tier access control**
    - **Validates: Requirements 1.2, 1.3, 1.4, 6.7**

  - [x] 2.3 Implement tone stack serialization and deserialization
    - Create `src/lib/serialization.ts` with `serializeToneStack`, `deserializeToneStack`, `serializeFxChain`, `deserializeFxChain`
    - Validate all fields on deserialization; return descriptive errors for invalid/malformed JSON identifying the invalid field and expected format
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6_

  - [x] 2.4 Write property test for tone stack serialization round-trip
    - **Property 3: Tone stack serialization round-trip**
    - **Validates: Requirements 25.1, 25.2, 25.3**

  - [x] 2.5 Write property test for FX pedal chain serialization round-trip
    - **Property 4: FX pedal chain serialization round-trip**
    - **Validates: Requirements 25.5, 25.6, 6.6**

  - [x] 2.6 Write property test for invalid tone stack JSON error identification
    - **Property 5: Invalid tone stack JSON error identification**
    - **Validates: Requirements 25.4**

  - [x] 2.7 Implement parameter clamping and validation utilities
    - Create `src/lib/parameter-utils.ts` with `clampValue(value, min, max)`, `validateAmpParameters`, `validatePreampTubeCount(count, model)`
    - _Requirements: 26.5, 4.1_

  - [x] 2.8 Write property test for parameter value clamping
    - **Property 12: Parameter value clamping**
    - **Validates: Requirements 26.5**

  - [x] 2.9 Write property test for preamp tube count validation
    - **Property 9: Preamp tube count validation**
    - **Validates: Requirements 4.1**

  - [x] 2.10 Write property test for model and pedal control completeness
    - **Property 10: Model and pedal control completeness**
    - **Validates: Requirements 3.6, 6.3**

  - [x] 2.11 Write property test for brand rename consistency
    - **Property 11: Brand rename consistency**
    - **Validates: Requirements 19.1**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Convex backend schema and functions
  - [x] 4.1 Create Convex schema definition
    - Create `convex/schema.ts` with all tables: ampList, ampManufacturerToneValues, preampToneValues, powerAmpToneValues, fxPedalList, fxPedalCircuitValues, fxCategoryValues, fxManufacturerValues, cabList, speakerList, cabToneValues, speakerToneValues, cabCombinedValues, micList, micTypeToneValues, userProfiles, userBioInformation, savedUserSignalChain, userSignalChainValues, subscriptions, realTimeUserSignalChain, micRealTimePositionValues, midiMappings, userSettings
    - Define all indexes as specified in the design document
    - _Requirements: 20.1, 20.4_

  - [x] 4.2 Implement Convex signal chain query and mutation functions
    - Create `convex/signalChains.ts` with `getUserSignalChains`, `saveSignalChain`, `loadSignalChain`, `deleteSignalChain`, `renameSignalChain`
    - Create `convex/realTimeState.ts` with `updateRealTimeState` mutation (writes within 50ms target)
    - _Requirements: 13.1, 13.2, 13.3, 20.3_

  - [x] 4.3 Implement Convex subscription and access control functions
    - Create `convex/subscriptions.ts` with `getUserTier`, `checkContentAccess`, `upgradeSubscription`, `handlePaymentFailure` (downgrade to Free within 60s)
    - _Requirements: 1.1, 1.5, 1.6, 1.7_

  - [x] 4.4 Implement Convex user authentication functions
    - Create `convex/auth.ts` with `signUp`, `login`, `resetPassword`, `getUserProfile`, `updateUserProfile`
    - Implement failed login tracking: lock account for 60s after 5 consecutive failures
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6_

  - [x] 4.5 Implement Convex MIDI mapping functions
    - Create `convex/midiMappings.ts` with `getMappings`, `createMapping`, `deleteMapping`, `updateMapping`
    - _Requirements: 11.2, 11.4, 11.6_

  - [x] 4.6 Implement Convex user settings functions
    - Create `convex/userSettings.ts` with `getSettings`, `updateSettings` for audio interface, recording, CPU/GPU, and AI blend settings
    - _Requirements: 16.1, 16.6_

  - [x] 4.7 Write property test for database referential integrity
    - **Property 15: Database referential integrity**
    - **Validates: Requirements 20.4**

  - [x] 4.8 Write property test for saved signal chain list sorting
    - **Property 14: Saved signal chain list sorting**
    - **Validates: Requirements 13.6**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement DSP engine and AudioWorklet processors
  - [x] 6.1 Create AudioWorklet processor base and input/output processors
    - Create `src/dsp/processors/base-processor.ts` with shared AudioWorkletProcessor utilities
    - Create `src/dsp/processors/input-settings-processor.ts` (gain, noise gate)
    - Create `src/dsp/processors/output-settings-processor.ts` (master volume, output gain)
    - _Requirements: 2.1, 2.7_

  - [x] 6.2 Implement preamp tube processor
    - Create `src/dsp/processors/preamp-tube-processor.ts` modeling 12AX7 stages with cumulative gain and per-stage frequency response shaping
    - Recalculate preamp gain model within 10ms on tube count change
    - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4_

  - [x] 6.3 Write property test for cumulative preamp gain staging
    - **Property 6: Cumulative preamp gain staging**
    - **Validates: Requirements 3.3, 4.2, 4.4**

  - [x] 6.4 Implement amplifier processor (tone stack + channel)
    - Create `src/dsp/processors/amplifier-processor.ts` with tone stack EQ (bass, mid, treble, presence, resonance) and channel switching (clean, crunch, overdrive)
    - Use manufacturer-accurate parameter values from amp model data
    - _Requirements: 3.2, 3.4, 3.6, 3.7_

  - [x] 6.5 Implement power amp processor
    - Create `src/dsp/processors/power-amp-processor.ts` modeling tube types (KT88, 6L6, EL34, EL84, 12BH7, 12AU7) with sag, bias, voltage response
    - Apply dynamic pick-attack sensitivity when drive > 70%
    - Model clean-to-lightly-overdriven response for drive 1–69%, progressive sag compression for 70–100%
    - _Requirements: 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.6 Write property test for power amp drive compression monotonicity
    - **Property 7: Power amp drive compression monotonicity**
    - **Validates: Requirements 3.5, 5.3, 5.4**

  - [x] 6.7 Write property test for power amp tube type parameter validity
    - **Property 8: Power amp tube type parameter validity**
    - **Validates: Requirements 5.2, 5.5**

  - [x] 6.8 Implement FX pedal processor
    - Create `src/dsp/processors/fx-pedal-processor.ts` as a generic processor that loads circuit behavior per pedal type
    - Enable/disable within 10ms without audio dropout
    - _Requirements: 6.2, 6.4_

  - [x] 6.9 Implement cabinet processor with IR convolution
    - Create `src/dsp/processors/cabinet-processor.ts` using convolution with IR data
    - Blend microphone type, position (X/Y/Z), and distance for final output
    - Support mic presets: Center (bright), Middle (warmer), Outside (flat)
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 8.1, 8.2, 8.3, 8.4_

  - [x] 6.10 Write property test for microphone configuration determinism
    - **Property 16: Microphone configuration determinism**
    - **Validates: Requirements 7.8, 8.3**

  - [x] 6.11 Implement Signal Chain Manager
    - Create `src/dsp/signal-chain-manager.ts` implementing the `SignalChainManager` interface
    - Connect AudioWorkletNodes in fixed order: Input → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet → Output
    - Support pedal reordering within stages by reconnecting nodes without tearing down the graph (within 10ms)
    - Support loading/saving full signal chain state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.5, 13.2_

  - [x] 6.12 Write property test for signal chain processing order invariant
    - **Property 2: Signal chain processing order invariant**
    - **Validates: Requirements 2.1**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement skeuomorphic UI controls and amp/FX renderers
  - [x] 8.1 Create rotary knob control component
    - Create `src/components/controls/rotary-knob.tsx` with mouse drag, touch gesture, and scroll wheel input
    - Support knob styles: chicken-head, pointer, dome
    - Support sizes: sm, md, lg
    - Expose `onContextMenu` handler
    - _Requirements: 14.4, 14.5_

  - [x] 8.2 Create toggle switch and slider control components
    - Create `src/components/controls/toggle-switch.tsx` with rocker, toggle, push styles
    - Create `src/components/controls/slider-control.tsx` with horizontal and vertical orientations
    - Both expose `onContextMenu` handler
    - _Requirements: 14.4, 14.5_

  - [x] 8.3 Create parameter context menu component
    - Create `src/components/ui/parameter-context-menu.tsx` using Radix context menu
    - For knobs/sliders: Set to Default, Enter Exact Value, Copy Value, Paste Value
    - For FX pedals: Enable/Disable, Remove from Chain, Duplicate, View Settings
    - Clamp entered values to valid range with notification
    - _Requirements: 14.5, 26.1, 26.2, 26.3, 26.4, 26.5_

  - [x] 8.4 Write property test for context menu option completeness
    - **Property 13: Context menu option completeness**
    - **Validates: Requirements 14.5, 26.1, 26.2, 26.3**

  - [x] 8.5 Create amp model renderer component
    - Create `src/components/amp/amp-model-renderer.tsx` rendering skeuomorphic amp panels
    - Read layout config per amp model to place knobs, toggles, channel selector
    - Display amp name in typographic style consistent with Brand_Rename identity
    - _Requirements: 3.6, 3.7, 3.8, 14.1_

  - [x] 8.6 Create FX pedal component and pedal board with drag-and-drop
    - Create `src/components/fx/fx-pedal-card.tsx` rendering individual pedals with brand-renamed identity, knobs, and footswitch
    - Create `src/components/fx/pedal-board.tsx` using `@dnd-kit/sortable` for drag-and-drop reordering within Preamp FX and FX Loop stages
    - _Requirements: 6.3, 6.5, 14.2_

  - [x] 8.7 Create cabinet and microphone position UI
    - Create `src/components/cabinet/cabinet-renderer.tsx` displaying cabinet visual
    - Create `src/components/cabinet/mic-position-control.tsx` with X/Y/Z position controls, distance slider, mic type selector, and preset buttons (Center, Middle, Outside)
    - _Requirements: 7.5, 7.6, 7.7, 8.1, 8.2_

- [ ] 9. Implement service modules (AI, MIDI, recording, offline)
  - [x] 9.1 Implement AI Engine service
    - Create `src/services/ai-engine.ts` with WebSocket connection to FastAPI backend
    - Implement `processAudio`, `setBlendLevel` (0–100%), connection management, latency monitoring
    - Auto-notify user when latency > 50ms; fall back to DSP-only on error
    - _Requirements: 2.5, 2.6, 9.1, 9.2, 9.4, 9.6, 9.7_

  - [x] 9.2 Implement MIDI Manager service
    - Create `src/services/midi-manager.ts` using Web MIDI API
    - Detect USB and Bluetooth MIDI devices on launch
    - Implement quick-map interface (≤3 interactions per mapping)
    - Support CC and Program Change mapping to amp channels, pedal toggle, pedal boost, and any parameter
    - Apply parameter changes within 5ms of MIDI message
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.6_

  - [x] 9.3 Implement Recording Engine service
    - Create `src/services/recording-engine.ts` using MediaRecorder API
    - Support WAV, MP3, FLAC formats at 44.1/48/96kHz and 16/24/32-bit
    - Provide recording timer and waveform visualization data
    - Save within 2 seconds of stop
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6_

  - [x] 9.4 Implement Offline Manager service
    - Create `src/services/offline-manager.ts` with connectivity detection
    - Cache DSP engine, amp/FX/cabinet data, and UI assets via Service Worker
    - Queue mutations in IndexedDB when offline; sync via CRDT within 30s on reconnect
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [x] 9.5 Implement Audio Interface Manager
    - Create `src/services/audio-interface-manager.ts` detecting connected audio interfaces
    - Provide optimized device profiles with recommended buffer size and sample rate
    - Handle disconnection: pause processing, show reconnection prompt, resume within 2s
    - Implement delay sync for remote collaboration
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement application pages and layouts
  - [x] 11.1 Create primary application layout with signal chain view
    - Create `src/app/(app)/layout.tsx` with glassmorphic navigation, sidebar, connectivity indicator, and responsive shell
    - Wire up Convex provider, auth context, and theme provider
    - _Requirements: 14.3, 23.5, 27.1_

  - [x] 11.2 Create main signal chain page
    - Create `src/app/(app)/page.tsx` as the primary rig view
    - Compose AmpModelRenderer, PedalBoard (preamp FX + FX loop), CabinetRenderer, MicPositionControl, InputSettings, OutputSettings
    - Wire all controls to SignalChainManager for real-time audio parameter updates within 10ms
    - _Requirements: 2.1, 14.1, 14.2, 14.4, 14.6, 14.8_

  - [x] 11.3 Create Live Performance page
    - Create `src/app/(app)/live/page.tsx` with enlarged touch-optimized controls for stage use
    - Display current amp channel, active FX pedals, master volume
    - Support 8 quick-access Saved_Signal_Chain slots for instant recall
    - Channel switching within 5ms
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 11.4 Create Saved Signal Chains page
    - Create `src/app/(app)/presets/page.tsx` listing all saved chains sortable by name and last modified date
    - Support save, load (within 500ms), rename, and delete operations
    - Wire to Convex for cross-device sync and IndexedDB for offline support
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 11.5 Create Settings pages
    - Create `src/app/(app)/settings/page.tsx` with sections: I/O Interface Options, MIDI Options, Recording Options, AI Settings, CPU & GPU Settings, Subscriptions, Payment
    - I/O: audio interface selection, input/output channels, buffer size
    - MIDI: device selection, mapping list with edit/delete, quick-map trigger
    - Recording: format (WAV/MP3/FLAC), sample rate, bit depth
    - AI: blend level slider (0–100%), neural network status (model version, latency, connection quality)
    - CPU & GPU: processing priority
    - Subscriptions: current status, renewal date, upgrade/downgrade
    - Payment: credit card and PayPal via Stripe (PCI-compliant)
    - Persist changes immediately; audio engine restart only for buffer size changes
    - _Requirements: 9.3, 9.7, 10.1, 10.3, 11.6, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [x] 11.6 Create User Profile and Authentication pages
    - Create `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx` with email/password auth
    - Create `src/app/(app)/profile/page.tsx` for viewing/editing profile info
    - Implement password reset flow via email verification (30-min link validity)
    - Display descriptive error on invalid credentials; lock after 5 failed attempts for 60s
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 12. Implement marketing and public pages
  - [-] 12.1 Create public page layout and landing page
    - Create `src/app/(public)/layout.tsx` with public navigation
    - Create `src/app/(public)/page.tsx` (Landing) with interactive amp/pedal/cabinet mockups
    - _Requirements: 18.1, 18.2_

  - [~] 12.2 Create remaining public pages
    - Create pages: About, Personal Intelligence, How We Do It, How It Works, What It Costs (pricing table with tier comparison), Who to Contact, Why We Do It, Blueprint and Tech Stack, White Sheet, Secured Privacy (plain-language privacy policy), Not Your Typical Terms (plain-language ToS)
    - _Requirements: 18.1, 18.3, 18.4, 18.5_

- [ ] 13. Implement responsive layout and cross-platform support
  - [~] 13.1 Implement responsive and adaptive layouts
    - Create primary layout for desktop (≥1024px) with full signal chain visible
    - Create secondary layout for tablet/mobile (<1024px) with collapsible sections and touch-optimized controls
    - Scale skeuomorphic visuals proportionally; maintain 44x44px touch targets
    - Support landscape and portrait orientations
    - _Requirements: 14.8, 27.1, 27.2, 27.3, 27.4, 27.5_

  - [~] 13.2 Set up PWA with Service Worker
    - Create `public/manifest.json` and Service Worker for offline caching of DSP engine, data, and UI assets
    - Register Service Worker in the app layout
    - _Requirements: 17.4, 23.1_

  - [~] 13.3 Set up Electron desktop app configuration
    - Create `electron/` directory with main process, preload script, and BrowserWindow loading the Next.js app
    - Add Node.js bridges: `electron-audio-bridge`, `electron-midi-bridge`, `electron-fs-bridge`
    - Configure build for Mac (Apple Silicon + Intel) and Windows (x64) with single build commands
    - _Requirements: 17.2, 17.5, 17.6, 17.7_

- [ ] 14. Implement security, performance, and brand assets
  - [~] 14.1 Implement security measures
    - Enforce TLS 1.2+ for all client-server communication
    - Use bcrypt/Argon2 for password hashing with per-user salt (via Convex auth functions)
    - Ensure payment data handled exclusively through Stripe (PCI-DSS compliant); no raw card storage
    - Implement GDPR data export and account deletion in user profile
    - Restrict audio transmission to AI Engine only for Next Gen tier with explicit consent; cease on revocation
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

  - [~] 14.2 Implement error handling and recovery
    - Add AudioWorklet error recovery: retry module load 3x with exponential backoff; recover audio within 500ms on exception
    - Add AI Engine fallback: fall back to DSP-only on error/unreachable with non-blocking notification
    - Add audio interface disconnect handling: pause, prompt, resume within 2s
    - Add Convex connection loss handling: queue locally, sync on reconnect
    - _Requirements: 2.6, 9.6, 10.6, 21.3_

  - [~] 14.3 Create brand identity assets
    - Create SVG logos for the platform and each Brand_Rename identity (MAC, KING, Manhattan, TOKYO)
    - Create favicon (ICO + SVG), banner assets
    - Apply brand package consistently across all UI surfaces
    - _Requirements: 19.1, 19.4_

- [ ] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 16 universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- The DSP engine runs entirely client-side via AudioWorklet; the cloud is used only for data sync, auth, payments, and AI enhancement
- Convex provides the reactive backend with real-time subscriptions and offline-first support
- All code uses TypeScript strict mode with the `@/*` path alias convention
