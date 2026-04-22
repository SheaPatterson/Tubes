"use client";

import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SliderControlProps {
  value: number;
  min: number;
  max: number;
  label: string;
  orientation: "horizontal" | "vertical";
  onChange: (value: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function SliderControl({
  value,
  min,
  max,
  label,
  orientation,
  onChange,
  onContextMenu,
}: SliderControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const normalized = max > min ? (value - min) / (max - min) : 0;
  const isVertical = orientation === "vertical";

  const computeValueFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();

      let ratio: number;
      if (isVertical) {
        ratio = 1 - (clientY - rect.top) / rect.height;
      } else {
        ratio = (clientX - rect.left) / rect.width;
      }

      const clamped = clamp(ratio, 0, 1);
      onChange(min + clamped * (max - min));
    },
    [isVertical, min, max, onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      computeValueFromPointer(e.clientX, e.clientY);
    },
    [computeValueFromPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      computeValueFromPointer(e.clientX, e.clientY);
    },
    [isDragging, computeValueFromPointer]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const step = (max - min) * 0.02;

  return (
    <div
      className={cn(
        "flex items-center gap-2 select-none",
        isVertical ? "flex-col" : "flex-row"
      )}
      onContextMenu={onContextMenu}
    >
      {/* Label */}
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium whitespace-nowrap">
        {label}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-orientation={orientation}
        tabIndex={0}
        className={cn(
          "relative rounded-full cursor-pointer",
          "bg-zinc-300 dark:bg-zinc-700 border border-zinc-400 dark:border-zinc-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isVertical ? "w-3 h-32" : "h-3 w-32"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(clamp(value + step, min, max));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(clamp(value - step, min, max));
          }
        }}
      >
        {/* Fill */}
        <div
          className={cn(
            "absolute rounded-full bg-gradient-to-r from-brand-accent to-brand-accent-hover",
            isVertical
              ? "bottom-0 left-0 right-0"
              : "top-0 bottom-0 left-0"
          )}
          style={
            isVertical
              ? { height: `${normalized * 100}%` }
              : { width: `${normalized * 100}%` }
          }
        />

        {/* Thumb */}
        <div
          className={cn(
            "absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2",
            "bg-gradient-to-b from-zinc-100 to-zinc-300 dark:from-zinc-400 dark:to-zinc-600",
            "border-2 border-zinc-400 dark:border-zinc-500 shadow-md",
            isDragging && "scale-110"
          )}
          style={
            isVertical
              ? { left: "50%", bottom: `${normalized * 100}%`, transform: "translate(-50%, 50%)" }
              : { top: "50%", left: `${normalized * 100}%`, transform: "translate(-50%, -50%)" }
          }
        />
      </div>

      {/* Value */}
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

SliderControl.displayName = "SliderControl";
