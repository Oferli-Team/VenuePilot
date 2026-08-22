import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { toast } from "./ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { type Row } from "@tanstack/react-table";
import { type Inscricao } from "@prisma/client";
import { usePathname } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isCheckIn } from "@/lib/utils/hasRole";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentMembership } from "@/lib/hooks/member";

const createNrLgndInputSchema = z.object({
  input: z
    .string()
    .nullable()
    .refine((value: string | null) => !value || /^\d+$/.test(value), {
      message: "Digite apenas números",
    }),
});

type FormData = z.infer<typeof createNrLgndInputSchema>;

type NrLgndInputProps = {
  row: Row<Inscricao>;
  type: "nrLgnd" | "nrRem";
};

export const ParticipantNumberInput = ({ row, type }: NrLgndInputProps) => {
  const { membership } = getCurrentMembership();

  const pahtname = usePathname();
  const { event } = useEventStore();
  const { invalidateInputLegendaryNumber } = useInvalidateQueries();

  const { mutateAsync: updateRegisterWithParticipantNumber, isPending } =
    api.inscricao.updateRegisterWithParticipantNumber.useMutation({
      async onSuccess() {
        await invalidateInputLegendaryNumber();
      },
    });

  const [open, setOpen] = useState(false);

  const createForm = useForm<FormData>({
    resolver: zodResolver(createNrLgndInputSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = createForm;

  const onSubmit = async (data: FormData) => {
    try {
      if (!event?.id) return;

      await updateRegisterWithParticipantNumber({
        eventoId: event.id,
        id: row.original.id,
        field: type,
        value: data.input,
        // nrLgnd: data.input ?? null,
      });

      toast({
        title: "Atualização realizada com sucesso!",
        variant: "success",
      });
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Ops, algo deu errado!",
        description: "Não foi possível salvar o número Legendário",
        variant: "destructive",
      });
    }
  };

  const hasPermissionToEdit = isCheckIn(membership);

  useEffect(() => {
    // setValue("input", row.original[type] ?? null);
    setValue("input", row.original[type] ?? null);
  }, [row.original, type, setValue]);

  const modalLabelMap = {
    ["nrLgnd"]: {
      title: "Número Legendário",
      description: (
        <p>
          Informe o número do Legendário: <b>{row.original.nome}</b>
        </p>
      ),
    },
    ["nrRem"]: {
      title: "Número REM",
      description: (
        <p>
          Informe o número REM do casal:{" "}
          <b>
            {row.original.nome} e {row.original.spouseName}
          </b>
        </p>
      ),
    },
  };

  return (
    <>
      {!pahtname.includes("bone") ? (
        <p className="text-center">{row.original[type]}</p>
      ) : (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-sm text-foreground hover:bg-secondary"
                  onClick={() => setOpen(true)}
                  disabled={!hasPermissionToEdit}
                >
                  {row.original[type] ?? "Editar"}
                  <Pencil className="ml-2 h-4 w-4 text-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {row.original[type] ? "Editar Número" : "Adicionar Número"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{modalLabelMap[type].title}</DialogTitle>
                <DialogDescription>
                  {modalLabelMap[type].description}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <FormProvider {...createForm}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-6"
                  >
                    <div>
                      <Input {...register("input")} type="tel" />
                      <p className="mt-2 text-xs text-destructive">
                        {errors.input?.message}
                      </p>
                    </div>
                    <div className="flex w-full justify-end gap-4">
                      <DialogClose>Cancelar</DialogClose>
                      <Button type="submit" loading={isPending}>
                        Confirmar
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};
