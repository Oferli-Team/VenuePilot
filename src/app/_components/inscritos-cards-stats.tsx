import { type ReactElement } from "react";
import { CardDashboard } from "@/components/card-dashboard";
import { GridThreeColumns } from "./grid-three-column";
import { cn } from "@/lib/utils";

interface Status {
  label: string;
  value: number;
  icon: ReactElement;
  isPending?: boolean;
  className?: string;
}

interface InscritosCardsStatsProps {
  stats: Status[];
}

export const InscritosCardsStats = ({ stats }: InscritosCardsStatsProps) => {
  return (
    <GridThreeColumns className="grid-cols-2 md:grid-cols-4">
      {stats.map((stat, index) => (
        <CardDashboard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          isPending={stat.isPending}
          className={cn(stat.className)}
        />
      ))}
    </GridThreeColumns>
  );
};
