import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

type SideModalProps = {
  direction?: "right" | "left";
  trigger: React.ReactElement;
  triggerLabel: string;
  header: string;
  children: React.ReactNode;
};

export const SideModal = ({
  direction = "right",
  children,
  header,
  trigger,
  triggerLabel,
}: SideModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getAnimationClasses = (direction: string) => {
    const baseClasses = `fixed z-20 h-screen  border-l drop-shadow-md border-input top-0 overflow-hidden bg-background transition-all delay-200`;
    switch (direction) {
      case "left":
        return `${baseClasses} left-0 data-[state=open]:animate-slideInLeft data-[state=open]:opacity-100 data-[state=closed]:animate-slideOutLeft data-[state=closed]:opacity-0`;
      default: // "right"
        return `${baseClasses} right-0 data-[state=open]:animate-slideInRight data-[state=open]:opacity-100  data-[state=closed]:animate-slideOutRight data-[state=closed]:opacity-0`;
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild onClick={handleToggle}>
            {trigger}
          </TooltipTrigger>
          <TooltipContent className="z-0">{triggerLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        data-state={isOpen ? "open" : "closed"}
        className={getAnimationClasses(direction)}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <h3 className="text-lg font-semibold">{header}</h3>

          <Button size="icon" variant="ghost" onClick={handleToggle}>
            <X />
          </Button>
        </div>
        <nav className="flex h-[40rem] flex-col gap-4">
          <div className="h-full overflow-auto px-6 pt-4">{children}</div>
        </nav>
      </div>
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-10 hidden bg-black/50 sm:block"
          onClick={handleToggle}
        />
      )}
    </>
  );
};
