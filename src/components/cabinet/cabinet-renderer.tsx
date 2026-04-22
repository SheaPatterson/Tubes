"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CabinetRendererProps {
  cabinet: Cabinet;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse speakerConfig like "4x12", "2x12", "1x12" into rows/cols for the grid. */
function parseSpeakerGrid(speakerConfig: string): { rows: number; cols: number } {
  const match = speakerConfig.match(/^(\d+)x(\d+)$/);
  if (!match) return { rows: 1, cols: 1 };

  const count = parseInt(match[1], 10);
  // Layout: 4 speakers → 2x2, 2 speakers → 1x2, 1 speaker → 1x1
  if (count >= 4) return { rows: 2, cols: 2 };
  if (count >= 2) return { rows: 1, cols: 2 };
  return { rows: 1, cols: 1 };
}

/** Return black or white depending on background luminance. */
function getContrastColor(hex: string): string {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return "#ffffff";
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#f5f5f5";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CabinetRenderer({ cabinet }: CabinetRendererProps) {
  const { name, speakerConfig, speakers, visualConfig } = cabinet;
  const { bodyColor, grillPattern } = visualConfig;
  const textColor = getContrastColor(bodyColor);
  const { rows, cols } = parseSpeakerGrid(speakerConfig);

  return (
    <div
      className="relative w-full max-w-xs rounded-xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ backgroundColor: bodyColor }}
    >
      {/* Cabinet name + config */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3
          className="text-lg font-bold tracking-wide drop-shadow-md"
          style={{ color: textColor }}
        >
          {name}
        </h3>
        <span
          className="text-xs font-semibold uppercase tracking-[0.15em] opacity-70"
          style={{ color: textColor }}
        >
          {speakerConfig}
        </span>
      </div>

      {/* Speaker grid */}
      <div className="px-4 pb-4">
        <div
          className={cn(
            "rounded-lg border border-white/5 p-3",
            grillPattern === "basket-weave" && "bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.03)_4px,rgba(255,255,255,0.03)_8px)]",
            grillPattern === "diamond-mesh" && "bg-[repeating-linear-gradient(60deg,transparent,transparent_3px,rgba(255,255,255,0.04)_3px,rgba(255,255,255,0.04)_6px)]",
            grillPattern === "wicker" && "bg-[repeating-linear-gradient(90deg,transparent,transparent_5px,rgba(255,255,255,0.03)_5px,rgba(255,255,255,0.03)_10px)]",
            grillPattern === "tweed-cloth" && "bg-[repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(139,119,80,0.1)_3px,rgba(139,119,80,0.1)_6px)]",
          )}
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <div
            className="grid gap-3 justify-items-center"
            style={{
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="flex flex-col items-center gap-1"
              >
                {/* Speaker cone visual */}
                <div
                  className={cn(
                    "rounded-full border-2 border-white/10",
                    "bg-gradient-radial from-zinc-600 via-zinc-700 to-zinc-900",
                    "shadow-inner flex items-center justify-center",
                    "w-20 h-20",
                  )}
                >
                  {/* Dust cap */}
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/5 shadow-sm" />
                </div>
                <span
                  className="text-[9px] font-medium opacity-60"
                  style={{ color: textColor }}
                >
                  {speaker.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

CabinetRenderer.displayName = "CabinetRenderer";
