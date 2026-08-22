import { inngest } from "../client";
import { createTermPDF } from "@/lib/utils/createTermPDF";
import { createAutentiqueDocument } from "@/lib/utils/createAutentiqueDocument";
import { EVENTS_NAME } from "../events";
import { format } from "date-fns";
import { api } from "@/trpc/server";
import { ENUM_CHECKIN_STATUS } from "@/lib/enum";

type Inscricao = {
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

type InngestEvent = { registers: Inscricao[] };

export const createBatchDisclaimer = inngest.createFunction(
  { id: "create-batch-disclaimer-autentique" },
  { event: EVENTS_NAME.CREATE_BATCH_DISCLAIMERS },
  async ({ event, step }) => {
    const { registers } = event.data as InngestEvent;

    const results = await Promise.all(
      registers.map(async (register, index) => {
        try {
          const blobUrl = await step.run(
            `generate-pdf-${register.id}`,
            async () => {
              const user = {
                name: register.nome,
                cpf: register.cpf,
                maritalStatus: register.estadoCivil,
                address: `${register.rua}, ${register.ruaNumero}. ${register.bairro}. ${register.cidade} - ${register.cep}`,
                birthDate: format(register.dataNascimento, "dd/MM/yyyy"),
                phone: register.celular,
                email: register.email,
                emergencyContact: `${register.nomeContatoEmergencia} - ${register.celularContatoEmergencia}`,
                topNumber: register.evento.topNumero.toString(),
              };
              const blobUrl = await createTermPDF(
                user,
                register.evento.topNumero,
              );
              return blobUrl;
            },
          );

          const document = await step.run(
            `create-autentique-document-${register.id}`,
            async () => {
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
            },
          );

          const registerUpdated = await step.run(
            `update-register-waiting-for-documents-${register.id}`,
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
            success: true,
          };
        } catch (error) {
          console.error(`Error processing user ${register.id}: `, error);
          return {
            userId: register.id,
            success: false,
            error:
              error instanceof Error
                ? error.message
                : `Error processing user ${register.id}`,
          };
        }
      }),
    );

    return {
      results,
      totalProcessed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  },
);
