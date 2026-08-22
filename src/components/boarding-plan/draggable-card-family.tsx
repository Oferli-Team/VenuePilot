import { useIsMobile } from "@/lib/hooks/ismobile";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Users } from "lucide-react";
import { useMemo } from "react";

type DraggableProps = Readonly<{
  id: string;
  name: string;
  users: number;
  data?: { id: string; name: string; users: number };
  className?: string;
}>;

export const DraggableCardFamily = ({
  id,
  name,
  users,
  data,
  className,
}: DraggableProps) => {
  const itemData = useMemo(() => {
    return (
      data ?? {
        id,
        name,
        users,
      }
    );
  }, [id, name, users, data]);

  const { attributes, transform, setNodeRef, listeners, isDragging } =
    useDraggable({
      id,
      data: itemData,
    });

  const isMobile = useIsMobile();

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...attributes}
      {...listeners}
      className={cn(
        `flex flex-col gap-3 rounded-md border border-background p-3 text-sm ${isDragging ? "bg-primary" : "bg-primary/90"}`,
        className,
      )}
    >
      <p className="font-bold">
        {isMobile
          ? `${name.split(" ")[0]?.slice(0, 3)} ${name.split(" ")[1]}`
          : name}
      </p>
      <span className="flex font-semibold">
        <Users className="mr-2 h-4 w-4" />
        {users}
      </span>
    </div>
  );
};
