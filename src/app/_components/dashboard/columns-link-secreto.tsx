"use client";

import { type ColumnDef } from "@tanstack/react-table";

type LinkSecreto = {
  link: string;
  quantidade: number;
};

type CustomCellProps = {
  value: string | number;
  className?: string;
};

const CustomCell: React.FC<CustomCellProps> = ({ value, className }) => {
  return <div className={`truncate ${className ?? ""}`}>{value}</div>;
};

export const columnsLinksSecreto: ColumnDef<LinkSecreto>[] = [
  {
    accessorKey: "link",
    header: "Link Secreto",
  },
  {
    accessorKey: "quantidade",
    header: () => <CustomCell className="text-center" value="Inscrições" />,
    cell: ({ row }) => (
      <CustomCell className="text-center" value={row.getValue("quantidade")} />
    ),
  },
];
