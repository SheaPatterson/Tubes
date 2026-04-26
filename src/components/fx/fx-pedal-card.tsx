"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { RotaryKnob } from "@/components/controls/rotary-knob";
import { ToggleSwitch } from "@/components/controls/toggle-switch";
import { SliderControl } from "@/components/controls/slider-control";
import {
  ParameterContextMenu,
  type KnobSliderMenuConfig,
  type PedalMenuConfig,
} from "@/components/ui/parameter-context-menu";
import type { FxPedalInstance, FxPedalDefinition } from "@/types/fx";

export interface FxPedalCardProps {
  instance: FxPedalInstance;
  definition: FxPedalDefinition;
  onToggle: (enabled: boolean) => void;
  onParameterChange: (paramKey: string, value: number) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
  onViewSettings?: () => void;
}

export function FxPedalCard({
  instance,
  definition,
  onToggle,
  onParameterChange,
  onRemove,
  onDuplicate,
  onViewSettings,
}: FxPedalCardProps) {
  const { visualConfig, controls, name, brand } = definition;
  const { enabled, parameters } = instance;

  const pedalMenuConfig: PedalMenuConfig = {
    targetType: "pedal",
    pedalName: `${brand} ${name}`,
    enabled,
    onToggleEnabled: () => onToggle(!enabled),
    onRemoveFromChain: onRemove,
    onDuplicate: onDuplicate ?? (() => {}),
    onViewSettings: onViewSettings ?? (() => {}),
  };

  const makeKnobMenuConfig = useCallback(
    (
      control: (typeof controls)[number],
      currentValue: number
    ): KnobSliderMenuConfig => ({
      targetType: control.type === "slider" ? "slider" : "knob",
      paramName: control.name,
      currentValue,
      min: control.min,
      max: control.max,
      defaultValue: control.defaultValue,
      onSetDefault: () => onParameterChange(control.paramKey, control.defaultValue),
      onEnterValue: (v) => onParameterChange(control.paramKey, v),
      onCopyValue: () => {},
      onPasteValue: (v) => onParameterChange(control.paramKey, v),
    }),
    [onParameterChange]
  );

  return (
    <ParameterContextMenu config={pedalMenuConfig}>
      <div
        className={cn(
          "relative flex flex-col items-center rounded-xl border-2 shadow-lg select-none transition-opacity",
          "p-3 gap-2",
          !enabled && "opacity-50"
        )}
        style={{
          backgroundColor: visualConfig.bodyColor,
          borderColor: adjustColor(visualConfig.bodyColor, -30),
          minWidth: `${Math.min(visualConfig.width, 140)}px`,
        }}
      >
        {/* Brand label */}
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70"
          style={{ color: getContrastColor(visualConfig.bodyColor) }}
        >
          {brand}
        </span>

        {/* Pedal name */}
        <span
          className="text-sm font-bold leading-tight text-center"
          style={{
            color: getContrastColor(visualConfig.bodyColor),
            fontFamily: visualConfig.labelFont,
          }}
        >
          {name}
        </span>

        {/* Controls */}
        <div className="flex flex-wrap items-end justify-center gap-2 py-1">
          {controls.map((control) => {
            const paramValue = parameters[control.paramKey] ?? control.defaultValue;
            const normalized =
              control.max > control.min
                ? (paramValue - control.min) / (control.max - control.min)
                : 0;

            if (control.type === "knob") {
              const menuConfig = makeKnobMenuConfig(control, paramValue);
              return (
                <ParameterContextMenu key={control.paramKey} config={menuConfig}>
                  <div>
                    <RotaryKnob
                      value={normalized}
                      min={control.min}
                      max={control.max}
                      label={control.name}
                      size="sm"
                      onChange={(norm) => {
                        const denormalized = control.min + norm * (control.max - control.min);
                        onParameterChange(control.paramKey, denormalized);
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </ParameterContextMenu>
              );
            }

            if (control.type === "switch") {
              return (
                <ToggleSwitch
                  key={control.paramKey}
                  value={paramValue > 0}
                  label={control.name}
                  style="push"
                  onChange={(on) =>
                    onParameterChange(control.paramKey, on ? control.max : control.min)
                  }
                />
              );
            }

            if (control.type === "slider") {
              const menuConfig = makeKnobMenuConfig(control, paramValue);
              return (
                <ParameterContextMenu key={control.paramKey} config={menuConfig}>
                  <div>
                    <SliderControl
                      value={paramValue}
                      min={control.min}
                      max={control.max}
                      label={control.name}
                      orientation="vertical"
                      onChange={(v) => onParameterChange(control.paramKey, v)}
                    />
                  </div>
                </ParameterContextMenu>
              );
            }

            return null;
          })}
        </div>

        {/* Footswitch */}
        <button
          type="button"
          aria-label={`${enabled ? "Disable" : "Enable"} ${name}`}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "w-10 h-10 rounded-full border-2 shadow-md transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            enabled
              ? "bg-red-500 border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              : "bg-zinc-500 border-zinc-600 dark:bg-zinc-700 dark:border-zinc-600"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mx-auto transition-colors",
              enabled
                ? "bg-red-200 shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                : "bg-zinc-400 dark:bg-zinc-500"
            )}
          />
        </button>
      </div>
    </ParameterContextMenu>
  );
}

FxPedalCard.displayName = "FxPedalCard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lighten or darken a hex color by an amount (-255 to 255). */
function adjustColor(hex: string, amount: number): string {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return hex;

  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Return black or white depending on background luminance. */
function getContrastColor(hex: string): string {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return "#ffffff";

  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  // Relative luminance (simplified)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#f5f5f5";
}
