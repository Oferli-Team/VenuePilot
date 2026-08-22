"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import Fieldset from "../Fiedset";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Vehicle } from "@prisma/client";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
import { useTopNumber } from "../../hook/useTopNumber";
import { ToastAction } from "../ui/toast";
import { useRouter } from "nextjs-toploader/app";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import type { ENUM_VEHICLE_TYPE } from "@/lib/enum";
import { GridThreeColumns } from "../grid-three-column";
import { createZodValidationJustNumbers } from "@/app/zod-validation/validation";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useFindEvent } from "@/lib/hooks/event";

type SetVehicleProps = {
  initialData?: Vehicle | null;
};

const createVehicleSchema = z.object({
  name: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  identifier: z.string(),
  type: z
    .string()
    .transform((value) => value.toUpperCase() as ENUM_VEHICLE_TYPE),
  totalCapacity: createZodValidationJustNumbers(),
  plate: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
  function: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormData = z.infer<typeof createVehicleSchema>;

export const SetVehicle = ({ initialData }: SetVehicleProps) => {
  const router = useRouter();
  const { event } = useFindEvent();
  const { invalidateVehicles } = useInvalidateQueries();

  const createForm = useForm<FormData>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: initialData ?? {
      name: "",
      identifier: "",
      totalCapacity: "",
      type: "",
      owner: "",
      plate: "",
      function: "",
      notes: "",
    },
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = createForm;

  const { mutate: createVehicle, isPending: createIsPending } =
    api.vehicle.create.useMutation({
      onError: (error) => {
        const err = JSON.parse(error.message) as {
          title: string;
          message: string;
        };
        toast({
          title: "Ops, algo deu errado",
          description: err.message ?? "Não foi possível criar a Viatura",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        reset();
        toast({
          title: "Viatura criada com sucesso!",
          variant: "success",
        });
        await invalidateVehicles();
      },
    });

  const { mutate: updateVehicle, isPending: updateIsPending } =
    api.vehicle.update.useMutation({
      onError: (error) => {
        const err = JSON.parse(error.message) as {
          title: string;
          message: string;
        };
        toast({
          title: "Ops, algo deu errado",
          description: err.message ?? "Não foi possível criar a Viatura",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        toast({
          title: "Viatura atualizada com sucesso!",
          variant: "success",
        });
        setTimeout(() => {
          router.back();
        }, 1000);
        await invalidateVehicles();
      },
    });

  const onSubmit = (data: FormData) => {
    if (!event) {
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

    const totalCapacity = Number(data.totalCapacity);
    if (initialData) {
      updateVehicle({
        ...data,
        id: initialData.id,
        eventId: initialData.eventId!,
        totalCapacity,
      });
      return;
    }

    createVehicle({
      ...data,
      eventId: event.id,
      totalCapacity,
    });
  };

  const buttonLabel = initialData ? "Atualizar" : "Criar";
  const loading = initialData ? updateIsPending : createIsPending;

  return (
    <FormProvider {...createForm}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-md border border-input bg-card px-4 py-4"
      >
        <GridThreeColumns>
          <Fieldset
            legend="Tipo de viatura"
            validationMessage={errors.type}
            isRequired
          >
            <Controller
              name="type"
              render={({ field }) => (
                <Select
                  value={String(field.value) ?? ""}
                  name="type"
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Veículos</SelectLabel>
                      <SelectItem value="CAR">Carro</SelectItem>
                      <SelectItem value="BUS">Ônibus</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Fieldset>
          <Fieldset
            legend="Vagas (capacidade)"
            validationMessage={errors.totalCapacity}
            isRequired
          >
            <Controller
              name="totalCapacity"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Informe a capacidade máxima da viatura"
                  {...register("totalCapacity")}
                  value={String(field.value) || ""}
                  type="tel"
                />
              )}
            />
          </Fieldset>
          <Fieldset
            legend="Nome da viatura"
            validationMessage={errors.name}
            isRequired
          >
            <Controller
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={`${watch("type") === "CAR" ? "HILUX 2.0 do João" : "Ônibus Familia 1 e 2"}`}
                  {...register("name")}
                  value={String(field.value) || ""}
                />
              )}
            />
          </Fieldset>
          <Fieldset
            legend="Identificação"
            isRequired
            validationMessage={errors.identifier}
          >
            <Controller
              name="identifier"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ex. 01"
                  {...register("identifier")}
                  value={field.value || ""}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Número ou descrição que identifique o veículo
            </p>
          </Fieldset>
        </GridThreeColumns>

        <GridThreeColumns
          title="Informações adicionais sobre a Viatura"
          className="mt-2 [&>h4]:mb-0"
        >
          <Fieldset
            legend="Proprietário da viatura"
            validationMessage={errors.owner}
          >
            <Controller
              name="owner"
              render={({ field }) => (
                <Input
                  {...field}
                  {...register("owner")}
                  value={(field.value as string) || ""}
                />
              )}
            />
          </Fieldset>
          <Fieldset legend="Placa do veículo" validationMessage={errors.plate}>
            <Controller
              name="plate"
              render={({ field }) => (
                <Input
                  {...field}
                  {...register("plate")}
                  value={(field.value as string) || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value.toUpperCase());
                  }}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Adicione uma Observação"
            validationMessage={errors.notes}
          >
            <Controller
              name="notes"
              render={({ field }) => (
                <Input
                  {...field}
                  {...register("notes")}
                  value={(field.value as string) || ""}
                />
              )}
            />
          </Fieldset>
          <Fieldset
            legend="Função da viatura"
            validationMessage={errors.function}
          >
            <Controller
              name="function"
              render={({ field }) => (
                <Input
                  {...field}
                  {...register("function")}
                  value={(field.value as string) || ""}
                />
              )}
            />
          </Fieldset>
        </GridThreeColumns>

        <div className="flex justify-end px-4">
          <Button loading={loading} type="submit">
            {buttonLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
