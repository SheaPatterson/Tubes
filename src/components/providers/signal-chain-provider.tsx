"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SignalChainManagerImpl } from "@/dsp/signal-chain-manager";
import type { SignalChainManager } from "@/dsp/signal-chain-manager";
import type { SignalChainState } from "@/types/signal-chain";

interface SignalChainContextValue {
  manager: SignalChainManager | null;
  audioContext: AudioContext | null;
  isInitialized: boolean;
  isAudioRunning: boolean;
  error: string | null;
  /** Start the audio engine — requires user gesture */
  startAudio: () => Promise<void>;
  /** Stop the audio engine */
  stopAudio: () => void;
  /** Push a full state snapshot to the DSP layer */
  pushState: (state: SignalChainState) => void;
}

const SignalChainContext = createContext<SignalChainContextValue>({
  manager: null,
  audioContext: null,
  isInitialized: false,
  isAudioRunning: false,
  error: null,
  startAudio: async () => {},
  stopAudio: () => {},
  pushState: () => {},
});

export function useSignalChain() {
  return useContext(SignalChainContext);
}

/**
 * Provides a singleton SignalChainManager and AudioContext to the component tree.
 *
 * Audio initialization requires a user gesture (browser autoplay policy).
 * Call `startAudio()` from a click/touch handler to begin processing.
 *
 * Once initialized, call `pushState(state)` to send signal chain configuration
 * to the AudioWorklet processors via MessagePort.
 */
export function SignalChainProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef<SignalChainManagerImpl | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Map<string, AudioWorkletNode>>(new Map());

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      managerRef.current?.dispose();
    };
  }, []);

  const startAudio = useCallback(async () => {
    if (isInitialized) return;

    try {
      // Create AudioContext (requires user gesture)
      const ctx = new AudioContext({ sampleRate: 44100, latencyHint: "interactive" });
      audioCtxRef.current = ctx;

      // Resume if suspended (autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Register AudioWorklet processors
      const processorModules = [
        "/dsp/input-settings-processor.js",
        "/dsp/preamp-tube-processor.js",
        "/dsp/amplifier-processor.js",
        "/dsp/fx-pedal-processor.js",
        "/dsp/power-amp-processor.js",
        "/dsp/cabinet-processor.js",
        "/dsp/output-settings-processor.js",
      ];

      // Try to load processors — if files don't exist yet, fall through gracefully
      for (const mod of processorModules) {
        try {
          await ctx.audioWorklet.addModule(mod);
        } catch {
          // Processor module not available — DSP will be bypassed
          console.warn(`AudioWorklet module not found: ${mod}`);
        }
      }

      // Create the node graph
      const nodeNames = [
        "input-settings-processor",
        "preamp-tube-processor",
        "amplifier-processor",
        "fx-pedal-processor",
        "power-amp-processor",
        "cabinet-processor",
        "output-settings-processor",
      ];

      let previousNode: AudioNode = ctx.createGain(); // input gain node
      const nodes = new Map<string, AudioWorkletNode>();

      for (const name of nodeNames) {
        try {
          const node = new AudioWorkletNode(ctx, name);
          nodes.set(name, node);
          previousNode.connect(node);
          previousNode = node;
        } catch {
          // Processor not registered — skip this node, connect through
          console.warn(`Could not create AudioWorkletNode: ${name}`);
        }
      }

      // Connect last node to destination
      previousNode.connect(ctx.destination);
      nodesRef.current = nodes;

      // Initialize the manager
      const manager = new SignalChainManagerImpl();
      await manager.initialize(ctx);
      managerRef.current = manager;

      setIsInitialized(true);
      setIsAudioRunning(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start audio";
      setError(message);
      console.error("Audio initialization failed:", err);
    }
  }, [isInitialized]);

  const stopAudio = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.suspend().catch(() => {});
    }
    setIsAudioRunning(false);
  }, []);

  /**
   * Push a full signal chain state to the AudioWorklet processors.
   * Each processor receives the relevant slice of state via MessagePort.
   */
  const pushState = useCallback((state: SignalChainState) => {
    const nodes = nodesRef.current;
    if (nodes.size === 0) return;

    // Input settings → input-settings-processor
    const inputNode = nodes.get("input-settings-processor");
    if (inputNode) {
      inputNode.port.postMessage({
        type: "setParams",
        inputGain: state.inputSettings.inputGain,
        noiseGateEnabled: state.inputSettings.noiseGateEnabled,
        noiseGateThreshold: state.inputSettings.noiseGateThreshold,
        noiseGateRelease: state.inputSettings.noiseGateRelease,
      });
    }

    // Amplifier → amplifier-processor
    const ampNode = nodes.get("amplifier-processor");
    if (ampNode) {
      const p = state.amplifier.parameters;
      ampNode.port.postMessage({
        type: "setChannel",
        channel: p.channel,
      });
      ampNode.port.postMessage({
        type: "setEQ",
        bass: p.bass,
        middle: p.middle,
        treble: p.treble,
        presence: p.presence,
        resonance: p.resonance,
      });
      ampNode.port.postMessage({
        type: "setGain",
        preampGain: p.preampGain,
        volume: p.volume,
        masterVolume: p.masterVolume,
      });
    }

    // Preamp tubes → preamp-tube-processor
    const tubeNode = nodes.get("preamp-tube-processor");
    if (tubeNode) {
      tubeNode.port.postMessage({
        type: "setStages",
        tubeCount: state.preampTubes.tubeCount,
        stageGains: state.preampTubes.stageGains,
      });
    }

    // Cabinet → cabinet-processor
    const cabNode = nodes.get("cabinet-processor");
    if (cabNode) {
      cabNode.port.postMessage({
        type: "setMicPosition",
        x: state.cabinet.mic.position.x,
        y: state.cabinet.mic.position.y,
        z: state.cabinet.mic.position.z,
      });
      cabNode.port.postMessage({
        type: "setMicType",
        micType: state.cabinet.mic.type,
      });
      cabNode.port.postMessage({
        type: "setMicDistance",
        distance: state.cabinet.mic.distance,
      });
    }

    // Output → output-settings-processor
    const outputNode = nodes.get("output-settings-processor");
    if (outputNode) {
      outputNode.port.postMessage({
        type: "setParams",
        masterVolume: state.outputSettings.masterVolume,
        outputGain: state.outputSettings.outputGain,
      });
    }

    // Update manager state
    managerRef.current?.setInputSettings(state.inputSettings);
    managerRef.current?.setOutputSettings(state.outputSettings);
  }, []);

  const value: SignalChainContextValue = {
    manager: managerRef.current,
    audioContext: audioCtxRef.current,
    isInitialized,
    isAudioRunning,
    error,
    startAudio,
    stopAudio,
    pushState,
  };

  return (
    <SignalChainContext.Provider value={value}>
      {children}
    </SignalChainContext.Provider>
  );
}
