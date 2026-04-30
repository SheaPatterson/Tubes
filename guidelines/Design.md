# Design Document: Amp Simulation Platform

## Overview

The Amp Simulation Platform is a cross-platform guitar amplifier and effects simulation application built on Next.js with a client-side DSP engine powered by the Web Audio API's AudioWorklet interface. The system uses Convex as the reactive backend for real-time data sync, authentication, and subscription management, while leveraging Service Workers and local storage for offline-first operation.

The architecture separates concerns into three primary layers:

1. **DSP Layer** — Client-side audio processing via AudioWorklet running on a dedicated audio thread, achieving sub-15ms latency by processing 128-sample frames at 44.1–96kHz sample rates.
2. **Application Layer** — Next.js App Router with React components for the skeuomorphic/glassmorphic UI, state management via Convex reactive queries, and platform abstraction for Web/PWA/Electron/Android targets.
3. **Cloud Layer** — Convex backend for data persistence, real-time sync, and subscription management; a separate FastAPI service hosts the AI Neural Network engine for Next Gen tier processing.

Key architectural decisions:

- **AudioWorklet over ScriptProcessorNode**: AudioWorklet runs on a separate real-time audio thread with a fixed 128-sample block size (~2.9ms at 44.1kHz), enabling deterministic low-latency processing. ScriptProcessorNode is deprecated and runs on the main thread.
- **Convex over raw PostgreSQL**: Convex provides end-to-end TypeScript type safety, real-time subscriptions via WebSockets, and built-in optimistic updates — eliminating the need for a separate API layer for most operations. For offline sync, Convex's optimistic mutations combined with a local IndexedDB cache provide CRDT-like conflict resolution.
- **Signal chain as a directed acyclic graph (DAG)**: Each processing stage is an AudioWorkletNode connected in sequence. Reordering FX pedals within a stage reconnects nodes without tearing down the entire graph, enabling glitch-free parameter changes within the 10ms requirement.
- **Electron shares the same codebase**: The Electron app loads the Next.js app via `BrowserWindow.loadURL`, with native Node.js bridges for file system access (recording), MIDI device enumeration, and audio interface selection. The Web Audio API works identically in Electron's Chromium runtime.

Cloud Services

Client (Browser / Electron / Android WebView)

React UI Layer  
Skeuomorphic + Glassmorphic

State Manager  
Convex React Hooks + Local Cache

DSP Engine  
AudioWorklet Thread

Service Worker  
Offline Cache

MIDI Manager  
Web MIDI API

Recording Engine  
MediaRecorder API

Convex Backend  
Database + Functions + Real-time Sync

AI Engine  
FastAPI + Neural Network

Payment Processor  
Stripe / PayPal

Auth Provider  
Convex Auth / Clerk

## Architecture

### System Architecture

The platform follows a client-heavy architecture where all audio processing happens on the user's device. The cloud is used only for data persistence, sync, authentication, payments, and AI enhancement.

#### Audio Processing Pipeline

The DSP Engine is built entirely on the Web Audio API. Each stage of the signal chain maps to one or more `AudioWorkletNode` instances connected in series:

Audio Input  
getUserMedia / Audio Interface

Input Settings  
Gain + Noise Gate

Preamp FX  
Pedal Chain

Preamp Tubes  
12AX7 Stages

Amplifier  
Tone Stack + Channel

FX Loop  
Pedal Chain

Cabinet  
IR Convolution

Output Settings  
Master Volume + EQ

Audio Output  
Speakers / Interface

AI Enhancement  
Cloud Round-trip

Each node processes audio in 128-sample blocks on the AudioWorklet thread. Parameter changes are communicated via `AudioParam` (for sample-accurate automation) or `MessagePort` (for structural changes like pedal reordering).

**Latency budget** (at 44.1kHz, 128-sample blocks):

- Input buffer: ~2.9ms
- DSP processing (all stages): ~1–3ms
- Output buffer: ~2.9ms
- Audio interface round-trip: ~5–6ms
- **Total: ~12–15ms** (within the 15ms requirement)

#### Data Flow Architecture

Convex Backend

Main Thread

Real-time Audio Path (AudioWorklet Thread)

User Interaction

Structural Change

CC/PC Messages

Optimistic Updates

