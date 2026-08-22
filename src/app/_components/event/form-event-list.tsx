import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import Fieldset from "../Fiedset";
import { useEventStore } from "@/lib/store/EventStore";
import React from "react";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { Editor } from "../tiptap/editor";
import { useEventStepsStore } from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { useResetEventStepData } from "@/lib/hooks/useResetEventStepData";

const schema = z.object({
  list: z.string(),
});

type FormData = z.infer<typeof schema>;

export const FormEventList = () => {
  const { event } = useEventStore();
  const orgSlug = getCurrentOrgFromCookie();

  const { setDirtyStep } = useEventStepsStore();
  const { resetEventStepData } = useResetEventStepData("list");

  const { mutate: updateEventList, isPending: updateIsPending } =
    api.evento.updateEventList.useMutation({
      onError: async (error) => {
        console.log(error);
        toast({
          title: "Não foi possível alterar a lista.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        await resetEventStepData();
        toast({
          title: "Lista para participante alterado com sucesso!",
          variant: "success",
        });
      },
    });

  const defaultValues = React.useMemo(() => {
    return { list: event?.list ?? "" };
  }, [event?.list]);

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

      if (event) {
        updateEventList({
          id: event?.id,
          list: data.list,
        });
      }
    } catch (error) {
      console.log({ error });
      toast({
        title: "Não foi possível criar a lista do evento.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isDirty) {
      setDirtyStep("list", isDirty);
    }
  }, [isDirty, setDirtyStep]);

  return (
    <div className="mx-auto flex w-full flex-col space-y-4 md:max-w-6xl">
      <div className="space-y-1">
        <h2>Lista do que o participante deve levar para o Evento</h2>
        <p>
          Crie uma lista de todos os items que os participantes que precisarão
          levar para o evento, esta lista será disponibilizada na página do
          evento.
        </p>
      </div>

      <FormProvider {...createForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <Fieldset validationMessage={errors.list}>
            <Controller
              name="list"
              control={control}
              render={({ field }) => (
                <Editor content={field.value} onChange={field.onChange} />
              )}
            />
          </Fieldset>

          <Button
            loading={updateIsPending}
            type="submit"
            className="flex w-36 justify-self-end"
          >
            Confirmar
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};
