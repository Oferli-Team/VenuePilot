export type SendMessageWhatsAppEvolutionApiRequest = {
  number: string;
  textMessage: {
    text: string;
  };
};

export type ContactTypeEvolutionApi = {
  fullName: string;
  wuid: string;
  phoneNumber: string;
  organization?: string;
  email?: string;
  url?: string;
};

export type SendContactMessageWhatsAppEvolutionApiRequest = {
  number: string;
  contact: ContactTypeEvolutionApi[];
};

type RoyListType = {
  title: string;
  description?: string;
  rowId: string;
};

type ListType = {
  title: string;
  rows: RoyListType[];
};

export type SendListMessageWhatsAppEvolutionApiRequest = {
  number: string;
  title: string;
  description: string;
  buttonText: string;
  footerText: string;
  sections: ListType[];
};

export type SendMessageWhatsAppEvolutionApiSuccessResponse = {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    extendedTextMessage: {
      text: string;
    };
  };
  messageTimestamp: string;
  status: string;
};

export type SendMessageWhatsAppEvolutionApiErrorResponse = {
  status: number;
  error: string;
  response: {
    message: string[];
  };
};

export type SendMessageWhatsAppEvolutionApiResponse =
  | SendMessageWhatsAppEvolutionApiSuccessResponse
  | SendMessageWhatsAppEvolutionApiErrorResponse;
