import { DataTable } from "@/components/ui/data-table";
import { SetSecretLink } from "@/components/set-secret-link";
import { api } from "@/trpc/server";
import { columns } from "./colums";
import { redirect } from "next/navigation";
import { getEvent } from "@/lib/utils/getEvent";
import { type ManadaPagesParams } from "@/lib/types";

export default async function CreateSecretLinkPage({
  params,
}: ManadaPagesParams) {
  const evento = await getEvent({ params });

  if (!evento) {
    redirect("/manada");
  }

  const links = await api.linkSecreto.getAll({
    eventoId: evento.id,
  });

  const linksWithRemaining = links.map((link) => ({
    ...link,
    quantidadeDisponivel: link.quantidade - link.usadoCount,
  }));

  return (
    <>
      <SetSecretLink />

      <div className="rounded-md border border-input bg-card p-4 shadow-md">
        <DataTable
          columns={columns}
          data={linksWithRemaining}
          search={{ placeholder: "Busque pelo nome do link", field: "link" }}
          startSortingBy={[
            { id: "tipoInscricao", desc: false },
            { id: "ativo", desc: true },
          ]}
        />
      </div>
    </>
  );
}
