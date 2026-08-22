"use client";

import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LinkSecreto } from "@prisma/client";
import { Link } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { mask } from "remask";
import { z } from "zod";
import Fieldset from "./Fiedset";
import { Button } from "./ui/button";
import { Heading } from "./ui/heading";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/selects";
import React from "react";
import { useRouter } from "nextjs-toploader/app";
import { ToastAction } from "./ui/toast";
import { useEventStore } from "@/lib/store/EventStore";
import { slugify } from "@/lib/utils/slugify";

interface SetSecretLinkProps {
  initialData?: LinkSecreto | null | undefined;
}

const createSecretLinkSchema = z.object({
  link: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  quantidade: z.string({ required_error: "Informe a quantidade" }).refine(
    (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 1 && num <= 1000;
    },
    { message: "Quantidade deve ser entre 1 a 1000" },
  ),
  tipoInscricao: z.enum(["PARTICIPANTE", "SERVIR"], {
    message: "Selecione o tipo de inscrição",
  }),
});

type FormData = z.infer<typeof createSecretLinkSchema>;

export const SetSecretLink = ({ initialData }: SetSecretLinkProps) => {
  const router = useRouter();
  const { event } = useEventStore();

  const defaultValues = {
    link: initialData?.link ?? "",
    quantidade: initialData?.quantidade ? String(initialData?.quantidade) : "",
    tipoInscricao: initialData?.tipoInscricao as "PARTICIPANTE" | "SERVIR",
  };

  const createForm = useForm<FormData>({
    resolver: zodResolver(createSecretLinkSchema),
    defaultValues: defaultValues || {
      link: "",
      quantidade: "",
      tipoInscricao: "",
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    control,
  } = createForm;

  const { mutate: createLink, isPending: createIsPending } =
    api.linkSecreto.create.useMutation({
      onError: (error) => {
        const errorMessage = Array.isArray(error)
          ? "Não foi possível criar o link secreto"
          : error.message;

        toast({
          title: "Ops, algo deu errado",
          description: errorMessage,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        setValue("link", "");
        setValue("quantidade", "");
        toast({
          title: "Link Secreto criado com sucesso!",
          variant: "success",
        });
        setTimeout(() => {
          router.refresh();
        }, 500);
      },
    });

  const { mutate: updateLink, isPending: updateIsPending } =
    api.linkSecreto.update.useMutation({
      onError: (error) => {
        const errorMessage = Array.isArray(error)
          ? "Não foi possível criar o link secreto"
          : error.message;

        toast({
          title: "Ops, algo deu errado",
          description: errorMessage,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        toast({
          title: "Link Secreto atualizado com sucesso!",
          variant: "success",
        });
        setTimeout(() => {
          router.back();
        }, 1000);
        router.refresh();
      },
    });

  const onSubmit = (data: FormData) => {
    const { link, tipoInscricao } = data;
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

    if (initialData) {
      updateLink({
        id: initialData.id,
        link: slugify(link),
        quantidade,
        tipoInscricao,
        eventoId: event.id,
      });
      return;
    }

    createLink({
      link: slugify(link),
      quantidade,
      eventoId: event.id,
      tipoInscricao,
    });
  };

  const buttonLabel = initialData ? "Atualizar" : "Criar";
  const loading = initialData ? updateIsPending : createIsPending;
  const heading = initialData ? "Atualizar link" : "Criar novo link";

  const baseUrl = `inscricoestop.com.br/evento/${event?.topNumero}/`;

  const customSlugify = (text: string) => {
    const from = "àáâãäåèéêëìíîïòóôõöùúûüçñ";
    const to = "aaaaaaeeeeiiiiooooouuuucn";

    return text
      .toLowerCase()
      .split("")
      .map((char) => {
        const index = from.indexOf(char);
        return index !== -1 ? to[index] : char;
      })
      .join("")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  };

  return (
    <>
      <div className="ml-4 flex flex-col gap-2">
        <Heading title="Link Secreto" icon={Link} />
        <h3 className="text-sm font-medium sm:text-base">{heading}</h3>
      </div>

      <div className="w-full rounded-lg border border-input bg-card px-2 py-4 shadow-md sm:mt-4 sm:px-4">
        <FormProvider {...createForm}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid items-end gap-10 sm:grid-cols-3 sm:gap-4"
          >
            <Fieldset
              legend="Final do link"
              validationMessage={errors.link}
              className="relative"
            >
              <Controller
                name="link"
                control={control}
                render={({ field }) => {
                  return (
                    <Input
                      placeholder="Ex: dourados"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const slugifiedValue = customSlugify(rawValue);
                        field.onChange(slugifiedValue);
                      }}
                    />
                  );
                }}
              />
              <div className="absolute -bottom-7">
                <span className="text-muted-foreground">{baseUrl}</span>
                {watch("link")}
              </div>
            </Fieldset>
            <Fieldset
              legend="Quantidade disponível"
              validationMessage={errors.quantidade}
            >
              <Controller
                name="quantidade"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ex. 10"
                    value={field.value || ""}
                    onChange={async (e) => {
                      const value = e.target.value;
                      field.onChange(value);
                    }}
                    type="tel"
                  />
                )}
              />
            </Fieldset>

            <Fieldset
              legend="Tipo de Inscrição"
              validationMessage={errors.tipoInscricao}
            >
              <Controller
                name="tipoInscricao"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value ?? ""}
                    name="tipoInscricao"
                  >
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {["PARTICIPANTE", "SERVIR"].map((type, i) => (
                        <SelectItem key={`${type} - ${i}`} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Fieldset>

            <div className="flex justify-end gap-3 px-4 sm:col-span-3">
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
