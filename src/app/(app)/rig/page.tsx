"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Guitar, Volume2, Mic, Power } from "lucide-react";
import { cn } from "@/lib/utils";

import { AmpModelRenderer } from "@/components/amp/amp-model-renderer";
import { PedalBoard } from "@/components/fx/pedal-board";
import { CabinetRenderer } from "@/components/cabinet/cabinet-renderer";
import { MicPositionControl } from "@/components/cabinet/mic-position-control";
import { RotaryKnob } from "@/components/controls/rotary-knob";
import { SliderControl } from "@/components/controls/slider-control";
import { ToggleSwitch } from "@/components/controls/toggle-switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsCompact } from "@/hooks/use-breakpoint";
import { useSignalChain } from "@/components/providers/signal-chain-provider";
import { useAmpModels } from "@/hooks/use-amp-models";
import { useCabinets } from "@/hooks/use-cabinets";
import { useFxPedals } from "@/hooks/use-fx-pedals";

import type { AmpChannel, AmpParameters } from "@/types/amp";
import type { MicType, MicPreset } from "@/types/cabinet";
import type {
  SignalChainState,
  InputSettings,
  OutputSettings,
} from "@/types/signal-chain";
import type { FxPedalDefinition, FxPedalInstance } from "@/types/fx";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

// Defaults are resolved inside the component after hooks run.
// These module-level references are only used for the initial build
// before the component mounts.
import { ampModels as staticAmpModels } from "@/data/amp-models";
import { cabinets as staticCabinets } from "@/data/cabinets";

const DEFAULT_AMP = staticAmpModels[0];
const DEFAULT_CABINET = staticCabinets[0];

function buildDefaultAmpParameters(): AmpParameters {
  const params: Record<string, number> = {};
  for (const c of DEFAULT_AMP.controls) {
    params[c.paramKey as string] = c.defaultValue;
  }
  const toggles: Record<string, boolean> = {};
  for (const t of DEFAULT_AMP.toggleSwitches) {
    toggles[t.paramKey] = t.defaultValue;
  }
  return {
    preampGain: (params.preampGain as number) ?? 5,
    volume: (params.volume as number) ?? 5,
    masterVolume: (params.masterVolume as number) ?? 5,
    masterGain: (params.masterGain as number) ?? 5,
    bass: (params.bass as number) ?? 5,
    middle: (params.middle as number) ?? 5,
    treble: (params.treble as number) ?? 5,
    tone: (params.tone as number) ?? 5,
    presence: (params.presence as number) ?? 5,
    resonance: (params.resonance as number) ?? 5,
    channel: DEFAULT_AMP.channels[0],
    toggles,
  } satisfies AmpParameters;
}

function buildDefaultState(): SignalChainState {
  return {
    inputSettings: {
      inputGain: 0.5,
      noiseGateEnabled: false,
      noiseGateThreshold: -60,
      noiseGateRelease: 50,
    },
    preampFx: [],
    preampTubes: {
      tubeCount: DEFAULT_AMP.preampStageCount,
      stageGains: Array.from(
        { length: DEFAULT_AMP.preampStageCount },
        () => 0.7,
      ),
    },
    amplifier: {
      modelId: DEFAULT_AMP.id,
      parameters: buildDefaultAmpParameters(),
    },
    fxLoop: [],
    cabinet: {
      cabinetId: DEFAULT_CABINET.id,
      mic: {
        type: "dynamic",
        position: { x: 0, y: 0, z: 0 },
        distance: 0.2,
        preset: "center",
      },
    },
    outputSettings: {
      masterVolume: 0.7,
      outputGain: 0.5,
    },
  };
}

// ---------------------------------------------------------------------------
// Pedal definition lookup
// ---------------------------------------------------------------------------

