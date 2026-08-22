import { ColumnDef } from "@tanstack/react-table";
import { CopyButton } from "@/components/ui/copy-button";
import { mask } from "remask";
import { MASK_PATTERN, statusOptions } from "@/lib/constants";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MANADADAY_PARTICIPANT_TYPE } from "@prisma/client";
import { InternationalPhoneWppButton } from "@/components/international-phone-wpp-button";
import { getStatusClass } from "@/lib/utils/getStatusClass";
import { MarkValueSearched } from "@/components/ui/mark-value-searched";
import { multiColumnFilterManada } from "@/lib/utils/filterColumn";

type CustomCellProps = {
  value: string | number;
  className?: string;
};

const CustomCell: React.FC<CustomCellProps> = ({ value, className }) => {
  return <div className={`truncate  ${className ?? ""}`}>{value}</div>;
};

export type Participant = {
  id: string;
  name: string;
  checkin: boolean;
  type: MANADADAY_PARTICIPANT_TYPE;
  checkinCode: string;
};

export type RegisterWithEvent = {
  name: string;
  cpf: string;
  phone: string;
  status: string;
  identifier: string;
  participants: Participant[];
};

export const columnsCheckInManadaDay: ColumnDef<RegisterWithEvent>[] = [
  {
    id: "expander",
    header: "",
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <div>
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      ) : null,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value: string = row.getValue("status");
      return (
        <CustomCell
          value={statusOptions.find((status) => status.value === value)?.label}
          className={`w-fit rounded-md p-1 text-center text-xs font-medium uppercase ${getStatusClass(row.getValue("status"))}`}
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Quem comprou",
    cell: ({ getValue, table }) => {
      const value = getValue<string>();
      const searchValue = table.getColumn("cpf")?.getFilterValue() as
        | string
        | undefined;

      return <MarkValueSearched value={value} searchValue={searchValue} />;
    },
    filterFn: multiColumnFilterManada,
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => (
      <div className="flex w-max items-center gap-1">
        {mask(row.original.cpf, MASK_PATTERN.cpf)}
        <CopyButton textToCopy={row.original.cpf} />
      </div>
    ),
    filterFn: multiColumnFilterManada,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Celular",
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.phone ?? ""}
      />
    ),
  },
  {
    accessorKey: "identifier",
    header: "Identificador",
    filterFn: multiColumnFilterManada,
  },
];
