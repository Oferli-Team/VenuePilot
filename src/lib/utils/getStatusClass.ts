import { ENUM_CHECKIN_STATUS, ENUM_PAYMENT_STATUS, ENUM_STATUS } from "../enum";

export const getStatusClass = (status: ENUM_STATUS): string => {
  switch (status) {
    case ENUM_STATUS.CONFIRMADA:
      return "bg-green-500/5 text-green-600";
    case ENUM_STATUS.INSCREVENDO:
      return "bg-yellow-500/5 text-yellow-600";
    case ENUM_STATUS.AGUARDANDO_PAGAMENTO:
      return "bg-orange-500/5 text-orange-600";
    case ENUM_STATUS.CANCELADA_PELO_CLIENTE:
      return "bg-blue-500/5 text-blue-600";
    case ENUM_STATUS.CANCELADA_TEMPO_EXPIRADO:
      return "bg-red-500/5 text-red-600";
    default:
      return "";
  }
};

export const addColorTextByStatus = (status: ENUM_STATUS): string => {
  switch (status) {
    case ENUM_STATUS.CONFIRMADA:
      return " text-green-600";
    // case ENUM_STATUS:
    //   return "text-red-600";
    case ENUM_STATUS.INSCREVENDO:
      return "text-yellow-600";
    case ENUM_STATUS.AGUARDANDO_PAGAMENTO:
      return "text-orange-600";
    case ENUM_STATUS.CANCELADA_PELO_CLIENTE:
      return "text-red-600";
    default:
      return "";
  }
};

export const addColorByCheckInStatus = (
  status: ENUM_CHECKIN_STATUS,
  local: "bg" | "text",
): string => {
  switch (status) {
    case ENUM_CHECKIN_STATUS.VALID_DOCUMENTS:
      return `${local}-green-600`;
    case ENUM_CHECKIN_STATUS.DOCUMENTS_SENT:
      return `${local}-yellow-600`;
    case ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS:
      return `${local}-orange-600`;
    case ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS:
      return `${local}-red-600`;
    default:
      return `${local}-muted`;
  }
};

export const addColorByPaymentStatus = (
  status: ENUM_PAYMENT_STATUS,
  local: "bg" | "text",
): string => {
  switch (status) {
    case ENUM_PAYMENT_STATUS.CREDIT_CARD_PAYMENT_COMPLETED:
      return `${local}-green-600`;
    case ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_CONCLUIDO:
      return `${local}-green-600`;
    case ENUM_PAYMENT_STATUS.CHARGE_COMPLETED:
      return `${local}-green-600`;
    case ENUM_PAYMENT_STATUS.CHARGE_CREATED:
      return `${local}-yellow-600`;
    case ENUM_PAYMENT_STATUS.GRATUITO:
      return `${local}-orange-600`;
    case ENUM_PAYMENT_STATUS.CHARGE_EXPIRED:
      return `${local}-red-600`;
    case ENUM_PAYMENT_STATUS.TRANSACTION_REFUND_RECEIVED:
      return `${local}-red-600`;
    case ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_PENDENTE:
      return `${local}-red-600`;
    default:
      return `${local}-muted`;
  }
};

const unusedClasses = "bg-green-600 bg-yellow-600 bg-orange-600 bg-red-600";

export const getPermitionClass = (
  status: "USER" | "ADMIN" | "SUPER_ADMIN" | "LADIES" | null,
): string => {
  switch (status) {
    case "USER":
      return " text-blue-600";
    case "ADMIN":
      return " text-yellow-600";
    case "SUPER_ADMIN":
      return "text-red-600";
    case "LADIES":
      return "text-pink-600";
    default:
      return "";
  }
};
