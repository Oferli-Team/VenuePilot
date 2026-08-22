import React, { useMemo } from "react";
import { FilterItem } from "./filter-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/selects";
import {
  MultiSelectActions,
  MultiSelectContent,
  MultiSelectOption,
  MultiSelectOptions,
  MultiSelectRoot,
  MultiSelectSearch,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectValueItem,
} from "./ui/multi-select";
import { useFilterParamsStore } from "@/lib/store/FiltersParamsStore";
import { Badge } from "./ui/badge";

type FilterSelectProps = {
  field: string;
  label: string;
  onValueChange?: (value: string | string[]) => void;
  options: string[] | { value: string; label: string }[];
  selectedValue: string | string[];
  loading: boolean;
  multiple?: boolean;
};

export const FilterSelect = ({
  field,
  label,
  onValueChange,
  options,
  selectedValue,
  loading,
  multiple = false,
}: FilterSelectProps) => {
  const { fieldFilters, setFieldFilters } = useFilterParamsStore();

  const value = useMemo(() => {
    return Array.isArray(fieldFilters[field])
      ? fieldFilters[field]
      : fieldFilters[field]
        ? [fieldFilters[field]]
        : [];
  }, [fieldFilters, field]);

  const handleChange = (selected: string) => {
    onValueChange && onValueChange(selected);
  };

  const getDisplayValue = () => {
    const selectedOptions = options
      .map((option) => {
        const isString = typeof option === "string";
        const optionValue = isString ? option : option.value;
        const optionLabel = isString ? option : option.label;

        return selectedValue.includes(optionValue)
          ? {
              label: optionLabel,
              value: optionValue,
            }
          : null;
      })
      .filter(Boolean);

    return selectedOptions;
  };

  const handleRemoveItem = (item: string) => {
    const filtered = value.filter((_value) => _value !== item);
    setFieldFilters(field, filtered);
  };
  const handleFilterChange = (columnKey: string, value: string | string[]) => {
    setFieldFilters(columnKey, value);
  };

  return (
    <FilterItem loading={loading} key={field} label={label}>
      {multiple ? (
        <MultiSelectRoot
          value={value}
          onValueChange={(value) => handleFilterChange(field, value)}
        >
          <MultiSelectTrigger>
            <MultiSelectValue maxDisplay={3} className="flex flex-wrap gap-1">
              {getDisplayValue().length > 0 ? (
                getDisplayValue()
                  .slice(0, 3)
                  .map((item) => {
                    return (
                      <MultiSelectValueItem
                        key={item?.value}
                        value={item?.value ?? ""}
                        label={item?.label === "null" ? "Nenhum" : item?.label}
                        onRemove={() => handleRemoveItem(item?.value ?? "")}
                      />
                    );
                  })
              ) : (
                <p className="text-muted-foreground">Selecione</p>
              )}
              {getDisplayValue().length > 3 && (
                <Badge variant="secondary">
                  +{getDisplayValue().length - 3} mais
                </Badge>
              )}
            </MultiSelectValue>
            <MultiSelectActions showClear={false} />
          </MultiSelectTrigger>
          <MultiSelectContent>
            <MultiSelectSearch />
            <MultiSelectOptions>
              {options.map((option) => {
                const isString = typeof option === "string";
                const optionValue = isString ? option : option.value;
                const optionLabel = isString ? option : option.label;
                return (
                  <MultiSelectOption key={optionValue} value={optionValue}>
                    {optionValue === "null" ? "Nenhum" : optionLabel}
                  </MultiSelectOption>
                );
              })}
            </MultiSelectOptions>
          </MultiSelectContent>
        </MultiSelectRoot>
      ) : (
        <Select value={value[0] ?? ""} onValueChange={handleChange}>
          <SelectTrigger size="sm" className={`h-auto min-h-10 w-full gap-2`}>
            <SelectValue placeholder="Selecione">{selectedValue}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options?.map((option, i) => {
              const isString = typeof option === "string";
              const optionValue = isString ? option : option.value;
              const optionLabel = isString ? option : option.label;
              return (
                <SelectItem
                  size="sm"
                  key={`${optionValue} - ${i + 1}`}
                  value={optionValue}
                  className={`cursor-pointer`}
                >
                  {optionLabel === "null" ? "Nenhum" : optionLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </FilterItem>
  );
};
