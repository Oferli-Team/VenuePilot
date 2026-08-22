import { useFormContext } from "react-hook-form";
import { unMask } from "remask";
import { vinculoOptions } from "@/lib/constants";
import { useGroupBlur } from "@/lib/hooks/useGroupBlur";
import { useFormStore } from "../../participante/useFormStore";
import { api } from "@/trpc/react";
import type { z } from "zod";
import {
  createRemParticipantSchema,
  type addressDataRem,
} from "@/app/zod-validation/schemas";
import { toast } from "../../ui/use-toast";
import React from "react";
import { AlertRegisterExist } from "../../alert-register-exist";
import { pickFieldsFromValues } from "@/lib/utils/formHelper";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { EmergencySection } from "./emergency-section";
import { AddressSection } from "./address-section";
import { ReligionSection } from "./religion-section";
import { HealthSection } from "./health-section";
import { SpouseSection } from "./spouse-section";
import { LegendarySection } from "./legendary-section";
import { TermsAndConditionsSection } from "./terms-and-conditions-section";

export const FormParticipantRem = () => {
  const { setFormData, eventRegister } = useFormStore();
  const { charge } = usePixChargeStore();

  const [hasRegister, setHasRegister] = React.useState(false);
  const [cpf, setCpf] = React.useState("");

  const { data, isLoading } =
    api.inscricao.checkExistRegisterConfirmedWithCPF.useQuery(
      {
        cpf,
        eventoId: eventRegister?.id,
      },
      { enabled: !!cpf },
    );

  const checkAlreadyExistRegister = (value: string) => {
    setCpf(value);
  };

  const { getValues } = useFormContext();

  const LegendarySchema = createRemParticipantSchema.pick({
    nome: true,
    cpf: true,
    celular: true,
    email: true,
  });
  type LegendaryData = z.infer<typeof LegendarySchema>;
  const legendaryKeys: (keyof LegendaryData)[] = [
    "cpf",
    "celular",
    "email",
    "nome",
    "email",
  ];

  const {
    handleFocus: handleLegendaryDataFocus,
    handleBlur: handleLegendaryDataBlur,
  } = useGroupBlur(async () => {
    const rawValues = pickFieldsFromValues<LegendaryData>(
      getValues(),
      legendaryKeys,
    );
    const values: LegendaryData = rawValues;
    const { nome, cpf, celular, email } = values;
    setFormData({
      nome,
      cpf,
      celular: unMask(celular),
      email,
    });
  });

  type AddressData = z.infer<typeof addressDataRem> & { cep: string };
  const addressKeys: (keyof AddressData)[] = [
    "cep",
    "rua",
    "rua_numero",
    "bairro",
    "cidade",
    "estado",
    "pais",
  ];

  const { handleFocus: handleAddressFocus, handleBlur: handleAddressBlur } =
    useGroupBlur(() => {
      const rawValues = pickFieldsFromValues<AddressData>(
        getValues(),
        addressKeys,
      );

      const values = rawValues;
      setFormData(values);
    });

  const showToast = (title: string, variant: "success" | "destructive") => {
    toast({
      title,
      variant,
    });
  };

  React.useEffect(() => {
    if (data) {
      setHasRegister(true);
    }

    if (cpf && !isLoading) {
      setCpf("");
    }
  }, [cpf, isLoading, data]);

  return (
    <>
      <div className="flex flex-col gap-8 bg-card p-4">
        <LegendarySection
          sectionOnBlur={handleLegendaryDataBlur}
          sectionOnFocus={handleLegendaryDataFocus}
          disabled={!!charge}
          checkAlreadyExistRegister={(cpf) => {
            checkAlreadyExistRegister(unMask(cpf));
          }}
        />

        <SpouseSection disabled={!!charge} />

        <EmergencySection
          title="Contato Emergência do Casal"
          selectOptions={vinculoOptions.filter((opt) => opt.value !== "Esposa")}
          disabled={!!charge}
        />

        <AddressSection
          title="Endereço do casal"
          sectionOnBlur={handleAddressBlur}
          sectionOnFocus={handleAddressFocus}
          disabled={!!charge}
        />

        <ReligionSection title="Religião do casal" disabled={!!charge} />

        <HealthSection disabled={!!charge} />

        <TermsAndConditionsSection disabled={!!charge} />
      </div>

      <AlertRegisterExist
        eventId={eventRegister?.id}
        cpf={cpf}
        open={hasRegister}
      />
    </>
  );
};
