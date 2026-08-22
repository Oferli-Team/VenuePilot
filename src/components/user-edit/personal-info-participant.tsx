import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { mask, unmask } from "remask";
import { MASK_PATTERN, stringToBoolean } from "@/lib/constants";
import { add, parse } from "date-fns";
import {
  type DataSectionProps,
  type FormDataPersonal,
  personalSchema,
} from "./schemas";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

const convertToTrueOrFalse = (value: boolean | null | undefined): string => {
  return value === true ? `true` : `false`;
};

export const PersonalInfoParticipant = ({
  user,
  fields,
  title = "Dados Pessoais",
}: DataSectionProps) => {
  const {
    isEditing,
    loading,
    updateRegister,
    handleChangeIsEditing,
    eventEnded,
  } = useEditUser(user);

  const createForm = useForm<FormDataPersonal>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      ...user,
      createdAt: user && formatDateToDDMMYYYY(user.createdAt),
      dataNascimento: formatDateToDDMMYYYY(user?.dataNascimento),
      celular: user?.celular ?? "",
      temFilhos: convertToTrueOrFalse(user?.temFilhos),
      qtdFilhos: mask(user?.qtdFilhos, MASK_PATTERN.qtdFilhos) ?? null,
      cpf: mask(user?.cpf, MASK_PATTERN.cpf),
      tamanhoFarda: user?.tamanhoFarda ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataPersonal) => {
    const { status, tipoInscricao, email, nome, tamanhoFarda } = data;
    const celular = unmask(data.celular);
    const cpf = unmask(data.cpf);
    const temFilhos = stringToBoolean(data.temFilhos);
    const qtdFilhos = data.qtdFilhos ? Number(data.qtdFilhos) : 0;

    const dataNascimentoSemMascara = unmask(data.dataNascimento);
    const dataNascimentoParsed = parse(
      dataNascimentoSemMascara,
      "ddMMyyyy",
      new Date(),
    );

    const dataNascimento = add(dataNascimentoParsed, { hours: 12 });

    if (!user) return;

    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      cpf,
      nome,
      celular,
      temFilhos,
      qtdFilhos,
      dataNascimento,
      status,
      tipoInscricao,
      email,
      tamanhoFarda,
    });
    handleChangeIsEditing("personal");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4">
          <SectionHeading
            title={title}
            loading={loading}
            isEditing={isEditing.personal}
            onClick={() => handleChangeIsEditing("personal")}
          />

          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["PERSONAL"]}
            isEditing={isEditing.personal}
            control={control}
            register={register}
            errors={errors}
          />

          {eventEnded && (
            <p className="col-span-full text-sm text-muted-foreground">
              Evento encerrado portanto alguns campos da inscrição não podem ser
              alterados.
            </p>
          )}
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
