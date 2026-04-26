"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToggleSwitchProps {
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: "rocker" | "toggle" | "push";
}

export function ToggleSwitch({
  value,
  label,
  onChange,
  onContextMenu,
  style = "toggle",
}: ToggleSwitchProps) {
  const toggle = () => onChange(!value);

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      onContextMenu={onContextMenu}
    >
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={toggle}
        className={cn(
          "relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors",
          style === "rocker" && [
            "w-8 h-14 rounded-sm border",
            "bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700",
            "border-zinc-400 dark:border-zinc-500 shadow-md",
          ],
          style === "toggle" && [
            "w-6 h-12 rounded-full border",
            "bg-gradient-to-b from-neutral-300 to-neutral-500 dark:from-neutral-500 dark:to-neutral-700",
            "border-neutral-400 dark:border-neutral-600 shadow-md",
          ],
          style === "push" && [
            "w-10 h-10 rounded-full border-2",
            value
              ? "bg-red-500 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              : "bg-zinc-400 dark:bg-zinc-600 border-zinc-500 dark:border-zinc-500 shadow-inner",
          ]
        )}
      >
        {/* Rocker style: tilting indicator */}
        {style === "rocker" && (
          <div
            className={cn(
              "absolute inset-x-1 h-[45%] rounded-sm transition-all duration-150",
              "bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-400 dark:to-zinc-500 shadow-sm",
              value ? "top-1 bottom-auto" : "top-auto bottom-1"
            )}
          />
        )}

        {/* Toggle style: lever */}
        {style === "toggle" && (
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-150",
              "bg-zinc-100 dark:bg-zinc-300 shadow-md border border-zinc-300 dark:border-zinc-400",
              value ? "top-1" : "bottom-1"
            )}
          />
        )}

        {/* Push style: LED indicator */}
        {style === "push" && (
          <div
            className={cn(
              "absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors",
              value ? "bg-red-300 shadow-[0_0_4px_rgba(239,68,68,0.8)]" : "bg-zinc-600 dark:bg-zinc-400"
            )}
          />
        )}
      </button>

      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

ToggleSwitch.displayName = "ToggleSwitch";
