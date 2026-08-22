import React from "react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = Readonly<{
  children: React.ReactNode;
  className?: string;
  id: string;
}>;

export const Droppable = ({ id, children, className }: DroppableProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={cn(
        `flex h-full min-h-64 w-full rounded-md border p-2 ${isOver ? "border-success" : "border-input"}`,
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};
