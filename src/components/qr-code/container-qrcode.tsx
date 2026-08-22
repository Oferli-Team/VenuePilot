import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { DialogHeaderQRcode } from "./dialog-header-qrcode";
import { FooterQRcode } from "./footer-qrcode";
import { TriggerQRcode } from "./trigger-qrcode";
import { ItemsUser } from "./items-user";
import { QRCodeScanner } from "./qrcode-scanner";
import { useUserCheckInStore } from "./user-checkin-store";
import { CircleCheckBig } from "lucide-react";
import { Drawer, DrawerContent } from "../ui/drawer";
import { useIsMobile } from "@/lib/hooks/ismobile";

const CheckInConfirmed = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <CircleCheckBig className="h-16 w-16 text-success sm:h-28 sm:w-28" />
      <p className="text-center font-bold sm:text-lg">
        Check-in realizado com Sucesso!
      </p>
    </div>
  );
};

export const ContainerQRcode = ({
  registerType,
}: {
  registerType: "PARTICIPANTE" | "SERVIR";
}) => {
  const { user, enableScanner, openModal } = useUserCheckInStore();

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={openModal}>
        <DrawerContent className="min-h-[70%] w-full overflow-auto">
          <DialogHeaderQRcode />

          <div className="mt-0 flex h-full w-full flex-col items-center justify-center gap-4 px-4">
            {user?.checkin && <CheckInConfirmed />}
            {user && user.checkin && <Separator orientation={"horizontal"} />}

            {!user?.checkin && enableScanner && (
              <QRCodeScanner registerType={registerType} />
            )}

            {user && !user.checkin && <Separator orientation={"horizontal"} />}

            <ItemsUser />
          </div>

          <FooterQRcode />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={openModal}>
      <DialogContent className="min-w-[50%]">
        <DialogHeaderQRcode />

        <div className="flex gap-4">
          {!user?.checkin && enableScanner && (
            <QRCodeScanner registerType={registerType} />
          )}

          {user && !user.checkin && <Separator orientation="vertical" />}

          <ItemsUser />

          {user && user.checkin && <Separator orientation="vertical" />}

          {user?.checkin && <CheckInConfirmed />}
        </div>

        <FooterQRcode />
      </DialogContent>
    </Dialog>
  );
};
