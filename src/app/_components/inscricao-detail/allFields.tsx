import {
  biotipoOptions,
  funcoesLgndOptions,
  howKnowLegendsOptions,
  MASK_PATTERN,
  paymentStatusMap,
  paymentStatusOptions,
  shirtSizesOptions,
  statusOptions,
  vinculoOptions,
} from "@/lib/constants";
import { useEventStore } from "@/lib/store/EventStore";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/utils/calculateAge";
import { classifyIMC } from "@/lib/utils/classifyIMC";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { getStatusClass } from "@/lib/utils/getStatusClass";
import { reais } from "@/lib/utils/money";
import { mask } from "remask";
import parsePhoneNumberFromString from "libphonenumber-js";
import type { ENUM_PAYMENT_STATUS } from "@/lib/enum";

export enum ENUM_CATEGORY {
  PERSONAL = "PERSONAL",
  SPOUSE_PERSONAL = "SPOUSE_PERSONAL",
  HEALTH = "HEALTH",
  MORE_HEALTH_INFO = "MORE_HEALTH_INFO",
  PAYMENT = "PAYMENT",
  ADDRESS = "ADDRESS",
  EMERGENCY = "EMERGENCY",
  LETTERS = "LETTERS",
  RELIGION = "RELIGION",
  LEGENDARY = "LEGENDARY",
  REFUND = "REFUND",
}

export enum ENUM_INPUT {
  TEXT = "TEXT",
  SELECT = "SELECT",
  RADIO = "RADIO",
  TEXTAREA = "TEXTAREA",
  CURRENCY = "CURRENCY",
  COMPONENT = "COMPONENT",
  PHONE_INTERNATIONAL = "PHONE_INTERNATIONAL",
}

export type AllFieldsProps = {
  id: string;
  label: string;
  input?: keyof typeof ENUM_INPUT;
  options?: { value: string; label: string }[];
  component?: (props: {
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    name: string;
  }) => JSX.Element;
  category: keyof typeof ENUM_CATEGORY;
  inputMask?: string | string[];
};

const formatDateDMY = (date: Date | undefined): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const ShowTicketComponent = ({ value }: { value: string }) => {
  const { event } = useEventStore();
  return (
    <LinkComponentCustom
      href={`/ticket/${event?.id}/${value}`}
      value="Mostrar Ticket"
      className="rounded-md bg-muted p-2 no-underline hover:bg-muted/80 md:text-sm"
    />
  );
};

const formatBoolean = (value: boolean | undefined): string =>
  value === true ? "Sim" : "Não";

const ComponentCustom = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => (
  <p className={cn("flex h-10 items-center text-sm sm:text-base", className)}>
    {value}
  </p>
);

const LinkComponentCustom = ({
  href,
  value,
  className,
}: {
  href: string;
  value: string;
  className?: string;
}) => (
  <a
    className={cn("text-sm underline sm:text-base", className)}
    target="_blank"
    rel="noreferrer"
    href={href}
  >
    {value}
  </a>
);

const radioOption = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

