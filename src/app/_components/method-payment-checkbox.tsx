import { FaPix } from "react-icons/fa6";
import { GridTwoColumns } from "./grid-two-columns";
import { CheckboxCard } from "./ui/checkbox-card";
import { CreditCardIcon } from "lucide-react";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { cn } from "@/lib/utils";

type Method = "pix" | "creditCard" | "free";

export const MethodPaymentCheckbox = ({
  className,
  showCreditCard = true,
}: {
  className?: string;
  showCreditCard?: boolean;
}) => {
  const { setFee, method, setMethod } = useCalcValueTopStore();

  const handleCheckPayPix = (value: string) => {
    setMethod(value as Method);
  };

  const handleCheckCreditCard = (value: string) => {
    setMethod(value as Method);
  };

  return (
    method !== "free" && (
      <GridTwoColumns
        title="Forma de pagamento"
        className={cn("rounded-md border bg-card p-4", className)}
      >
        <div className="flex gap-4">
          <CheckboxCard
            checkedValue={method}
            setChecked={(value) => {
              handleCheckPayPix(value);
              setFee(0);
            }}
            name="payment"
            label="Pix"
            value="pix"
            icon={<FaPix className="size-5 text-primary" />}
            className="w-full justify-center px-4 py-4 text-base sm:py-8"
          />

          {showCreditCard && (
            <CheckboxCard
              checkedValue={method}
              setChecked={(value) => {
                handleCheckCreditCard(value);
                setFee(0);
              }}
              name="payment"
              label="Cartão de Crédito"
              value="creditCard"
              icon={<CreditCardIcon className="size-5 text-primary" />}
              className=" w-full justify-center px-4 py-4 text-base sm:py-8"
            />
          )}
        </div>
      </GridTwoColumns>
    )
  );
};
