import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Switch } from "../../ui/switch";
import Fieldset from "../../Fiedset";
import { Progress } from "../../ui/progress";

export type ActionTicketCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  progress: {
    current: number;
    total: number;
    label: string;
  };
  actions: {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
  className?: string;
  obs?: string;
};

export const ActionTicketCard = ({
  title,
  description,
  icon: Icon,
  progress,
  actions,
  className,
  obs,
}: ActionTicketCardProps) => {
  const progressValue = progress
    ? (progress.current / progress.total) * 100
    : undefined;

  return (
    <Card className={className}>
      <CardHeader className={`sm:p-2 `}>
        <CardTitle className="flex items-center gap-2 sm:text-base">
          {Icon && <Icon className={`size-6`} />}
          <span>{title}</span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`space-y-2`}>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <p className="font-semibold">{progress.label ?? "Progresso"}</p>
            <div className="flex items-center gap-2">
              <Progress value={progressValue} />
              <span className="text-xs font-medium text-muted-foreground">
                {progress.current}/{progress.total}
              </span>
            </div>
          </div>

          <Fieldset legend={actions.label}>
            <Switch
              checked={actions.checked}
              disabled={actions.disabled}
              onCheckedChange={actions.onCheckedChange}
            />
          </Fieldset>
        </div>

        {obs && (
          <p className="text-xs text-muted-foreground sm:text-sm">{obs}</p>
        )}
      </CardContent>
    </Card>
  );
};
