import { createWhatsappLink } from "@/lib/whatsapp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-modal";
import { ITOP } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";

type AlertRegisterExistProps = {
  cpf?: string;
  eventId?: string;
  open: boolean;
};
export const AlertRegisterExist = ({
  cpf,
  eventId,
  open,
}: AlertRegisterExistProps) => {
  const router = useRouter();
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="border-red-600">
        <AlertDialogHeader>
          <AlertDialogTitle>Inscrição já Cadastrada</AlertDialogTitle>
          <AlertDialogDescription>
            Parece que o CPF informado já foi utilizado para uma inscrição.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-2 flex flex-col items-center gap-2 text-center sm:my-0 sm:flex-row">
          <p className="text-sm">Precisa de ajuda? Fale com suporte iTOP:</p>
          <a
            target="_blank"
            href={createWhatsappLink({
              phone: ITOP.whatsapp_suporte,
              text: `Preciso de ajuda para fazer minha inscrição.`,
            })}
            className="font-bold underline"
          >
            Falar com suporte!
          </a>
        </div>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogAction
            className="border bg-transparent hover:bg-transparent"
            onClick={() => {
              router.back();
            }}
          >
            Voltar
          </AlertDialogAction>

          {eventId && cpf && (
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/ticket/${eventId}/${cpf}`}>Ver Ticket</Link>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
