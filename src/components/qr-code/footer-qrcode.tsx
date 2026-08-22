import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import { useUserCheckInStore } from "./user-checkin-store";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { DrawerFooter } from "../ui/drawer";
import { TriggerQRcode } from "./trigger-qrcode";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";

export const FooterQRcode = () => {
  const {
    user,
    updateUserCheckIn,
    setUser,
    setOpenModal,
    setEnableScanner,
    checkinObs,
  } = useUserCheckInStore();
  const { invalidateCheckIn } = useInvalidateQueries();

  const { mutateAsync: updateCheckin, isPending } =
    api.inscricao.updateCheckin.useMutation({
      onSuccess: async () => {
        await invalidateCheckIn();
      },
    });

  const readyForCheckIn = useMemo(() => {
    if (
      user?.checkinCode &&
      user.checkinStatus === ENUM_CHECKIN_STATUS.VALID_DOCUMENTS
    ) {
      return true;
    }
    return false;
  }, [user]);

  const closeScannerModal = () => {
    setOpenModal(false);
    setEnableScanner(false);
    setUser(null);
  };

  const doneCheckIn = async () => {
    try {
      if (!user) return;
      const result = await updateCheckin({
        id: user?.id,
        eventoId: user.eventoId,
        checkin: true,
        check_obs: checkinObs ?? undefined,
      });

      if (result.checkin) {
        updateUserCheckIn(result.checkin);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerFooter>
        {readyForCheckIn && user?.checkin !== true && (
          <Button loading={isPending} variant="success" onClick={doneCheckIn}>
            Confirmar Check-in
          </Button>
        )}

        {user && (
          <TriggerQRcode
            className="w-full"
            variant="secondary"
            label="Novo QRCode"
          />
        )}
        <Button variant="outline" onClick={closeScannerModal}>
          Fechar
        </Button>
      </DrawerFooter>
    );
  }

  return (
    <DialogFooter>
      <Button variant="outline" onClick={closeScannerModal}>
        Fechar
      </Button>
      {user && <TriggerQRcode variant="secondary" label="Novo QRCode" />}

      {readyForCheckIn && !user?.checkin && (
        <Button loading={isPending} variant="success" onClick={doneCheckIn}>
          Confirmar Check-in
        </Button>
      )}
    </DialogFooter>
  );
};
