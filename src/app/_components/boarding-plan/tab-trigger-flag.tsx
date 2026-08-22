import { TabsTrigger } from "../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export const TabTriggerFlag = ({
  hasUnsaved,
  label,
  value,
}: {
  hasUnsaved: boolean;
  label: string;
  value: string;
}) => {
  return (
    <TabsTrigger
      asChild
      className="relative cursor-pointer font-semibold"
      value={value}
    >
      <div>
        {hasUnsaved && (
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
        )}
        {hasUnsaved ? (
          <Tooltip>
            <TooltipTrigger>{label}</TooltipTrigger>
            <TooltipContent>
              Existem alterações não salvas no plano de embarque para {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <p>{label}</p>
        )}
      </div>
    </TabsTrigger>
  );
};
