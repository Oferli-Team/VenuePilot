import { z } from "zod";
import { Button } from "./../ui/button";
import { Label } from "./../ui/label";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { toast } from "./../ui/use-toast";
import { useEffect, useState } from "react";
import { Cross } from "lucide-react";
import { useInscricaoDetail } from "../inscricao-detail/useInscricaoDetailStore";
import Fieldset from "../Fiedset";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { Textarea } from "../ui/textarea";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isHakuna } from "@/lib/utils/hasRole";

export const valueColorMapping: Record<string, string> = {
  Nenhum: "text-gray-500",
  "2": "text-orange-600",
  "1": "text-red-600",
  "3": "text-yellow-600",
  "4": "text-green-600",
  "5": "text-blue-600",
};

export const hakunaClassificationOptions = [
  { value: "Nenhum", color: "" },
  { value: "1", color: "text-red-600" },
  { value: "2", color: "text-orange-600" },
  { value: "3", color: "text-yellow-600" },
  { value: "4", color: "text-green-600" },
  { value: "5", color: "text-blue-600" },
] as const;

const hakunaClassificationSchema = z.object({
  saude: z.string().optional(),
  saude_obs: z.union([z.string(), z.null()]).optional(),
});

type FormData = z.infer<typeof hakunaClassificationSchema>;

export const HakunaClassificationSidebar = () => {
  const { membership } = getCurrentMembership();
  const { event } = useEventStore();

  const { invalidateHealth } = useInvalidateQueries();
  const { selectedInscricao, setSelectedInscricao } = useInscricaoDetail();

  const createForm = useForm<FormData>({
    resolver: zodResolver(hakunaClassificationSchema),
    defaultValues: {
      saude_obs: selectedInscricao?.saude_obs,
      saude: selectedInscricao?.saude
        ? String(selectedInscricao?.saude)
        : "Nenhum",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = createForm;

  const saudeValue = watch("saude");
  const saudeObsValue = watch("saude_obs");

  const [initialSaude, setInitialSaude] = useState(saudeValue);
  const [initialSaudeObs, setInitialSaudeObs] = useState(saudeObsValue);

  const updateSaude = api.inscricao.updateInscricaoWithSaude.useMutation({
    async onSuccess() {
      await invalidateHealth();
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!selectedInscricao && !event?.id) {
        toast({
          title: "Hakuna",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        });
        return;
      }

      const saude = Number(data.saude);
      const inscricaoUpdated = await updateSaude.mutateAsync({
        eventoId: event?.id ?? "",
        inscricaoId: selectedInscricao!.id,
        saude_obs: data.saude_obs ?? "",
        saude: saude && !isNaN(saude) ? saude : null,
      });

      setSelectedInscricao(inscricaoUpdated);
      toast({
        title: "Hakuna",
        description: "Classificação realizada com sucesso",
        variant: "success",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const isButtonDisabled =
    saudeValue === initialSaude && saudeObsValue === initialSaudeObs;

  useEffect(() => {
    setInitialSaude(saudeValue);
    setInitialSaudeObs(saudeObsValue);
  }, []);

  return (
    <>
      {!isHakuna(membership) ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium opacity-80 sm:text-sm">
              Saúde
            </Label>
            <div className="flex items-center gap-2">
              <Cross
                size={16}
                className={valueColorMapping[selectedInscricao?.saude ?? ""]}
              />
              <p className="text-sm sm:text-base">{selectedInscricao?.saude}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium opacity-80 sm:text-sm">
              Observação de Saúde
            </Label>
            <p className="text-sm sm:text-base">
              {selectedInscricao?.saude_obs}
            </p>
          </div>
        </div>
      ) : (
        <FormProvider {...createForm}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-4 flex flex-col gap-4"
          >
            <div className="z-30 flex flex-col gap-3 pt-2">
              <Label>Classificar saúde</Label>
              <Controller
                name="saude"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-3">
                          <Cross
                            size={16}
                            className={valueColorMapping[field.value!]}
                          />

                          {field.value?.toString() === "-" ||
                          field.value?.toString() === "Nenhum"
                            ? "-"
                            : field.value}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {hakunaClassificationOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={
                            option.value.toString() === "Nenhum"
                              ? "-"
                              : option.value.toString()
                          }
                        >
                          <span className="flex items-center gap-3">
                            <Cross size={16} className={`${option.color}`} />
                            {option.value}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Fieldset legend="Observação de saúde" className="font-medium">
              <Controller
                name="saude_obs"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    name="saude_obs"
                    value={field.value ?? ""}
                    placeholder="Adicione uma observação"
                    className="max-h-36 min-h-28"
                  />
                )}
              />
            </Fieldset>

            <Button
              className="w-1/3 self-end"
              type="submit"
              loading={updateSaude.isPending}
              disabled={isButtonDisabled}
            >
              Salvar
            </Button>
          </form>
        </FormProvider>
      )}
    </>
  );
};
