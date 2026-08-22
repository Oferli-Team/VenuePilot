import { Card } from "@/components/ui/card";
import { useFindManyMembers } from "@/lib/hooks/member";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./column";
import { DataTableSkeleton } from "../ui/data-table-skeleton";
import { cn } from "@/lib/utils";

type MemberListProps = {
  className?: string;
};

export const MemberList = ({ className }: MemberListProps) => {
  const { members, isLoading } = useFindManyMembers();

  return (
    <Card className={cn("space-y-4 p-4", className)}>
      <h3 className="text-xl font-bold">Membros</h3>

      {isLoading || !members ? (
        <DataTableSkeleton rowCount={6} columnCount={4} />
      ) : (
        <DataTable
          className="rounded-md"
          columns={columns}
          data={members}
          startSortingBy={[{ id: "role", desc: false }]}
          search={{ field: "name", placeholder: "Busque membro por nome" }}
        />
      )}
    </Card>
  );
};
