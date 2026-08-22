import { AddressInfo } from "./address-info";
import { PaymentInfo } from "./payment-info";
import { RefundInfo } from "./refund-info";
import { ReligionInfo } from "./religion-info";
import { allFields } from "../inscricao-detail/allFields";
import { type Inscricao } from "@prisma/client";
import { SpouseDataInfo } from "./spouse-data-info";
import { HealthParticipantInfo } from "./health-info-participant";
import { PersonalInfoLegendary } from "./personal-info-legendary";

export const EditUserFromRemEvent = ({ user }: { user: Inscricao }) => {
  const fields = allFields.filter(
    (field) => !["ticket", "idade"].includes(field.label.toLowerCase()),
  );

  const filtered = fields.filter(
    (field) =>
      ![
        "tamanhoFarda",
        "temFilhos",
        "qtdFilhos",
        "createdAt",
        "tipoInscricao",
        "lgnd_funcao",
        "lgndCertificado",
        "comoConheceuLegendarios",
        "quemConvidou",
        "possuiAutorizacaoServir",
        "imc",
      ].includes(field.id),
  );

  const healthFields = filtered.filter((field) =>
    ["isPregnant", "hasHealthIssues", "healthIssuesDescription"].includes(
      field.id,
    ),
  );

  return (
    <>
      <PersonalInfoLegendary
        title="Dados Pessoais Esposo"
        user={user}
        fields={filtered}
      />
      <SpouseDataInfo user={user} fields={filtered} />
      <AddressInfo title="Endereço do Casal" user={user} fields={filtered} />
      <ReligionInfo title="Religião do Casal" user={user} fields={filtered} />
      <HealthParticipantInfo
        title="Dados de Saúde do Casal"
        user={user}
        fields={healthFields}
      />
      <PaymentInfo user={user} fields={filtered} />
      <RefundInfo user={user} fields={filtered} />
    </>
  );
};
