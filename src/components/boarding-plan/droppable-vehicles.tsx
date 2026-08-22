import { Bus, LucideIcon, Users } from "lucide-react";
import { Droppable } from "../droppable";
import { Separator } from "../ui/separator";
import { VehicleType } from "./distributor-participants";
import { DroppableVehicleHeader } from "./droppable-vehicle-header";
import { cn } from "@/lib/utils";

const QuantityItem = ({
  title,
  total,
  className,
}: {
  title: string;
  total: number;
  className?: string;
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs">{title}</p>
      <p className="flex items-center">
        <Users
          className={cn("mr-2 h-3 w-3 text-muted-foreground", className)}
        />{" "}
        {total}
      </p>
    </div>
  );
};

type DroppableVehicleProps = {
  vehicle: VehicleType;
  totalParticipants?: number;
  totalLegendary?: number;
  totalUsed?: number;
  icon: LucideIcon;
  children: React.ReactNode;
};

export const DroppableVehicles = ({
  vehicle,
  totalParticipants,
  totalLegendary,
  totalUsed,
  children,
  icon,
}: DroppableVehicleProps) => {
  return (
    <Droppable id={vehicle.id}>
      <div className="w-full space-y-2">
        <DroppableVehicleHeader icon={icon} vehicle={vehicle} />

        <div className="flex flex-wrap items-center gap-3">
          {totalParticipants !== null && totalParticipants !== undefined && (
            <QuantityItem title="Inscritos" total={totalParticipants} />
          )}
          {totalLegendary !== null && totalLegendary !== undefined && (
            <QuantityItem title="Legendários" total={totalLegendary} />
          )}
          {totalUsed !== null && totalUsed !== undefined && (
            <QuantityItem
              title="Total"
              total={totalUsed}
              className={cn(
                totalUsed >= (vehicle?.totalCapacity ?? 0)
                  ? "text-destructive"
                  : "text-foreground",
              )}
            />
          )}
        </div>

        <Separator />

        {children}
      </div>
    </Droppable>
  );
};
