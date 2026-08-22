import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFilterParamsStore } from "@/lib/store/FiltersParamsStore";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

type FilterActiveBadgeProps = {
  filters?: Record<string, string | undefined>;
};

export const FiltersActiveBadge = ({ filters }: FilterActiveBadgeProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { setFieldFilters } = useFilterParamsStore();
  const [loading, setLoading] = useState("");

  const setArrayOfFilters = () => {
    if (!filters) return [];
    const filtersActive =
      Object.entries(filters).map(([key, value]) => ({
        key,
        value,
      })) ?? [];
    return filtersActive;
  };

  const removeParamsFilter = (keyParams: string) => {
    setLoading(keyParams);
    const params = new URLSearchParams(searchParams);
    setFieldFilters(keyParams, "");
    params.delete(keyParams);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const paramsFilterClosed = loading;
    if (loading && !searchParams.has(paramsFilterClosed)) {
      setLoading("");
    }
  }, [searchParams, loading]);

  const filtersActive = setArrayOfFilters();

  return (
    filtersActive.length > 0 && (
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        <p className="text-xs font-semibold">Filtro aplicado |</p>
        {filtersActive.length > 0 &&
          filtersActive.map((item) => {
            const label = item.key
              .replace(/([A-Z])/g, " $1")
              .replaceAll("_", " ")
              .toLowerCase();

            return (
              <Badge
                key={item.value}
                variant="outline"
                className="duration-100 hover:bg-muted"
              >
                {label}
                <Button
                  variant="secondary"
                  size="icon"
                  className="ml-2 h-3 w-3 cursor-pointer bg-transparent"
                  onClick={() => removeParamsFilter(item.key)}
                >
                  {loading === item.key ? (
                    <Spinner size={16} />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </Badge>
            );
          })}
      </div>
    )
  );
};
