import { FormProvider, useForm } from "react-hook-form";
import {
  emergencySchema,
  type FormDataEmergency,
  type DataSectionProps,
} from "./schemas";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { unmask } from "remask";
import { GridTwoColumns } from "../grid-two-columns";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const EmergencyInfo = ({ user, fields }: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataEmergency>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      ...user,
      celularContatoEmergencia: user?.celularContatoEmergencia ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataEmergency) => {
    const celularContatoEmergencia = unmask(data.celularContatoEmergencia);

    if (!user) return;

    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      ...data,
      celularContatoEmergencia,
    });

    handleChangeIsEditing("emergency");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridTwoColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title="Contato de Emergência"
            isEditing={isEditing.emergency}
            loading={loading}
            onClick={() => handleChangeIsEditing("emergency")}
          />

          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["EMERGENCY"]}
            isEditing={isEditing.emergency}
            control={control}
            register={register}
            errors={errors}
          />
        </GridTwoColumns>
      </form>
    </FormProvider>
  );
};
