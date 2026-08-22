import { useIsMobile } from "@/lib/hooks/ismobile";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useUserCheckInStore } from "./user-checkin-store";
import { DrawerDescription, DrawerHeader, DrawerTitle } from "../ui/drawer";

export const DialogHeaderQRcode = () => {
  const { user } = useUserCheckInStore();
  const isMobile = useIsMobile();

  const title = "Check-in | QR Code";
  const description = !user
    ? "Scanneie o QR Code para fazer check-in do inscrito"
    : user.checkin
      ? "Check-in Confirmado"
      : "Confirme o check-in do inscrito";

  if (isMobile) {
    return (
      <DrawerHeader className="pb-2">
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </DrawerHeader>
    );
  }

  return (
    <DialogHeader className="mb-3">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};
