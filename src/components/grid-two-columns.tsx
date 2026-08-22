import { cn } from "@/lib/utils";

export const GridTwoColumns = ({
  children,
  title,
  className,
  titleStyle,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  titleStyle?: string;
}) => (
  <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}>
    {title && (
      <h4 className={cn("text-md col-span-full p-0 font-bold", titleStyle)}>
        {title}
      </h4>
    )}
    {children}
  </div>
);
