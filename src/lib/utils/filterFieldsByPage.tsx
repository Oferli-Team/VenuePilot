import { type AllFieldsProps } from "@/components/inscricao-detail/allFields";
import { VISIBLE_FIELDS_SIDE_TABLE } from "../constants";

export const filterFieldsByPage = (
  allFields: AllFieldsProps[],
  page: keyof typeof VISIBLE_FIELDS_SIDE_TABLE,
): AllFieldsProps[] => {
  const allowedFields = VISIBLE_FIELDS_SIDE_TABLE[page];
  const filteredFields = allFields.filter((field) =>
    allowedFields?.includes(field.id),
  );
  return filteredFields;
};
