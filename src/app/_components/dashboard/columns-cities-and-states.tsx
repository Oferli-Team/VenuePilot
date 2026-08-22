"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";

type CitiesAndState = {
  cidade: string;
  estado: string;
  quantidade: string;
};

type CustomCellProps = {
  value: string | number;
  className?: string;
};

const CustomCell: React.FC<CustomCellProps> = ({ value, className }) => {
  return <div className={`truncate ${className ?? ""}`}>{value}</div>;
};

export const columnsCitiesAndStates: ColumnDef<CitiesAndState>[] = [
  {
    accessorKey: "cidade",
    header: "Cidade",
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estado
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <CustomCell value={row.getValue("estado")} />,
  },
  {
    accessorKey: "quantidade",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Inscritos
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <CustomCell value={row.getValue("quantidade")} />,
  },
];
