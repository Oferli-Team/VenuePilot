import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const FormFooterButton = ({
  loading,
  handleBackStep,
  onClick,
  className,
}: {
  loading: boolean;
  handleBackStep?: () => void;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div className={cn("mt-12 flex w-full justify-between", className)}>
      <Button
        variant="ghost"
        className="cursor-pointer p-2"
        onClick={handleBackStep}
      >
        Voltar
      </Button>

      <div className="sm:w-40">
        <Button
          type="submit"
          loading={loading}
          className="w-full cursor-pointer"
          onClick={onClick}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};
