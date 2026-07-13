"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type KanbanColumn = { key: string; label: string };
export type KanbanItem = { id: string; status: string; node: React.ReactNode };

export function KanbanBoard({
  columns,
  items,
  onMove,
}: {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMove: (id: string, newStatus: string) => Promise<void>;
}) {
  const [localItems, setLocalItems] = React.useState(items);
  const [syncedItems, setSyncedItems] = React.useState(items);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  if (items !== syncedItems) {
    setSyncedItems(items);
    setLocalItems(items);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = String(over.id);
    const itemId = String(active.id);
    const current = localItems.find((i) => i.id === itemId);
    if (!current || current.status === newStatus) return;

    const previous = localItems;
    setLocalItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)));

    startTransition(async () => {
      try {
        await onMove(itemId, newStatus);
      } catch {
        setLocalItems(previous);
        toast.error("Não foi possível mover o cartão.");
      }
    });
  }

  const activeItem = localItems.find((i) => i.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colItems = localItems.filter((i) => i.status === col.key);
          return (
            <KanbanColumnZone key={col.key} column={col} count={colItems.length}>
              <div className="flex flex-col gap-2">
                {colItems.map((item) => (
                  <KanbanCardDraggable key={item.id} id={item.id} disabled={pending}>
                    {item.node}
                  </KanbanCardDraggable>
                ))}
                {colItems.length === 0 && (
                  <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Nenhum cliente
                  </p>
                )}
              </div>
            </KanbanColumnZone>
          );
        })}
      </div>
      <DragOverlay>{activeItem ? <div className="rotate-2 opacity-90">{activeItem.node}</div> : null}</DragOverlay>
    </DndContext>
  );
}

function KanbanColumnZone({
  column,
  count,
  children,
}: {
  column: KanbanColumn;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 p-2.5 transition-colors",
        isOver && "bg-accent border-primary/40"
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="max-h-[calc(100vh-260px)] min-h-24 overflow-y-auto px-0.5">{children}</div>
    </div>
  );
}

function KanbanCardDraggable({
  id,
  children,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
          : undefined
      }
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
}