Offline Sync

AudioParam Updates

MessagePort Commands

Worklet Processors

React Components

Convex Hooks  
useQuery / useMutation

Local Cache  
IndexedDB

MIDI Controller Handler

Query Functions

Mutation Functions

Action Functions  
AI Engine Calls

Convex Database

### Cross-Platform Strategy

|Target|Runtime|Audio Engine|Distribution|
|---|---|---|---|
|Web|Browser (Chrome, Firefox, Safari, Edge)|Web Audio API + AudioWorklet|Vercel deployment|
|PWA|Browser + Service Worker|Web Audio API + AudioWorklet|Same as web, installable|
|Electron (Mac)|Chromium + Node.js|Web Audio API + AudioWorklet|DMG / App Store|
|Electron (Windows)|Chromium + Node.js|Web Audio API + AudioWorklet|NSIS installer / MS Store|
|Android|WebView (Capacitor/TWA)|Web Audio API + AudioWorklet|Google Play Store|

The Electron app wraps the Next.js build with additional Node.js bridges:

- `electron-audio-bridge`: Enumerates native audio devices, sets buffer sizes
- `electron-midi-bridge`: Supplements Web MIDI API with native USB/Bluetooth MIDI
- `electron-fs-bridge`: Provides native file save dialogs for recordings

## Components and Interfaces

### 1. DSP Engine (`src/dsp/`)

The DSP Engine is the core audio processing system. It runs entirely on the AudioWorklet thread.

#### AudioWorklet Processors

Each signal chain stage is implemented as a custom `AudioWorkletProcessor`:

```
// src/dsp/processors/preamp-tube-processor.tsinterface PreampTubeParams {  gainStages: number;       // 1–N (model-dependent)  stageGain: number[];      // Per-stage gain values from Preamp_Tone_Values  frequencyResponse: number[][]; // Per-stage EQ curves}class PreampTubeProcessor extends AudioWorkletProcessor {  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean}
```

**Processor inventory:**

|Processor|Purpose|Key Parameters|
|---|---|---|
|`InputSettingsProcessor`|Input gain, noise gate|gain, gateThreshold, gateRelease|
|`FxPedalProcessor`|Generic FX pedal DSP|circuitType, knobValues[], enabled|
|`PreampTubeProcessor`|12AX7 tube gain staging|gainStages, stageGain[], frequencyResponse|
|`AmplifierProcessor`|Tone stack + channel|bass, mid, treble, presence, resonance, channel|
|`PowerAmpProcessor`|Power tube simulation|tubeType, masterVolume, bias, sag, voltage|
|`CabinetProcessor`|IR convolution|irBuffer, micType, micPosition, micDistance|
|`OutputSettingsProcessor`|Master volume, final EQ|masterVolume, outputGain|

#### Signal Chain Manager

```
// src/dsp/signal-chain-manager.tsinterface SignalChainManager {  // Lifecycle  initialize(audioContext: AudioContext): Promise<void>;  dispose(): void;  // Chain configuration  loadSignalChain(config: SavedSignalChain): Promise<void>;  getSignalChainState(): SignalChainState;  // Stage manipulation  setAmpModel(modelId: string): Promise<void>;  setPreampTubeCount(count: number): void;  setPowerAmpTubeType(tubeType: PowerAmpTubeType): void;  setCabinet(cabinetId: string): Promise<void>;  // FX pedal management  addPedal(stageId: 'preamp' | 'fxloop', pedalId: string, position: number): void;  removePedal(stageId: 'preamp' | 'fxloop', position: number): void;  reorderPedals(stageId: 'preamp' | 'fxloop', newOrder: string[]): void;  setPedalEnabled(stageId: 'preamp' | 'fxloop', position: number, enabled: boolean): void;  // Parameter control  setParameter(nodeId: string, paramName: string, value: number): void;  getParameter(nodeId: string, paramName: string): number;  // Microphone  setMicPosition(x: number, y: number, z: number): void;  setMicType(micType: MicType): void;  setMicDistance(distance: number): void;}
```

### 2. UI Components (`src/components/`)

#### Skeuomorphic Controls

