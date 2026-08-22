import { type Inscricao } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "./filter-select";
import { useFilterParamsStore } from "@/lib/store/FiltersParamsStore";
import { useQueryParamsByPage } from "@/lib/hooks/useQueryParamsByPage";
import {
  checkinStatusOptions,
  funcoesLgndOptions,
  statusOptions,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterItemProps = {
  visibleColumns: string[];
  className?: string;
};

// Tipo para fieldFilters (ajustado para suportar arrays)
type FilterParams = {
  [key: string]: string | string[] | undefined;
};

const booleanOptions = [
  { label: "Sim", value: "true" },
  { label: "Não", value: "false" },
  { label: "Não verificado", value: "null" },
];

export const FilterTableItems = ({
  visibleColumns,
  className,
}: FilterItemProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);

  const { params: paramsByPage } = useQueryParamsByPage();

  const { fieldFilters, setFieldFilters } = useFilterParamsStore();

  const [loading, setLoading] = useState("");

  type Columns = keyof Inscricao;

  const columns: Columns[] = [
    "linkSecreto",
    "pagamento_couponValue",
    "estado",
    "cidade",
    "familia",
    "saude",
  ];

  const { data } = api.inscricao.getUniqueColumnValueToFilter.useQuery(
    {
      eventoId: paramsByPage.eventoId,
      tipoInscricao: paramsByPage.tipoInscricao,
      status: paramsByPage.status,
      checkin: paramsByPage.checkin,
      columns,
    },
    {
      enabled: !!paramsByPage.eventoId,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const statesOptions = data?.estado ?? [];
  const citiesOptions = data?.cidade ?? [];
  const familyOptions = data?.familia ?? [];
  const healthOptions = data?.saude ?? [];
  const secretLinkOptions = data?.linkSecreto ?? [];
  const discountCouponOptions =
    data?.pagamento_couponValue?.filter((item) => item !== "none") ?? [];

  const handleFilterChange = (columnKey: string, value: string | string[]) => {
    setFieldFilters(columnKey, value);
  };

  const handleClearFilter = (filter: string) => {
    setLoading(filter);
    setFieldFilters(filter, undefined);
    params.delete(filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setFieldFiltersFromSearchParams = () => {
    const newFilters: FilterParams = {};
    params.forEach((value, key) => {
      if (key === "page" || key === "max") return;
      const currentValues = params.getAll(key);
      newFilters[key] =
        currentValues.length > 1 ? currentValues : currentValues[0];
    });
    Object.entries(newFilters).forEach(([key, value]) => {
      setFieldFilters(key, value);
    });
  };

  useEffect(() => {
    setFieldFiltersFromSearchParams();
  }, []);

  useEffect(() => {
    const paramsFilterClosed = loading;
    if (loading && !searchParams.has(paramsFilterClosed)) {
      setLoading("");
    }
  }, [searchParams, loading]);

  const formatSelectedValue = (field: string) => {
    return Array.isArray(fieldFilters[field])
      ? fieldFilters[field].map((val: string) =>
          val === "null" ? "null" : val,
        )
      : fieldFilters[field]
        ? [fieldFilters[field] === "null" ? "null" : fieldFilters[field]]
        : [];
  };

  const formatSelectedCheckInStatus = () => {
    if (Array.isArray(fieldFilters.checkinStatus)) {
      console.log("entrou dentro do if");
      return fieldFilters.checkinStatus.map((val) => {
        return (
          checkinStatusOptions.find((item) => item.value === val)?.value ?? ""
        );
      });
    } else {
      return [""];
    }
  };

  const buildFilterObject = ({
    field,
    label,
    options,
    multiple = true,
    onValueChange,
    selectedValue = formatSelectedValue(field),
  }: {
    field: string;
    label: string;
    options: { label: string; value: string }[] | string[];
    multiple?: boolean;
    selectedValue?: string[];
    onValueChange?: (value: string | string[]) => void;
  }) => {
    return {
      field: field,
      label,
      loading: loading === field,
      multiple,
      show: visibleColumns.includes(field),
      onValueChange,
      options,
      selectedValue,
    };
  };

  const filterConfigs = [
    buildFilterObject({
      field: "familia",
      options: familyOptions,
      label: "Família",
    }),
    buildFilterObject({
      field: "saude",
      options: healthOptions,
      label: "Saúde",
    }),
    buildFilterObject({
      field: "status",
      options: statusOptions,
      label: "Status da Inscrição",
    }),
    buildFilterObject({
      field: "checkin",
      options: [
        { label: "Sim", value: "true" },
        { label: "Não", value: "null" },
      ],
      multiple: false,
      label: "Check-in",
      onValueChange: (value) => handleFilterChange("checkin", value),
      selectedValue: [
        [
          { label: "Sim", value: "true" },
          { label: "Não", value: "null" },
        ].find((option) => option.value === fieldFilters.checkin)?.label ??
          "Selecione",
      ],
    }),
    buildFilterObject({
      field: "lgnd_funcao",
      options: funcoesLgndOptions,
      label: "Função Legendário",
    }),
    buildFilterObject({
      field: "cartas_recebida",
      options: booleanOptions,
      label: "Cartas Recebidas",
      multiple: false,
      onValueChange: (value) => handleFilterChange("cartas_recebida", value),
      selectedValue: [
        booleanOptions.find(
          (option) => option.value === fieldFilters.cartas_recebida,
        )?.label ?? "Selecione",
      ],
    }),
    buildFilterObject({
      field: "cartas_contato_valido",
      options: booleanOptions,
      label: "Contatos Válidos",
      multiple: false,
      onValueChange: (value) =>
        handleFilterChange("cartas_contato_valido", value),
      selectedValue: [
        booleanOptions.find(
          (option) => option.value === fieldFilters.cartas_contato_valido,
        )?.label ?? "Selecione",
      ],
    }),
    buildFilterObject({
      field: "linkSecreto",
      options: secretLinkOptions,
      label: "Link secreto",
    }),
    buildFilterObject({
      field: "pagamento_couponValue",
      options: discountCouponOptions,
      label: "Cupom de desconto",
      onValueChange: (value) => {
        if (value.some((item) => item === "null")) {
          handleFilterChange("pagamento_couponValue", "none");
          return;
        }
        handleFilterChange("pagamento_couponValue", value);
      },
    }),
    buildFilterObject({
      field: "cidade",
      options: citiesOptions,
      label: "Cidade",
    }),
    buildFilterObject({
      field: "estado",
      options: statesOptions,
      label: "Estado",
    }),
    buildFilterObject({
      field: "checkinStatus",
      options: checkinStatusOptions,
      label: "Documento",
      selectedValue: formatSelectedCheckInStatus(),
    }),
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {filterConfigs
        .filter((config) => config.show) // Filtrar apenas visíveis
        .map((config) => (
          <FilterSelect key={config.field} {...config} />
        ))}
    </div>
  );
};
