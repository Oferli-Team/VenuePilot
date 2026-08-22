"use server";

import { InviteEmailTemplate } from "@/components/emails/InviteEmailTemplate";
import SubscriptionConfirmationEmailTemplate, {
  type SubscriptionConfirmationEmailTemplateProps,
} from "@/components/emails/SubscriptionConfirmationEmailTemplate";
import { getData, sendEmail } from "@/lib/mailer";
import { api } from "@/trpc/server";
import { ENUM_EVENT_TYPE } from "../enum";

type BaseRegister = {
  nome: string;
  cpf: string;
  status: string;
  tipoInscricao?: string;
  email: string;
};

type RemRegister = BaseRegister & {
  spouseName: string;
  spouseCPF: string;
  spouseEmail: string;
};

type ManadaDayRegister = Omit<BaseRegister, "nome"> & {
  name: string;
  identifier: string;
  participants: { name: string; cpf?: string }[];
};

const getRegisterFromInscricaoModel = async (
  registerId: string,
  eventId: string,
) => {
  try {
    const registerFound = await api.inscricao.getInscricaoByUserId({
      id: registerId,
      eventId,
    });
    return registerFound;
  } catch (error) {
    console.log(error);
    throw Error(`Erro ao buscar inscrição do evento ${eventId} em mail`);
  }
};

const getRegisterFromManadaDayModel = async (
  registerId: string,
  eventId: string,
) => {
  try {
    const registerFound = await api.manadaDay.getRegisterById({
      id: registerId,
      eventoId: eventId,
    });
    return registerFound;
  } catch (error) {
    console.log(error);
    throw Error(`Erro ao buscar inscrição do evento ${eventId} em mail`);
  }
};

export async function sendSubscriptionConfirmation(
  inscricaoId: string,
  eventoId: string,
  eventType: ENUM_EVENT_TYPE,
) {
  const queryRegisterMap = {
    [ENUM_EVENT_TYPE.LEGENDARIOS]: getRegisterFromInscricaoModel,
    [ENUM_EVENT_TYPE.REM]: getRegisterFromInscricaoModel,
    [ENUM_EVENT_TYPE.MANADADAY]: getRegisterFromManadaDayModel,
    [ENUM_EVENT_TYPE.LEGADO_FILHA]: async () => null,
    [ENUM_EVENT_TYPE.LEGADO_FILHO]: async () => null,
  };

  const handler = queryRegisterMap[eventType];

  if (!handler) {
    throw new Error(`Tipo de evento não suportado: ${eventType}`);
  }

  const registerFound = await handler(inscricaoId, eventoId);

  if (!registerFound) {
    throw new Error(`Erro ao buscar inscrição ${inscricaoId}`);
  }

  let register:
    | SubscriptionConfirmationEmailTemplateProps["register"]
    | undefined;

  let emailTo: string | string[] = "";

  switch (eventType) {
    case ENUM_EVENT_TYPE.REM: {
      const rem = registerFound as RemRegister;
      emailTo = [rem.email, rem.spouseEmail];
      register = {
        cpf: rem.cpf,
        nome: rem.nome,
        status: rem.status,
        tipoInscricao: rem.tipoInscricao ?? "",
        otherCPF: rem.spouseCPF,
        otherName: rem.spouseName,
      };
      break;
    }

    case ENUM_EVENT_TYPE.MANADADAY: {
      const manadaDayRegister = registerFound as ManadaDayRegister;
      emailTo = [manadaDayRegister.email];
      register = {
        cpf: manadaDayRegister.cpf,
        nome: manadaDayRegister.name,
        status: manadaDayRegister.status,
        tipoInscricao: "",
        identifier: manadaDayRegister.identifier,
        participants: manadaDayRegister.participants,
      };
      break;
    }

    case ENUM_EVENT_TYPE.LEGENDARIOS: {
      const reg = registerFound as BaseRegister;
      emailTo = reg.email!;
      register = {
        cpf: reg.cpf,
        nome: reg.nome,
        status: reg.status,
        tipoInscricao: reg.tipoInscricao ?? "",
      };
      break;
    }

    case ENUM_EVENT_TYPE.LEGADO_FILHO:
    case ENUM_EVENT_TYPE.LEGADO_FILHA: {
      const reg = registerFound as BaseRegister;
      register = {
        cpf: reg.cpf,
        nome: reg.nome,
        status: reg.status,
        tipoInscricao: reg.tipoInscricao ?? "",
      };
      break;
    }
  }

  const data: SubscriptionConfirmationEmailTemplateProps = {
    register,
    event: registerFound.evento,
  };

  const emailHtml = await getData(SubscriptionConfirmationEmailTemplate(data));

  const response = await sendEmail(emailTo, "Confira sua inscrição", emailHtml);

  return response;
}

export async function sendInviteEmail(
  email: string,
  organizationName: string,
  inviteId: string,
) {
  const emailHtml = await getData(
    InviteEmailTemplate({ email, organizationName, inviteId }),
  );
  await sendEmail(
    email,
    `Convite para ser membro de ${organizationName}`,
    emailHtml,
  );
}
