import {
  Banknote,
  CheckCheck,
  CircleOff,
  LayoutTemplate,
  SmilePlus,
  TicketSlash,
  UserPlus,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

export const faqItems = [
  {
    icon: <LayoutTemplate />,
    question: "Quem somos?",
    answer:
      "Nós somos a plataforma que facilita a inscrição dos participantes e legendários nos eventos e também ofereceremos um sistema robusto para administração dos TOP's para os organizadores.",
  },
  {
    icon: <SmilePlus />,
    question: "Em que vocês podem ajudar?",
    answer:
      "Podemos ajudar respondendo dúvidas no processo de inscrição, auxiliando no cadastro em caso de dificuldades e esclarecendo dúvidas sobre o processo de pagamento.",
  },
  {
    icon: <CircleOff />,
    question: "O que vocês não podem ajudar?",
    answer:
      "Não temos informações sobre os detalhes do evento, como datas, valores, local de chegada ou saída. Essas informações devem ser verificadas diretamente com os organizadores por meio da página do evento ou contato direto com eles.",
  },
  {
    icon: <UserPlus />,
    question: "Como faço para participar?",
    answer:
      "Para participar basta se inscrever em algum evento (TOP) que esteja com as inscrições abertas. Veja todos os eventos da plataforma <a href='/'><strong>aqui</strong></a>.",
  },
  {
    icon: <Banknote />,
    question: "Quais são os meios de pagamento?",
    answer: "Aceitamos PIX à vista e cartão de crédito com taxa.",
  },
  {
    icon: <CheckCheck />,
    question: "Como saber se minha inscrição está confirmada?",
    answer:
      "Após realizar a inscrição, você receberá um e-mail e uma mensagem no seu whatsApp de confirmação. Também pode verificar o status da sua inscrição <a href='/ticket'><strong>aqui</strong></a>, informando o CPF do inscrito.",
  },
  {
    icon: <FaWhatsapp />,
    question:
      "Como faço para entrar no grupo do WhatsApp do evento em que me inscrevi?",
    answer:
      "Após se inscrever no evento, a plataforma enviou no seu whatsApp uma mensagem de confirmação com o link para entrar no grupo. Mas você também pode buscar o ticket do evento em que se inscreveu informando o CPF do inscrito. <a href='/ticket'><strong>Clique aqui para ver seu ticket</strong></a>. Nele estará o link para entrar no grupo do WhatsApp, é só clicar em: 'Clique para entrar no grupo do WhatsApp'.",
  },
  {
    icon: <TicketSlash />,
    question: "Como funciona o cancelamento e reembolso?",
    answer:
      "Os pedidos de cancelamento que foram feitos até 7 dias após a compra do ingresso, a plataforma ITOP faz o reembolso integral do valor pago. Para informações sobre cancelamento e reembolso após os 7 dias da compra, consulte os organizadores do evento por meio da página do evento ou contato disponibilizado por eles.",
  },
];
