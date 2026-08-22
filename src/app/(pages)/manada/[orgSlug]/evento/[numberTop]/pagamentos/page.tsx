"use client";

import {
  fetchAllCustomersWoovi,
  getCustomerChargesAtAsaas,
  getCustomerChargesAtWoovi,
} from "@/lib/actions/charges";
import { useFindEvent } from "@/lib/hooks/event";
import { type ManadaPagesParams } from "@/lib/types";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export default function PagamentosPage({ params }: ManadaPagesParams) {
  const { event } = useFindEvent();

  const { data: allInscricaoNotConfirmed } =
    api.inscricao.getAllInscricaoByMultipleStatus.useQuery({
      statuses: [
        "INSCREVENDO",
        "AGUARDANDO_PAGAMENTO",
        "CANCELADO_TEMPO_EXPIRADO",
      ],
      eventoId: event?.id ?? "",
    });
  const [inscricaoCharges, setInscricaoCharges] = useState<
    Record<string, string[]>
  >({});
  const [chargesFetched, setChargesFetched] = useState(false);

  useEffect(() => {
    const fetchCharges = async () => {
      if (allInscricaoNotConfirmed) {
        const charges: Record<string, string[]> = {};
        const allCustomersWoovi = await fetchAllCustomersWoovi();
        for (const inscricao of allInscricaoNotConfirmed) {
          const asaasCharges = await getCustomerChargesAtAsaas(
            inscricao.id,
            inscricao.eventoId,
          );
          const correlationID = allCustomersWoovi.find(
            (c) => c.taxID.taxID === inscricao.cpf,
          )?.correlationID as string;
          const wooviCharges = await getCustomerChargesAtWoovi(
            // inscricao.cpf,
            inscricao.id,
            inscricao.eventoId,
            correlationID,
          );

          charges[inscricao.cpf] = [
            ...(asaasCharges?.map(
              (charge) => `${charge.status} - ${charge.externalReference}`,
            ) ?? []),
            ...(wooviCharges?.map(
              (charge) => `${charge.status} - ${charge.comment}`,
            ) ?? []),
          ];

          if (charges[inscricao.cpf].length === 0) {
            charges[inscricao.cpf] = ["Não encontrado"];
          }
        }
        setInscricaoCharges(charges);
        setChargesFetched(true);
      }
    };

    if (!chargesFetched && allInscricaoNotConfirmed) {
      void fetchCharges();
    }
  }, [allInscricaoNotConfirmed, chargesFetched]);

  return (
    <div className="flex flex-col gap-4">
      {allInscricaoNotConfirmed && allInscricaoNotConfirmed.length > 0 && (
        <div>
          <div>{allInscricaoNotConfirmed.length} ocorrências</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left">CPF</th>
                <th className="border p-2 text-left">Nome</th>
                <th className="border p-2 text-left">Tipo</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Gateway</th>
                <th className="border p-2 text-left">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {allInscricaoNotConfirmed.map((inscricao, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{inscricao.cpf}</td>
                  <td className="border p-2">{inscricao.nome}</td>
                  <td className="border p-2">{inscricao.tipoInscricao}</td>
                  <td className="border p-2">{inscricao.status}</td>
                  <td className="border p-2">
                    {inscricao.pagamento_integracao_service}
                  </td>
                  <td className="border p-2">
                    {inscricaoCharges[inscricao.cpf]?.map((status, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span>{status}</span>
                      </div>
                    )) || "Carregando..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
