import { type Inscricao } from "@prisma/client";
import { AddressInfo } from "./address-info";
import { EmergencyInfo } from "./emergency-info";
import { LettersContactInfo } from "./letters-contact-info";
import { OthersHealthInfoParticipant } from "./others-health-info-participant";
import { PaymentInfo } from "./payment-info";
import { PersonalInfoParticipant } from "./personal-info-participant";
import { RefundInfo } from "./refund-info";
import { ReligionInfo } from "./religion-info";
import { HealthParticipantInfo } from "./health-info-participant";
import { PersonalInfoLegendary } from "./personal-info-legendary";
import { allFields } from "../inscricao-detail/allFields";

type EditUserFromLegendaryEventProps = {
  user: Inscricao;
};

export const EditUserFromLegendaryEvent = ({
  user,
}: EditUserFromLegendaryEventProps) => {
  const fields = allFields
    .filter((field) => !["ticket", "idade"].includes(field.label.toLowerCase()))
    .filter((field) =>
      user.tipoInscricao === "SERVIR"
        ? !["manTshirtSize", "qtdFilhos", "temFilhos"].includes(field.id)
        : !["createdAt"].includes(field.id),
    );

  const isParticipant = user.tipoInscricao === "PARTICIPANTE";
  const isServe = user.tipoInscricao === "SERVIR";

  return (
    <>
      {isParticipant && <PersonalInfoParticipant user={user} fields={fields} />}
      {isServe && <PersonalInfoLegendary user={user} fields={fields} />}
      <AddressInfo user={user} fields={fields} />
      <ReligionInfo user={user} fields={fields} />
      {isParticipant && <LettersContactInfo user={user} fields={fields} />}
      <EmergencyInfo user={user} fields={fields} />
      {isParticipant && (
        <>
          <HealthParticipantInfo user={user} fields={fields} />
          <OthersHealthInfoParticipant user={user} fields={fields} />
        </>
      )}
      <PaymentInfo user={user} fields={fields} />
      <RefundInfo user={user} fields={fields} />
    </>
  );
};
