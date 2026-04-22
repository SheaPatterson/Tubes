"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { RotaryKnob } from "@/components/controls/rotary-knob";
import { ToggleSwitch } from "@/components/controls/toggle-switch";
import {
  ParameterContextMenu,
  type KnobSliderMenuConfig,
} from "@/components/ui/parameter-context-menu";
import type {
  AmpModel,
  AmpParameters,
  AmpChannel,
  KnobPosition,
} from "@/types/amp";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AmpModelRendererProps {
  model: AmpModel;
  parameters: AmpParameters;
  onParameterChange: (param: string, value: number) => void;
  onChannelChange: (channel: AmpChannel) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KNOB_SIZE_PX: Record<KnobPosition["size"], string> = {
  sm: "w-16",
  md: "w-20",
  lg: "w-24",
};

/** Convert a raw parameter value (e.g. 1–10) to the 0–1 normalized range RotaryKnob expects. */
function toNormalized(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/** Convert a 0–1 normalized value back to the parameter's native range. */
function fromNormalized(normalized: number, min: number, max: number): number {
  return min + normalized * (max - min);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AmpModelRenderer({
  model,
  parameters,
  onParameterChange,
  onChannelChange,
}: AmpModelRendererProps) {
  const { visualConfig, controls, toggleSwitches, channels, name, brandRename } = model;
  const { panelColor, knobStyle, fontFamily, layoutGrid } = visualConfig;

  // Build a lookup from paramKey → control definition for quick access
  const controlMap = React.useMemo(() => {
    const map = new Map<string, (typeof controls)[number]>();
    for (const c of controls) {
      map.set(c.paramKey as string, c);
    }
    return map;
  }, [controls]);

  // Applicable toggle switches only
  const applicableToggles = React.useMemo(
    () => toggleSwitches.filter((t) => t.applicableToModel),
    [toggleSwitches],
  );

  return (
    <div
      className="relative w-full rounded-xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ backgroundColor: panelColor }}
    >
      {/* ── Brand name / header ── */}
      <div className="px-6 pt-5 pb-2 flex items-center justify-between">
        <h2
          className={cn(
            "text-2xl font-bold tracking-wide text-white drop-shadow-md",
            fontFamily === "serif" ? "font-serif" : "font-sans",
          )}
        >
          {name}
        </h2>

        <span
          className={cn(
            "text-xs uppercase tracking-[0.2em] text-white/60",
            fontFamily === "serif" ? "font-serif" : "font-sans",
          )}
        >
          {brandRename}
        </span>
      </div>

      {/* ── Channel selector (only when multiple channels) ── */}
      {channels.length > 1 && (
        <ChannelSelector
          channels={channels}
          activeChannel={parameters.channel}
          onChannelChange={onChannelChange}
        />
      )}

      {/* ── Knob grid ── */}
      <div className="relative w-full px-4 py-6" style={{ minHeight: 160 }}>
        <div className="relative w-full" style={{ height: 140 }}>
          {layoutGrid.map((pos) => {
            const control = controlMap.get(pos.paramKey);
            if (!control) return null;

            const rawValue = parameters[control.paramKey as keyof AmpParameters];
            if (typeof rawValue !== "number") return null;

            return (
              <KnobWithContextMenu
                key={pos.paramKey}
                position={pos}
                control={control}
                rawValue={rawValue}
                knobStyle={knobStyle}
                onParameterChange={onParameterChange}
              />
            );
          })}
        </div>
      </div>

      {/* ── Toggle switches ── */}
      {applicableToggles.length > 0 && (
        <div className="flex items-center justify-center gap-6 px-6 pb-5 pt-1">
          {applicableToggles.map((toggle) => (
            <ToggleWithContextMenu
              key={toggle.paramKey}
              toggle={toggle}
              value={!!parameters.toggles[toggle.paramKey]}
              onParameterChange={onParameterChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

AmpModelRenderer.displayName = "AmpModelRenderer";


// ---------------------------------------------------------------------------
// KnobWithContextMenu — positions a single knob on the layout grid
// ---------------------------------------------------------------------------

function KnobWithContextMenu({
  position,
  control,
  rawValue,
  knobStyle,
  onParameterChange,
}: {
  position: KnobPosition;
  control: AmpModel["controls"][number];
  rawValue: number;
  knobStyle: AmpModel["visualConfig"]["knobStyle"];
  onParameterChange: (param: string, value: number) => void;
}) {
  const { paramKey, min, max, defaultValue, name } = control;
  const normalized = toNormalized(rawValue, min, max);

  const handleChange = useCallback(
    (norm: number) => {
      const raw = fromNormalized(norm, min, max);
      // Round to step precision to avoid floating-point drift
      const rounded = Math.round(raw * 10) / 10;
      onParameterChange(paramKey as string, rounded);
    },
    [paramKey, min, max, onParameterChange],
  );

  const contextMenuConfig: KnobSliderMenuConfig = {
    targetType: "knob",
    paramName: name,
    currentValue: rawValue,
    min,
    max,
    defaultValue,
    onSetDefault: () => onParameterChange(paramKey as string, defaultValue),
    onEnterValue: (v) => onParameterChange(paramKey as string, v),
    onCopyValue: () => {},
    onPasteValue: (v) => onParameterChange(paramKey as string, v),
  };

  return (
    <div
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", KNOB_SIZE_PX[position.size])}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <ParameterContextMenu config={contextMenuConfig}>
        <div>
          <RotaryKnob
            value={normalized}
            min={min}
            max={max}
            label={name}
            onChange={handleChange}
            onContextMenu={(e) => e.preventDefault()}
            size={position.size}
            style={knobStyle}
          />
        </div>
      </ParameterContextMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleWithContextMenu
// ---------------------------------------------------------------------------

function ToggleWithContextMenu({
  toggle,
  value,
  onParameterChange,
}: {
  toggle: AmpModel["toggleSwitches"][number];
  value: boolean;
  onParameterChange: (param: string, value: number) => void;
}) {
  const handleChange = useCallback(
    (v: boolean) => {
      // Encode boolean as 1/0 for the unified parameter change callback
      onParameterChange(toggle.paramKey, v ? 1 : 0);
    },
    [toggle.paramKey, onParameterChange],
  );

  return (
    <ToggleSwitch
      value={value}
      label={toggle.name}
      onChange={handleChange}
    />
  );
}

// ---------------------------------------------------------------------------
// ChannelSelector
// ---------------------------------------------------------------------------

function ChannelSelector({
  channels,
  activeChannel,
  onChannelChange,
}: {
  channels: AmpChannel[];
  activeChannel: AmpChannel;
  onChannelChange: (channel: AmpChannel) => void;
}) {
  return (
    <div className="flex items-center gap-1 px-6 pb-2" role="radiogroup" aria-label="Amp channel">
      {channels.map((ch) => (
        <button
          key={ch}
          type="button"
          role="radio"
          aria-checked={ch === activeChannel}
          onClick={() => onChannelChange(ch)}
          className={cn(
            "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            ch === activeChannel
              ? "bg-white/20 text-white shadow-inner"
              : "text-white/50 hover:text-white/80 hover:bg-white/10",
          )}
        >
          {ch}
        </button>
      ))}
    </div>
  );
}
