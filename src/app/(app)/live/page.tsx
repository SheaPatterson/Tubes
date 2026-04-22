"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Radio, Volume2, Guitar } from "lucide-react";
import { cn } from "@/lib/utils";

import { ampModels } from "@/data/amp-models";
import { fxPedals } from "@/data/fx-pedals";

import type { AmpChannel, AmpModel, AmpParameters } from "@/types/amp";
import type { SignalChainState } from "@/types/signal-chain";
import type { SavedSignalChain } from "@/types/signal-chain";
import type { FxPedalInstance } from "@/types/fx";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_AMP = ampModels[0];
const QUICK_ACCESS_SLOT_COUNT = 8;

function buildDefaultAmpParameters(model: AmpModel): AmpParameters {
  const params: Record<string, number> = {};
  for (const c of model.controls) {
    params[c.paramKey as string] = c.defaultValue;
  }
  const toggles: Record<string, boolean> = {};
  for (const t of model.toggleSwitches) {
    toggles[t.paramKey] = t.defaultValue;
  }
  return {
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
  };
}

function buildDefaultState(): SignalChainState {
  return {
    inputSettings: {
      inputGain: 0.5,
      noiseGateEnabled: false,
      noiseGateThreshold: 0.3,
      noiseGateRelease: 0.1,
    },
    preampFx: [],
    preampTubes: {
      tubeCount: DEFAULT_AMP.preampStageCount,
      stageGains: Array.from({ length: DEFAULT_AMP.preampStageCount }, () => 0.7),
    },
    amplifier: {
      modelId: DEFAULT_AMP.id,
      parameters: buildDefaultAmpParameters(DEFAULT_AMP),
    },
    fxLoop: [],
    cabinet: {
      cabinetId: "winston-4x12",
      mic: { type: "dynamic", position: { x: 0, y: 0, z: 0 }, distance: 0.2, preset: "center" },
    },
    outputSettings: { masterVolume: 0.7, outputGain: 0.5 },
  };
}

// ---------------------------------------------------------------------------
// Pedal definition lookup
// ---------------------------------------------------------------------------

const PEDAL_DEF_MAP: Record<string, (typeof fxPedals)[number]> = {};
for (const p of fxPedals) {
  PEDAL_DEF_MAP[p.id] = p;
}

// ---------------------------------------------------------------------------
// Live Performance Page
// ---------------------------------------------------------------------------

