"use client";

import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { FxPedalCard } from "@/components/fx/fx-pedal-card";
import type { FxPedalInstance, FxPedalDefinition } from "@/types/fx";

// ---------------------------------------------------------------------------
// PedalBoard
// ---------------------------------------------------------------------------

export interface PedalBoardProps {
  stage: "preamp" | "fxloop";
  pedals: FxPedalInstance[];
  pedalDefinitions: Record<string, FxPedalDefinition>;
  onReorder: (newOrder: string[]) => void;
  onPedalToggle: (pedalId: string, enabled: boolean) => void;
  onPedalParameterChange: (pedalId: string, param: string, value: number) => void;
  onAddPedal: () => void;
  onRemovePedal: (pedalId: string) => void;
}

export function PedalBoard({
  stage,
  pedals,
  pedalDefinitions,
  onReorder,
  onPedalToggle,
  onPedalParameterChange,
  onAddPedal,
  onRemovePedal,
}: PedalBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const sortedPedals = useMemo(
    () => [...pedals].sort((a, b) => a.position - b.position),
    [pedals]
  );

  const itemIds = useMemo(
    () => sortedPedals.map((p) => p.instanceId),
    [sortedPedals]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(itemIds, oldIndex, newIndex);
      onReorder(reordered);
    },
    [itemIds, onReorder]
  );

  const stageLabel = stage === "preamp" ? "Preamp FX" : "FX Loop";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {stageLabel}
        </h3>
        <button
          type="button"
          onClick={onAddPedal}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
            "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <PlusIcon />
          Add Pedal
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          <div
            className={cn(
              "flex items-start gap-3 overflow-x-auto rounded-lg border border-dashed border-muted-foreground/25 p-3",
              "bg-muted/30 backdrop-blur-sm min-h-[180px]"
            )}
            role="list"
            aria-label={`${stageLabel} pedal chain`}
          >
            {sortedPedals.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground/60 italic">
                No pedals — click &quot;Add Pedal&quot; to get started
              </div>
            )}
            {sortedPedals.map((pedal) => {
              const def = pedalDefinitions[pedal.definitionId];
              if (!def) return null;
              return (
                <SortablePedalItem
                  key={pedal.instanceId}
                  instance={pedal}
                  definition={def}
                  onToggle={(enabled) => onPedalToggle(pedal.instanceId, enabled)}
                  onParameterChange={(param, value) =>
                    onPedalParameterChange(pedal.instanceId, param, value)
                  }
                  onRemove={() => onRemovePedal(pedal.instanceId)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

PedalBoard.displayName = "PedalBoard";

// ---------------------------------------------------------------------------
// SortablePedalItem
// ---------------------------------------------------------------------------

interface SortablePedalItemProps {
  instance: FxPedalInstance;
  definition: FxPedalDefinition;
  onToggle: (enabled: boolean) => void;
  onParameterChange: (param: string, value: number) => void;
  onRemove: () => void;
}

function SortablePedalItem({
  instance,
  definition,
  onToggle,
  onParameterChange,
  onRemove,
}: SortablePedalItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition: sortableTransition,
    isDragging,
  } = useSortable({ id: instance.instanceId });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: sortableTransition ?? undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "shrink-0 touch-none",
        isDragging && "opacity-80 scale-105"
      )}
      {...attributes}
      {...listeners}
      role="listitem"
    >
      <FxPedalCard
        instance={instance}
        definition={definition}
        onToggle={onToggle}
        onParameterChange={onParameterChange}
        onRemove={onRemove}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
