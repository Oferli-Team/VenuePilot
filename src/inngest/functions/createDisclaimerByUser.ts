import { createTermPDF } from "@/lib/utils/createTermPDF";
import { inngest } from "../client";
import { createAutentiqueDocument } from "@/lib/utils/createAutentiqueDocument";
import { api } from "@/trpc/server";
import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import { format } from "date-fns";
import { EVENTS_NAME } from "../events";

type InngestData = {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  celular: string;
  dataNascimento: Date;
  tipoInscricao: string;
  estadoCivil: string;
  nomeContatoEmergencia: string;
  celularContatoEmergencia: string;
  rua: string;
  ruaNumero: string;
  bairro: string;
  cidade: string;
  cep: string;
  evento: {
    id: string;
    pista: string;
    dataInicio: Date;
    topNumero: number;
  };
};

export const createDisclaimerByUser = inngest.createFunction(
  { id: "create-disclaimer-autentique-by-user" },
  { event: EVENTS_NAME.CREATE_DISCLAIMER_BY_USER },
  async ({ event, step }) => {
    const register = event.data as InngestData;

    const blobUrl = await step.run(`generate-pdf`, async () => {
      const blobUrl = await createTermPDF(
        {
          name: register.nome,
          cpf: register.cpf,
          maritalStatus: register.estadoCivil,
          address: `${register.rua}, ${register.ruaNumero}. ${register.bairro}. ${register.cidade} - ${register.cep}`,
          birthDate: format(register.dataNascimento, "dd/MM/yyyy"),
          phone: register.celular,
          email: register.email,
          emergencyContact: `${register.nomeContatoEmergencia} - ${register.celularContatoEmergencia}`,
          topNumber: register.evento.topNumero.toString(),
        },
        register.evento.topNumero,
      );
      return blobUrl;
    });

    const document = await step.run(`create-autentique-document`, async () => {
      return await createAutentiqueDocument({
        blobUrl,
        user: {
          name: register.nome,
          cpf: register.cpf,
          phone: register.celular,
          email: register.email,
        },
        event: {
          initialDate: format(register.evento.dataInicio, "dd/MM/yyyy"),
          organization: register.evento.pista,
          topNumber: register.evento.topNumero,
        },
      });
    });

    const registerUpdated = await step.run(
      `update-checkin-status-and-documentId`,
      async () => {
        if (document.status === "CREATED") {
          return await api.inscricao.updateCheckinStatus({
            id: register.id,
            eventoId: register.evento.id,
            checkinStatus: ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
            documentId: document.documentId,
          });
        }
        return null;
      },
    );

    return {
      registerId: register.id,
      document,
      checkinStatus: registerUpdated?.checkinStatus,
      success: !!registerUpdated?.checkinStatus,
    };
  },
);
