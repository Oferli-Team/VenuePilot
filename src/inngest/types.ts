export enum FLAGS {
  WHATSAPP_MESSAGE = "sendConfirmationMessageByWhats",
  EMAIL_MESSAGE = "sendConfirmationMessageByEmail",
}

export type NotificationsMessageType = {
  inscricao: {
    id: string;
    cpf: string;
    nome: string;
    spouseName?: string;
    spousePhoneNumber?: string;
    tipoInscricao: "PARTICIPANTE" | "SERVIR";
    celular: string;
    flags: string[];
  };
  evento: {
    type: string;
    id: string;
    titulo?: string;
    topNumero: string;
    linkWhatsappGrupoParticipante: string;
    linkWhatsappGrupoServir: string;
    dataInicio: string;
  };
};

export type NotificationMessageManadaDay = {
  inscricao: {
    id: string;
    nome: string;
    celular: string;
    identifier: string;
    participants: { name: string; cpf?: string; type: string }[];
  };
  evento: {
    type: string;
    id: string;
    titulo?: string;
  };
};
