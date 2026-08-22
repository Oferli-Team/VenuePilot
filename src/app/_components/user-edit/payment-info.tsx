import { FormProvider, useForm } from "react-hook-form";
import {
  type DataSectionProps,
  type FormDataPayment,
  paymentSchema,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";
import { parse } from "date-fns";
import {
  convertFromBasisPoint,
  convertToBasisPoint,
} from "@/lib/utils/basisPoint";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";

type updateDatePaymentFields = {
  eventoId: string;
  id: string;
  pagamento_status: string;
  pagamento_top_value: number | undefined;
  pagamento_total_value: number | undefined;
  pagamento_fee_card: number | undefined;
  pagamento_discount_value: number;
  pagamento_data: Date | undefined;
  pagamento_couponValue: string;
  obs: string | undefined;
  metodo_pagamento?: "PIX" | "CARTAO";
};

export const PaymentInfo = ({ user, fields }: DataSectionProps) => {
  const {
    isEditing,
    loading,
    updateRegister,
    handleChangeIsEditing,
    eventEnded,
  } = useEditUser(user);

  const createForm = useForm<FormDataPayment>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...user,
      pagamento_data: formatDateToDDMMYYYY(user.pagamento_data),
      pagamento_top_value: convertFromBasisPoint(user.pagamento_top_value ?? 0),
      pagamento_discount_value: convertFromBasisPoint(
        user.pagamento_discount_value ?? 0,
      ),
      pagamento_total_value: convertFromBasisPoint(
        user.pagamento_total_value ?? 0,
      ),
      pagamento_fee_card: convertFromBasisPoint(user.pagamento_fee_card ?? 0),
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataPayment) => {
    const {
      pagamento_couponValue,
      pagamento_top_value,
      pagamento_total_value,
      pagamento_fee_card,
      pagamento_discount_value,
      metodo_pagamento,
      pagamento_status,
      obs,
    } = data;

    const pagamento_data = data.pagamento_data
      ? parse(data.pagamento_data, "dd/MM/yyyy", new Date())
      : undefined;

    if (!user) return;

    const updateData: updateDatePaymentFields = {
      eventoId: user.eventoId,
      id: user.id,
      pagamento_status: pagamento_status ?? "",
      pagamento_top_value:
        pagamento_top_value && convertToBasisPoint(pagamento_top_value),
      pagamento_total_value:
        pagamento_total_value && convertToBasisPoint(pagamento_total_value),
      pagamento_fee_card:
        pagamento_fee_card && convertToBasisPoint(pagamento_fee_card),
      pagamento_discount_value: convertToBasisPoint(pagamento_discount_value),
      pagamento_data,
      pagamento_couponValue: pagamento_couponValue ?? "none",
      obs: obs ?? undefined,
    };

    if (metodo_pagamento) {
      updateData.metodo_pagamento = metodo_pagamento;
    }

    await updateRegister(updateData);

    handleChangeIsEditing("payment");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title="Pagamento"
            loading={loading}
            isEditing={isEditing.payment}
            onClick={() => handleChangeIsEditing("payment")}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["PAYMENT"]}
            isEditing={isEditing.payment}
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