export default function LivePerformancePage() {
  const [state, setState] = useState<SignalChainState>(buildDefaultState);
  const [quickSlots, setQuickSlots] = useState<(SavedSignalChain | null)[]>(
    () => Array.from({ length: QUICK_ACCESS_SLOT_COUNT }, () => null),
  );

  const lastUpdateRef = useRef(performance.now());

  const selectedAmp = useMemo(
    () => ampModels.find((a) => a.id === state.amplifier.modelId) ?? DEFAULT_AMP,
    [state.amplifier.modelId],
  );

  const activePedals = useMemo(() => {
    const all = [...state.preampFx, ...state.fxLoop];
    return all.filter((p) => p.enabled);
  }, [state.preampFx, state.fxLoop]);

  // ── Channel switching — synchronous React state update for <5ms ──
  const handleChannelChange = useCallback((channel: AmpChannel) => {
    lastUpdateRef.current = performance.now();
    setState((prev) => ({
      ...prev,
      amplifier: {
        ...prev.amplifier,
        parameters: { ...prev.amplifier.parameters, channel },
      },
    }));
  }, []);

  // ── Master volume ──
  const handleMasterVolumeChange = useCallback((value: number) => {
    lastUpdateRef.current = performance.now();
    setState((prev) => ({
      ...prev,
      outputSettings: { ...prev.outputSettings, masterVolume: value },
    }));
  }, []);

  // ── Toggle pedal on/off ──
  const handlePedalToggle = useCallback((instanceId: string) => {
    lastUpdateRef.current = performance.now();
    setState((prev) => {
      const toggleIn = (pedals: FxPedalInstance[]) =>
        pedals.map((p) =>
          p.instanceId === instanceId ? { ...p, enabled: !p.enabled } : p,
        );
      return {
        ...prev,
        preampFx: toggleIn(prev.preampFx),
        fxLoop: toggleIn(prev.fxLoop),
      };
    });
  }, []);

  // ── Quick slot recall ──
  const handleSlotRecall = useCallback((slotIndex: number) => {
    setQuickSlots((prev) => {
      const chain = prev[slotIndex];
      if (!chain) return prev;
      lastUpdateRef.current = performance.now();
      setState(chain.config);
      return prev;
    });
  }, []);

  // ── Quick slot assign (saves current state to slot) ──
  const handleSlotAssign = useCallback(
    (slotIndex: number) => {
      const saved: SavedSignalChain = {
        id: `slot-${slotIndex}`,
        userId: "",
        name: `Slot ${slotIndex + 1}`,
        config: state,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setQuickSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = saved;
        return next;
      });
    },
    [state],
  );

  return (
    <div className="flex flex-col gap-4 pb-8 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <LiveHeader ampName={selectedAmp.name} />

      {/* Channel Switcher */}
      <ChannelSwitcher
        channels={selectedAmp.channels}
        activeChannel={state.amplifier.parameters.channel}
        onChannelChange={handleChannelChange}
      />

      {/* Master Volume */}
      <MasterVolumeControl
        value={state.outputSettings.masterVolume}
        onChange={handleMasterVolumeChange}
      />

      {/* Active FX Pedals */}
      <ActivePedalsGrid
        allPedals={[...state.preampFx, ...state.fxLoop]}
        onToggle={handlePedalToggle}
      />

      {/* Quick Access Slots */}
      <QuickAccessSlots
        slots={quickSlots}
        onRecall={handleSlotRecall}
        onAssign={handleSlotAssign}
      />
    </div>
  );
}


// ---------------------------------------------------------------------------
// Live Header
// ---------------------------------------------------------------------------

