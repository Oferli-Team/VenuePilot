import { FormProvider, useForm } from "react-hook-form";
import {
  type DataSectionProps,
  type FormDataRefund,
  refundSchema,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { parse } from "date-fns";

export const RefundInfo = ({ user, fields }: DataSectionProps) => {
  const { updateRegister, loading, handleChangeIsEditing } = useEditUser(user);

  const createForm = useForm<FormDataRefund>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      ...user,
      reembolso_created: user && formatDateToDDMMYYYY(user.reembolso_created),
      reembolso_value: Number(user?.reembolso_value),
      reembolso_description: user?.reembolso_description ?? "",
      reembolso_receipt: user?.reembolso_receipt ?? "",
      reembolso_status: user?.reembolso_status ?? "",
      reembolso_type: user?.reembolso_type ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataRefund) => {
    const {
      reembolso_description,
      reembolso_receipt,
      reembolso_status,
      reembolso_type,
      reembolso_value,
    } = data;

    const reembolso_created = data.reembolso_created
      ? parse(data.reembolso_created, "dd/MM/yyyy", new Date())
      : undefined;

    if (!user) return;

    await updateRegister({
      eventoId: user.eventoId,
      id: user.id,
      reembolso_description,
      reembolso_receipt,
      reembolso_status,
      reembolso_type,
      reembolso_value,
    });

    handleChangeIsEditing("payment");
  };

  return (
    user.reembolso_status && (
      <FormProvider {...createForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
            <SectionHeading
              title="Reembolso"
              disabled={true}
              loading={loading}
              onClick={() => handleChangeIsEditing("refund")}
            />
            <DynamicFieldsMapped
              user={user}
              fields={fields}
              categories={["REFUND"]}
              isEditing={false}
              control={control}
              register={register}
              errors={errors}
            />
          </GridThreeColumns>
        </form>
      </FormProvider>
    )
  );
};
