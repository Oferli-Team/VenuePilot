import { FormProvider, useForm } from "react-hook-form";
import {
  type DataSectionProps,
  type FormDataContactLetters,
  contactLettersSchema,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { unmask } from "remask";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const LettersContactInfo = ({ user, fields }: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataContactLetters>({
    resolver: zodResolver(contactLettersSchema),
    defaultValues: {
      nomeContatoCartas: user?.nomeContatoCartas ?? "",
      celularContatoCartas: user?.celularContatoCartas ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataContactLetters) => {
    const celularContatoEmergencia =
      data.celularContatoCartas && unmask(data.celularContatoCartas);

    if (!user) return;

    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      nomeContatoCartas: data.nomeContatoCartas,
      celularContatoEmergencia,
    });
    handleChangeIsEditing("letters");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title="Contato para Cartas"
            isEditing={isEditing.letters}
            loading={loading}
            onClick={() => handleChangeIsEditing("letters")}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["LETTERS"]}
            isEditing={isEditing.letters}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
