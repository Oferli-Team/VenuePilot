import { inngest } from "../client";
import { EVENTS_NAME } from "../events";

type User = {
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

// Tamanho do grupo para cada evento
const BATCH_SIZE = 20;

export const queueDisclaimerBatches = inngest.createFunction(
  { id: "queue-disclaimer-batches" },
  { event: EVENTS_NAME.ENQUEUE_DISCLAIMER_BATCHES },
  async ({ event, step }) => {
    const payload = event.data as { registers: User[] };
    const queuedEvents = await step.run("enqueue-batch-events", async () => {
      const batches = [];
      for (let i = 0; i < payload.registers.length; i += BATCH_SIZE) {
        batches.push(payload.registers.slice(i, i + BATCH_SIZE));
      }

      const events = batches.map((batch, index) => ({
        name: EVENTS_NAME.CREATE_BATCH_DISCLAIMERS,
        data: { registers: batch },
        id: `disclaimer-batch-${event.id}-${index}`,
      }));

      await inngest.send(events);
      return events.length;
    });

    return {
      batchesQueued: queuedEvents,
      totalRegisters: payload.registers.length,
      registersPerBatch: BATCH_SIZE,
    };
  },
);
