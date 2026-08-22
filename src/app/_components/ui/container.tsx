"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const Container = ({ children, className }: ContainerProps) => {
  return (
    <section className={cn(`h-full w-full px-2 md:px-4`, className)}>
      {children}
    </section>
  );
};

const ContainerSpace = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn(`flex flex-col gap-12 pb-6`, className)}>{children}</div>
  );
};

const ContainerDetail = ({
  children,
  className,
  withDetail = true,
}: {
  withDetail?: boolean;
} & ContainerProps) => {
  return (
    <div className={cn("relative", className)}>
      {withDetail && (
        <div className="absolute left-0 right-0 top-0 z-0 h-[20rem] bg-primary" />
      )}
      {children}
    </div>
  );
};

export { Container, ContainerDetail, ContainerSpace };
