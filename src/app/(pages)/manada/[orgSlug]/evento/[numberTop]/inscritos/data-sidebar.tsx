"use client";

import {
  allFields,
  ENUM_CATEGORY,
} from "@/components/inscricao-detail/allFields";
import { InscricaoDetails } from "@/components/inscricao-detail/inscricao-detail";
import { InscricaoDetailItem } from "@/components/inscricao-detail/inscricao-detail-item";
import { type VISIBLE_FIELDS_SIDE_TABLE } from "@/lib/constants";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { useFindEvent } from "@/lib/hooks/event";
import { categorizeFields } from "@/lib/utils/categorizeFields";
import { filterFieldsByPage } from "@/lib/utils/filterFieldsByPage";

export const DataSidebar = ({
  visibleFieldsPage,
}: {
  visibleFieldsPage: keyof typeof VISIBLE_FIELDS_SIDE_TABLE;
}) => {
  const { event } = useFindEvent();
  const fieldsServir = filterFieldsByPage(allFields, visibleFieldsPage);
  const categorizedFields = categorizeFields(fieldsServir);

  return (
    <InscricaoDetails>
      <InscricaoDetailItem
        title="Dados Pessoais"
        fields={categorizedFields[ENUM_CATEGORY.PERSONAL] ?? []}
      />

      {(event?.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.REM && (
        <InscricaoDetailItem
          title="Dados Pessoais Esposa"
          fields={categorizedFields[ENUM_CATEGORY.SPOUSE_PERSONAL] ?? []}
        />
      )}

      <InscricaoDetailItem
        title="Endereço"
        fields={categorizedFields[ENUM_CATEGORY.ADDRESS] ?? []}
      />

      {(event?.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.LEGENDARIOS && (
        <InscricaoDetailItem
          title="Contato Emergência"
          fields={categorizedFields[ENUM_CATEGORY.EMERGENCY] ?? []}
        />
      )}

      {(event?.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.REM && (
        <InscricaoDetailItem
          title="Dados de Saúde do casal"
          fields={categorizedFields[ENUM_CATEGORY.HEALTH] ?? []}
        />
      )}

      <InscricaoDetailItem
        title="Pagamento"
        fields={categorizedFields[ENUM_CATEGORY.PAYMENT] ?? []}
      />
    </InscricaoDetails>
  );
};
