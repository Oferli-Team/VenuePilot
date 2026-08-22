import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";

type DraggableLegendary = {
  className?: string;
  id: string;
  name: string;
  service: string;
  family: string;
  identifier: string;
  data: {
    id: string;
    name: string;
    service: string;
    family: string;
    identifier: string;
  };
};

export const DraggableCardLegendary = ({
  className,
  id,
  name,
  service,
  family,
  identifier,
  data,
}: DraggableLegendary) => {
  const itemData = useMemo(() => {
    return (
      data ?? {
        id,
        name,
        service,
        family,
        identifier,
      }
    );
  }, [id, name, data]);

  const { attributes, transform, setNodeRef, listeners, isDragging } =
    useDraggable({ id, data: itemData });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...attributes}
      {...listeners}
      className={cn(
        `flex flex-col justify-between gap-2 rounded-md border border-background p-3 text-xs ${isDragging ? "border-primary/50 bg-muted/90" : "bg-muted"}`,
        className,
      )}
    >
      <p>LGND {identifier}</p>
      <span className="flex font-semibold">{name.toUpperCase()}</span>
      <p className="font-semibold text-primary">
        {service && service.replaceAll("_", " ")}
      </p>
      {family && <p className="text-muted-foreground">Família {family}</p>}
    </div>
  );
};