```
// src/components/controls/rotary-knob.tsxinterface RotaryKnobProps {  value: number;              // Current value (normalized 0–1)  min: number;                // Display minimum (e.g., 1)  max: number;                // Display maximum (e.g., 10)  label: string;              // Knob label text  onChange: (value: number) => void;  onContextMenu: (e: React.MouseEvent) => void;  size?: 'sm' | 'md' | 'lg';  style?: 'chicken-head' | 'pointer' | 'dome'; // Knob visual style}// src/components/controls/toggle-switch.tsxinterface ToggleSwitchProps {  value: boolean;  label: string;  onChange: (value: boolean) => void;  style?: 'rocker' | 'toggle' | 'push';}// src/components/controls/slider-control.tsxinterface SliderControlProps {  value: number;  min: number;  max: number;  label: string;  orientation: 'horizontal' | 'vertical';  onChange: (value: number) => void;}
```

#### Amp Model Renderer

```
// src/components/amp/amp-model-renderer.tsxinterface AmpModelRendererProps {  model: AmpModel;  parameters: AmpParameters;  onParameterChange: (param: string, value: number) => void;  onChannelChange: (channel: AmpChannel) => void;  onContextMenu: (param: string, e: React.MouseEvent) => void;}
```

Each amp model has a dedicated layout configuration defining knob positions, colors, typography, and panel artwork. The renderer reads this configuration and places `RotaryKnob`, `ToggleSwitch`, and channel selector components accordingly.

#### FX Pedal Board

```
// src/components/fx/pedal-board.tsxinterface PedalBoardProps {  stage: 'preamp' | 'fxloop';  pedals: FxPedalInstance[];  onReorder: (newOrder: string[]) => void;  onPedalToggle: (pedalId: string, enabled: boolean) => void;  onPedalParameterChange: (pedalId: string, param: string, value: number) => void;  onAddPedal: () => void;  onRemovePedal: (pedalId: string) => void;}
```

Drag-and-drop reordering uses `@dnd-kit/core` for accessible, touch-friendly sorting. Each pedal renders as a skeuomorphic card with its brand-renamed identity, knobs, and footswitch.

#### Context Menu System

```
// src/components/ui/parameter-context-menu.tsxinterface ParameterContextMenuProps {  targetType: 'knob' | 'slider' | 'switch' | 'pedal' | 'amp';  paramName: string;  currentValue: number;  min: number;  max: number;  defaultValue: number;  onSetDefault: () => void;  onEnterValue: (value: number) => void;  onCopyValue: () => void;  onPasteValue: (value: number) => void;}
```

### 3. Convex Backend (`convex/`)

#### Schema Definition

```
// convex/schema.tsimport { defineSchema, defineTable } from "convex/server";import { v } from "convex/values";export default defineSchema({  // Amp models and tone data  ampList: defineTable({ ... }),  ampManufacturerToneValues: defineTable({ ... }),  preampSettings: defineTable({ ... }),  preampToneValues: defineTable({ ... }),  powerAmpSettings: defineTable({ ... }),  powerAmpToneValues: defineTable({ ... }),  // FX pedals  fxPedalList: defineTable({ ... }),  fxPedalSettings: defineTable({ ... }),  fxPedalCircuitValues: defineTable({ ... }),  fxCategoryValues: defineTable({ ... }),  fxManufacturerValues: defineTable({ ... }),  // Cabinets and speakers  cabList: defineTable({ ... }),  speakerList: defineTable({ ... }),  cabToneValues: defineTable({ ... }),  speakerToneValues: defineTable({ ... }),  cabCombinedValues: defineTable({ ... }),  // Microphones  micList: defineTable({ ... }),  micTypeToneValues: defineTable({ ... }),  // User data  userProfiles: defineTable({ ... }),  userBioInformation: defineTable({ ... }),  savedUserSignalChain: defineTable({ ... }),  userSignalChainValues: defineTable({ ... }),  // Subscriptions  subscriptions: defineTable({ ... }),});
```

#### Convex Functions

