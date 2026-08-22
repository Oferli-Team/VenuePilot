import { MASK_PATTERN, stringToBoolean } from "@/lib/constants";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { mask } from "remask";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";
import {
  type DataSectionProps,
  type FormDataLegendary,
  legendarySchema,
} from "./schemas";
import { useEditUser } from "./use-edit-user";

const convertToTrueOrFalse = (value: boolean | null | undefined): string => {
  return value === true ? `true` : `false`;
};

export const PersonalInfoLegendary = ({
  title = "Legendário",
  user,
  fields,
}: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataLegendary>({
    resolver: zodResolver(legendarySchema),
    defaultValues: {
      ...user,
      status: user?.status ?? "",
      tipoInscricao: user?.tipoInscricao ?? "",
      createdAt: user && formatDateToDDMMYYYY(user.createdAt),
      lgndCertificado: convertToTrueOrFalse(user?.lgndCertificado),
      possuiAutorizacaoServir: convertToTrueOrFalse(
        user?.possuiAutorizacaoServir,
      ),
      lgnd_funcao: String(user?.lgnd_funcao),
      dataNascimento: formatDateToDDMMYYYY(user?.dataNascimento),
      cpf: mask(user?.cpf, MASK_PATTERN.cpf),
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataLegendary) => {
    const {
      status,
      tipoInscricao,
      lgndCertificado,
      nrLgnd,
      possuiAutorizacaoServir,
      lgnd_funcao,
      manTshirtSize,
    } = data;

    if (!user) return;

    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      status,
      tipoInscricao,
      nrLgnd,
      lgndCertificado: stringToBoolean(lgndCertificado),
      possuiAutorizacaoServir: stringToBoolean(possuiAutorizacaoServir),
      lgnd_funcao,
      manTshirtSize: manTshirtSize ?? undefined,
    });

    handleChangeIsEditing("legendary");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title={title}
            isEditing={isEditing.legendary}
            loading={loading}
            onClick={() => handleChangeIsEditing("legendary")}
          />

          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["LEGENDARY", "PERSONAL"]}
            isEditing={isEditing.legendary}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
