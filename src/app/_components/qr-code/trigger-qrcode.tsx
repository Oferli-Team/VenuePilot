import { QrCode } from "lucide-react";
import { Button, type ButtonProps } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { DrawerTrigger } from "../ui/drawer";
import { useUserCheckInStore } from "./user-checkin-store";

type TriggerButtonProps = {
  label?: string;
} & ButtonProps;

const TriggerButton = ({
  label = "Fazer Check-in",
  ...props
}: TriggerButtonProps) => {
  return (
    <Button {...props}>
      <QrCode className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
};

export const TriggerQRcode = ({ ...props }: TriggerButtonProps) => {
  const { setEnableScanner, setOpenModal, setUser } = useUserCheckInStore();

  const isMobile = useIsMobile();

  const handleOpenModal = () => {
    setUser(null);
    setEnableScanner(true);
    setOpenModal(true);
  };

  return (
    <>
      {isMobile ? (
        <DrawerTrigger
          asChild
          onClick={handleOpenModal}
          className="w-fit self-end"
        >
          <TriggerButton {...props} />
        </DrawerTrigger>
      ) : (
        <DialogTrigger
          asChild
          onClick={handleOpenModal}
          className="w-fit self-end"
        >
          <TriggerButton {...props} />
        </DialogTrigger>
      )}
    </>
  );
};