```
// convex/signalChains.ts — Query and mutation functionsexport const getUserSignalChains = query({  args: { userId: v.id("userProfiles") },  handler: async (ctx, args) => { /* ... */ }});export const saveSignalChain = mutation({  args: { name: v.string(), config: v.object({ /* ... */ }) },  handler: async (ctx, args) => { /* ... */ }});export const loadSignalChain = query({  args: { chainId: v.id("savedUserSignalChain") },  handler: async (ctx, args) => { /* ... */ }});// convex/subscriptions.ts — Tier enforcementexport const getUserTier = query({  args: {},  handler: async (ctx) => { /* ... */ }});export const checkContentAccess = query({  args: { contentType: v.string(), contentId: v.string() },  handler: async (ctx, args) => { /* ... */ }});
```

### 4. AI Engine Interface (`src/services/ai-engine.ts`)

```
interface AIEngineService {  // Connection management  connect(): Promise<void>;  disconnect(): void;  getStatus(): AIEngineStatus;  // Audio processing  processAudio(dspOutput: Float32Array, sampleRate: number): Promise<Float32Array>;  setBlendLevel(level: number): void; // 0.0 (DSP only) to 1.0 (full AI)  // Status  getLatency(): number;  getModelVersion(): string;}interface AIEngineStatus {  connected: boolean;  latency: number;  modelVersion: string;  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';}
```

The AI Engine communicates via WebSocket for streaming audio data to the FastAPI backend. When latency exceeds 50ms, the client automatically notifies the user and offers to disable AI enhancement.

### 5. MIDI Manager (`src/services/midi-manager.ts`)

```
interface MIDIManager {  // Device discovery  initialize(): Promise<void>;  getDevices(): MIDIDevice[];  selectDevice(deviceId: string): void;  // Mapping  createMapping(midiMessage: MIDIMessage, target: ParameterTarget): void;  deleteMapping(mappingId: string): void;  getMappings(): MIDIMapping[];  // Quick-map mode  startQuickMap(target: ParameterTarget): void;  cancelQuickMap(): void;  // Events  onMessage: (callback: (message: MIDIMessage) => void) => void;}interface MIDIMapping {  id: string;  channel: number;  type: 'cc' | 'program_change';  number: number;  target: ParameterTarget;}type ParameterTarget =  | { type: 'amp_channel'; channel: AmpChannel }  | { type: 'pedal_toggle'; stageId: string; pedalId: string }  | { type: 'pedal_boost'; stageId: string; pedalId: string }  | { type: 'parameter'; nodeId: string; paramName: string };
```

### 6. Recording Engine (`src/services/recording-engine.ts`)

```
interface RecordingEngine {  startRecording(options: RecordingOptions): void;  stopRecording(): Promise<RecordingResult>;  isRecording(): boolean;  getElapsedTime(): number;  getWaveformData(): Float32Array; // For visualization}interface RecordingOptions {  format: 'wav' | 'mp3' | 'flac';  sampleRate: 44100 | 48000 | 96000;  bitDepth: 16 | 24 | 32;  outputPath?: string; // Electron only}interface RecordingResult {  blob: Blob;  duration: number;  format: string;  sampleRate: number;  bitDepth: number;}
```

### 7. Offline Manager (`src/services/offline-manager.ts`)

```
interface OfflineManager {  getConnectivityStatus(): 'online' | 'offline';  onStatusChange: (callback: (status: 'online' | 'offline') => void) => void;  // Local cache  cacheSignalChain(chain: SavedSignalChain): Promise<void>;  getCachedSignalChains(): Promise<SavedSignalChain[]>;  // Sync  syncPendingChanges(): Promise<SyncResult>;  getPendingChangeCount(): number;}
```

## Data Models

### Core Type Definitions

