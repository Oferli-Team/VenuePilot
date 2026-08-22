import { FormProvider, useForm } from "react-hook-form";
import {
  type DataSectionProps,
  type FormDataOtherMedicineInfo,
  othersMedicineInfoSchema,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const OthersHealthInfoParticipant = ({
  user,
  fields,
}: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataOtherMedicineInfo>({
    resolver: zodResolver(othersMedicineInfoSchema),
    defaultValues: user,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataOtherMedicineInfo) => {
    if (!user) return;
    await updateRegister({
      ...data,
      eventoId: user?.eventoId,
      id: user?.id,
    });
    handleChangeIsEditing("otherInfoMedicine");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title="Outras informações médicas"
            loading={loading}
            isEditing={isEditing.otherInfoMedicine}
            onClick={() => handleChangeIsEditing("otherInfoMedicine")}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["MORE_HEALTH_INFO"]}
            isEditing={isEditing.otherInfoMedicine}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
