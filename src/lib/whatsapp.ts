// PATTERN
// phone = 5567999210000
// text = "Olá, gostaria de mais informações sobre o evento TOP Vale da Onça"
// https://wa.me/phone?text=mensagem
export const WHATSAPP_BASE_URL = `https://wa.me/`;
interface WhatsappLinkParams {
  phone: string;
  text: string;
}

export const createWhatsappLink = ({
  phone,
  text,
}: WhatsappLinkParams): string => {
  const encodedText = encodeURIComponent(text);
  return `${WHATSAPP_BASE_URL}/${phone}?text=${encodedText}`;
};

export const createWhatsappGroupLinkServir = (
  phone: string,
  linkZap: string,
): string => {
  return createWhatsappLink({
    phone,
    text: `Legendário, entre no grupo do top para acompanhar as novidades, AHU! ${linkZap}`,
  });
};

export const createWhatsappGroupLinkParticipantes = (
  phone: string,
  linkZap: string,
): string => {
  return createWhatsappLink({
    phone,
    text: `Olá caro participante do Evento, entre no grupo do top para acompanhar as novidades, AHU! ${linkZap}`,
  });
};

// Exemplo de uso
// const phone = "5567999210000";
// const text = "Olá, gostaria de mais informações sobre o evento TOP Vale da Onça";
// const whatsappLink = createWhatsappLink({ phone, text });
