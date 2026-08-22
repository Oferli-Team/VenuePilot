import { Ticket } from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";

type Props = {
  topValue: number;
  valueDiscount: number;
  whatasappLink: string;
  participante: { cpf: string; eventoId: string } | null;
};

export const SuccessPaymentMessage = ({
  topValue,
  valueDiscount,
  whatasappLink,
  participante,
}: Props) => {
  return (
    <div className="mt-6 flex w-full flex-col justify-center gap-4 rounded-md bg-background p-4">
      <h2 className="text-center text-lg font-bold text-primary sm:text-xl">
        AHU! Te esperamos lá!
      </h2>
      {topValue !== valueDiscount && (
        <div className="flex flex-col items-center justify-center gap-3 text-center text-sm md:text-base">
          <h3 className="">
            Seu pagamento foi realizado com sucesso e você recebeu{" "}
            <b>ticket por e-mail</b>.
          </h3>

          {participante !== null && (
            <Link
              href={`/ticket/${participante.eventoId}/${participante.cpf}`}
              className="flex items-center gap-2 font-semibold sm:text-lg"
            >
              <Ticket size={22} className="text-primary" />
              <span>Ver meu Ticket</span>
            </Link>
          )}
        </div>
      )}

      <p className="text-center text-sm md:text-base">
        Entre no grupo do whatsapp que criamos para você:
      </p>
      <a
        href={whatasappLink}
        className="flex justify-center gap-2 text-center text-sm font-semibold sm:items-center md:text-base"
      >
        <FaWhatsapp size={22} className="text-primary" />
        <span className="underline">Clique aqui para entrar no grupo.</span>
      </a>
    </div>
  );
};
