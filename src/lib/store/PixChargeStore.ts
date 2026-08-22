import { create } from "zustand";
import { type AsaasPaymentResponse } from "@/appTypes/asaas";
import { type AsaasQrCodeResponse } from "@/lib/actions/asaas";

type Charge = (AsaasPaymentResponse & AsaasQrCodeResponse) | null;

type PixChargeStore = {
  charge: Charge;
  openChargePixModal: boolean;
  setOpenChargePixModal: (open: boolean) => void;
  paymentStatus: "PENDING" | "DONE";
  isCopiedQrCode: boolean;
  isCopiedPixToPay: boolean;
  setCharge: (charge: Charge) => void;
  setIsCopiedQrCode: (value: boolean) => void;
  setIsCopiedPixToPay: (value: boolean) => void;
  setPaymentStatus: (status: "PENDING" | "DONE") => void;
};

export const usePixChargeStore = create<PixChargeStore>((set) => ({
  charge: null,
  paymentStatus: "PENDING",
  isCopiedQrCode: false,
  isCopiedPixToPay: false,
  openChargePixModal: false,

  setOpenChargePixModal: (open: boolean) =>
    set(() => ({ openChargePixModal: open })),
  setCharge: (charge: Charge) => set(() => ({ charge })),
  setIsCopiedQrCode: (value) => set(() => ({ isCopiedQrCode: value })),
  setIsCopiedPixToPay: (value) => set(() => ({ isCopiedPixToPay: value })),
  setPaymentStatus: (status) => set(() => ({ paymentStatus: status })),
}));
