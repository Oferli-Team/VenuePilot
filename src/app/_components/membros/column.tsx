"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Role } from "@prisma/client";
import React from "react";
import { cn } from "@/lib/utils";
import { SetMemberRole } from "./set-member-role";
import { DeleteMemberButton } from "./delete-member-button";
import { Badge } from "../ui/badge";

type Member = {
  name: string | null;
  email: string | null;
  id: string;
  role: Role;
  isOwner: boolean;
};

const TextCenter = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => <div className={cn("text-center", className)}>{value}</div>;

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    id: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <p className="font-bold">{row.original.name}</p>
        <span>{row.original.email}</span>
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "isOwner",
    header: () => <TextCenter value={""} />,
    cell: ({ row }) => {
      const isOwner = row.original.isOwner;
      return isOwner ? <Badge variant="secondary">proprietário</Badge> : null;
    },
  },
  {
    accessorKey: "role",
    header: () => <TextCenter value={"Permissão"} />,
    cell: ({ row }) => <SetMemberRole {...row.original} />,
    enableSorting: true,
  },
  {
    accessorKey: "actions",
    header: () => <TextCenter value={""} />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <DeleteMemberButton {...row.original} />
      </div>
    ),
  },
];