function buildPedalDefMap(pedals: FxPedalDefinition[]): Record<string, FxPedalDefinition> {
  const map: Record<string, FxPedalDefinition> = {};
  for (const p of pedals) {
    map[p.id] = p;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Signal chain update helper — batches state updates synchronously so
// parameter changes propagate within a single React commit (~<10ms).
// ---------------------------------------------------------------------------

let nextInstanceId = 1;
function generateInstanceId(): string {
  return `pedal-${Date.now()}-${nextInstanceId++}`;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SignalChainPage() {
  const { data: ampModels } = useAmpModels();
  const { data: cabinets } = useCabinets();
  const { data: fxPedals } = useFxPedals();
  const { isAudioRunning, isInitialized, error: audioError, startAudio, stopAudio, pushState } = useSignalChain();

  const [state, setState] = useState<SignalChainState>(buildDefaultState);

  // Pedal definition map — rebuilt when pedal catalog changes
  const PEDAL_DEF_MAP = useMemo(() => buildPedalDefMap(fxPedals), [fxPedals]);

  // Derived data
  const selectedAmp = useMemo(
    () => ampModels.find((a) => a.id === state.amplifier.modelId) ?? ampModels[0] ?? DEFAULT_AMP,
    [state.amplifier.modelId, ampModels],
  );

  const selectedCabinet = useMemo(
    () => cabinets.find((c) => c.id === state.cabinet.cabinetId) ?? cabinets[0] ?? DEFAULT_CABINET,
    [state.cabinet.cabinetId, cabinets],
  );

  // ── Bridge: push state to DSP layer on every change ──
  useEffect(() => {
    if (isInitialized) {
      pushState(state);
    }
  }, [state, isInitialized, pushState]);

  // Track last update time for latency indicator
  const lastUpdateRef = useRef(performance.now());

  // Generic updater that touches lastUpdateRef for latency tracking
  const updateState = useCallback(
    (updater: (prev: SignalChainState) => SignalChainState) => {
      lastUpdateRef.current = performance.now();
      setState(updater);
    },
    [],
  );

  // ── Amp parameter handlers ──
  const handleAmpParameterChange = useCallback(
    (param: string, value: number) => {
      updateState((prev) => ({
        ...prev,
        amplifier: {
          ...prev.amplifier,
          parameters: { ...prev.amplifier.parameters, [param]: value },
        },
      }));
    },
    [updateState],
  );

  const handleChannelChange = useCallback(
    (channel: AmpChannel) => {
      updateState((prev) => ({
        ...prev,
        amplifier: {
          ...prev.amplifier,
          parameters: { ...prev.amplifier.parameters, channel },
        },
      }));
    },
    [updateState],
  );

  const handleToggleChange = useCallback(
    (param: string, value: number) => {
      // Toggles come as 1/0 from AmpModelRenderer
      if (
        param in (state.amplifier.parameters.toggles ?? {}) ||
        selectedAmp.toggleSwitches.some((t) => t.paramKey === param)
      ) {
        updateState((prev) => ({
          ...prev,
          amplifier: {
            ...prev.amplifier,
            parameters: {
              ...prev.amplifier.parameters,
              toggles: {
                ...prev.amplifier.parameters.toggles,
                [param]: value === 1,
              },
            },
          },
        }));
      } else {
        handleAmpParameterChange(param, value);
      }
    },
    [updateState, selectedAmp.toggleSwitches, handleAmpParameterChange],
  );

  // ── Amp model selector ──
  const handleAmpModelChange = useCallback(
    (modelId: string) => {
      const model = ampModels.find((a) => a.id === modelId);
      if (!model) return;
      const params: Record<string, number> = {};
      for (const c of model.controls) {
        params[c.paramKey as string] = c.defaultValue;
      }
      const toggles: Record<string, boolean> = {};
      for (const t of model.toggleSwitches) {
        toggles[t.paramKey] = t.defaultValue;
      }
      updateState((prev) => ({
        ...prev,
        amplifier: {
          modelId,
          parameters: {
            preampGain: params.preampGain ?? 5,
            volume: params.volume ?? 5,
            masterVolume: params.masterVolume ?? 5,
            masterGain: params.masterGain ?? 5,
            bass: params.bass ?? 5,
            middle: params.middle ?? 5,
            treble: params.treble ?? 5,
            tone: params.tone ?? 5,
            presence: params.presence ?? 5,
            resonance: params.resonance ?? 5,
            channel: model.channels[0],
            toggles,
          },
        },
        preampTubes: {
          tubeCount: model.preampStageCount,
          stageGains: Array.from({ length: model.preampStageCount }, () => 0.7),
        },
      }));
    },
    [updateState, ampModels],
  );

  // ── Cabinet selector ──
  const handleCabinetChange = useCallback(
    (cabinetId: string) => {
      updateState((prev) => ({
        ...prev,
        cabinet: { ...prev.cabinet, cabinetId },
      }));
    },
    [updateState],
  );

  // ── Input settings ──
  const handleInputGainChange = useCallback(
    (v: number) =>
      updateState((prev) => ({
        ...prev,
        inputSettings: { ...prev.inputSettings, inputGain: v },
      })),
    [updateState],
  );

  const handleNoiseGateToggle = useCallback(
    (v: boolean) =>
      updateState((prev) => ({
        ...prev,
        inputSettings: { ...prev.inputSettings, noiseGateEnabled: v },
      })),
    [updateState],
  );

  const handleNoiseGateThreshold = useCallback(
    (v: number) =>
      updateState((prev) => ({
        ...prev,
        inputSettings: { ...prev.inputSettings, noiseGateThreshold: v },
      })),
    [updateState],
  );

  const handleNoiseGateRelease = useCallback(
    (v: number) =>
      updateState((prev) => ({
        ...prev,
        inputSettings: { ...prev.inputSettings, noiseGateRelease: v },
      })),
    [updateState],
  );

  // ── Output settings ──
  const handleMasterVolume = useCallback(
    (v: number) =>
      updateState((prev) => ({
        ...prev,
        outputSettings: { ...prev.outputSettings, masterVolume: v },
      })),
    [updateState],
  );

  const handleOutputGain = useCallback(
    (v: number) =>
      updateState((prev) => ({
        ...prev,
        outputSettings: { ...prev.outputSettings, outputGain: v },
      })),
    [updateState],
  );

  // ── Mic position handlers ──
  const handleMicPositionChange = useCallback(
    (x: number, y: number, z: number) =>
      updateState((prev) => ({
        ...prev,
        cabinet: {
          ...prev.cabinet,
          mic: { ...prev.cabinet.mic, position: { x, y, z } },
        },
      })),
    [updateState],
  );

  const handleMicDistanceChange = useCallback(
    (distance: number) =>
      updateState((prev) => ({
        ...prev,
        cabinet: {
          ...prev.cabinet,
          mic: { ...prev.cabinet.mic, distance },
        },
      })),
    [updateState],
  );

  const handleMicTypeChange = useCallback(
    (type: MicType) =>
      updateState((prev) => ({
        ...prev,
        cabinet: {
          ...prev.cabinet,
          mic: { ...prev.cabinet.mic, type },
        },
      })),
    [updateState],
  );

  const handleMicPresetChange = useCallback(
    (preset: MicPreset) =>
      updateState((prev) => ({
        ...prev,
        cabinet: {
          ...prev.cabinet,
          mic: { ...prev.cabinet.mic, preset },
        },
      })),
    [updateState],
  );

  // ── Pedal board handlers (preamp FX) ──
  const handlePreampReorder = useCallback(
    (newOrder: string[]) =>
      updateState((prev) => ({
        ...prev,
        preampFx: newOrder.map((id, i) => {
          const existing = prev.preampFx.find((p) => p.instanceId === id);
          return existing ? { ...existing, position: i } : existing!;
        }),
      })),
    [updateState],
  );

  const handlePreampPedalToggle = useCallback(
    (pedalId: string, enabled: boolean) =>
      updateState((prev) => ({
        ...prev,
        preampFx: prev.preampFx.map((p) =>
          p.instanceId === pedalId ? { ...p, enabled } : p,
        ),
      })),
    [updateState],
  );

  const handlePreampPedalParam = useCallback(
    (pedalId: string, param: string, value: number) =>
      updateState((prev) => ({
        ...prev,
        preampFx: prev.preampFx.map((p) =>
          p.instanceId === pedalId
            ? { ...p, parameters: { ...p.parameters, [param]: value } }
            : p,
        ),
      })),
    [updateState],
  );

  const handlePreampAddPedal = useCallback(() => {
    // Add the first available pedal as a default
    const def = fxPedals[0];
    if (!def) return;
    const params: Record<string, number> = {};
    for (const c of def.controls) {
      params[c.paramKey] = c.defaultValue;
    }
    const instance: FxPedalInstance = {
      definitionId: def.id,
      instanceId: generateInstanceId(),
      enabled: true,
      parameters: params,
      position: state.preampFx.length,
    };
    updateState((prev) => ({
      ...prev,
      preampFx: [...prev.preampFx, instance],
    }));
  }, [updateState, fxPedals, state.preampFx.length]);

  const handlePreampRemovePedal = useCallback(
    (pedalId: string) =>
      updateState((prev) => ({
        ...prev,
        preampFx: prev.preampFx
          .filter((p) => p.instanceId !== pedalId)
          .map((p, i) => ({ ...p, position: i })),
      })),
    [updateState],
  );

  // ── Pedal board handlers (FX loop) ──
  const handleFxLoopReorder = useCallback(
    (newOrder: string[]) =>
      updateState((prev) => ({
        ...prev,
        fxLoop: newOrder.map((id, i) => {
          const existing = prev.fxLoop.find((p) => p.instanceId === id);
          return existing ? { ...existing, position: i } : existing!;
        }),
      })),
    [updateState],
  );

  const handleFxLoopPedalToggle = useCallback(
    (pedalId: string, enabled: boolean) =>
      updateState((prev) => ({
        ...prev,
        fxLoop: prev.fxLoop.map((p) =>
          p.instanceId === pedalId ? { ...p, enabled } : p,
        ),
      })),
    [updateState],
  );

  const handleFxLoopPedalParam = useCallback(
    (pedalId: string, param: string, value: number) =>
      updateState((prev) => ({
        ...prev,
        fxLoop: prev.fxLoop.map((p) =>
          p.instanceId === pedalId
            ? { ...p, parameters: { ...p.parameters, [param]: value } }
            : p,
        ),
      })),
    [updateState],
  );

  const handleFxLoopAddPedal = useCallback(() => {
    const def = fxPedals[0];
    if (!def) return;
    const params: Record<string, number> = {};
    for (const c of def.controls) {
      params[c.paramKey] = c.defaultValue;
    }
    const instance: FxPedalInstance = {
      definitionId: def.id,
      instanceId: generateInstanceId(),
      enabled: true,
      parameters: params,
      position: state.fxLoop.length,
    };
    updateState((prev) => ({
      ...prev,
      fxLoop: [...prev.fxLoop, instance],
    }));
  }, [updateState, fxPedals, state.fxLoop.length]);

  const handleFxLoopRemovePedal = useCallback(
    (pedalId: string) =>
      updateState((prev) => ({
        ...prev,
        fxLoop: prev.fxLoop
          .filter((p) => p.instanceId !== pedalId)
          .map((p, i) => ({ ...p, position: i })),
      })),
    [updateState],
  );

  // ── Render ──
  const isCompact = useIsCompact();

  return (
    <div className="signal-chain-layout pb-8">
      {/* Audio engine control */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isAudioRunning ? stopAudio : startAudio}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]",
            isAudioRunning
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)]",
          )}
          aria-label={isAudioRunning ? "Stop audio engine" : "Start audio engine"}
        >
          <Power className="h-4 w-4" />
          {isAudioRunning ? "Audio Running" : "Start Audio"}
        </button>
        {audioError && (
          <span className="text-xs text-destructive">{audioError}</span>
        )}
      </div>

      {/* Signal chain flow indicator */}
      <SignalFlowHeader />

      {/* ── 1. Input Settings ── */}
      <Section icon={<Guitar className="h-4 w-4" />} title="Input" collapsible={isCompact}>
        <InputSettingsPanel
          settings={state.inputSettings}
          onGainChange={handleInputGainChange}
          onGateToggle={handleNoiseGateToggle}
          onGateThreshold={handleNoiseGateThreshold}
          onGateRelease={handleNoiseGateRelease}
        />
      </Section>

      {/* ── 2. Preamp FX ── */}
      <Section title="Preamp FX" collapsible={isCompact}>
        <PedalBoard
          stage="preamp"
          pedals={state.preampFx}
          pedalDefinitions={PEDAL_DEF_MAP}
          onReorder={handlePreampReorder}
          onPedalToggle={handlePreampPedalToggle}
          onPedalParameterChange={handlePreampPedalParam}
          onAddPedal={handlePreampAddPedal}
          onRemovePedal={handlePreampRemovePedal}
        />
      </Section>

      {/* ── 3. Preamp Tubes + 4. Amplifier ── */}
      <Section title="Amplifier" collapsible={isCompact} defaultOpen>
        <div className="flex flex-col gap-4">
          {/* Amp model selector */}
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="amp-model-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Model
            </label>
            <select
              id="amp-model-select"
              value={state.amplifier.modelId}
              onChange={(e) => handleAmpModelChange(e.target.value)}
              className={cn(
                "rounded-md border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-sm text-white min-h-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {ampModels.map((amp) => (
                <option key={amp.id} value={amp.id}>
                  {amp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amp renderer */}
          <div className="amp-panel-responsive skeuo-control">
            <AmpModelRenderer
              model={selectedAmp}
              parameters={state.amplifier.parameters}
              onParameterChange={handleToggleChange}
              onChannelChange={handleChannelChange}
            />
          </div>
        </div>
      </Section>

      {/* ── 5. FX Loop ── */}
      <Section title="FX Loop" collapsible={isCompact}>
        <PedalBoard
          stage="fxloop"
          pedals={state.fxLoop}
          pedalDefinitions={PEDAL_DEF_MAP}
          onReorder={handleFxLoopReorder}
          onPedalToggle={handleFxLoopPedalToggle}
          onPedalParameterChange={handleFxLoopPedalParam}
          onAddPedal={handleFxLoopAddPedal}
          onRemovePedal={handleFxLoopRemovePedal}
        />
      </Section>

      {/* ── 6. Cabinet + Mic ── */}
      <Section icon={<Mic className="h-4 w-4" />} title="Cabinet & Mic" collapsible={isCompact}>
        <div className="flex flex-col gap-4">
          {/* Cabinet selector */}
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="cabinet-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Cabinet
            </label>
            <select
              id="cabinet-select"
              value={state.cabinet.cabinetId}
              onChange={(e) => handleCabinetChange(e.target.value)}
              className={cn(
                "rounded-md border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-sm text-white min-h-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {cabinets.map((cab) => (
                <option key={cab.id} value={cab.id}>
                  {cab.name} ({cab.speakerConfig})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="skeuo-control">
              <CabinetRenderer cabinet={selectedCabinet} />
            </div>
            <MicPositionControl
              config={state.cabinet.mic}
              onPositionChange={handleMicPositionChange}
              onDistanceChange={handleMicDistanceChange}
              onMicTypeChange={handleMicTypeChange}
              onPresetChange={handleMicPresetChange}
            />
          </div>
        </div>
      </Section>

      {/* ── 7. Output Settings ── */}
      <Section icon={<Volume2 className="h-4 w-4" />} title="Output" collapsible={isCompact}>
        <OutputSettingsPanel
          settings={state.outputSettings}
          onMasterVolume={handleMasterVolume}
          onOutputGain={handleOutputGain}
        />
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signal flow header — shows the fixed processing order
// ---------------------------------------------------------------------------

const SIGNAL_STAGES = [
  "Input",
  "Preamp FX",
  "Preamp Tubes",
  "Amplifier",
  "FX Loop",
  "Cabinet",
  "Output",
] as const;

function SignalFlowHeader() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2" role="navigation" aria-label="Signal chain order">
      {SIGNAL_STAGES.map((stage, i) => (
        <React.Fragment key={stage}>
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {stage}
          </span>
          {i < SIGNAL_STAGES.length - 1 && (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper — glassmorphic card with optional collapsible behavior
// On desktop (≥1024px): always expanded, no collapse trigger
// On mobile/tablet (<1024px): collapsible with touch-friendly trigger
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children,
  collapsible = false,
  defaultOpen = false,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible || defaultOpen);

  // Desktop: always show content directly (no collapsible wrapper)
  if (!collapsible) {
    return (
      <section
        className={cn(
          "rounded-xl border p-4 lg:p-5",
          "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          {icon && <span className="text-[var(--brand-accent)]">{icon}</span>}
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            {title}
          </h2>
        </div>
        {children}
      </section>
    );
  }

  // Mobile/tablet: collapsible section
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section
        className={cn(
          "rounded-xl border",
          "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "signal-section-trigger touch-target w-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label={`${open ? "Collapse" : "Expand"} ${title} section`}
          >
            <span className="flex items-center gap-2">
              {icon && <span className="text-[var(--brand-accent)]">{icon}</span>}
              <span className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                {title}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {children}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Input Settings panel
// ---------------------------------------------------------------------------

function InputSettingsPanel({
  settings,
  onGainChange,
  onGateToggle,
  onGateThreshold,
  onGateRelease,
}: {
  settings: InputSettings;
  onGainChange: (v: number) => void;
  onGateToggle: (v: boolean) => void;
  onGateThreshold: (v: number) => void;
  onGateRelease: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <RotaryKnob
        value={settings.inputGain}
        min={0}
        max={1}
        label="Input Gain"
        size="lg"
        onChange={onGainChange}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="flex flex-col items-center gap-2">
        <ToggleSwitch
          value={settings.noiseGateEnabled}
          label="Noise Gate"
          onChange={onGateToggle}
        />
      </div>

      {settings.noiseGateEnabled && (
        <>
          <SliderControl
            value={settings.noiseGateThreshold}
            min={-80}
            max={0}
            label="Threshold (dB)"
            orientation="horizontal"
            onChange={onGateThreshold}
          />
          <SliderControl
            value={settings.noiseGateRelease}
            min={5}
            max={500}
            label="Release (ms)"
            orientation="horizontal"
            onChange={onGateRelease}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Output Settings panel
// ---------------------------------------------------------------------------

function OutputSettingsPanel({
  settings,
  onMasterVolume,
  onOutputGain,
}: {
  settings: OutputSettings;
  onMasterVolume: (v: number) => void;
  onOutputGain: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <RotaryKnob
        value={settings.masterVolume}
        min={0}
        max={1}
        label="Master Volume"
        size="lg"
        onChange={onMasterVolume}
        onContextMenu={(e) => e.preventDefault()}
      />
      <RotaryKnob
        value={settings.outputGain}
        min={0}
        max={1}
        label="Output Gain"
        size="md"
        onChange={onOutputGain}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