export const allFields: AllFieldsProps[] = [
  {
    id: "createdAt",
    label: "Data da inscrição",
    component: ({ value }) => <ComponentCustom value={formatDateDMY(value)} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.date,
  },
  {
    id: "status",
    label: "Status",
    component: ({ value }) => (
      <ComponentCustom
        className={`${getStatusClass(value)} w-fit rounded-md p-1 font-medium uppercase sm:text-sm`}
        value={value}
      />
    ),
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.SELECT,
    options: statusOptions,
  },
  {
    id: "tipoInscricao",
    label: "Inscrição",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.SELECT,
    options: [
      { value: "PARTICIPANTE", label: "Participante" },
      { value: "SERVIR", label: "Legendário" },
    ],
  },
  {
    id: "cpf",
    label: "Ticket",
    component: ({ value }) => <ShowTicketComponent value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "nome",
    label: "Nome",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "cpf",
    label: "CPF",
    component: ({ value }) => (
      <ComponentCustom value={mask(value, "999.999.999-99")} />
    ),
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.cpf,
  },
  {
    id: "celular",
    label: "Celular",
    component: ({ value }) => {
      const phoneNumber = parsePhoneNumberFromString(`+${value}`);
      return (
        <LinkComponentCustom
          className="flex items-center gap-2 text-green-500"
          value={
            !phoneNumber ? (value as string) : phoneNumber.formatInternational()
          }
          href={`https://wa.me/${value}`}
        />
      );
    },
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.PHONE_INTERNATIONAL,
  },
  {
    id: "email",
    label: "Email",
    component: ({ value }) => (
      <LinkComponentCustom
        className="flex items-center gap-2 text-blue-600"
        value={value}
        href={`mailto:${value}`}
      />
    ),
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "dataNascimento",
    label: "Nascimento",
    component: ({ value }) => <ComponentCustom value={formatDateDMY(value)} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.date,
  },
  {
    id: "dataNascimento",
    label: "Idade",
    component: ({ value }) => {
      const dataNascimento = formatDateToDDMMYYYY(value);
      const idade = calculateAge(dataNascimento);
      return <ComponentCustom value={idade.toString()} />;
    },
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "manTshirtSize",
    label: "Tamanho Camiseta",
    component: ({ value }) => {
      return <ComponentCustom value={value ?? "-"} />;
    },
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.SELECT,
    options: shirtSizesOptions,
  },
  {
    id: "spouseName",
    label: "Nome",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "spouseCPF",
    label: "CPF",
    component: ({ value }) => (
      <ComponentCustom value={mask(value, "999.999.999-99")} />
    ),
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.cpf,
  },
  {
    id: "spousePhoneNumber",
    label: "Celular",
    component: ({ value }) => {
      const phoneNumber = parsePhoneNumberFromString(`+${value}`);
      return (
        <LinkComponentCustom
          className="flex items-center gap-2 text-green-500"
          value={
            !phoneNumber ? (value as string) : phoneNumber.formatInternational()
          }
          href={`https://wa.me/${value}`}
        />
      );
    },
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.PHONE_INTERNATIONAL,
  },
  {
    id: "spouseEmail",
    label: "Email",
    component: ({ value }) => (
      <LinkComponentCustom
        className="flex items-center gap-2 text-blue-600"
        value={value}
        href={`mailto:${value}`}
      />
    ),
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "spouseBirthDate",
    label: "Nascimento",
    component: ({ value }) => <ComponentCustom value={formatDateDMY(value)} />,
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.date,
  },
  {
    id: "spouseBirthDate",
    label: "Idade",
    component: ({ value }) => {
      const spouseBirthDate = formatDateToDDMMYYYY(value);
      const age = calculateAge(spouseBirthDate);
      return <ComponentCustom value={value ? age.toString() : "-"} />;
    },
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "womanTshirtSize",
    label: "Tamanho Camiseta",
    component: ({ value }) => {
      return <ComponentCustom value={value ?? "-"} />;
    },
    category: ENUM_CATEGORY.SPOUSE_PERSONAL,
    input: ENUM_INPUT.SELECT,
    options: shirtSizesOptions,
  },
  {
    id: "temFilhos",
    label: "Tem Filhos?",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "qtdFilhos",
    label: "Qtd Filhos",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.qtdFilhos,
  },
  {
    id: "tamanhoFarda",
    label: "Farda",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PERSONAL,
    input: ENUM_INPUT.SELECT,
    options: shirtSizesOptions,
  },
  {
    id: "nrLgnd",
    label: "LGND Número",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LEGENDARY,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "lgndCertificado",
    label: "LGND Certificado?",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LEGENDARY,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiAutorizacaoServir",
    label: "Autorizado para Servir?",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LEGENDARY,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "lgnd_funcao",
    label: "Função no TOP",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LEGENDARY,
    input: ENUM_INPUT.SELECT,
    options: funcoesLgndOptions,
  },
  {
    id: "rua",
    label: "Rua",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "ruaNumero",
    label: "Número da Rua",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "ruaComplemento",
    label: "Complemento da Rua",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "bairro",
    label: "Bairro",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "cidade",
    label: "Cidade",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "estado",
    label: "Estado",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "cep",
    label: "CEP",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.ADDRESS,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.cep,
  },
  {
    id: "nomeContatoEmergencia",
    label: "Nome",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.EMERGENCY,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "celularContatoEmergencia",
    label: "Celular",
    category: ENUM_CATEGORY.EMERGENCY,
    component: ({ value }) => {
      const phoneNumber = parsePhoneNumberFromString(`+${value}`);
      return (
        <LinkComponentCustom
          className="flex items-center gap-2 text-green-500"
          value={
            !phoneNumber ? (value as string) : phoneNumber.formatInternational()
          }
          href={`https://wa.me/${value}`}
        />
      );
    },
    input: ENUM_INPUT.PHONE_INTERNATIONAL,
  },
  {
    id: "tipoVinculoContatoEmergencia",
    label: "Vínculo",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.EMERGENCY,
    input: ENUM_INPUT.SELECT,
    options: vinculoOptions,
  },
  {
    id: "nomeContatoCartas",
    label: "Nome",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LETTERS,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "celularContatoCartas",
    label: "Celular",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.LETTERS,
    input: ENUM_INPUT.PHONE_INTERNATIONAL,
  },
  {
    id: "peso",
    label: "Peso",
    component: ({ value }) => <ComponentCustom value={`${value} kg`} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "altura",
    label: "Altura",
    component: ({ value }) => <ComponentCustom value={mask(value, "9.99")} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "imc",
    label: "IMC",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "imc",
    label: "Classificação IMC",
    component: ({ value }) => {
      const { classification, textColor, backgroundColor } = classifyIMC(value);

      return (
        <ComponentCustom
          className={`w-fit rounded-md p-1 font-medium sm:text-sm ${textColor} ${backgroundColor}`}
          value={classification}
        />
      );
    },
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "biotipo",
    label: "Biotipo",
    component: ({ value }) => {
      const biotipo = biotipoOptions.find(
        (option) => option.value === value,
      )?.label;
      return <ComponentCustom value={biotipo ?? "-"} />;
    },
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.SELECT,
    options: biotipoOptions,
  },
  {
    id: "possuiPlanoSaude",
    label: "Possui Plano de saúde",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "nomePlanoSaude",
    label: "Nome Plano de saúde",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "possuiAlergia",
    label: "Possui Alergia",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiDiabetes",
    label: "Possui Diabetes",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiConvulsoes",
    label: "Possui Convulsões",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiDesmaios",
    label: "Possui Desmaios",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiProblemasRespiratorios",
    label: "Problema Respiratório",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiProblemasCardiacos",
    label: "Problema Cardíaco",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "cuidadosPsiquiatricos",
    label: "Cuidados Psiquiátricos",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "medicacaoDepressao",
    label: "Medicação para depressão",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "possuiProblemasMusculoesqueleticos",
    label: "Problems Musculoesquetéticos",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "doencaOuCondicao",
    label: "Possui Outras Doenças",
    component: ({ value }) => (
      <ComponentCustom
        className="h-full min-h-10 md:text-sm"
        value={!value ? "-" : value}
      />
    ),
    category: ENUM_CATEGORY.MORE_HEALTH_INFO,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "medicacoes",
    label: "Medicações",
    component: ({ value }) => (
      <ComponentCustom
        className="h-full min-h-10 md:text-sm"
        value={!value ? "-" : value}
      />
    ),
    category: ENUM_CATEGORY.MORE_HEALTH_INFO,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "motivosDietaEspecial",
    label: "Motivos dieta especial",
    component: ({ value }) => (
      <ComponentCustom
        className="h-full min-h-10 md:text-sm"
        value={!value ? "-" : value}
      />
    ),
    category: ENUM_CATEGORY.MORE_HEALTH_INFO,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "outrasInformacoesMedicas",
    label: "Outras informações",
    component: ({ value }) => (
      <ComponentCustom
        className="h-full min-h-10 md:text-sm"
        value={!value ? "-" : value}
      />
    ),
    category: ENUM_CATEGORY.MORE_HEALTH_INFO,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "hasHealthIssues",
    label: "Problema de Saúde do cassal",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "healthIssuesDescription",
    label: "Detalhe sobre saúde do casal",
    component: ({ value }) => (
      <ComponentCustom
        className="h-full min-h-10 md:text-sm"
        value={!value ? "-" : value}
      />
    ),
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "isPregnant",
    label: "Esposa grávida?",
    component: ({ value }) => <ComponentCustom value={formatBoolean(value)} />,
    category: ENUM_CATEGORY.HEALTH,
    input: ENUM_INPUT.RADIO,
    options: radioOption,
  },
  {
    id: "igreja",
    label: "Igreja ou Comunidade",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.RELIGION,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "igrejaPastor",
    label: "Pastor ou Líder Religioso",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.RELIGION,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "comoConheceuLegendarios",
    label: "Como conheceu os Legendários",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.RELIGION,
    input: ENUM_INPUT.SELECT,
    options: howKnowLegendsOptions,
  },
  {
    id: "quemConvidou",
    label: "Quem convidou",
    component: ({ value }) => <ComponentCustom value={!value ? "-" : value} />,
    category: ENUM_CATEGORY.RELIGION,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "pagamento_status",
    label: "Status de Pagamento",
    component: ({ value }) => {
      const paymentStatus = paymentStatusMap[value as ENUM_PAYMENT_STATUS];
      return <ComponentCustom value={paymentStatus} />;
    },
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.SELECT,
    options: paymentStatusOptions,
  },
  {
    id: "metodo_pagamento",
    label: "Método de Pagamento",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.SELECT,
    options: [
      { value: "PIX", label: "Pix" },
      { value: "CARTAO", label: "Cartão" },
      { value: "CUPOM_GRATUITO", label: "Cupom Gratuito" },
    ],
  },
  {
    id: "pagamento_data",
    label: "Data de Pagamento",
    component: ({ value }) => <ComponentCustom value={formatDateDMY(value)} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.TEXT,
    inputMask: MASK_PATTERN.date,
  },
  {
    id: "pagamento_top_value",
    label: "Valor TOP",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.CURRENCY,
  },
  {
    id: "pagamento_total_value",
    label: "Valor Pago",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.CURRENCY,
  },
  {
    id: "pagamento_fee_card",
    label: "Taxa Cartão",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.CURRENCY,
  },
  {
    id: "pagamento_couponValue",
    label: "Cupom de desconto",
    component: ({ value }) => <ComponentCustom value={value ?? "-"} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "pagamento_discount_value",
    label: "Valor do desconto",
    component: ({ value }) => (
      <ComponentCustom value={value ? reais(value) : "-"} />
    ),
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.CURRENCY,
  },
  {
    id: "pagamento_link_url",
    label: "Comprovante de pagamento",
    component: ({ value }) => {
      if (!value) return <></>;
      return (
        <LinkComponentCustom
          href={value as string}
          className="text-blue-500"
          value={"Abrir comprovante"}
        />
      );
    },
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "linkSecreto",
    label: "Link Secreto",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "obs",
    label: "Observação",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.PAYMENT,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "reembolso_status",
    label: "Status do Estorno",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.REFUND,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "reembolso_created",
    label: "Data do estorno",
    component: ({ value }) => <ComponentCustom value={formatDateDMY(value)} />,
    category: ENUM_CATEGORY.REFUND,
    input: ENUM_INPUT.TEXT,
  },
  {
    id: "reembolso_value",
    label: "Valor estornado",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.REFUND,
    input: ENUM_INPUT.CURRENCY,
  },
  {
    id: "reembolso_description",
    label: "Motivo do estorno",
    component: ({ value }) => <ComponentCustom value={value} />,
    category: ENUM_CATEGORY.REFUND,
    input: ENUM_INPUT.TEXTAREA,
  },
  {
    id: "reembolso_receipt",
    label: "Comprovante de estorno",
    component: ({ value }) => (
      <LinkComponentCustom
        href={value as string}
        className="text-blue-500"
        value={"Abrir comprovante"}
      />
    ),
    category: ENUM_CATEGORY.REFUND,
    input: ENUM_INPUT.COMPONENT,
  },
];