```
// src/types/amp.tstype AmpChannel = 'clean' | 'crunch' | 'overdrive';type PowerAmpTubeType = 'KT88' | '6L6' | 'EL34' | 'EL84' | '12BH7' | '12AU7';type MicType = 'condenser' | 'ribbon' | 'dynamic';type MicPreset = 'center' | 'middle' | 'outside';type SubscriptionTier = 'free' | 'classic' | 'next_gen';interface AmpModel {  id: string;  name: string;                    // e.g., "Winston CHL"  originalBrand: string;           // Internal reference only  brandRename: string;             // e.g., "Winston"  channels: AmpChannel[];  preampStageCount: number;        // Max 12AX7 stages  powerAmpTubeType: PowerAmpTubeType;  controls: AmpControlDefinition[];  toggleSwitches: ToggleSwitchDefinition[];  visualConfig: AmpVisualConfig;}interface AmpParameters {  preampGain: number;    // 1–10  volume: number;        // 1–10  masterVolume: number;  // 1–10  masterGain: number;    // 1–10  bass: number;          // 1–10  middle: number;        // 1–10  treble: number;        // 1–10  tone: number;          // 1–10  presence: number;      // 1–10  resonance: number;     // 1–10  channel: AmpChannel;  toggles: Record<string, boolean>; // toneShift, deep, midBoost, etc.}interface AmpControlDefinition {  name: string;  paramKey: keyof AmpParameters;  min: number;  max: number;  defaultValue: number;  step: number;}interface ToggleSwitchDefinition {  name: string;  paramKey: string;  defaultValue: boolean;  applicableToModel: boolean;}interface AmpVisualConfig {  panelColor: string;  knobStyle: 'chicken-head' | 'pointer' | 'dome';  fontFamily: string;  logoSvgPath: string;  layoutGrid: KnobPosition[];}interface KnobPosition {  paramKey: string;  x: number;  // Percentage position  y: number;  size: 'sm' | 'md' | 'lg';}
```

```
// src/types/fx.tstype FxCategory = 'overdrive' | 'distortion' | 'delay' | 'modulation' | 'compression' | 'eq' | 'gate' | 'multi';type FxBrandRename = 'MAC' | 'KING' | 'Manhattan' | 'TOKYO';interface FxPedalDefinition {  id: string;  name: string;                    // e.g., "Super Comp"  brand: FxBrandRename;  originalBrand: string;           // Internal reference  category: FxCategory;  controls: FxControlDefinition[];  circuitType: string;             // Reference to circuit model  visualConfig: FxPedalVisualConfig;  tierRequired: SubscriptionTier;  // 'free' for free-tier pedals}interface FxPedalInstance {  definitionId: string;  instanceId: string;  enabled: boolean;  parameters: Record<string, number>;  position: number;                // Order in chain}interface FxControlDefinition {  name: string;  paramKey: string;  type: 'knob' | 'switch' | 'slider';  min: number;  max: number;  defaultValue: number;  step: number;}interface FxPedalVisualConfig {  bodyColor: string;  knobStyle: string;  labelFont: string;  logoSvgPath: string;  width: number;  height: number;}
```

```
// src/types/cabinet.tsinterface Cabinet {  id: string;  name: string;                    // e.g., "Winston 4x12"  speakerConfig: string;           // e.g., "4x12"  speakers: Speaker[];  irData: Float32Array;            // Combined IR buffer  visualConfig: CabinetVisualConfig;}interface Speaker {  id: string;  name: string;  frequencyResponse: number[];     // From Speaker_Tone_Values  powerRating: number;}interface MicPosition {  x: number;  // -1 to 1 (left to right)  y: number;  // -1 to 1 (bottom to top)  z: number;  // 0 to 1 (distance from cone)}interface MicConfiguration {  type: MicType;  position: MicPosition;  distance: number;                // 0 to 1 (close to far)  preset?: MicPreset;}
```

```
// src/types/signal-chain.tsinterface SignalChainState {  inputSettings: InputSettings;  preampFx: FxPedalInstance[];  preampTubes: PreampTubeConfig;  amplifier: AmplifierConfig;  fxLoop: FxPedalInstance[];  cabinet: CabinetConfig;  outputSettings: OutputSettings;}interface InputSettings {  inputGain: number;       // 0–1  noiseGateEnabled: boolean;  noiseGateThreshold: number;  noiseGateRelease: number;}interface PreampTubeConfig {  tubeCount: number;       // 1–N  stageGains: number[];    // Per-stage gain}interface AmplifierConfig {  modelId: string;  parameters: AmpParameters;}interface CabinetConfig {  cabinetId: string;  mic: MicConfiguration;}interface OutputSettings {  masterVolume: number;    // 0–1  outputGain: number;      // 0–1}interface SavedSignalChain {  id: string;  userId: string;  name: string;  config: SignalChainState;  createdAt: number;  updatedAt: number;}
```

