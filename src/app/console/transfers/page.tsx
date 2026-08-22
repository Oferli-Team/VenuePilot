import { DataTable } from "@/components/ui/data-table";
import { Section } from "@/components/ui/section";
import { getTransfer } from "@/lib/actions/asaas";
import { columns } from "./columns";
import { Heading } from "@/components/ui/heading";
import { ArrowLeftRight } from "lucide-react";

export default async function TransfersPage() {
  const data = await getTransfer();

  return (
    <Section className="mt-24">
      <Heading
        title="Repasses Realizados"
        subtitle="Feitos na ASAAS"
        icon={ArrowLeftRight}
      />

      {/* <DataTable className="mt-8" data={data} columns={columns} /> */}
    </Section>
  );
}
