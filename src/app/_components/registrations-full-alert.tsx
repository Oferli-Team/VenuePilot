"use client";

import React from "react";
import { api } from "@/trpc/react";
import { createWhatsappLink } from "@/lib/whatsapp";
import { FaWhatsapp } from "react-icons/fa6";
import { ITOP } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-modal";
import { AlertTriangle } from "lucide-react";
import { useFormStore } from "./participante/useFormStore";
import { checkVagasParticipante } from "@/lib/utils/checkVagasParticipante";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

// TODO: pegar do contexto do evento o texto de inscrições encerradas
export const RegistrationsFullAlert = ({
  registerType,
}: {
  registerType: "PARTICIPANTE" | "SERVIR";
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const { eventRegister } = useFormStore();

  const [isSoldOut, setIsSoldOut] = React.useState(false);

  const { data: allParticipantsRegistered } =
    api.inscricao.getAllParticipantes.useQuery(
      {
        status: "CONFIRMADA",
        eventoId: eventRegister?.id,
      },
      { enabled: registerType === "PARTICIPANTE" && !!eventRegister?.id },
    );

  const { data: allLegendaryRegistered } = api.inscricao.getAllServir.useQuery(
    {
      status: "CONFIRMADA",
      eventoId: eventRegister?.id,
    },
    { enabled: registerType === "SERVIR" && !!eventRegister?.id },
  );

  React.useEffect(() => {
    if (registerType === "SERVIR") return;
    if (allParticipantsRegistered && eventRegister) {
      const isSoldOut = checkVagasParticipante(
        allParticipantsRegistered,
        eventRegister.vagasParticipar,
      );
      setIsSoldOut(isSoldOut);
      if (!hasLinkParams && eventRegister.openParticipar === false) {
        setIsSoldOut(true);
      }
    }
  }, [allParticipantsRegistered, eventRegister, hasLinkParams, registerType]);

  React.useEffect(() => {
    if (registerType === "PARTICIPANTE") return;

    if (allLegendaryRegistered && eventRegister) {
      const isSoldOut = checkVagasParticipante(
        allLegendaryRegistered,
        eventRegister.vagasServir,
      );
      setIsSoldOut(isSoldOut);
      if (!hasLinkParams && eventRegister.openServir === false) {
        setIsSoldOut(true);
      }
    }
  }, [allLegendaryRegistered, eventRegister, hasLinkParams, registerType]);

  return (
    <AlertDialog open={isSoldOut}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle />
            <AlertDialogTitle>Inscrições Esgotadas!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-foreground">
            Obrigado pelo interesse, mas as vagas estão esgotadas. Qualquer
            dúvida entre em contato com nosso suporte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => router.push("/")}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <a
              target="_blank"
              className="flex items-center gap-1 font-bold"
              href={createWhatsappLink({
                phone: ITOP.whatsapp_suporte,
                text: ITOP.whatsapp_text_support_participar,
              })}
            >
              <FaWhatsapp />
              Falar com suporte!
            </a>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
