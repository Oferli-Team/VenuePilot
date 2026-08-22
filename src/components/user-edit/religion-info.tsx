import { FormProvider, useForm } from "react-hook-form";
import {
  religionSchema,
  type DataSectionProps,
  type FormDataReligion,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const ReligionInfo = ({
  user,
  title = "Religião",
  fields,
}: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataReligion>({
    resolver: zodResolver(religionSchema),
    defaultValues: {
      ...user,
      comoConheceuLegendarios: user?.comoConheceuLegendarios ?? "",
      quemConvidou: user?.quemConvidou ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataReligion) => {
    if (!user) return;
    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      ...data,
    });
    handleChangeIsEditing("religion");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title={title}
            isEditing={isEditing.religion}
            loading={loading}
            onClick={() => handleChangeIsEditing("religion")}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["RELIGION"]}
            isEditing={isEditing.religion}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
