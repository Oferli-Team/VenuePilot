import { type Inscricao } from "@prisma/client";
import type { FieldValues, Path } from "react-hook-form";
import type {
    AllFieldsProps,
    ENUM_CATEGORY,
} from "../inscricao-detail/allFields";
import { type ItemProps, PersonalUserItem } from "../personal-user-item";
import { useEditUser } from "./use-edit-user";

const convertToYesToNo = (value: boolean | null | undefined): string => {
  return value === true ? `Sim` : `Não`;
};

type PersonalUserItemProps<T extends FieldValues> = Pick<
  ItemProps<T>,
  "control" | "register" | "errors"
>;

type Category = keyof typeof ENUM_CATEGORY;
type DynamicFieldsMappedProps<T extends FieldValues> = {
  user: Inscricao;
  fields: AllFieldsProps[];
  isEditing: boolean;
  categories: Category[];
} & PersonalUserItemProps<T>;

export const DynamicFieldsMapped = <T extends FieldValues>({
  user,
  fields,
  categories,
  isEditing,
  register,
  errors,
  control,
}: DynamicFieldsMappedProps<T>) => {
  const { filterFieldsToRenderByCategory, canEditField } = useEditUser(user);

  const fieldsFiltered = filterFieldsToRenderByCategory(fields, categories);

  return (
    <>
      {user &&
        fieldsFiltered.map((field, i) => {
          const fieldId = field.id as keyof Inscricao;
          const value = user[fieldId];

          if (field.component) {
            return (
              <PersonalUserItem
                key={`${field.id}-${i + 1}`}
                isEditing={isEditing && canEditField(isEditing, fieldId)}
                keyLabel={field.label}
                register={register}
                control={control}
                editType={field.input}
                name={fieldId as Path<T>}
                label={convertToYesToNo(value as boolean | null | undefined)}
                errors={errors}
                options={field.options}
                maskPattern={field.inputMask}
                value={typeof value === "object" ? "" : String(value ?? "")}
                component={field.component({ value })}
              />
            );
          }
          return null;
        })}
    </>
  );
};
