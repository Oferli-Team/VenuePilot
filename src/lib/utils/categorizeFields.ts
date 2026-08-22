import {
  type AllFieldsProps,
  type ENUM_CATEGORY,
} from "@/components/inscricao-detail/allFields";

type CategorizedFields = {
  [key in ENUM_CATEGORY]?: AllFieldsProps[];
};

export const categorizeFields = (
  allFields: AllFieldsProps[],
  allowedFields?: string[],
): CategorizedFields => {
  const filteredFields = allowedFields
    ? allFields.filter((field) => allowedFields.includes(field.id))
    : allFields;

  return filteredFields.reduce<CategorizedFields>((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category]!.push(field);
    return acc;
  }, {} as CategorizedFields);
};
