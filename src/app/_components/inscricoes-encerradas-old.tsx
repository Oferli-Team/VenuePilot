import { createWhatsappLink } from "@/lib/whatsapp";
import { Separator } from "./ui/separator";
import { FaWhatsapp } from "react-icons/fa6";
import { ITOP } from "@/lib/constants";

type InscricoesEncerradasProps = {
  type: "participante" | "servir";
};

// TODO: pegar do contexto do evento o texto de inscrições encerradas
export const InscricoesEncerradas = ({ type }: InscricoesEncerradasProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-md bg-destructive/70 px-4 py-4 pt-2 text-center">
    <h3 className="font-bold">Inscrições Esgotadas!</h3>
    <Separator className="w-1/2 bg-white opacity-80" />
    <p>Obrigado pelo interesse, mas as vagas estão esgotadas.</p>
    <p>Qualquer dúvida entre em contato com nosso suporte.</p>
    <a
      target="_blank"
      className="flex items-center gap-1 font-bold"
      href={createWhatsappLink({
        phone: ITOP.whatsapp_suporte,
        text:
          type === "participante"
            ? ITOP.whatsapp_text_support_participar
            : ITOP.whatsapp_text_support_servir,
      })}
    >
      <FaWhatsapp />
      Falar com suporte!
    </a>
  </div>
);
