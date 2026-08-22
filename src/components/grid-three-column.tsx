import { cn } from "@/lib/utils";

export const GridThreeColumns = ({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "group grid grid-cols-1 gap-4 md:grid-cols-3 [&>h4]:mb-3",
      className,
    )}
  >
    {title && <h4 className="text-md col-span-full font-bold">{title}</h4>}
    {children}
  </div>
);