```
// src/types/user.tsinterface UserProfile {  id: string;  email: string;  displayName: string;  tier: SubscriptionTier;  createdAt: number;  lastLoginAt: number;}interface Subscription {  id: string;  userId: string;  tier: SubscriptionTier;  status: 'active' | 'past_due' | 'cancelled';  currentPeriodEnd: number;  paymentMethod: 'credit_card' | 'paypal';}
```

```
// src/types/tone-stack.ts// Serialization types for round-trip propertyinterface ToneStackJSON {  version: number;  ampModelId: string;  parameters: {    preampGain: number;    volume: number;    masterVolume: number;    masterGain: number;    bass: number;    middle: number;    treble: number;    tone: number;    presence: number;    resonance: number;  };  channel: AmpChannel;  toggles: Record<string, boolean>;}interface FxChainJSON {  version: number;  pedals: Array<{    definitionId: string;    enabled: boolean;    parameters: Record<string, number>;    position: number;  }>;}// Serialization functionsfunction serializeToneStack(params: AmpParameters, modelId: string): ToneStackJSON;function deserializeToneStack(json: ToneStackJSON): { modelId: string; params: AmpParameters };function serializeFxChain(pedals: FxPedalInstance[]): FxChainJSON;function deserializeFxChain(json: FxChainJSON): FxPedalInstance[];
```

### Convex Database Schema (Detailed)

