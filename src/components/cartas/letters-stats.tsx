import { CardDashboard } from "@/components/card-dashboard";
import { MailCheck, MailX, PhoneCall, PhoneMissed } from "lucide-react";
import { type FC } from "react";
import { GridThreeColumns } from "../grid-three-column";

interface LettersStatsProps {
  lettersReceived: number;
  lettersPending: number;
  contactValid: number;
  contactNotValid: number;
}

export const LettersStats: FC<LettersStatsProps> = ({
  lettersReceived,
  lettersPending,
  contactValid,
  contactNotValid,
}) => {
  return (
    <GridThreeColumns className="grid-cols-2 md:grid-cols-4">
      <CardDashboard
        label="Cartas Recebidas"
        value={lettersReceived}
        icon={<MailCheck />}
      />
      <CardDashboard
        label="Cartas Pendetes"
        value={lettersPending}
        icon={<MailX />}
        isPending
        infoContent={
          "Aguardando a entrega das cartas ou que ainda não entraram em contato solicitando."
        }
      />

      <CardDashboard
        label="Contato Respondido"
        icon={<PhoneCall />}
        value={contactValid}
      />
      <CardDashboard
        label="Contato Não Respondido"
        icon={<PhoneMissed />}
        value={contactNotValid}
        isPending
        infoContent={
          "Pessoas que não foi possível entrar em contato por algum motivo."
        }
      />
    </GridThreeColumns>
  );
};
