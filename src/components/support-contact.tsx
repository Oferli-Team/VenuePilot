import { ITOP } from "@/lib/constants";
import { createWhatsappLink } from "@/lib/whatsapp";
import { Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

export const SupportContact = () => {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h4>Dúvidas?</h4>

      <p className="text-xs sm:text-sm">Entre em contato com o suporte:</p>
      <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <a
          target="_blank"
          className="flex items-center gap-1"
          href={createWhatsappLink({
            phone: ITOP.whatsapp_suporte,
            text: `Preciso de ajuda para realizar minha inscrição.`,
          })}
        >
          <FaWhatsapp /> WhatsApp
        </a>

        <a
          target="_blank"
          href={`mailto:${ITOP.email_suporte}`}
          className="flex items-center gap-1"
        >
          <Mail size={16} />
          E-mail
        </a>
      </div>
    </div>
  );
};
