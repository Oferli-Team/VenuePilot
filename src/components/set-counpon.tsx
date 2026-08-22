"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import Fieldset from "./Fiedset";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mask } from "remask";
import { type CupomDesconto } from "@prisma/client";
import { api } from "@/trpc/react";
import { toast } from "./ui/use-toast";
import { TicketCheck } from "lucide-react";
import { ToastAction } from "./ui/toast";
import { useRouter } from "nextjs-toploader/app";
import { useEventStore } from "@/lib/store/EventStore";

type SetCouponProps = {
  initialData?: CupomDesconto | null | undefined;
};

const createCouponSchema = z.object({
  codigo: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  quantidade: z.string({ required_error: "Informe a quantidade" }).refine(
    (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 1 && num <= 100;
    },
    { message: "Quantidade deve ser entre 1 a 100" },
  ),
  desconto: z
    .string({ required_error: "Informe a porcentagem do desconto" })
    .refine(
      (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 100 && num <= 10000;
      },
      { message: "Desconto deve ser entre 1% a 100%" },
    ),
});

type FormData = z.infer<typeof createCouponSchema>;
const inputNumber = ["9", "99", "999", "9999", "99999"];

export const SetCoupon = ({ initialData }: SetCouponProps) => {
  const router = useRouter();
  const { event } = useEventStore();

  const defaultValues = {
    codigo: initialData?.codigo ?? "",
    quantidade: initialData?.quantidade ? String(initialData?.quantidade) : "",
    desconto: initialData?.desconto ? String(initialData?.desconto) : "",
  };

  const createForm = useForm<FormData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: defaultValues || {
      codigo: "",
      quantidade: "",
      desconto: "",
    },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = createForm;

  const { mutateAsync: createCupom, isPending: createIsPending } =
    api.cupom.create.useMutation({
      onError: (error) => {
        const errorMessage = Array.isArray(error)
          ? "Não foi possível criar o cupom"
          : error.message;

        toast({
          title: "Ops, algo deu errado",
          description: errorMessage,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        setValue("codigo", "");
        setValue("quantidade", "");
        setValue("desconto", "");
        toast({
          title: "Cupom criado com sucesso!",
          variant: "success",
        });
        setTimeout(() => {
          router.refresh();
        }, 500);
      },
    });

  const { mutateAsync: updateCupom, isPending: updateIsPending } =
    api.cupom.update.useMutation({
      onError: (error) => {
        const errorMessage = Array.isArray(error)
          ? "Não foi possível criar o cupom"
          : error.message;

        toast({
          title: "Ops, algo deu errado",
          description: errorMessage,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        toast({
          title: "Cupom atualizado com sucesso!",
          variant: "success",
        });
        setTimeout(() => {
          router.back();
        }, 1000);
        router.refresh();
      },
    });

  const onSubmit = async (data: FormData) => {
    const { codigo } = data;
    const desconto = Number(data.desconto);
    const quantidade = Number(data.quantidade);

    if (!event?.id) {
      toast({
        title: "Ops, algo deu errado",
        action: (
          <ToastAction
            onClick={() => router.push("/")}
            altText="Tente novamente"
          >
            Tente novamente
          </ToastAction>
        ),
      });
      return;
    }

    try {
      if (initialData) {
        await updateCupom({
          id: initialData.id,
          eventoId: event.id,
          codigo,
          desconto,
          quantidade,
        });
        return;
      }

      await createCupom({
        codigo,
        desconto,
        quantidade,
        eventoId: event.id,
      });

      return;
    } catch (error) {
      console.error(error);
    }
  };

  const buttonLabel = initialData ? "Atualizar" : "Criar";
  const loading = initialData ? updateIsPending : createIsPending;
  const heading = initialData ? "Atualizar cupom" : "Criar novo cupom";

  return (
    <>
      <div className="ml-4 flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <TicketCheck size={28} />
          <h2 className="font-bold sm:text-2xl">Cupom de Desconto</h2>
        </div>
        <h3 className="text-sm font-medium sm:text-base">{heading}</h3>
      </div>

      <div className="w-full rounded-lg border border-input bg-card px-2 py-4 shadow-md sm:mt-4 sm:px-4">
        <FormProvider {...createForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-col-span-1 sm:grid-col-span-2 grid items-end sm:gap-4 md:grid-cols-3">
              <Fieldset
                legend="Códido do cupom"
                validationMessage={errors.codigo}
              >
                <Controller
                  name="codigo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex. NOMECUPOM"
                      value={field.value || ""}
                      onChange={async (e) => {
                        const value = e.target.value;
                        field.onChange(
                          value.toUpperCase().replaceAll(" ", "_"),
                        );
                      }}
                    />
                  )}
                />
              </Fieldset>
              <Fieldset
                legend="Quantidade de uso"
                validationMessage={errors.quantidade}
              >
                <Controller
                  name="quantidade"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex. 50"
                      value={field.value || ""}
                      onChange={async (e) => {
                        const value = e.target.value;
                        const masked = mask(value, ["9", "99", "999"]);
                        field.onChange(masked);
                      }}
                      type="tel"
                    />
                  )}
                />
              </Fieldset>
              <Fieldset
                legend="Porcentagem de desconto * 100 _ inteiro"
                validationMessage={errors.desconto}
              >
                <Controller
                  name="desconto"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex. 50% = 5000"
                      value={field.value || ""}
                      onChange={async (e) => {
                        const value = e.target.value;
                        const masked = mask(value, inputNumber);
                        field.onChange(masked);
                      }}
                      type="tel"
                    />
                  )}
                />
              </Fieldset>
            </div>
            <div className="flex justify-end gap-3 px-4">
              {initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              )}
              <Button loading={loading} type="submit">
                {buttonLabel}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
};
