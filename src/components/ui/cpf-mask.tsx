import { MASK_PATTERN } from "@/lib/constants";
import { CopyButton } from "./copy-button";
import { mask } from "remask";
import { Eye } from "lucide-react";
import { Button } from "./button";
import React from "react";
import { maskCPF } from "@/lib/utils/maskCPF";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const CPFMask = ({ value }: { value: string }) => {
  const [unMask, setUnMask] = React.useState(true);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  const handleClick = () => {
    setUnMask(!unMask);
  };

  return (
    <div className="flex items-center gap-2">
      <p className="truncate">
        {unMask ? maskCPF(value) : mask(value, MASK_PATTERN.cpf)}
      </p>
      <CopyButton textToCopy={value} />

      <TooltipProvider>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={setTooltipOpen}
          delayDuration={300}
        >
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <EyeClosedIcon
                className={`transform transition-all duration-150 ${unMask ? "size-4 scale-100 opacity-100" : "size-0 scale-0 opacity-0"}`}
              />
              <Eye
                className={`transform transition-all duration-150 ${unMask ? "size-0 scale-0 opacity-0" : "size-4 scale-100 opacity-100"}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{unMask ? "Mostrar" : "Esconder"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
