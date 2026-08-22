import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { sendInngestEventCreateBatchesDisclaimer } from "@/lib/queries/client";
import { toast } from "../ui/use-toast";
import { api } from "@/trpc/react";
import { useEventStore } from "@/lib/store/EventStore";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-modal";
import { cn } from "@/lib/utils";
import { FileStack, type LucideIcon, QrCode } from "lucide-react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { useUserCheckInStore } from "../qr-code/user-checkin-store";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { Drawer, DrawerTrigger } from "../ui/drawer";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isCheckIn, isSuperAdmin } from "@/lib/utils/hasRole";

type CheckinDropdownItemProps = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};
const CheckinDropdownItem = ({
  title,
  description,
  icon: Icon,
  className,
  children,
  onClick,
  disabled,
}: CheckinDropdownItemProps) => {
  return (
    <DropdownMenuItem
      disabled={disabled}
      className={cn(
        "group flex w-full cursor-pointer justify-between",
        className,
      )}
      onClick={onClick}
    >
      <div className="block">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {Icon && <Icon className="size-5 shrink-0 group-hover:text-primary" />}
    </DropdownMenuItem>
  );
};

type Props = {
  registerType: "PARTICIPANTE" | "SERVIR";
};

export const CheckinDropdownActions = ({ registerType }: Props) => {
  const { membership } = getCurrentMembership();
  const isMobile = useIsMobile();
  const { event } = useEventStore();
  const { setEnableScanner, setOpenModal, setUser } = useUserCheckInStore();

  const [enable, setEnable] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const { data } =
    api.inscricao.getRegistersToCreateAutentiqueDocument.useQuery(
      {
        eventId: event?.id,
        tipoInscricao: registerType,
      },
      { enabled: !!event && enable },
    );

  const handleOpenModal = () => {
    setUser(null);
    setEnableScanner(true);
    setOpenModal(true);
  };

  const sendBatchAutentiqueTerm = async () => {
    const title = "Envio Termo de Responsabilidade";
    try {
      if (data.length === 0) {
        toast({
          title,
          description:
            "Não há inscritos para enviar o termo, verifique se já foi realizado o envio",
          variant: "alert",
        });
        return;
      }

      if (data.length > 0) {
        await sendInngestEventCreateBatchesDisclaimer(data);
        toast({
          title,
          description: `Sua solicitação foi realizada com sucesso e enviado para ${data.length} inscritos`,
          variant: "success",
        });
        return;
      }

      toast({
        title,
        description: "Erro na solicitação de envio dos termos",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title,
        description: "Erro na solicitação de envio dos termos",
        variant: "destructive",
      });
    } finally {
      setEnable(false);
    }
  };

  return (
    <>
      {membership && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="justify-self-end">
            <Button className="w-fit" variant="outline">
              Ações de Check-in
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-w-[20rem]">
            <DropdownMenuLabel>Ações de Check-in</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {isSuperAdmin(membership) && (
                <CheckinDropdownItem
                  title="Enviar termo em lote"
                  description="Clique para enviar o termo de responsabilidade"
                  icon={FileStack}
                  disabled
                  onClick={() => {
                    setEnable(true);
                    setOpenDropdown(true);
                  }}
                />
              )}

              {isCheckIn(membership) && (
                <CheckinDropdownItem
                  title="Fazer check-in por QrCode"
                  description="Clique para abrir o scanner de qr code"
                  icon={QrCode}
                  onClick={handleOpenModal}
                >
                  {isMobile ? (
                    <Drawer>
                      <DrawerTrigger />
                    </Drawer>
                  ) : (
                    <Dialog>
                      <DialogTrigger />
                    </Dialog>
                  )}
                </CheckinDropdownItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={openDropdown} onOpenChange={setOpenDropdown}>
        <AlertDialogTrigger />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="flex">
              Ao confirmar, o termo de responsabilidade será gerado para todos
              os inscritos. Para criar o termo de um único inscrito, utilize o
              ícone correspondente na coluna "Ações" da tabela abaixo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={sendBatchAutentiqueTerm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