```
// convex/schema.tsimport { defineSchema, defineTable } from "convex/server";import { v } from "convex/values";export default defineSchema({  // ── Amplifier Tables ──  ampList: defineTable({    name: v.string(),    brandRename: v.string(),    channels: v.array(v.string()),    preampStageCount: v.number(),    powerAmpTubeType: v.string(),    controls: v.array(v.object({      name: v.string(),      paramKey: v.string(),      min: v.number(),      max: v.number(),      defaultValue: v.number(),    })),    toggleSwitches: v.array(v.object({      name: v.string(),      paramKey: v.string(),      defaultValue: v.boolean(),    })),    visualConfig: v.any(),  }).index("by_name", ["name"]),  ampManufacturerToneValues: defineTable({    ampId: v.id("ampList"),    bass: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),    middle: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),    treble: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),    presence: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),    resonance: v.object({ frequency: v.number(), gain: v.number(), q: v.number() }),  }).index("by_amp", ["ampId"]),  preampToneValues: defineTable({    ampId: v.id("ampList"),    stageIndex: v.number(),    gain: v.number(),    frequencyResponse: v.array(v.number()),    harmonicContent: v.array(v.number()),  }).index("by_amp_stage", ["ampId", "stageIndex"]),  powerAmpToneValues: defineTable({    tubeType: v.string(),    masterVolumeResponse: v.array(v.number()),    biasDefault: v.number(),    sagCoefficient: v.number(),    voltageDefault: v.number(),    compressionCurve: v.array(v.number()),    dynamicRange: v.object({ min: v.number(), max: v.number() }),  }).index("by_tube_type", ["tubeType"]),  // ── FX Pedal Tables ──  fxPedalList: defineTable({    name: v.string(),    brand: v.string(),    category: v.string(),    controls: v.array(v.object({      name: v.string(),      paramKey: v.string(),      type: v.string(),      min: v.number(),      max: v.number(),      defaultValue: v.number(),    })),    tierRequired: v.string(),    visualConfig: v.any(),  }).index("by_brand", ["brand"])    .index("by_category", ["category"]),  fxPedalCircuitValues: defineTable({    pedalId: v.id("fxPedalList"),    circuitType: v.string(),    componentValues: v.any(),    transferFunction: v.array(v.number()),  }).index("by_pedal", ["pedalId"]),  fxCategoryValues: defineTable({    name: v.string(),    displayOrder: v.number(),  }),  fxManufacturerValues: defineTable({    originalName: v.string(),    brandRename: v.string(),    logoSvgPath: v.string(),  }),  // ── Cabinet Tables ──  cabList: defineTable({    name: v.string(),    speakerConfig: v.string(),    speakerIds: v.array(v.id("speakerList")),    visualConfig: v.any(),  }).index("by_name", ["name"]),  speakerList: defineTable({    name: v.string(),    frequencyResponse: v.array(v.number()),    powerRating: v.number(),  }),  cabToneValues: defineTable({    cabId: v.id("cabList"),    depth: v.number(),    dimension: v.number(),    airSimulation: v.array(v.number()),  }).index("by_cab", ["cabId"]),  speakerToneValues: defineTable({    speakerId: v.id("speakerList"),    frequencySpectrum: v.array(v.number()),    impedanceCurve: v.array(v.number()),  }).index("by_speaker", ["speakerId"]),  cabCombinedValues: defineTable({    cabId: v.id("cabList"),    irData: v.bytes(),    sampleRate: v.number(),  }).index("by_cab", ["cabId"]),  // ── Microphone Tables ──  micList: defineTable({    name: v.string(),    type: v.string(),  }),  micTypeToneValues: defineTable({    micId: v.id("micList"),    frequencyResponse: v.array(v.number()),    polarPattern: v.string(),    sensitivityDb: v.number(),  }).index("by_mic", ["micId"]),  // ── User Tables ──  userProfiles: defineTable({    email: v.string(),    displayName: v.string(),    passwordHash: v.string(),    tier: v.string(),    createdAt: v.number(),    lastLoginAt: v.number(),    failedLoginAttempts: v.number(),    lockedUntil: v.optional(v.number()),  }).index("by_email", ["email"]),  userBioInformation: defineTable({    userId: v.id("userProfiles"),    firstName: v.optional(v.string()),    lastName: v.optional(v.string()),    avatarUrl: v.optional(v.string()),    bio: v.optional(v.string()),  }).index("by_user", ["userId"]),  savedUserSignalChain: defineTable({    userId: v.id("userProfiles"),    name: v.string(),    config: v.any(),    createdAt: v.number(),    updatedAt: v.number(),  }).index("by_user", ["userId"])    .index("by_user_name", ["userId", "name"]),  userSignalChainValues: defineTable({    chainId: v.id("savedUserSignalChain"),    parameterKey: v.string(),    parameterValue: v.any(),  }).index("by_chain", ["chainId"]),  // ── Subscription Tables ──  subscriptions: defineTable({    userId: v.id("userProfiles"),    tier: v.string(),    status: v.string(),    stripeCustomerId: v.optional(v.string()),    stripeSubscriptionId: v.optional(v.string()),    currentPeriodEnd: v.number(),    createdAt: v.number(),  }).index("by_user", ["userId"]),  // ── Real-Time Tables (for session state) ──  realTimeUserSignalChain: defineTable({    userId: v.id("userProfiles"),    sessionId: v.string(),    currentState: v.any(),    lastUpdated: v.number(),  }).index("by_user_session", ["userId", "sessionId"]),  micRealTimePositionValues: defineTable({    sessionId: v.string(),    userId: v.id("userProfiles"),    x: v.number(),    y: v.number(),    z: v.number(),    distance: v.number(),    lastUpdated: v.number(),  }).index("by_session", ["sessionId"]),  // ── MIDI Mappings ──  midiMappings: defineTable({    userId: v.id("userProfiles"),    channel: v.number(),    type: v.string(),    number: v.number(),    targetType: v.string(),    targetConfig: v.any(),  }).index("by_user", ["userId"]),  // ── Settings ──  userSettings: defineTable({    userId: v.id("userProfiles"),    audioInterfaceId: v.optional(v.string()),    bufferSize: v.optional(v.number()),    sampleRate: v.optional(v.number()),    recordingFormat: v.optional(v.string()),    recordingBitDepth: v.optional(v.number()),    cpuPriority: v.optional(v.string()),    gpuEnabled: v.optional(v.boolean()),    aiBlendLevel: v.optional(v.number()),  }).index("by_user", ["userId"]),});
```

### Entity Relationship Diagram

owns

has

subscribes

configures

configures

sessions

contains

defines

stages

used by

modeled by

categorized

branded

contains

tuned

IR data

response

response

userProfiles

savedUserSignalChain

userBioInformation

subscriptions

midiMappings

userSettings

realTimeUserSignalChain

userSignalChainValues

ampList

ampManufacturerToneValues

preampToneValues

powerAmpToneValues

fxPedalList

fxPedalCircuitValues

fxCategoryValues

fxManufacturerValues

cabList

speakerList

cabToneValues

cabCombinedValues

speakerToneValues

micList

micTypeToneValues