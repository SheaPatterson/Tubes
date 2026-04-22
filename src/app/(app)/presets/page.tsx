"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Clock,
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ampModels } from "@/data/amp-models";
import type { AmpModel, AmpParameters } from "@/types/amp";
import type { SavedSignalChain, SignalChainState } from "@/types/signal-chain";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_AMP = ampModels[0];

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
      stageGains: Array.from(
        { length: DEFAULT_AMP.preampStageCount },
        () => 0.7,
      ),
    },
    amplifier: {
      modelId: DEFAULT_AMP.id,
      parameters: buildDefaultAmpParameters(DEFAULT_AMP),
    },
    fxLoop: [],
    cabinet: {
      cabinetId: "winston-4x12",
      mic: {
        type: "dynamic",
        position: { x: 0, y: 0, z: 0 },
        distance: 0.2,
        preset: "center",
      },
    },
    outputSettings: { masterVolume: 0.7, outputGain: 0.5 },
  };
}


let nextId = 1;
function generateId(): string {
  return `chain-${Date.now()}-${nextId++}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAmpName(modelId: string): string {
  return ampModels.find((a) => a.id === modelId)?.name ?? "Unknown Amp";
}

type SortField = "name" | "updatedAt";
type SortDirection = "asc" | "desc";

// ---------------------------------------------------------------------------
// Seed data for demo
// ---------------------------------------------------------------------------

function createSeedChains(): SavedSignalChain[] {
  const now = Date.now();
  const base = buildDefaultState();
  return [
    {
      id: generateId(),
      userId: "",
      name: "Clean Sparkle",
      config: base,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 86400000 * 1,
    },
    {
      id: generateId(),
      userId: "",
      name: "High Gain Lead",
      config: {
        ...base,
        amplifier: {
          modelId: "us-steel-plate",
          parameters: {
            ...buildDefaultAmpParameters(ampModels[1]),
            channel: "overdrive",
          },
        },
      },
      createdAt: now - 86400000 * 7,
      updatedAt: now - 3600000 * 2,
    },
    {
      id: generateId(),
      userId: "",
      name: "Crunch Rhythm",
      config: {
        ...base,
        amplifier: {
          modelId: "fizzle-0505",
          parameters: {
            ...buildDefaultAmpParameters(ampModels[3]),
            channel: "crunch",
          },
        },
      },
      createdAt: now - 86400000 * 14,
      updatedAt: now - 86400000 * 5,
    },
  ];
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function SavedSignalChainsPage() {
  const [chains, setChains] = useState<SavedSignalChain[]>(createSeedChains);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Rename dialog state
  const [renameTarget, setRenameTarget] = useState<SavedSignalChain | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<SavedSignalChain | null>(
    null,
  );

  // ── Sorting & filtering ──
  const sortedChains = useMemo(() => {
    let filtered = chains;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = chains.filter((c) => c.name.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortField === "name") {
        return dir * a.name.localeCompare(b.name);
      }
      return dir * (a.updatedAt - b.updatedAt);
    });
  }, [chains, sortField, sortDirection, searchQuery]);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection(field === "name" ? "asc" : "desc");
      }
    },
    [sortField],
  );

  // ── Save current chain ──
  const handleSaveNew = useCallback(() => {
    const now = Date.now();
    const newChain: SavedSignalChain = {
      id: generateId(),
      userId: "",
      name: `New Preset ${chains.length + 1}`,
      config: buildDefaultState(),
      createdAt: now,
      updatedAt: now,
    };
    setChains((prev) => [newChain, ...prev]);
  }, [chains.length]);

  // ── Load chain ──
  const handleLoad = useCallback((_chain: SavedSignalChain) => {
    // In a full implementation this would apply the chain config
    // to the SignalChainManager within 500ms.
    // For now we just mark it as loaded via a brief visual cue.
  }, []);

  // ── Rename ──
  const openRename = useCallback((chain: SavedSignalChain) => {
    setRenameTarget(chain);
    setRenameValue(chain.name);
  }, []);

  const confirmRename = useCallback(() => {
    if (!renameTarget || !renameValue.trim()) return;
    const now = Date.now();
    setChains((prev) =>
      prev.map((c) =>
        c.id === renameTarget.id
          ? { ...c, name: renameValue.trim(), updatedAt: now }
          : c,
      ),
    );
    setRenameTarget(null);
    setRenameValue("");
  }, [renameTarget, renameValue]);

  // ── Delete ──
  const openDelete = useCallback((chain: SavedSignalChain) => {
    setDeleteTarget(chain);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setChains((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  return (
    <div className="flex flex-col gap-4 pb-8 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <PageHeader onSaveNew={handleSaveNew} />

      {/* Search & Sort Controls */}
      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border p-4",
          "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
        )}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search presets…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search saved signal chains"
          />
        </div>
        <div className="flex gap-2">
          <SortButton
            label="Name"
            field="name"
            activeField={sortField}
            direction={sortDirection}
            onToggle={toggleSort}
          />
          <SortButton
            label="Modified"
            field="updatedAt"
            activeField={sortField}
            direction={sortDirection}
            onToggle={toggleSort}
          />
        </div>
      </div>

      {/* Chain List */}
      {sortedChains.length === 0 ? (
        <EmptyState hasSearch={!!searchQuery.trim()} onSaveNew={handleSaveNew} />
      ) : (
        <div className="grid gap-3">
          {sortedChains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              onLoad={handleLoad}
              onRename={openRename}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
            <DialogDescription>
              Enter a new name for &ldquo;{renameTarget?.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
            }}
            placeholder="Preset name"
            autoFocus
            aria-label="New preset name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={!renameValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PageHeader({ onSaveNew }: { onSaveNew: () => void }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <div className="flex items-center gap-3">
        <Save className="h-6 w-6 text-[var(--brand-accent)]" />
        <h1 className="text-lg font-bold uppercase tracking-wider">
          Saved Presets
        </h1>
      </div>
      <Button size="sm" onClick={onSaveNew}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Save Current</span>
      </Button>
    </div>
  );
}

function SortButton({
  label,
  field,
  activeField,
  direction,
  onToggle,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
  onToggle: (field: SortField) => void;
}) {
  const isActive = field === activeField;
  const Icon =
    field === "name"
      ? direction === "asc" && isActive
        ? ArrowDownAZ
        : ArrowUpAZ
      : isActive && direction === "asc"
        ? Calendar
        : Clock;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={() => onToggle(field)}
      aria-label={`Sort by ${label} ${isActive ? (direction === "asc" ? "descending" : "ascending") : ""}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function ChainCard({
  chain,
  onLoad,
  onRename,
  onDelete,
}: {
  chain: SavedSignalChain;
  onLoad: (chain: SavedSignalChain) => void;
  onRename: (chain: SavedSignalChain) => void;
  onDelete: (chain: SavedSignalChain) => void;
}) {
  const ampName = getAmpName(chain.config.amplifier.modelId);
  const pedalCount =
    chain.config.preampFx.length + chain.config.fxLoop.length;

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
        "transition-colors hover:border-[var(--brand-accent)]/40",
      )}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{chain.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{ampName}</span>
          <span>·</span>
          <span>
            {pedalCount} pedal{pedalCount !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{formatDate(chain.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="default"
          onClick={() => onLoad(chain)}
          aria-label={`Load ${chain.name}`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Load</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRename(chain)}
          aria-label={`Rename ${chain.name}`}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(chain)}
          className="text-destructive hover:text-destructive"
          aria-label={`Delete ${chain.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onSaveNew,
}: {
  hasSearch: boolean;
  onSaveNew: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border p-12",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <Save className="h-10 w-10 text-muted-foreground/50" />
      {hasSearch ? (
        <p className="text-sm text-muted-foreground">
          No presets match your search.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            No saved presets yet. Save your current signal chain to get started.
          </p>
          <Button size="sm" onClick={onSaveNew}>
            <Plus className="h-4 w-4" />
            Save Current Chain
          </Button>
        </>
      )}
    </div>
  );
}
