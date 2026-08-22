import { ITOP } from "@/lib/constants";
import { Section } from "@/components/ui/section";
import { FaWhatsapp } from "react-icons/fa6";
import { createWhatsappLink } from "@/lib/whatsapp";
import { Mail } from "lucide-react";

export default function PrivacyPolitic() {
  return (
    <Section className="mb-12 mt-24 flex w-full flex-col leading-6">
      <h1 className="text-lg font-bold md:text-3xl">Política de Privacidade</h1>
      <ol className="mt-8 flex flex-col gap-8 text-sm sm:text-base">
        <li>
          <h3 className="mb-4 text-lg font-semibold">Coleta de Informações</h3>
          <p>
            Nós da plataforma <span className="text-primary">{ITOP.name}</span>{" "}
            coletamos informações pessoais, endereço, informações de saúde e
            informações de pagamento quando o participante realiza a inscrição
            para os eventos dos Legendários. Essas informações são utilizadas
            para processamento de pagamentos e também para a administração do
            Evento (TOP) pelo qual está se inscrevendo.
          </p>
        </li>
        <li>
          <h3 className="mb-4 text-lg font-semibold">
            Compartilhamento de Informações
          </h3>
          <p>
            Nós não compartilhamos suas informações pessoais com terceiros,
            exceto quando necessário para o cumprimento dos serviços contratados
            (por exemplo, processadores de pagamento) ou em conformidade com a
            lei.
          </p>
        </li>
      </ol>

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
              text: "Gostaria de falar sobre política de privacidade da Plataforma Inscrições TOP",
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
