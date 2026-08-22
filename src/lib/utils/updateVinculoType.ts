import { type createServirSchema } from "@/app/zod-validation/schemas";
import { type UseFormSetValue } from "react-hook-form";
import { type z } from "zod";

type FormValue = z.infer<typeof createServirSchema>;

export const updateVinculoType = (
  maritalStatus: string,
  setValue: UseFormSetValue<FormValue>,
  setVinculoType: (state: string) => void,
) => {
  if (!maritalStatus) return;

  if (["Casado", "União Estável"].includes(maritalStatus)) {
    setValue("tipo_vinculo_contato_emergencia", "Esposa");
    setVinculoType("Esposa");
  } else {
    setValue("tipo_vinculo_contato_emergencia", "");
    setVinculoType("");
  }
};
