"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Vehicle } from "@prisma/client";
import React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ENUM_VEHICLE_TYPE } from "@/lib/enum";
import { ActiveVehicle } from "@/components/boarding-plan/active-vehicle";
import { VehicleActions } from "@/components/boarding-plan/vehicle-actions";

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{row.getValue("name")}</p>
        <span className="text-xs text-muted-foreground">
          {row.original.plate}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <TextCenter value={"Tipo da viatura"} />,
    cell: ({ row }) => {
      let value = "";
      if (row.original.type === ENUM_VEHICLE_TYPE["CAR"]) {
        value = "Carro";
      } else value = "Ônibus";

      return <TextCenter value={value} />;
    },
  },
  {
    accessorKey: "identifier",
    header: () => <TextCenter value={"Identificador"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("identifier")} />,
  },
  {
    accessorKey: "totalCapacity",
    header: () => <TextCenter value={"Total de Vagas"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("totalCapacity")} />,
  },
  {
    accessorKey: "usedCapacity",
    header: () => <TextCenter value={"Ocupadas"} />,
    cell: ({ row }) => <TextCenter value={row.getValue("usedCapacity")} />,
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full items-center justify-center"
      >
        Ativo
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <ActiveVehicle row={row} />,
    enableSorting: true,
  },
  {
    accessorKey: "actions",
    header: "",
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => <VehicleActions data={row.original} />,
  },
];
