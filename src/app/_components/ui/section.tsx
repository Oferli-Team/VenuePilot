import { cn } from "@/lib/utils";
import React from "react";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export const Section = ({ children, className }: SectionProps) => {
  return (
    <section className={cn("mx-auto w-full max-w-screen-xl px-4", className)}>
      {children}
    </section>
  );
};
