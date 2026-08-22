import React from "react";
import { CardDashboard } from "@/components/card-dashboard";
import { cn } from "@/lib/utils";

type CardsStatsProps = {
  primaryLabel: string;
  primaryIcon: React.ReactElement;
  secondLabel: string;
  secondIcon: React.ReactElement;
  done?: number;
  pending?: number;
  className?: string;
};

export const CardsStats = ({
  done,
  pending,
  className,
  primaryLabel,
  primaryIcon,
  secondLabel,
  secondIcon,
}: CardsStatsProps) => {
  return (
    <div
      className={cn(
        "grid items-center gap-3 sm:grid-cols-3 sm:gap-6",
        className,
      )}
    >
      <CardDashboard
        label={primaryLabel}
        value={done}
        icon={primaryIcon}
        className="bg-gradient-to-r from-success/20 to-card"
      />
      <CardDashboard
        label={secondLabel}
        value={pending}
        icon={secondIcon}
        isPending
        className="bg-gradient-to-r from-destructive/20 to-card"
      />
    </div>
  );
};
