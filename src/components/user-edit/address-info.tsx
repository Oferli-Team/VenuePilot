import { FormProvider, useForm } from "react-hook-form";
import {
  addressSchema,
  type FormDataAddress,
  type DataSectionProps,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { mask, unmask } from "remask";
import { MASK_PATTERN } from "@/lib/constants";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const AddressInfo = ({
  title = "Endereço",
  user,
  fields,
}: DataSectionProps) => {
  const { isEditing, loading, updateRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      ...user,
      cep: mask(user.cep, MASK_PATTERN.cep),
      ruaComplemento: user.ruaComplemento ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataAddress) => {
    const cep = unmask(data.cep);
    const ruaComplemento = data.ruaComplemento ?? "";
    await updateRegister({
      ...data,
      eventoId: user.eventoId,
      id: user.id,
      cep,
      ruaComplemento,
    });

    handleChangeIsEditing("address");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title={title}
            isEditing={isEditing.address}
            loading={loading}
            onClick={() => handleChangeIsEditing("address")}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["ADDRESS"]}
            isEditing={isEditing.address}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
