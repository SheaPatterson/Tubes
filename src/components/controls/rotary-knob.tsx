"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface RotaryKnobProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  style?: "chicken-head" | "pointer" | "dome";
}

const SIZE_MAP = {
  sm: { outer: "w-10 h-10", text: "text-[10px]", label: "text-[9px]" },
  md: { outer: "w-14 h-14", text: "text-xs", label: "text-[10px]" },
  lg: { outer: "w-20 h-20", text: "text-sm", label: "text-xs" },
} as const;

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

function valueToAngle(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return MIN_ANGLE + clamped * (MAX_ANGLE - MIN_ANGLE);
}

function clampNormalized(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function RotaryKnob({
  value,
  min,
  max,
  label,
  onChange,
  onContextMenu,
  size = "md",
  style = "pointer",
}: RotaryKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayValue = min + value * (max - min);
  const angle = valueToAngle(value);
  const sizeConfig = SIZE_MAP[size];

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragState.current = { startY: e.clientY, startValue: value };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return;
      const dy = dragState.current.startY - e.clientY;
      const sensitivity = 0.005;
      const newValue = clampNormalized(dragState.current.startValue + dy * sensitivity);
      onChange(newValue);
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const step = 0.02;
      const delta = e.deltaY < 0 ? step : -step;
      onChange(clampNormalized(value + delta));
    },
    [value, onChange]
  );

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      onContextMenu={onContextMenu}
    >
      <div
        ref={knobRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(displayValue * 10) / 10}
        tabIndex={0}
        className={cn(
          "relative rounded-full cursor-grab active:cursor-grabbing",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          sizeConfig.outer,
          isDragging && "cursor-grabbing",
          // Base knob styles
          style === "chicken-head" &&
            "bg-gradient-to-b from-zinc-200 to-zinc-400 dark:from-zinc-600 dark:to-zinc-800 shadow-md border border-zinc-300 dark:border-zinc-600",
          style === "pointer" &&
            "bg-gradient-to-b from-neutral-300 to-neutral-500 dark:from-neutral-500 dark:to-neutral-700 shadow-lg border border-neutral-400 dark:border-neutral-600",
          style === "dome" &&
            "bg-gradient-radial from-zinc-100 via-zinc-300 to-zinc-500 dark:from-zinc-500 dark:via-zinc-600 dark:to-zinc-800 shadow-inner border border-zinc-400 dark:border-zinc-600"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={(e) => {
          const step = 0.02;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(clampNormalized(value + step));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(clampNormalized(value - step));
          }
        }}
      >
        {/* Indicator */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {style === "chicken-head" ? (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-600" />
          ) : style === "pointer" ? (
            <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[2px] h-[30%] bg-white rounded-full shadow-sm" />
          ) : (
            <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-sm" />
          )}
        </div>
      </div>

      {/* Value display */}
      <span className={cn("text-muted-foreground tabular-nums", sizeConfig.text)}>
        {displayValue.toFixed(1)}
      </span>

      {/* Label */}
      <span
        className={cn(
          "text-muted-foreground uppercase tracking-wider font-medium",
          sizeConfig.label
        )}
      >
        {label}
      </span>
    </div>
  );
}

RotaryKnob.displayName = "RotaryKnob";
