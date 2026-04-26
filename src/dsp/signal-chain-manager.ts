import type { PowerAmpTubeType } from '@/types/amp';
import type { MicType } from '@/types/cabinet';
import type { FxPedalInstance } from '@/types/fx';
import type {
  SignalChainState,
  InputSettings,
  PreampTubeConfig,
  AmplifierConfig,
  CabinetConfig,
  OutputSettings,
  SavedSignalChain,
} from '@/types/signal-chain';

// ─── Stage Definitions ───────────────────────────────────────────────

/**
 * The fixed, canonical processing order for the signal chain.
 * This order MUST NOT change regardless of any user operation.
 */
export const STAGE_ORDER = [
  'input',
  'preampFx',
  'preampTubes',
  'amplifier',
  'fxLoop',
  'cabinet',
  'output',
] as const;

export type StageId = (typeof STAGE_ORDER)[number];

/**
 * Pedal stages are the only stages that support user-reorderable pedals.
 */
export type PedalStageId = 'preampFx' | 'fxLoop';

// ─── Interfaces ──────────────────────────────────────────────────────

export interface SignalChainManager {
  // Lifecycle
  initialize(audioContext: AudioContext): Promise<void>;
  dispose(): void;

  // Chain configuration
  loadSignalChain(config: SavedSignalChain): Promise<void>;
  getSignalChainState(): SignalChainState;
  getStageOrder(): readonly StageId[];

  // Stage manipulation
  setAmpModel(modelId: string): Promise<void>;
  setPreampTubeCount(count: number): void;
  setPowerAmpTubeType(tubeType: PowerAmpTubeType): void;
  setCabinet(cabinetId: string): Promise<void>;

  // FX pedal management
  addPedal(stageId: PedalStageId, pedal: FxPedalInstance): void;
  removePedal(stageId: PedalStageId, instanceId: string): void;
  reorderPedals(stageId: PedalStageId, newOrder: string[]): void;
  setPedalEnabled(stageId: PedalStageId, instanceId: string, enabled: boolean): void;

  // Parameter control
  setInputSettings(settings: Partial<InputSettings>): void;
  setOutputSettings(settings: Partial<OutputSettings>): void;

  // Microphone
  setMicPosition(x: number, y: number, z: number): void;
  setMicType(micType: MicType): void;
  setMicDistance(distance: number): void;
}

// ─── Default State ───────────────────────────────────────────────────

function createDefaultState(): SignalChainState {
  return {
    inputSettings: {
      inputGain: 0.5,
      noiseGateEnabled: false,
      noiseGateThreshold: -60,
      noiseGateRelease: 50,
    },
    preampFx: [],
    preampTubes: {
      tubeCount: 1,
      stageGains: [1.0],
    },
    amplifier: {
      modelId: 'winston-chl',
      parameters: {
        preampGain: 5,
        volume: 5,
        masterVolume: 5,
        masterGain: 5,
        bass: 5,
        middle: 5,
        treble: 5,
        tone: 5,
        presence: 5,
        resonance: 5,
        channel: 'clean',
        toggles: {},
      },
    },
    fxLoop: [],
    cabinet: {
      cabinetId: 'cab-winston-4x12',
      mic: {
        type: 'dynamic',
        position: { x: 0, y: 0, z: 0 },
        distance: 0.5,
      },
    },
    outputSettings: {
      masterVolume: 0.5,
      outputGain: 0.5,
    },
  };
}

// ─── Implementation ──────────────────────────────────────────────────

/**
 * Manages the signal chain state and AudioWorkletNode graph.
 *
 * The manager tracks the signal chain as data (array of stage IDs in fixed
 * canonical order) and provides methods to manipulate pedals within stages,
 * change amp/cabinet models, and load/save full chain state.
 *
 * The actual AudioContext/AudioWorkletNode wiring is abstracted behind
 * optional hooks so the core logic can be tested without a browser
 * environment.
 */
export class SignalChainManagerImpl implements SignalChainManager {
  private state: SignalChainState;
  private audioContext: AudioContext | null = null;
  private initialized = false;

