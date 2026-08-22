import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MASK_PATTERN,
  paymentStatusOptions,
  statusOptions,
} from "../constants";
import { getStatusClass } from "../utils/getStatusClass";
import { CopyButton } from "@/components/ui/copy-button";
import { mask } from "remask";
import { InternationalPhoneWppButton } from "@/components/international-phone-wpp-button";
import { formatDateDMY } from "../utils/formatDateToDDMMYYYY";
import { Badge } from "@/components/ui/badge";
import { multiColumnFilterManada } from "@/lib/utils/filterColumn";

type CustomHeaderProps = {
  value: string | number;
  className?: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ value, className }) => {
  return <div className={`truncate ${className ?? ""}`}>{value}</div>;
};

type CustomCellProps = {
  value: string | number;
  className?: string;
};

const CustomCell: React.FC<CustomCellProps> = ({ value, className }) => {
  return <div className={`truncate  ${className ?? ""}`}>{value}</div>;
};

type RegisterWithEvent = ManadaDayRegister & {
  participants: {
    name: string;
    checkin: boolean | null;
    id: string;
    cpf: string | null;
    type: MANADADAY_PARTICIPANT_TYPE;
  }[];
};

export const columnsRegisterManadaDay: ColumnDef<RegisterWithEvent>[] = [
  {
    id: "index",
    enableHiding: true,
    accessorKey: "index",
    header: () => <CustomHeader value="Nr" />,
    cell: ({ row, table }) => {
      const sortedIndex = table
        .getSortedRowModel()
        .rows.findIndex((sortedRow) => sortedRow.id === row.id);
      return sortedIndex + 1;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: () => <CustomHeader value="Data Compra" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("createdAt"))} />
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: () => <CustomHeader value="Status" className="text-center" />,
    cell: ({ row }) => {
      const value: string = row.getValue("status");
      return (
        <CustomCell
          value={statusOptions.find((status) => status.value === value)?.label}
          className={`w-full rounded-md p-1 text-center text-xs font-medium uppercase ${getStatusClass(row.getValue("status"))}`}
        />
      );
    },
  },
  {
    id: "participants",
    accessorKey: "participants",
    header: () => <CustomHeader value="Ingressos" className="text-center" />,
    cell: ({ row }) => {
      const participants = row.original.participants;
      return (
        <div className="flex w-max flex-col gap-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`flex w-full gap-2 font-medium`}
            >
              <span>{participant.name}</span>
              <Badge
                variant="secondary"
                className={ticketTypeMap[participant.type].style}
              >
                {ticketTypeMap[participant.type].label}
              </Badge>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Nome</span>
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="min-w-max">
          <p>{row.original.name}</p>
        </div>
      );
    },
    filterFn: multiColumnFilterManada,
  },
  {
    id: "cpf",
    accessorKey: "cpf",
    header: () => <CustomHeader value="CPF" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <CustomCell value={mask(row.getValue("cpf"), MASK_PATTERN.cpf)} />
        <CopyButton textToCopy={row.getValue("cpf")} />
      </div>
    ),
    filterFn: multiColumnFilterManada,
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: () => <CustomHeader value="Celular" />,
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.phone ?? ""}
      />
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Email</span>
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <CustomCell value={row.getValue("email")} className="lowercase" />
    ),
  },

  {
    accessorKey: "paymentStatus",
    header: () => <CustomHeader value="Status Pagamento" />,
    cell: ({ row }) => {
      const value = row.getValue("paymentStatus");
      const paymentStatus = paymentStatusOptions.find(
        (item) => item.value === value,
      )?.label;
      return <CustomCell value={paymentStatus ?? (value as string)} />;
    },
  },
  {
    accessorKey: "paymentData",
    header: () => <CustomHeader value="Data Pagamento" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("paymentData"))} />
    ),
  },
];
