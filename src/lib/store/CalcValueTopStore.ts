import type { ChargeAsaasType } from "@/appTypes/asaas";
import { create } from "zustand";

type PaymentMethod = "pix" | "creditCard" | "free";
interface CalcValueTopStoreType {
  isPaid: boolean;
  amount: number;
  topValue: number;
  discount: number;
  fee: number;
  isPaymentCardProcessing: boolean;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  setIsPaid: (isPaid: boolean) => void;
  setAmount: (amount: number) => void;
  resetAmount: () => void;
  resetValues: () => void;
  setTopValue: (topValue: number) => void;
  setDiscount: (discount: number) => void;
  setFee: (fee: number) => void;
  calcAmount: () => void;
  resetCalcValueStore: () => void;
  paymentIsLoading: boolean;
  setPaymentIsLoading: (paymentIsLoading: boolean) => void;
  setIsPaymentCardProcessing: (isPaymentCardProcessing: boolean) => void;
  chargeAlreadyCreatedAsaas: ChargeAsaasType | null;
  setChargeAlreadyCreatedAsaas: (
    chargeAlreadyCreatedAsaas: ChargeAsaasType | null,
  ) => void;
}

const initialState = {
  isPaid: false,
  paymentIsLoading: false,
  isPaymentCardProcessing: false,
  chargeAlreadyCreatedAsaas: null,
  amount: 0,
  discount: 0,
  fee: 0,
  topValue: 0,
  method: "pix" as PaymentMethod,
};

export const useCalcValueTopStore = create<CalcValueTopStoreType>(
  (set, get) => ({
    ...initialState,
    setChargeAlreadyCreatedAsaas: (chargeAlreadyCreatedAsaas) =>
      set(() => ({ chargeAlreadyCreatedAsaas })),
    setPaymentIsLoading: (paymentIsLoading) =>
      set(() => ({ paymentIsLoading })),
    setIsPaymentCardProcessing: (isPaymentCardProcessing) =>
      set(() => ({ isPaymentCardProcessing })),
    setIsPaid: (isPaid) => set(() => ({ isPaid })),
    setAmount: (amount) => set(() => ({ amount })),
    resetAmount: () => set(() => ({ amount: 0 })),
    resetValues: () => set(() => ({ amount: 0, discount: 0, fee: 0 })),
    setDiscount: (discount) =>
      set(() => {
        const newState = { discount };
        set(newState);
        const { calcAmount } = get();
        calcAmount();
        return newState;
      }),
    setFee: (fee) =>
      set(() => {
        const newState = { fee };
        set(newState);
        const { calcAmount } = get();
        calcAmount();
        return newState;
      }),
    setTopValue: (topValue) =>
      set(() => {
        const newState = { topValue };
        set(newState);
        const { calcAmount } = get();
        calcAmount();
        return newState;
      }),
    setMethod: (method: PaymentMethod) => set(() => ({ method })),
    calcAmount: () => {
      const { discount, fee, topValue, setAmount } = get();
      const total = topValue - discount + fee;
      setAmount(total);
    },
    resetCalcValueStore: () => set(initialState),
  }),
);
