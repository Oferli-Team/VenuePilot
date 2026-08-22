import { SquareCheck, Edit, HandCoins, X, Clock } from "lucide-react";
import { InscritosCardsStats } from "./inscritos-cards-stats";

interface InscritosStatsProps {
  CONFIRMADA: number;
  INSCREVENDO: number;
  AGUARDANDO_PAGAMENTO: number;
  CANCELADA_PELO_CLIENTE: number;
  CANCELADA_TEMPO_EXPIRADO: number;
}

export const InscritosStats = ({
  CONFIRMADA,
  INSCREVENDO,
  AGUARDANDO_PAGAMENTO,
  CANCELADA_PELO_CLIENTE,
  CANCELADA_TEMPO_EXPIRADO,
}: InscritosStatsProps) => {
  const statCards = [
    {
      label: "Confirmados",
      value: CONFIRMADA,
      icon: <SquareCheck />,
      className: "bg-gradient-to-r from-success/20 to-card",
    },
    {
      label: "Inscrevendo",
      value: INSCREVENDO,
      icon: <Edit />,
      isPending: true,
    },
    {
      label: "Aguardando Pagamento",
      value: AGUARDANDO_PAGAMENTO,
      icon: <HandCoins />,
      isPending: true,
    },
    {
      label: "Tempo expirado",
      value: CANCELADA_TEMPO_EXPIRADO,
      icon: <Clock />,
      isPending: true,
    },
    {
      label: "Cancelada pelo cliente",
      value: CANCELADA_PELO_CLIENTE,
      icon: <X />,
      isPending: true,
    },
  ];

  return <InscritosCardsStats stats={statCards} />;
};
