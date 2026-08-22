import { reais } from "@/lib/utils/money";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { type LinkSecreto } from "@prisma/client";
import { cn } from "@/lib/utils";

const PriceLabel = ({
  text,
  label,
  labelColor = "text-primary",
  price,
  button,
}: {
  text: string;
  label: string;
  labelColor?: string;
  price: string;
  button?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p>{text}</p>
        <p className="mt-1 font-medium">{price}</p>
        <p className={`mt-1 text-xs ${labelColor}`}>{label}</p>
      </div>
      {button && <div>{button}</div>}
    </div>
  );
};

type TicketOptionsProps = {
  className?: string;
  isSoldOutParticipant: boolean;
  isSoldOutServe: boolean;
  type: ENUM_EVENT_TYPE;
  valorParticipante: number;
  valorParaObterCertificacao?: number;
  valorParaLgndCertificados: number;
  openServir: boolean;
  openParticipar: boolean;
  secretLink?: LinkSecreto;
  handlePushParticipantPage: () => void;
  handlePushServePage: () => void;
};

export const TicketOptions = ({
  className,
  isSoldOutParticipant,
  isSoldOutServe,
  type,
  secretLink,
  openParticipar,
  openServir,
  valorParticipante,
  valorParaLgndCertificados,
  valorParaObterCertificacao,
  handlePushParticipantPage,
  handlePushServePage,
}: TicketOptionsProps) => {
  const getLabel = (
    registerIsOpen: boolean,
    isSoldOut: boolean,
    availableMessage: string,
    tipoInscricao?: "PARTICIPANTE" | "SERVIR",
  ) => {
    if (secretLink?.link && secretLink.ativo) {
      return tipoInscricao ? "Inscrição indisponível" : availableMessage;
    }

    if (registerIsOpen && !isSoldOut) {
      return tipoInscricao ? "Inscrição indisponível" : availableMessage;
    }

    if (registerIsOpen && !isSoldOut) return availableMessage; // se a isOpenPartipar ou isOpenServir estiver ativo e ainda tiver vaga, libera inscricao
    if (!registerIsOpen) return "Inscrição indisponível"; // isOpenPartipar ou isOpenServir === false, inscrições ainda não estão disponíveis
    return "Inscrição indisponível"; // inscrição esgotada
  };

  const getParticiparLabel = () => {
    return getLabel(
      openParticipar,
      isSoldOutParticipant,
      "Participar primeira vez",
      secretLink?.tipoInscricao === "SERVIR" ? "SERVIR" : undefined, // Se o tipo for 'SERVIR', desabilita o botão de 'Participar'
    );
  };

  const getLgndCertificadoLabel = () => {
    return getLabel(
      openServir,
      isSoldOutServe,
      `${type === ENUM_EVENT_TYPE.LEGENDARIOS ? "LGND que já serviu" : "Valor para casal que já serviu (certificado)"}`,
      secretLink?.tipoInscricao === "PARTICIPANTE" ? "PARTICIPANTE" : undefined, // Se o tipo for 'SERVIR', desabilita o botão de 'Participar'
    );
  };

  const getLgndObterCertificadoLabel = () => {
    return getLabel(
      openServir,
      isSoldOutServe,
      `${type === ENUM_EVENT_TYPE.LEGENDARIOS ? "LGND que irá servir pela primeira vez" : "Valor para casal que irá servir pela primeira vez (Não certificado)"}`,
      secretLink?.tipoInscricao === "PARTICIPANTE" ? "PARTICIPANTE" : undefined, // Se o tipo for 'SERVIR', desabilita o botão de 'Participar'
    );
  };

  // // Função para verificar se o botão deve estar habilitado
  const isButtonDisable = (
    registerIsOpen: boolean,
    isSoldOut: boolean,
    tipoInscricao?: "SERVIR" | "PARTICIPANTE",
  ) => {
    if (secretLink?.link && secretLink.ativo) {
      return tipoInscricao === "PARTICIPANTE" || tipoInscricao === "SERVIR";
    }

    return !(registerIsOpen && !isSoldOut);
  };

  const isParticiparButtonDisable = isButtonDisable(
    openParticipar,
    isSoldOutParticipant,
    secretLink?.tipoInscricao === "SERVIR" ? "SERVIR" : undefined,
  );

  const isLgndButtonDisable = isButtonDisable(
    openServir,
    isSoldOutServe,
    secretLink?.tipoInscricao === "PARTICIPANTE" ? "PARTICIPANTE" : undefined,
  );

  const labelParticipar = getParticiparLabel();
  const labelLgndCertificado = getLgndCertificadoLabel();
  const labelLgndObterCertificado = getLgndObterCertificadoLabel();

  return (
    <div className={cn("flex flex-col gap-6 sm:gap-3", className)}>
      {valorParticipante > 0 && (
        <PriceLabel
          text="Participante"
          label={labelParticipar}
          price={reais(valorParticipante)}
          button={
            <Button
              disabled={isParticiparButtonDisable}
              onClick={handlePushParticipantPage}
            >
              Inscrever
            </Button>
          }
        />
      )}

      <Separator />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-3">
          {valorParaLgndCertificados > 0 && (
            <PriceLabel
              text="Servir"
              label={labelLgndCertificado}
              labelColor="text-blue-500"
              price={reais(valorParaLgndCertificados)}
            />
          )}

          {valorParaObterCertificacao && valorParaObterCertificacao > 0 && (
            <PriceLabel
              text="Servir"
              label={labelLgndObterCertificado}
              labelColor="text-blue-500"
              price={reais(valorParaObterCertificacao)}
            />
          )}
        </div>

        <Button
          disabled={isLgndButtonDisable}
          onClick={handlePushServePage}
          variant="blue"
        >
          Inscrever
        </Button>
      </div>
    </div>
  );
};
