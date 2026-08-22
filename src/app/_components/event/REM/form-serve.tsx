import { Controller, useFormContext } from "react-hook-form";
import { GridTwoColumns } from "../../grid-two-columns";
import Fieldset from "../../Fiedset";
import { unMask } from "remask";
import { vinculoOptions } from "@/lib/constants";
import { useGroupBlur } from "@/lib/hooks/useGroupBlur";
import { useFormStore } from "../../participante/useFormStore";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { api } from "@/trpc/react";
import { type z } from "zod";
import {
  createRemServeSchema,
  type addressDataRem,
} from "@/app/zod-validation/schemas";
import { toast } from "../../ui/use-toast";
import React, { useEffect } from "react";
import { AlertRegisterExist } from "../../alert-register-exist";
import { pickFieldsFromValues } from "@/lib/utils/formHelper";
import { SelectTShirtSize } from "../select-shirt-size";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { EmergencySection } from "./emergency-section";
import { SpouseSection } from "./spouse-section";
import { AddressSection } from "./address-section";
import { ReligionSection } from "./religion-section";
import { HealthSection } from "./health-section";
import { LegendarySection } from "./legendary-section";
import { TermsAndConditionsSection } from "./terms-and-conditions-section";
import { Input } from "../../ui/input";

export const FormServeRem = () => {
  const { setFormData, eventRegister } = useFormStore();
  const { charge } = usePixChargeStore();

  const [hasRegister, setHasRegister] = React.useState(false);
  const [cpf, setCpf] = React.useState("");
  const [tShirtErrors, setTshirtErrors] = React.useState<{
    man: string;
    woman: string;
  }>({ man: "", woman: "" });

  const { data, isLoading } =
    api.inscricao.checkExistRegisterConfirmedWithCPF.useQuery(
      {
        cpf,
        eventoId: eventRegister?.id,
      },
      { enabled: !!cpf },
    );

  const checkAlreadyExistRegister = async (value: string) => {
    setCpf(value);
  };

  const {
    watch,
    formState: { errors },
    control,
    getValues,
  } = useFormContext();

  const LegendarySchema = createRemServeSchema.pick({
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

  const tshirtsSchema = createRemServeSchema.pick({
    lgndCertificado: true,
    manTshirtSize: true,
    womanTshirtSize: true,
  });
  type TShirtData = z.infer<typeof tshirtsSchema>;
  const TShirtKeys: (keyof TShirtData)[] = [
    "lgndCertificado",
    "manTshirtSize",
    "womanTshirtSize",
  ];
  const { handleFocus: handleTShirtFocus, handleBlur: handleTShirtBlur } =
    useGroupBlur(() => {
      const rawValues = pickFieldsFromValues<TShirtData>(
        getValues(),
        TShirtKeys,
      );

      const { lgndCertificado, manTshirtSize, womanTshirtSize } = rawValues;
    });

  const lgndCertificate = watch("lgndCertificado") as string;
  const manTshirtSize: string = watch("manTshirtSize") as string;
  const womanTshirtSize: string = watch("womanTshirtSize") as string;

  const showToast = (title: string, variant: "success" | "destructive") => {
    toast({
      title,
      variant,
    });
  };

  useEffect(() => {
    if (lgndCertificate === "false") {
      setTshirtErrors({
        man: !manTshirtSize ? "Informe tamanho da camiseta masculina" : "",
        woman: !womanTshirtSize ? "Informe tamanho da camiseta feminina" : "",
      });
    } else {
      setTshirtErrors({
        man: manTshirtSize && "",
        woman: womanTshirtSize && "",
      });
    }
  }, [lgndCertificate, manTshirtSize, womanTshirtSize]);

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
          hiddenTShirtField
          sectionOnBlur={handleLegendaryDataBlur}
          sectionOnFocus={handleLegendaryDataFocus}
          disabled={!!charge}
          checkAlreadyExistRegister={(cpf) =>
            checkAlreadyExistRegister(unMask(cpf))
          }
        />

        <SpouseSection disabled={!!charge} hiddenTShirtField />

        <GridTwoColumns title="Casal REM ❤️">
          <Fieldset
            isRequired
            legend="Número REM do casal"
            validationMessage={errors.nrRem}
          >
            <Controller
              name="nrRem"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="tel"
                  disabled={!!charge}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    console.log({ onlyNumbers });
                    field.onChange(onlyNumbers);
                  }}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="O casal é Certificado (já serviu no REM)?"
            isRequired
            validationMessage={errors.lgndCertificado}
          >
            <Controller
              name="lgndCertificado"
              render={({ field }) => (
                <RadioGroup
                  disabled={!!charge}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                  onFocus={handleTShirtFocus}
                  onBlur={handleTShirtBlur}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="true"
                      id="lgndCertificado-yes"
                      className="border-input bg-background ring-offset-background"
                    />
                    <Label htmlFor="lgndCertificado-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="false"
                      id="lgndCertificado-no"
                      className="border-input bg-background ring-offset-background"
                    />
                    <Label htmlFor="lgndCertificado-no">Não</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Tamanho da Camiseta do Masculina"
            messageError={tShirtErrors.man}
            className={`${!lgndCertificate || lgndCertificate === "true" ? "hidden" : "block"}`}
          >
            <Controller
              control={control}
              name="manTshirtSize"
              render={({ field }) => (
                <SelectTShirtSize
                  disabled={
                    !lgndCertificate || lgndCertificate === "true" || !!charge
                  }
                  onValueChange={field.onChange}
                  value={lgndCertificate === "true" ? "" : field.value}
                  onFocus={handleTShirtFocus}
                  onBlur={handleTShirtBlur}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Tamanho da Camiseta do Feminina"
            messageError={tShirtErrors.woman}
            className={`${!lgndCertificate || lgndCertificate === "true" ? "hidden" : "block"}`}
          >
            <Controller
              control={control}
              name="womanTshirtSize"
              render={({ field }) => (
                <SelectTShirtSize
                  disabled={
                    !lgndCertificate || lgndCertificate === "true" || !!charge
                  }
                  onValueChange={field.onChange}
                  value={lgndCertificate === "true" ? "" : field.value}
                  onFocus={handleTShirtFocus}
                  onBlur={handleTShirtBlur}
                />
              )}
            />
          </Fieldset>
        </GridTwoColumns>

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
