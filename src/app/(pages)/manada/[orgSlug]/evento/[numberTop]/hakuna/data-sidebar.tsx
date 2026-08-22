import { HakunaClassificationSidebar } from "@/components/hakuna/hakuna-classification-sidebar";
import {
  allFields,
  ENUM_CATEGORY,
} from "@/components/inscricao-detail/allFields";
import { InscricaoDetails } from "@/components/inscricao-detail/inscricao-detail";
import { InscricaoDetailItem } from "@/components/inscricao-detail/inscricao-detail-item";
import { categorizeFields } from "@/lib/utils/categorizeFields";
import { filterFieldsByPage } from "@/lib/utils/filterFieldsByPage";
import { type Table } from "@tanstack/react-table";

interface DataSidebarProps<TData> {
  table?: Table<TData>; // Aqui você define o tipo da tabela que vai passar
}

export const DataSidebar = <TData,>({ table }: DataSidebarProps<TData>) => {
  const fieldsHakuna = filterFieldsByPage(allFields, "hakuna");
  const categorizedFields = categorizeFields(fieldsHakuna);

  return (
    <InscricaoDetails>
      <InscricaoDetailItem
        title="Dados Pessoais"
        fields={categorizedFields[ENUM_CATEGORY.PERSONAL] ?? []}
      />
      <InscricaoDetailItem
        title="Dados de Saúde"
        fields={categorizedFields[ENUM_CATEGORY.HEALTH] ?? []}
      />
      <InscricaoDetailItem
        title="Informações de Saúde"
        fields={categorizedFields[ENUM_CATEGORY.MORE_HEALTH_INFO] ?? []}
      />
      <InscricaoDetailItem title="Hakuna Classificação">
        <HakunaClassificationSidebar />
      </InscricaoDetailItem>
      <InscricaoDetailItem
        title="Contato Emergência"
        fields={categorizedFields[ENUM_CATEGORY.EMERGENCY] ?? []}
      />
    </InscricaoDetails>
  );
};
