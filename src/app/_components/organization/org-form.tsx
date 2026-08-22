"use client";

import Fieldset from "@/components/Fiedset";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { SocialMediaInputs } from "@/components/organization/social-media-inputs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPhone } from "@/components/ui/input-phone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selects";
import { toast } from "@/components/ui/use-toast";
import { createOrganizationSchema } from "@/app/zod-validation/orgSchema";
import { MASK_PATTERN } from "@/lib/constants";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { mask } from "remask";
import { type z } from "zod";
import { Spinner } from "../ui/spinner";
import React from "react";

type FormData = z.infer<typeof createOrganizationSchema>;

export const FormCreateOrganization = () => {
  const { orgsRoutes } = useEventRoutes({});

  const [orgCreated, setOrgCreated] = React.useState(false);

  const createForm = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      pixKeyType: "cpf",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    setValue,
  } = createForm;

  const {
    mutateAsync: createOrganization,
    isPending: createOrganizationIsPending,
  } = api.organization.create.useMutation({
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erro ao criar organização",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      setOrgCreated(true);
      console.log("Mutation success:", data);
      toast({
        title: "Organização criada com sucesso!",
        variant: "success",
      });
      setTimeout(() => {
        window.location.href = orgsRoutes.orgCreatedSuccessfully;
      }, 1000);
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createOrganization(data);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Erro ao criar organização",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const pixKeyType = watch("pixKeyType");
  const pixKeyPlaceholder = [
    {
      value: "cpf",
      placeholder: "000.000.000-00",
      type: "tel",
      mask: MASK_PATTERN.cpf,
    },
    {
      value: "cnpj",
      placeholder: "00.000.000/0001-00",
      type: "tel",
      mask: MASK_PATTERN.cnpj,
    },
    { value: "email", placeholder: "seu-endereco@email.com", type: "text" },
    { value: "random", placeholder: "Chave aleatória", type: "text" },
  ];

  return (
    <>
      {orgCreated && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex flex-col items-center justify-center bg-card/80">
          <div className="flex flex-col items-center justify-center gap-2">
            <Spinner size={40} />
            <p className="font-semibold">Aguarde...</p>
          </div>
        </div>
      )}
      <FormProvider {...createForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-card p-4">
          <GridTwoColumns title="Dados Gerais">
            <Fieldset legend="Nome" validationMessage={errors.name} isRequired>
              <Controller
                control={control}
                name="name"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Nome da organização"
                      disabled={createOrganizationIsPending}
                    />
                  );
                }}
              />
            </Fieldset>

            <Fieldset legend="CNPJ" validationMessage={errors.cnpj} isRequired>
              <Controller
                control={control}
                name="cnpj"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      value={mask(field.value, MASK_PATTERN.cnpj) ?? ""}
                      placeholder="00.000.000/0000-00"
                      disabled={createOrganizationIsPending}
                      type="tel"
                    />
                  );
                }}
              />
            </Fieldset>
          </GridTwoColumns>

          <GridTwoColumns title="Dados bancários">
            <Fieldset
              legend="Tipo da chave Pix"
              validationMessage={errors.pixKeyType}
              isRequired
            >
              <Select
                value={pixKeyType ?? "cpf"}
                onValueChange={(value) => setValue("pixKeyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Chave aleatória</SelectItem>
                </SelectContent>
              </Select>
            </Fieldset>

            <Fieldset
              legend="Chave Pix"
              validationMessage={errors.pixKey}
              isRequired
            >
              <Controller
                control={control}
                name="pixKey"
                render={({ field }) => {
                  const itemMask = pixKeyPlaceholder.find(
                    ({ value }) => value === pixKeyType,
                  )?.mask;
                  if (pixKeyType === "phone") {
                    return <InputPhone {...field} value={field.value ?? ""} />;
                  }
                  return (
                    <Input
                      {...field}
                      value={
                        itemMask
                          ? mask(field.value, itemMask)
                          : (field.value ?? "")
                      }
                      placeholder={
                        pixKeyPlaceholder.find(
                          ({ value }) => value === pixKeyType,
                        )?.placeholder
                      }
                      type={
                        pixKeyPlaceholder.find(
                          ({ value }) => value === pixKeyType,
                        )?.type ?? "text"
                      }
                      disabled={createOrganizationIsPending}
                    />
                  );
                }}
              />
            </Fieldset>
          </GridTwoColumns>

          <GridTwoColumns title="Dados do diretor da Pista">
            <Fieldset
              legend="Nome"
              validationMessage={errors.managerName}
              isRequired
            >
              <Controller
                control={control}
                name="managerName"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      disabled={createOrganizationIsPending}
                    />
                  );
                }}
              />
            </Fieldset>

            <Fieldset
              legend="Celular"
              validationMessage={errors.managerPhone}
              isRequired
            >
              <Controller
                control={control}
                name="managerPhone"
                render={({ field }) => {
                  return (
                    <InputPhone
                      {...field}
                      value={field.value ?? ""}
                      disabled={createOrganizationIsPending}
                    />
                  );
                }}
              />
            </Fieldset>
          </GridTwoColumns>

          <GridTwoColumns title="Contato para suporte e redes sociais">
            <Fieldset
              legend="Contato para suporte (whatsapp)"
              validationMessage={errors.supportContact}
            >
              <Controller
                control={control}
                name="supportContact"
                render={({ field }) => {
                  return (
                    <InputPhone
                      {...field}
                      value={field.value ?? ""}
                      disabled={createOrganizationIsPending}
                    />
                  );
                }}
              />
            </Fieldset>

            <SocialMediaInputs />
          </GridTwoColumns>

          <Button
            loading={createOrganizationIsPending}
            className="mt-6 flex justify-end"
            type="submit"
            disabled={createOrganizationIsPending || isSubmitting}
          >
            Confirmar
          </Button>
        </form>
      </FormProvider>
    </>
  );
};
