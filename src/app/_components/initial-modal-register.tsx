import { Spinner } from "./ui/spinner";
import { RegistrationsFullAlert } from "./registrations-full-alert";
import { SecretLinkErrorMessage } from "./secret-link-error-message";
import { useSearchParams } from "next/navigation";
import { useFormStore } from "./participante/useFormStore";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { useRouter } from "nextjs-toploader/app";
import { Button } from "./ui/button";
import { useTimerStore } from "@/lib/store/TimerStore";

interface InitialModalRegisterProps {
  registerType: "PARTICIPANTE" | "SERVIR";
}

export const InitialModalRegister = ({
  registerType,
}: InitialModalRegisterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secretLinkName = searchParams.get("link");
  const hasLinkParams = searchParams.has("link");

  const { eventRegister } = useFormStore();
  const { startTimer } = useTimerStore();

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (hasLinkParams) setOpen(true);
  }, [hasLinkParams]);

  const closeDialog = React.useCallback(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (eventRegister?.id) {
      startTimer();
    }
  }, [eventRegister?.id, startTimer]);

  return (
    <>
      {!eventRegister && (
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-card/70">
          <Spinner size={40} />
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="text-lg font-semibold">
              Você tem certeza?
            </Dialog.Title>

            <Dialog.Description className="mt-4 text-foreground">
              Você está usando um link exclusivo{" "}
              <strong>
                {secretLinkName?.replaceAll("-", " ").toUpperCase()}
              </strong>
              , tem certeza que pode utilizar este link?
            </Dialog.Description>

            <div className="mt-4 rounded-md bg-card/60 p-2 text-xs">
              <p>
                O uso indevido do link exclusivo sem permissão, pode acarretar
                no cancelamento da inscrição com multa.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Não
              </Button>
              <Button onClick={closeDialog}>Sim</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <RegistrationsFullAlert registerType={registerType} />
      <SecretLinkErrorMessage registerType={registerType} />
    </>
  );
};
