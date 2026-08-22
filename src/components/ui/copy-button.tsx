import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy } from "lucide-react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

type CopyButtonProps = {
  textToCopy: string;
};

export const CopyButton = ({ textToCopy }: CopyButtonProps) => {
  const [isCopy, setIsCopy] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleCopyLink = React.useCallback(() => {
    setIsCopy(true);
    setTooltipOpen(true);

    setTimeout(() => {
      setIsCopy(false);
      setTooltipOpen(false);
    }, 2000);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
        delayDuration={300}
      >
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            <CopyToClipboard text={textToCopy}>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
                className={`sm:text-xs ${isCopy && "hover:text-success"}`}
                asChild
              >
                <Copy className={`h-4 w-4 ${isCopy ? "text-success" : ""}`} />
              </Button>
            </CopyToClipboard>
          </div>
        </TooltipTrigger>
        <TooltipContent>{isCopy ? "Copiado" : "Copiar"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
