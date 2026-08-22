import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { mask, unmask } from "remask";
import { MASK_PATTERN } from "@/lib/constants";
import { add, parse } from "date-fns";
import {
  type DataSectionProps,
  type FormDataSpouse,
  spouseSchema,
} from "./schemas";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";

export const SpouseDataInfo = ({ user, fields }: DataSectionProps) => {
  const { isEditing, loadingRem, updateRemRegister, handleChangeIsEditing } =
    useEditUser(user);

  const createForm = useForm<FormDataSpouse>({
    resolver: zodResolver(spouseSchema),
    defaultValues: {
      ...user,
      spouseBirthDate: user.spouseBirthDate
        ? formatDateToDDMMYYYY(user.spouseBirthDate)
        : "",
      spouseCPF: mask(user?.spouseCPF, MASK_PATTERN.cpf),
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createForm;

  const onSubmit = async (data: FormDataSpouse) => {
    const spousePhoneNumber = unmask(data.spousePhoneNumber);
    const spouseCPF = unmask(data.spouseCPF);

    const spouseBirthDateParsed = parse(
      unmask(data.spouseBirthDate),
      "ddMMyyyy",
      new Date(),
    );

    const spouseBirthDate = add(spouseBirthDateParsed, { hours: 12 });

    if (!user) return;

    await updateRemRegister({
      ...data,
      eventId: user.eventoId,
      id: user.id,
      spouseCPF,
      spousePhoneNumber,
      spouseBirthDate,
    });

    handleChangeIsEditing("spousePersonal");
  };

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4">
          <SectionHeading
            title="Dados Pessoais Esposa"
            isEditing={isEditing.spousePersonal}
            loading={loadingRem}
            onClick={() => handleChangeIsEditing("spousePersonal")}
          />

          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["SPOUSE_PERSONAL"]}
            isEditing={isEditing.spousePersonal}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
