import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import Fieldset from "../Fiedset";
import { useEventStore } from "@/lib/store/EventStore";
import React from "react";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
import { useEventStepsStore } from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { TermsEditor, VARIABLES } from "./terms-editor";
import { parseRichText } from "@/lib/utils/parseRichText";
import type { VariablesRichTextTerms } from "@/lib/types";
import { formatDate } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useResetEventStepData } from "@/lib/hooks/useResetEventStepData";

const schema = z.object({
  terms: z.string(),
});

type FormData = z.infer<typeof schema>;

export const FormEventTerms = ({ isEdit }: { isEdit: boolean }) => {
  const { event } = useEventStore();
  const { formData, setStep, resetFormData, setDirtyStep } =
    useEventStepsStore();
  const orgSlug = getCurrentOrgFromCookie();

  const [previewTerms, setPreviewTerms] = React.useState<string>("");
  const [tab, setTab] = React.useState<"edit" | "preview">("edit");

  const { resetEventStepData } = useResetEventStepData("terms");

  const { mutate: createEvent, isPending: createIsPending } =
    api.evento.createEvent.useMutation({
      onError: async (error) => {
        console.log(error);
        toast({
          title: "Não foi possível criar o evento.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        resetFormData();
        setStep("success");
      },
    });

  const { mutate: updateEventTerms, isPending: updateIsPending } =
    api.evento.updateEventTerms.useMutation({
      onError: async (error) => {
        console.log(error);
        toast({
          title: "Não foi possível alterar o termo do evento.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        await resetEventStepData();
        toast({
          title: "Termo do evento alterado com sucesso!",
          variant: "success",
        });
      },
    });

  const defaultValues = React.useMemo(() => {
    if (isEdit && event) {
      setPreviewTerms(event?.terms ?? "");
      return { terms: event.terms ?? "" };
    }
    if (!isEdit && formData?.slug !== "") {
      setPreviewTerms(formData?.terms ?? "");
      return { terms: formData?.terms ?? "" };
    }
    return { terms: "" };
  }, [isEdit]);

  const createForm = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = createForm;

  const onSubmit = async (data: FormData) => {
    try {
      if (!orgSlug) {
        toast({
          title: "Organização não encontrada.",
          variant: "destructive",
        });
        return;
      }

      if (isEdit && event) {
        updateEventTerms({
          id: event?.id,
          terms: data.terms,
        });
        return;
      }

      createEvent({
        orgSlug,
        event: {
          ...formData,
          terms: data.terms,
        },
      });
    } catch (error) {
      console.log({ error });
      toast({
        title: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    }
  };

  const previewContent = React.useMemo(() => {
    if (!previewTerms) return "";

    const dataInicio = formatDate(new Date(), "dd/MM/yyyy");
    const dataFinal = formatDate(new Date(), "dd/MM/yyyy");
    if (!dataInicio || !dataFinal) return "";

    const variables: VariablesRichTextTerms = isEdit
      ? {
          NR_TOP: event?.topNumero ?? 0,
          DATA_INICIO_EVENTO: event?.dataInicio
            ? formatDate(event?.dataInicio, "dd/MM/yyyy")
            : dataInicio,
          DATA_FIM_EVENTO: event?.dataFim
            ? formatDate(event?.dataFim, "dd/MM/yyyy")
            : dataFinal,
          PISTA: event?.pista ?? "Sua Pista",
        }
      : {
          NR_TOP: formData?.topNumero ?? 0,
          DATA_INICIO_EVENTO: dataInicio,
          DATA_FIM_EVENTO: dataInicio,
          PISTA: event?.pista ?? "Sua Pista",
        };

    const preview = parseRichText(previewTerms, variables);
    return preview;
  }, [event, formData, previewTerms, isEdit]);

  React.useEffect(() => {
    if (isEdit && isDirty) {
      setDirtyStep("terms", isDirty);
    }
  }, [isDirty, isEdit, setDirtyStep]);

  return (
    <div className="mx-auto flex w-full flex-col space-y-4 md:max-w-6xl">
      <div className="space-y-1">
        <h2>Termos do evento</h2>
        <p>
          Aqui você deve escrever um texto que será mostrado ao participante no
          momento da inscrição. Ele precisa aceitar esse termo para concluir a
          inscrição.
        </p>
        <p>
          Use esse espaço para informar{" "}
          <b>
            regras importantes, orientações ou condições de participação no
            evento
          </b>
          .
        </p>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        Você pode usar as seguintes variáveis:
        <ul className="list-inside list-disc">
          {VARIABLES.map((variable) => (
            <li key={variable.id}>
              <code>{variable.id}</code> - {variable.description}
            </li>
          ))}
        </ul>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "edit" | "preview")}
      >
        <TabsList>
          <TabsTrigger value="edit" onClick={(e) => e.stopPropagation()}>
            Editar
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            onClick={(e) => e.stopPropagation()}
            disabled={!previewTerms}
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <FormProvider {...createForm}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <Fieldset validationMessage={errors.terms}>
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <TermsEditor
                      content={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setPreviewTerms(value);
                      }}
                    />
                  )}
                />
              </Fieldset>

              <Button
                loading={createIsPending || updateIsPending}
                type="submit"
                className="flex w-36 justify-self-end"
              >
                Confirmar
              </Button>
            </form>
          </FormProvider>
        </TabsContent>

        <TabsContent
          value="preview"
          className="mt-6 min-h-48 rounded-md border bg-background/40 p-2"
        >
          <div
            className="[&>h1]:mb-6 [&>h2]:mb-5 [&>h3]:mb-4 [&>ol]:mb-4 [&>p]:mb-4 [&>ul]:mb-4"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
