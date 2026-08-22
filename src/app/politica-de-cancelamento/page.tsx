import { ITOP } from "@/lib/constants";
import { Section } from "@/components/ui/section";
import { FaWhatsapp } from "react-icons/fa6";
import { Mail } from "lucide-react";
import { createWhatsappLink } from "@/lib/whatsapp";

export default function CancelPolitic() {
  return (
    <Section className="mb-12 mt-24 flex w-full flex-col leading-6">
      <h1 className="text-lg font-bold md:text-3xl">
        Política de Cancelamento e Reembolso
      </h1>
      <div className="flex flex-col gap-4 text-sm sm:text-base">
        <p>
          Em conformidade com o Código de Defesa do Consumidor, o PARTICIPANTE
          terá direito ao reembolso integral do valor da inscrição caso desista
          do evento no prazo de até 7 (sete) dias úteis contados a partir da
          data de inscrição.
        </p>

        <p>
          Após o período de 7 (sete) dias úteis, em caso de desistência, será
          aplicada uma multa correspondente a 70% (setenta por cento) do valor
          pago pela inscrição. O saldo remanescente será devolvido ao
          PARTICIPANTE no prazo máximo de 30 (trinta) dias úteis, contados a
          partir da solicitação de cancelamento.
        </p>

        <p>
          A solicitação de cancelamento deve ser feita por escrito e enviada
          para <strong>WhatsApp</strong> do suporte da plataforma ITOP,
          informando o motivo da desistência claramente especificados. Para
          desistências após os 7 (sete) dias úteis, a solicitação deve ser
          enviada até 7 (sete) dias úteis antes da data de início do evento.
        </p>

        <p>
          Não haverá reembolso para solicitações feitas após a conclusão do
          evento ou solicitações fora do prazo informado acima.
        </p>
      </div>
      <hr className="my-8" />

      <div className="mt-2 space-y-4">
        <p className="font-semibold">
          Em caso de dúvidas, solicitações ou reclamações, o participante pode
          entrar em contato através:{" "}
        </p>
        <div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FaWhatsapp />
            <span>WhatsApp</span>
          </div>
          <a
            className="font-semibold"
            target="_blank"
            href={createWhatsappLink({
              text: "Gostaria de falar sobre política de cancelamento da Plataforma Inscrições TOP",
              phone: `55${ITOP.whatsapp_suporte}`,
            })}
          >
            {ITOP.whatsapp_suporte}
          </a>
        </div>
        <div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>E-mail</span>
          </div>
          <a
            className="font-semibold"
            target="_blank"
            href={`mailto:${ITOP.email_suporte}`}
          >
            {ITOP.email_suporte}
          </a>
        </div>
      </div>

      <br />
      <p>
        Atendimento da plataforma ITOP é realizado de segunda a sexta, das 9h às
        18h.
      </p>
    </Section>
  );
}
