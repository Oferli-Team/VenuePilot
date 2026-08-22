import { useIsMobile } from "@/lib/hooks/ismobile";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isAdmin } from "@/lib/utils/hasRole";
import { Button } from "./ui/button";
import { Check, Pencil } from "lucide-react";

type SectionHeadingProps = {
  title: string;
  isEditing?: boolean;
  disabled?: boolean;
  onClick: () => void;
  loading?: boolean;
};

export const SectionHeading = ({
  title,
  isEditing,
  disabled,
  onClick,
  loading,
}: SectionHeadingProps) => {
  const { membership } = getCurrentMembership();

  const isMobile = useIsMobile();

  const isAdminRole = isAdmin(membership);

  return (
    <div className="text-md col-span-full mb-3 flex items-center justify-between font-bold">
      <h4 className="text-md col-span-full font-bold">{title}</h4>

      {isEditing ? (
        <Button
          size={isMobile ? "icon" : "default"}
          type="submit"
          variant="default"
          className="col-span-full"
          disabled={!isAdminRole || disabled}
          loading={loading}
        >
          {isMobile ? <Check className="h-4 w-4 " /> : "Salvar"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "icon" : "default"}
          className="col-span-full"
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
          disabled={!isAdminRole || disabled}
          loading={loading}
        >
          {isMobile ? <Pencil className="h-4 w-4" /> : "Editar"}
        </Button>
      )}
    </div>
  );
};
