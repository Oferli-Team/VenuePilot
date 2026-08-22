import { ENUM_STATUS } from "@/lib/enum";

export const MANADA_DAY = {
  titulo: "Manada Day 2025",
  subtitulo: "O maior evento da família Legendários do Mato Grosso do Sul",
  banner:
    "https://gpo38j4868.ufs.sh/f/r4qM8FC5YdZuNYLJtUL91RyCzGk6dKge0YHO8aZwSQpBniUD",
  description: `<h3>Lote 01 - ATÉ 10/08/2025</h3><p></p><ul class="list-disc ml-3"><li><p>Adultos e crianças maiores de 11 anos: R$ 69,99</p></li><li><p>Crianças de 6 a 10 anos: R$34,99</p></li><li><p>Crianças de 0 a 5 anos:  Não pagam</p></li></ul><p></p><p>📅 Válido somente até <strong>10 de julho</strong>!</p><br/><br/><hr><p></p><p>📍 Sindicato Rural de Iguatemi/MS<br>Rua Alcides Fernandes Nogueira s/n - Vila Mariza</p>`,
  pista: "",
  periodo: "20/09/2025",
  local: "Sindicato Rural de Iguatemi - MS",
  localUrl: "https://maps.app.goo.gl/6g5jhjfx6gvbyLzL7",
  maxPeople: 2000,
  ticketsValue: {
    ADULT: 69.99,
    PAID_CHILD: 34.99,
    FREE_CHILD: 0,
  },
  ticketsType: {
    ADULT: "Adulto ou criança +11 anos",
    PAID_CHILD: "Criança 6 a 10 anos",
    FREE_CHILD: "Criança 0 a 5 anos",
  },
};

export const statusManadaDayOptions = [
  { value: ENUM_STATUS.CONFIRMADA, label: "Confirmada" },
  { value: ENUM_STATUS.AGUARDANDO_PAGAMENTO, label: "Aguardando pagamento" },
  {
    value: ENUM_STATUS.CANCELADA_PELO_CLIENTE,
    label: "Cancelada",
  },
];

export const ticketTypeMap = {
  ["ADULT"]: {
    label: "Adulto",
    style: "text-primary",
  },
  ["PAID_CHILD"]: {
    label: "Criança pagante",
    style: "text-green-500",
  },
  ["FREE_CHILD"]: {
    label: "Criança free",
    style: "text-blue-500",
  },
};
