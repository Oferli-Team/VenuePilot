import { Download } from "lucide-react";
import { Button } from "../ui/button";

type ButtonsActionProps = {
  hasUnsaved: boolean;
  unsavedAlert?: string;
  hasBoardingPlan: boolean;
  enableExport: boolean;
  handleRemoveAll: () => void;
  handleExportBoardingPlan: () => void;
  handleOpenAlert: () => void;
};

export const ButtonsAction = ({
  hasUnsaved,
  unsavedAlert = "*Alterações não salvas, clique em salvar.",
  enableExport,
  handleRemoveAll,
  hasBoardingPlan,
  handleExportBoardingPlan,
  handleOpenAlert,
}: ButtonsActionProps) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {hasUnsaved && <p className="text-sm text-primary">{unsavedAlert}</p>}

      <div className="flex items-center gap-2">
        <Button
          disabled={!hasBoardingPlan}
          loading={enableExport}
          onClick={handleExportBoardingPlan}
          variant="secondary"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </Button>
        <Button variant="outline" onClick={handleRemoveAll}>
          Desfazer
        </Button>
        <Button disabled={!hasUnsaved} onClick={handleOpenAlert}>
          Salvar
        </Button>
      </div>
    </div>
  );
};
