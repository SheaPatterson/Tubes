"use client";

import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { clampValue } from "@/lib/parameter-utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Re-export for convenience
export { getMenuOptionsForTarget } from "@/lib/context-menu-options";
export type { ParameterTargetType } from "@/lib/context-menu-options";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnobSliderMenuConfig {
  targetType: "knob" | "slider" | "switch";
  paramName: string;
  currentValue: number;
  min: number;
  max: number;
  defaultValue: number;
  onSetDefault: () => void;
  onEnterValue: (value: number) => void;
  onCopyValue: () => void;
  onPasteValue: (value: number) => void;
}

export interface PedalMenuConfig {
  targetType: "pedal";
  pedalName: string;
  enabled: boolean;
  onToggleEnabled: () => void;
  onRemoveFromChain: () => void;
  onDuplicate: () => void;
  onViewSettings: () => void;
}

export type ParameterContextMenuConfig = KnobSliderMenuConfig | PedalMenuConfig;

export interface ParameterContextMenuProps {
  config: ParameterContextMenuConfig;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ParameterContextMenu({
  config,
  children,
}: ParameterContextMenuProps) {
  const [exactValueOpen, setExactValueOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Knob / Slider / Switch menu ----
  if (config.targetType !== "pedal") {
    return (
      <KnobSliderContextMenu
        config={config}
        exactValueOpen={exactValueOpen}
        setExactValueOpen={setExactValueOpen}
        inputRef={inputRef}
      >
        {children}
      </KnobSliderContextMenu>
    );
  }

  // ---- Pedal menu ----
  return <PedalContextMenu config={config}>{children}</PedalContextMenu>;
}

ParameterContextMenu.displayName = "ParameterContextMenu";

// ---------------------------------------------------------------------------
// KnobSliderContextMenu
// ---------------------------------------------------------------------------

function KnobSliderContextMenu({
  config,
  exactValueOpen,
  setExactValueOpen,
  inputRef,
  children,
}: {
  config: KnobSliderMenuConfig;
  exactValueOpen: boolean;
  setExactValueOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  children: React.ReactNode;
}) {
  const {
    paramName,
    currentValue,
    min,
    max,
    defaultValue,
    onSetDefault,
    onEnterValue,
    onCopyValue,
    onPasteValue,
  } = config;

  const handleSetDefault = useCallback(() => {
    onSetDefault();
  }, [onSetDefault]);

  const handleCopy = useCallback(() => {
    const text = String(currentValue);
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Copied ${paramName}: ${text}`);
    });
    onCopyValue();
  }, [currentValue, paramName, onCopyValue]);

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      const parsed = Number(text);
      if (Number.isNaN(parsed)) {
        toast.error("Clipboard does not contain a valid number");
        return;
      }
      const clamped = clampValue(parsed, min, max);
      if (clamped !== parsed) {
        toast.info(
          `Value ${parsed} clamped to ${clamped} (valid range: ${min}–${max})`
        );
      }
      onPasteValue(clamped);
    });
  }, [min, max, onPasteValue]);

  const handleExactValueSubmit = useCallback(() => {
    const raw = inputRef.current?.value ?? "";
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      toast.error("Please enter a valid number");
      return;
    }
    const clamped = clampValue(parsed, min, max);
    if (clamped !== parsed) {
      toast.info(
        `Value ${parsed} clamped to ${clamped} (valid range: ${min}–${max})`
      );
    }
    onEnterValue(clamped);
    setExactValueOpen(false);
  }, [min, max, onEnterValue, setExactValueOpen, inputRef]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>{paramName}</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={handleSetDefault}>
            Set to Default
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setExactValueOpen(true)}>
            Enter Exact Value
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={handleCopy}>Copy Value</ContextMenuItem>
          <ContextMenuItem onSelect={handlePaste}>Paste Value</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Enter Exact Value dialog */}
      <Dialog open={exactValueOpen} onOpenChange={setExactValueOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Enter Exact Value</DialogTitle>
            <DialogDescription>
              {paramName} — range: {min} to {max} (default: {defaultValue})
            </DialogDescription>
          </DialogHeader>
          <Input
            ref={inputRef}
            type="number"
            step="any"
            min={min}
            max={max}
            defaultValue={currentValue}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleExactValueSubmit();
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExactValueOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleExactValueSubmit}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// PedalContextMenu
// ---------------------------------------------------------------------------

function PedalContextMenu({
  config,
  children,
}: {
  config: PedalMenuConfig;
  children: React.ReactNode;
}) {
  const { pedalName, enabled, onToggleEnabled, onRemoveFromChain, onDuplicate, onViewSettings } =
    config;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>{pedalName}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onToggleEnabled}>
          {enabled ? "Disable" : "Enable"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={onRemoveFromChain}>
          Remove from Chain
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate}>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onViewSettings}>
          View Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
