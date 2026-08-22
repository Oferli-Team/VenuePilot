"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";

import { Controller, FormProvider, useForm } from "react-hook-form";
import Fieldset from "./Fiedset";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { mask, unMask } from "remask";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSession } from "next-auth/react";
import { isValidCpf } from "@/app/zod-validation/validation";

const createIdentifyZod = z.object({
  name: z.string().refine((value) => value, { message: "Nome é obrigatório" }),
  cpf: z
    .string()
    .refine((value) => value, { message: "CPF é obrigatório" })
    .refine(isValidCpf, { message: "Digite um CPF válido" }),
});

type FormData = z.infer<typeof createIdentifyZod>;

export const Onboarding = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const updateUser = api.user.onboarding.useMutation({
    onSuccess: async () => {
      return router.push(callbackUrl);
    },
  });

  const createForm = useForm<FormData>({
    resolver: zodResolver(createIdentifyZod),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormData) => {
    try {
      const { name, cpf } = data;
      const _cpf = unMask(cpf);
      await updateUser.mutateAsync({ name, cpf: _cpf });
      await update({
        user: {
          ...session?.user,
          name,
          cpf: _cpf,
        },
      });
    } catch (error) {
      console.error(error);
      // TODO: TOAST MESSAGE
    }
  };

  return (
    <Card className="w-full sm:w-[480px]">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-col items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/10 bg-input">
              <UserRound className="text-primary" size={20} />
            </span>
            <p>Identificação</p>
          </div>

          <p className="pt-4 text-center text-base">
            Seja bem vindo, preencha os dados para continuar
          </p>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <FormProvider {...createForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div>
                <Fieldset
                  className="p-0"
                  legend="Nome Completo"
                  validationMessage={errors.name}
                >
                  <Input placeholder="Osni Sampati" {...register("name")} />
                </Fieldset>

                <Fieldset
                  legend="CPF"
                  validationMessage={errors.cpf}
                  className="p-0"
                >
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field }) => (
                      <Input
                        {...register("cpf")}
                        value={mask(field.value, "999.999.999-99")}
                        placeholder="000.000.000-00"
                      />
                    )}
                  />
                </Fieldset>
              </div>
              <Button
                type="submit"
                disabled={updateUser.isPending}
                loading={updateUser.isPending}
              >
                Enviar
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