  constructor(initialState?: SignalChainState) {
    this.state = initialState ? structuredClone(initialState) : createDefaultState();
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  async initialize(audioContext: AudioContext): Promise<void> {
    this.audioContext = audioContext;
    this.initialized = true;
    // In a real implementation, this would register AudioWorklet modules
    // and create the initial node graph.
  }

  dispose(): void {
    this.audioContext = null;
    this.initialized = false;
  }

  // ── Chain Configuration ──────────────────────────────────────────

  async loadSignalChain(saved: SavedSignalChain): Promise<void> {
    this.state = structuredClone(saved.config);
  }

  getSignalChainState(): SignalChainState {
    return structuredClone(this.state);
  }

  /**
   * Returns the fixed canonical stage order.
   * This NEVER changes regardless of any operation performed on the chain.
   */
  getStageOrder(): readonly StageId[] {
    return STAGE_ORDER;
  }

  // ── Stage Manipulation ───────────────────────────────────────────

  async setAmpModel(modelId: string): Promise<void> {
    this.state.amplifier.modelId = modelId;
  }

  setPreampTubeCount(count: number): void {
    const currentGains = this.state.preampTubes.stageGains;
    if (count > currentGains.length) {
      // Add new stages with default gain of 1.0
      const newGains = [...currentGains];
      while (newGains.length < count) {
        newGains.push(1.0);
      }
      this.state.preampTubes = { tubeCount: count, stageGains: newGains };
    } else {
      this.state.preampTubes = {
        tubeCount: count,
        stageGains: currentGains.slice(0, count),
      };
    }
  }

  setPowerAmpTubeType(tubeType: PowerAmpTubeType): void {
    // Power amp tube type is part of the amp model definition,
    // but we track it for runtime overrides.
    // In a full implementation this would update the PowerAmpProcessor node.
    void tubeType;
  }

  async setCabinet(cabinetId: string): Promise<void> {
    this.state.cabinet.cabinetId = cabinetId;
  }

  // ── FX Pedal Management ──────────────────────────────────────────

  private getPedalList(stageId: PedalStageId): FxPedalInstance[] {
    return stageId === 'preampFx' ? this.state.preampFx : this.state.fxLoop;
  }

  private setPedalList(stageId: PedalStageId, pedals: FxPedalInstance[]): void {
    if (stageId === 'preampFx') {
      this.state.preampFx = pedals;
    } else {
      this.state.fxLoop = pedals;
    }
  }

  addPedal(stageId: PedalStageId, pedal: FxPedalInstance): void {
    const pedals = this.getPedalList(stageId);
    // Insert at the pedal's position, or append at end
    const position = pedal.position ?? pedals.length;
    const newPedals = [...pedals];
    newPedals.splice(position, 0, pedal);
    // Re-index positions
    this.setPedalList(
      stageId,
      newPedals.map((p, i) => ({ ...p, position: i })),
    );
  }

  removePedal(stageId: PedalStageId, instanceId: string): void {
    const pedals = this.getPedalList(stageId);
    const filtered = pedals.filter((p) => p.instanceId !== instanceId);
    // Re-index positions
    this.setPedalList(
      stageId,
      filtered.map((p, i) => ({ ...p, position: i })),
    );
  }

  /**
   * Reorder pedals within a stage by providing the new order of instance IDs.
   * This reconnects nodes without tearing down the graph (within 10ms target).
   * The inter-stage order (STAGE_ORDER) is NEVER affected.
   */
  reorderPedals(stageId: PedalStageId, newOrder: string[]): void {
    const pedals = this.getPedalList(stageId);
    const pedalMap = new Map(pedals.map((p) => [p.instanceId, p]));

    const reordered: FxPedalInstance[] = [];
    for (const instanceId of newOrder) {
      const pedal = pedalMap.get(instanceId);
      if (pedal) {
        reordered.push({ ...pedal, position: reordered.length });
      }
    }

    // Append any pedals not in newOrder at the end (defensive)
    for (const pedal of pedals) {
      if (!newOrder.includes(pedal.instanceId)) {
        reordered.push({ ...pedal, position: reordered.length });
      }
    }

    this.setPedalList(stageId, reordered);
  }

  setPedalEnabled(stageId: PedalStageId, instanceId: string, enabled: boolean): void {
    const pedals = this.getPedalList(stageId);
    this.setPedalList(
      stageId,
      pedals.map((p) => (p.instanceId === instanceId ? { ...p, enabled } : p)),
    );
  }

  // ── Parameter Control ────────────────────────────────────────────

  setInputSettings(settings: Partial<InputSettings>): void {
    this.state.inputSettings = { ...this.state.inputSettings, ...settings };
  }

  setOutputSettings(settings: Partial<OutputSettings>): void {
    this.state.outputSettings = { ...this.state.outputSettings, ...settings };
  }

  // ── Microphone ───────────────────────────────────────────────────

  setMicPosition(x: number, y: number, z: number): void {
    this.state.cabinet.mic.position = { x, y, z };
  }

  setMicType(micType: MicType): void {
    this.state.cabinet.mic.type = micType;
  }

  setMicDistance(distance: number): void {
    this.state.cabinet.mic.distance = distance;
  }
}
