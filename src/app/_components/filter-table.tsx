"use client";

import { type Inscricao } from "@prisma/client";
import { type Table } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useFilterParamsStore } from "@/lib/store/FiltersParamsStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterTableItems } from "./filter-table-items";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type FilterTableProps = {
  table: Table<Inscricao>;
  visibleColumns: string[];
};

export const FilterTable = ({ table, visibleColumns }: FilterTableProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const paramsFiltersNotConsider = ["search", "page", "max"];

  const { fieldFilters, clearAllFilters } = useFilterParamsStore();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const applyFilters = () => {
    setLoading(true);
    const filtersParams: Record<string, string> = {};
    Object.entries(fieldFilters).forEach(([key, value]) => {
      params.delete(key);
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((val) => params.append(key, val));
          return;
        }
        params.set(key, value);
        filtersParams[key] = value;
      } else {
        params.delete(key);
        delete filtersParams[key];
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCleanAllFilters = () => {
    const remainingParams = Array.from(searchParams.entries())
      .filter(([key]) => paramsFiltersNotConsider.includes(key))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const newUrl = remainingParams
      ? `${pathname}?${remainingParams}`
      : `${pathname}`;

    clearAllFilters();
    router.replace(newUrl);
  };

  const filtersActive = Object.entries(fieldFilters ?? {})
    .filter(([key]) => !paramsFiltersNotConsider.includes(key))
    .map(([key, value]) => {
      return {
        key,
        value,
      };
    });

  const hasFilterActive = filtersActive.some((item) =>
    searchParams?.has(item.key),
  );

  const areFiltersEqual = (
    filters1: Record<string, string[]>,
    filters2: Record<string, string[]>,
  ) => {
    const keys1 = Object.keys(filters1);
    const keys2 = Object.keys(filters2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => {
      const val1 = filters1[key];
      const val2 = filters2[key];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        return (
          val1.length === val2.length && val1.every((v, i) => v === val2[i])
        );
      }

      return val1 === val2;
    });
  };

  // Obter filtros ativos atuais da URL
  const getCurrentUrlFilters = () => {
    const urlFilters: Record<string, any> = {};

    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (!paramsFiltersNotConsider.includes(key)) {
        if (urlFilters[key]) {
          // Se já existe, transformar em array ou adicionar ao array
          if (Array.isArray(urlFilters[key])) {
            urlFilters[key].push(value);
          } else {
            urlFilters[key] = [urlFilters[key], value];
          }
        } else {
          urlFilters[key] = value;
        }
      }
    });

    return urlFilters;
  };

  // Preparar filtros do store para comparação (removendo valores vazios)
  const getCleanFieldFilters = () => {
    const cleanFilters: Record<string, any> = {};

    Object.entries(fieldFilters).forEach(([key, value]) => {
      if (!paramsFiltersNotConsider.includes(key)) {
        if (
          value &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          cleanFilters[key] = value;
        }
      }
    });

    return cleanFilters;
  };

  // Verificar se há alterações nos filtros
  const hasFilterChanges = React.useMemo(() => {
    const currentUrlFilters = getCurrentUrlFilters();
    const currentFieldFilters = getCleanFieldFilters();

    return !areFiltersEqual(currentUrlFilters, currentFieldFilters);
  }, [fieldFilters, searchParams]);

  // Verificar se há filtros para aplicar
  const hasFiltersToApply = React.useMemo(() => {
    const cleanFilters = getCleanFieldFilters();
    return Object.keys(cleanFilters).length > 0;
  }, [fieldFilters]);

  const shouldEnableApplyButton = hasFiltersToApply && hasFilterChanges;

  useEffect(() => {
    if (hasFilterActive && loading) {
      setOpen(false);
      setLoading(false);
    }
  }, [hasFilterActive, loading]);

  useEffect(() => {
    if (!hasFilterActive) {
      clearAllFilters();
    }
  }, [pathname, clearAllFilters]);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <SheetTrigger asChild>
        <Button
          variant={"outline"}
          onClick={() => setOpen(true)}
          className="relative"
        >
          {hasFilterActive && (
            <span className="absolute -right-5 -top-3 h-3 w-3 rounded-full bg-primary" />
          )}
          <Filter size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col justify-between sm:w-3/4 sm:px-3">
        <div className="space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Filter className="mr-2 size-5" />
              Filtro
            </SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <FilterTableItems visibleColumns={visibleColumns} />
        </div>

        <SheetFooter className="gap-4 sm:gap-0">
          <Button
            className="flex w-full"
            disabled={!hasFilterActive}
            onClick={handleCleanAllFilters}
            variant="secondary"
          >
            Remover Filtro
          </Button>
          <Button
            className="flex w-full"
            disabled={!shouldEnableApplyButton || loading}
            onClick={applyFilters}
          >
            Aplicar Filtro
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
