export type Loading = "initial" | "loading";

export type Legendary = {
  id: number;
  name: string;
  lgnd: number;
  email: string;
  experience: string;
  mobile: string;
};

type PersonalInfoFields =
  | "nome"
  | "email"
  | "celular"
  | "data_nascimento"
  | "estado_civil";

type AddressFields =
  | "pais"
  | "cep"
  | "rua"
  | "rua_numero"
  | "bairro"
  | "rua_complemento"
  | "cidade"
  | "estado";

type EmergencyContactFields =
  | "nome_contato_emergencia"
  | "email_contato_emergencia"
  | "celular_contato_emergencia"
  | "tipo_vinculo_contato_emergencia";

export type FieldsPersonalData =
  | PersonalInfoFields
  | "rg"
  | "orgao_expedidor"
  | "peso"
  | "altura"
  | "igreja"
  | "tem_filhos"
  | "qtd_filhos"
  | "como_conheceu_legendarios"
  | AddressFields
  | EmergencyContactFields;

export type FieldsPersonalServeData =
  | "nrLgnd"
  // | 'dourados_ou_regiao'
  | PersonalInfoFields
  | "orientador_espiritual"
  | "igreja"
  | AddressFields
  | EmergencyContactFields;

export type FieldCertificateServeData = "lgnd_certificado";

export type FieldsHealth =
  | "possui_plano_saude"
  | "nome_plano_saude"
  | "possui_alergia"
  | "possui_diabetes"
  | "possui_convulsoes"
  | "possui_desmaios"
  | "possui_problemas_cardiacos"
  | "possui_disturbios_alimentares"
  | "possui_problemas_respiratorios"
  | "cuidados_psiquiatricos"
  | "medicacao_depressao"
  | "possui_problemas_musculoesqueleticos"
  | "doenca_ou_condicao"
  | "outras_informacoes_medicas"
  | "motivos_dieta_especial";

type PaymentMethod = {
  additionalInfo: [{ key: string; value: string }];
  brCode: string;
  fee: number;
  identifier: string;
  method: string;
  qrCodeImage: string;
  status: string;
  transactionID: string;
  txId: string;
  value: number;
};

export type ChargePix = {
  brCode: string;
  comment: string;
  correlationID: string;
  createdAt: string;
  customer: null | unknown;
  discount: number;
  expiresDate: string | Date;
  expiresIn: number;
  fee: number;
  globalID: string;
  identifier: string;
  paymentLinkID: string;
  paymentLinkUrl: string;
  paymentMethods: {
    pix: PaymentMethod;
  };
  pixKey: string;
  qrCodeImage: string;
  status: string;
  transactionID: string;
  type: string;
  updatedAt: string;
  value: number;
  valueWithDiscount: number;
};

export type ManadaPagesParams = Readonly<{
  params: {
    numberTop: string;
    orgSlug: string;
  };
  searchParams: {
    page: string;
    max: string;
    search: string;
    filters: Record<string, string>;
  };
}>;

export type FeeObject = Record<string, { $numberDecimal: string }>;

export type FeeRates = Record<string, number>;

export type VariablesRichTextTerms = {
  NR_TOP: number;
  DATA_INICIO_EVENTO: string;
  DATA_FIM_EVENTO: string;
  PISTA: string;
};

export type RegisterSection = {
  disabled?: boolean;
  title?: string;
  className?: string;
  selectOptions: { value: string; label: string }[];
  sectionOnFocus?: () => void;
  sectionOnBlur?: () => void;
};
