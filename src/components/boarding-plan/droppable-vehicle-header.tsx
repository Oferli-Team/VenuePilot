import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { GridTwoColumns } from "../grid-two-columns";
import { VehicleType } from "./distributor-participants";
import { LucideIcon } from "lucide-react";

export const DroppableVehicleHeaderItem = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col gap-0">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
};

type DroppableVehicleHeaderProps = {
  icon: LucideIcon;
  vehicle: VehicleType;
};

export const DroppableVehicleHeader = ({
  icon: Icon,
  vehicle,
}: DroppableVehicleHeaderProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <div>
            <h5 className="flex items-center text-xs font-semibold sm:text-sm">
              <Icon className="mr-2 h-3 w-3 text-primary" /> {vehicle.name}
            </h5>
            <p className="text-xs text-muted-foreground">
              Identificador{" "}
              <b className="text-foreground">{vehicle.identifier}</b>
            </p>
          </div>

          <div className={`text-end`}>
            <p className="text-[0.65rem] text-muted-foreground">Capacidade</p>
            <p>{vehicle.totalCapacity ?? 0}</p>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit">
        <GridTwoColumns className="gap-2">
          <DroppableVehicleHeaderItem
            title="Viatura"
            value={vehicle.name ?? "-"}
          />
          <DroppableVehicleHeaderItem
            title="Identificador"
            value={vehicle.identifier ?? "-"}
          />
          <DroppableVehicleHeaderItem
            title="Proprietário"
            value={vehicle.owner ?? "-"}
          />
          <DroppableVehicleHeaderItem
            title="Função"
            value={vehicle.function ?? "-"}
          />
          <DroppableVehicleHeaderItem
            title="Placa"
            value={vehicle.plate ?? "-"}
          />
          <DroppableVehicleHeaderItem
            title="Observação"
            value={vehicle.notes ?? "-"}
          />
        </GridTwoColumns>
      </HoverCardContent>
    </HoverCard>
  );
};
