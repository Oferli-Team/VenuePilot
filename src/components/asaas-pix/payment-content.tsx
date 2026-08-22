import Image from "next/image";
import { PaymentActionButton } from "./payment-action-button";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "../ui/button";
import { Copy, Link } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { reais } from "@/lib/utils/money";
import React from "react";
import { useFormStore } from "../participante/useFormStore";
import { toast } from "../ui/use-toast";
import { eventTypeMap } from "@/lib/constants";

export const PaymentContent = () => {
  const { amount } = useCalcValueTopStore();
  const { eventRegister, formData } = useFormStore();
  const {
    isCopiedPixToPay,
    isCopiedQrCode,
    setIsCopiedPixToPay,
    setIsCopiedQrCode,
    charge,
  } = usePixChargeStore();

  const handleSendPixToPay = React.useCallback(
    async (e: any) => {
      if (e.target.name === "codeQrCode") {
        setIsCopiedPixToPay(true);
        setTimeout(() => {
          setIsCopiedPixToPay(false);
        }, 2000);
      } else {
        setIsCopiedPixToPay(true);

        setTimeout(() => {
          setIsCopiedPixToPay(false);
          if (!charge) return;
          const eventoLegendariosURL = charge.invoiceUrl;
          const mensagem = encodeURIComponent(
            `Pague com PIX ${reais(amount)} para ${eventRegister?.pista} - Evento: ${eventTypeMap[eventRegister?.type]} #${eventRegister?.topNumero} através da Asaas. ${eventoLegendariosURL}`,
          );
          const whatsappURL = `https://api.whatsapp.com/send?phone=${formData?.celular}&text=${mensagem}`;

          window.open(whatsappURL, "_blank");
        }, 1000);
      }
    },
    [charge],
  );

  const handleCopyQrCode = React.useCallback(
    async (e: any) => {
      if (e.target.name === "codeQrCode") {
        setIsCopiedQrCode(true);
        toast({
          title: "QRCode copiado!",
          variant: "success",
        });
        setTimeout(() => {
          setIsCopiedQrCode(false);
        }, 2000);
      } else {
        setIsCopiedQrCode(true);
        setTimeout(() => {
          setIsCopiedQrCode(false);
          if (!charge) return;
        }, 1000);
      }
    },
    [charge],
  );

  return (
    <div className="space-y-6">
      <div className="my-4 flex flex-col items-center justify-between gap-4 rounded-md bg-muted/30 p-2 sm:flex-row">
        <div className="text-sm sm:w-[50%]">
          <p className="mb-2 font-semibold">Pague com Pix</p>
          <p className="w-full leading-5">
            Acesse seu APP e faça a leitura do QR Code ao lado para efetuar o
            pagamento de forma rápida e segura.
          </p>

          <div className="mt-4 font-semibold">
            <p className="text-xs">Valor à pagar</p>
            <p className="font-semibold text-primary">{reais(amount)}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="h-40 w-40 overflow-hidden rounded-sm">
            <Image
              src={`data:image/png;base64,${charge?.encodedImage}`}
              alt="QrCode"
              width={600}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <PaymentActionButton
        title="Pix Copia e Cola"
        description=" Clique no botão ao lado para copiar a cobrança e cole no seu App de
              pagamento."
        button={
          <CopyToClipboard text={charge?.payload ?? ""}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              name="codeQrCode"
              onClick={handleCopyQrCode}
              className="cursor-pointer shadow-lg"
              aria-live="polite"
            >
              <Copy className="mr-2 size-4" />
              {!isCopiedQrCode ? "Copiar" : "Copiado!"}
            </Button>
          </CopyToClipboard>
        }
      />

      <PaymentActionButton
        title="Deseja enviar cobrança Pix?"
        description="Clique no botão ao lado para enviar esta cobrança via WhatsApp."
        button={
          <Button
            type="button"
            size="sm"
            className="bg-success hover:bg-success/90"
            onClick={handleSendPixToPay}
          >
            {!isCopiedPixToPay ? (
              <span className="flex items-center gap-2">
                <FaWhatsapp size={16} />
                Enviar
              </span>
            ) : (
              "Enviando..."
            )}
          </Button>
        }
      />

      <PaymentActionButton
        title="Deseja visualizar link de pagamento?"
        button={
          <Button type="button" variant="blue" asChild size="sm">
            <a href={charge?.invoiceUrl} target="_blank">
              <Link className="mr-2 size-4" />
              Abrir link
            </a>
          </Button>
        }
      />
    </div>
  );
};
