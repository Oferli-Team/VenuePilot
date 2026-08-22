import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-modal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStore } from "./participante/useFormStore";
import { getLinkSecreto } from "@/lib/queries/client";
import React from "react";

export const SecretLinkErrorMessage = ({
  registerType,
}: {
  registerType: "PARTICIPANTE" | "SERVIR";
}) => {
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const { eventRegister, setSecretLink } = useFormStore();

  const [secretLinkError, setSecretLinkError] = React.useState("");

  const checkSecretLink = async () => {
    try {
      if (!hasLinkParams) {
        return;
      }

      if (!eventRegister) {
        return;
      }

      const link = searchParams.get("link");

      if (!link) {
        setSecretLinkError("Link não encontrado");
        return;
      }

      const data = await getLinkSecreto(link, eventRegister.id);

      if (!data) {
        setSecretLinkError("Link inválido");
        return;
      }

      if (!data.ativo) {
        setSecretLinkError("Link inválido");
        return;
      }

      if (data.tipoInscricao !== registerType) {
        setSecretLinkError(
          `O link fornecido para as inscrições ${registerType.toLowerCase()} é inválido`,
        );
        return;
      }

      const secretLinkIsValid = data.quantidade > data.usadoCount;

      if (!secretLinkIsValid) {
        setSecretLinkError("Link expirado");
      }

      setSecretLink({
        id: data.id,
        link: data.link,
      });
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    if (!eventRegister) {
      return;
    }

    void checkSecretLink();
  }, [hasLinkParams, eventRegister]);

  return (
    <AlertDialog open={!!secretLinkError}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle />
            <AlertDialogTitle>Ops, {secretLinkError}!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-foreground">
            Entre em contato com os administradores do evento para confirmar o
            link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Link href="/">Ok</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
