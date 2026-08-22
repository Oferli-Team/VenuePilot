import { cn } from "@/lib/utils";

export const ItemUser = ({
  label,
  description,
  className,
  classNameDesc,
}: {
  label: string;
  description: string;
  className?: string;
  classNameDesc?: string;
}) => {
  return (
    <div className={cn("group space-y-1", className)}>
      <label className="text-xs font-semibold">{label}</label>
      <p className={cn(classNameDesc)}>{description}</p>
    </div>
  );
};