function LiveHeader({ ampName }: { ampName: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <div className="flex items-center gap-3">
        <Radio className="h-6 w-6 text-[var(--brand-accent)]" />
        <h1 className="text-lg font-bold uppercase tracking-wider">
          Live Mode
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Guitar className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">
          {ampName}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Channel Switcher — large touch targets, synchronous state for <5ms
// ---------------------------------------------------------------------------

const CHANNEL_COLORS: Record<AmpChannel, string> = {
  clean: "bg-emerald-600 hover:bg-emerald-500 border-emerald-400",
  crunch: "bg-amber-600 hover:bg-amber-500 border-amber-400",
  overdrive: "bg-red-600 hover:bg-red-500 border-red-400",
};

const CHANNEL_ACTIVE_COLORS: Record<AmpChannel, string> = {
  clean: "bg-emerald-500 border-emerald-300 ring-2 ring-emerald-400/50 shadow-emerald-500/30 shadow-lg",
  crunch: "bg-amber-500 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/30 shadow-lg",
  overdrive: "bg-red-500 border-red-300 ring-2 ring-red-400/50 shadow-red-500/30 shadow-lg",
};

function ChannelSwitcher({
  channels,
  activeChannel,
  onChannelChange,
}: {
  channels: AmpChannel[];
  activeChannel: AmpChannel;
  onChannelChange: (channel: AmpChannel) => void;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Channel
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {channels.map((channel) => {
          const isActive = channel === activeChannel;
          return (
            <button
              key={channel}
              type="button"
              onClick={() => onChannelChange(channel)}
              className={cn(
                "min-h-[56px] min-w-[44px] rounded-lg border-2 px-4 py-3",
                "text-sm font-bold uppercase tracking-wider text-white",
                "transition-all duration-75 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive ? CHANNEL_ACTIVE_COLORS[channel] : CHANNEL_COLORS[channel],
              )}
              aria-pressed={isActive}
              aria-label={`Switch to ${channel} channel`}
            >
              {channel}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Master Volume — large touch-friendly slider
// ---------------------------------------------------------------------------

function MasterVolumeControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const percentage = Math.round(value * 100);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      const update = (clientX: number) => {
        const rect = el.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        onChange(ratio);
      };

      update(e.clientX);

      const onMove = (ev: PointerEvent) => update(ev.clientX);
      const onUp = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [onChange],
  );

  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-[var(--brand-accent)]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Master Volume
          </h2>
        </div>
        <span className="text-2xl font-bold tabular-nums">{percentage}%</span>
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Master volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="relative h-14 w-full cursor-pointer rounded-lg bg-zinc-800/60 touch-none"
        onPointerDown={handlePointerDown}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(1, value + 0.01));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0, value - 0.01));
          }
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-gold)] transition-[width] duration-75"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-10 w-3 rounded-full bg-white shadow-md border border-white/30"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Active Pedals Grid — large toggle buttons for each pedal in the chain
// ---------------------------------------------------------------------------

function ActivePedalsGrid({
  allPedals,
  onToggle,
}: {
  allPedals: FxPedalInstance[];
  onToggle: (instanceId: string) => void;
}) {
  if (allPedals.length === 0) {
    return (
      <section
        className={cn(
          "rounded-xl border p-4",
          "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
        )}
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          FX Pedals
        </h2>
        <p className="text-sm text-muted-foreground">
          No pedals in signal chain. Add pedals from the main Signal Chain page.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        FX Pedals
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPedals.map((pedal) => {
          const def = PEDAL_DEF_MAP[pedal.definitionId];
          const name = def?.name ?? "Unknown";
          const brand = def?.brand ?? "";
          return (
            <button
              key={pedal.instanceId}
              type="button"
              onClick={() => onToggle(pedal.instanceId)}
              className={cn(
                "min-h-[56px] min-w-[44px] rounded-lg border-2 px-3 py-3",
                "flex flex-col items-center justify-center gap-1",
                "text-xs font-bold uppercase tracking-wider",
                "transition-all duration-75 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                pedal.enabled
                  ? "bg-[var(--brand-accent)] border-[var(--brand-accent)] text-white shadow-lg shadow-[var(--brand-accent)]/20"
                  : "bg-zinc-800/60 border-zinc-700 text-zinc-400",
              )}
              aria-pressed={pedal.enabled}
              aria-label={`Toggle ${name} pedal ${pedal.enabled ? "off" : "on"}`}
            >
              <span className="text-[10px] text-current/70">{brand}</span>
              <span className="truncate max-w-full">{name}</span>
              <span
                className={cn(
                  "mt-1 h-2 w-2 rounded-full",
                  pedal.enabled ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-zinc-600",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Quick Access Slots — 8 slots for instant Saved_Signal_Chain recall
// ---------------------------------------------------------------------------

function QuickAccessSlots({
  slots,
  onRecall,
  onAssign,
}: {
  slots: (SavedSignalChain | null)[];
  onRecall: (index: number) => void;
  onAssign: (index: number) => void;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick Access Presets
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => (slot ? onRecall(i) : onAssign(i))}
              className={cn(
                "min-h-[56px] min-w-[44px] rounded-lg border-2 px-2 py-3",
                "flex flex-col items-center justify-center gap-1",
                "text-xs font-bold",
                "transition-all duration-75 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                slot
                  ? "bg-[var(--brand-surface)] border-[var(--brand-gold)] text-white"
                  : "bg-zinc-800/40 border-zinc-700/50 text-zinc-500 border-dashed",
              )}
              aria-label={
                slot
                  ? `Recall preset: ${slot.name}`
                  : `Assign current signal chain to slot ${i + 1}`
              }
            >
              <span className="text-lg font-bold tabular-nums">{i + 1}</span>
              <span className="truncate max-w-full text-[10px]">
                {slot ? slot.name : "Empty"}
              </span>
            </button>
            {slot && (
              <button
                type="button"
                onClick={() => onAssign(i)}
                className={cn(
                  "min-h-[28px] rounded border border-zinc-700/50 bg-zinc-800/40",
                  "text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600",
                  "transition-colors duration-75",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label={`Overwrite slot ${i + 1} with current signal chain`}
              >
                Save
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
