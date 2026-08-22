"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const AccordionContext = React.createContext<{ hasIcon: boolean }>({
  hasIcon: false,
});

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    inset?: boolean;
    border?: boolean;
    icon?: boolean;
  }
>(({ className, inset, border = true, icon, ...props }, ref) => {
  const contextValue = React.useMemo(() => ({ hasIcon: !!icon }), [icon]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <AccordionPrimitive.Item
        ref={ref}
        className={cn(
          `mb-2 ${border && "rounded-lg border"}`,
          inset && "pl-8",
          className,
        )}
        {...props}
      >
        {props.children}
      </AccordionPrimitive.Item>
    </AccordionContext.Provider>
  );
});
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    inset?: boolean;
    icon?: React.ReactElement;
  }
>(({ className, inset, children, icon, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex flex-1 cursor-pointer select-none items-center justify-between px-2 py-4 text-left text-sm font-medium transition-colors focus:outline-none sm:p-4 sm:py-4",
          inset && "pl-8",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="rounded-md border p-2">
              {React.cloneElement(icon, { className: "h-4 w-4" })}
            </span>
          )}
          {children}
        </div>
        <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, ...props }, ref) => {
  const { hasIcon } = React.useContext(AccordionContext);

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        hasIcon ? "sm:pl-[3.7rem] sm:pr-4" : "sm:px-4",
        className,
      )}
      {...props}
    >
      <div className="px-2 pb-4">{props.children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
