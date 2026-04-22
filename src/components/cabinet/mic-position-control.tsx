"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { SliderControl } from "@/components/controls/slider-control";
import type { MicConfiguration, MicType, MicPreset } from "@/types/cabinet";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MicPositionControlProps {
  config: MicConfiguration;
  onPositionChange: (x: number, y: number, z: number) => void;
  onDistanceChange: (distance: number) => void;
  onMicTypeChange: (type: MicType) => void;
  onPresetChange: (preset: MicPreset) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIC_TYPES: { value: MicType; label: string }[] = [
  { value: "condenser", label: "Condenser" },
  { value: "ribbon", label: "Ribbon" },
  { value: "dynamic", label: "Dynamic" },
];

const MIC_PRESETS: { value: MicPreset; label: string; description: string }[] = [
  { value: "center", label: "Center", description: "Bright" },
  { value: "middle", label: "Middle", description: "Warmer" },
  { value: "outside", label: "Outside", description: "Flat" },
];

/** Predefined X/Y/Z and distance values for each preset. */
const PRESET_VALUES: Record<MicPreset, { x: number; y: number; z: number; distance: number }> = {
  center:  { x: 0,    y: 0,    z: 0,   distance: 0.2 },
  middle:  { x: 0.4,  y: 0,    z: 0.2, distance: 0.4 },
  outside: { x: 0.8,  y: 0,    z: 0.5, distance: 0.7 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MicPositionControl({
  config,
  onPositionChange,
  onDistanceChange,
  onMicTypeChange,
  onPresetChange,
}: MicPositionControlProps) {
  const { type, position, distance, preset } = config;

  const handleXChange = useCallback(
    (v: number) => onPositionChange(v, position.y, position.z),
    [onPositionChange, position.y, position.z],
  );

  const handleYChange = useCallback(
    (v: number) => onPositionChange(position.x, v, position.z),
    [onPositionChange, position.x, position.z],
  );

  const handleZChange = useCallback(
    (v: number) => onPositionChange(position.x, position.y, v),
    [onPositionChange, position.x, position.y],
  );

  const handlePresetClick = useCallback(
    (p: MicPreset) => {
      const vals = PRESET_VALUES[p];
      onPositionChange(vals.x, vals.y, vals.z);
      onDistanceChange(vals.distance);
      onPresetChange(p);
    },
    [onPositionChange, onDistanceChange, onPresetChange],
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-zinc-900/80 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
          Microphone
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Position
        </span>
      </div>

      {/* Mic type selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Type
        </label>
        <div className="flex gap-1" role="radiogroup" aria-label="Microphone type">
          {MIC_TYPES.map((mt) => (
            <button
              key={mt.value}
              type="button"
              role="radio"
              aria-checked={type === mt.value}
              onClick={() => onMicTypeChange(mt.value)}
              className={cn(
                "flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                type === mt.value
                  ? "bg-white/20 text-white shadow-inner"
                  : "text-white/50 hover:text-white/80 hover:bg-white/10",
              )}
            >
              {mt.label}
            </button>
          ))}
        </div>
      </div>

      {/* X/Y/Z position sliders */}
      <div className="flex flex-col gap-3">
        <SliderControl
          value={position.x}
          min={-1}
          max={1}
          label="X"
          orientation="horizontal"
          onChange={handleXChange}
        />
        <SliderControl
          value={position.y}
          min={-1}
          max={1}
          label="Y"
          orientation="horizontal"
          onChange={handleYChange}
        />
        <SliderControl
          value={position.z}
          min={0}
          max={1}
          label="Z"
          orientation="horizontal"
          onChange={handleZChange}
        />
      </div>

      {/* Distance slider */}
      <SliderControl
        value={distance}
        min={0}
        max={1}
        label="Distance"
        orientation="horizontal"
        onChange={onDistanceChange}
      />

      {/* Preset buttons */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Presets
        </label>
        <div className="flex gap-1.5">
          {MIC_PRESETS.map((mp) => (
            <button
              key={mp.value}
              type="button"
              onClick={() => handlePresetClick(mp.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                preset === mp.value
                  ? "bg-white/20 text-white shadow-inner"
                  : "text-white/50 hover:text-white/80 hover:bg-white/10",
              )}
            >
              <span className="text-xs font-semibold">{mp.label}</span>
              <span className="text-[9px] opacity-60">{mp.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

MicPositionControl.displayName = "MicPositionControl";
