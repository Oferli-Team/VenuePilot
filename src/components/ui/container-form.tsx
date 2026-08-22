import React from "react";

export const ContainerForm = ({
  children,
  className,
  withDetail = true,
}: {
  children: React.ReactNode;
  className?: string;
  withDetail?: boolean;
}) => {
  return (
    <div className={`relative ${className}`}>
      {withDetail && (
        <div className="absolute left-0 right-0 top-0 z-0 h-[20rem] bg-primary" />
      )}
      {children}
    </div>
  );
};
