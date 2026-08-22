"use client";

import { X } from "lucide-react";
import { useFormStore } from "../participante/useFormStore";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-modal";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { eventTypeMap } from "@/lib/constants";
import { PaymentContent } from "./payment-content";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { useCountdown } from "./useCountdown";

export const PixChargeAsaasModal = () => {
  const isMobile = useIsMobile();

  const { eventRegister } = useFormStore();
  const { openChargePixModal, setOpenChargePixModal } = usePixChargeStore();
  const { countdown } = useCountdown();

  const description = `Pague ${eventTypeMap[eventRegister?.type]} ${eventRegister?.topNumero} - ${eventRegister?.pista} via Pix`;
  const title = "Pagamento - Inscrição";
  const footer = `Esta cobrança é intermediada pela Asaas e expira em`;

  if (isMobile) {
    return (
      <Drawer open={openChargePixModal} onOpenChange={setOpenChargePixModal}>
        <DrawerTrigger />

        <DrawerContent className="px-2 pt-3">
          <DrawerHeader className="mb-4 p-0 px-4 pt-6">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          <PaymentContent />

          <DrawerFooter className="text-center text-xs text-muted-foreground/50">
            {footer}
            {""}
            <b>{countdown}</b>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={openChargePixModal} onOpenChange={setOpenChargePixModal}>
      <AlertDialogTrigger />
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogCancel className="fixed right-0 top-1 border-none hover:bg-transparent">
          <X className="h-4 w-4" />
        </AlertDialogCancel>

        <AlertDialogHeader className="space-y-1">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <PaymentContent />

        <AlertDialogFooter className="text-xs text-muted-foreground/50">
          {footer}
          {""}
          <b>{countdown}</b>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
