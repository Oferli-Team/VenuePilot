import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { debounce } from "@/lib/utils/debounce";
import { Spinner } from "./ui/spinner";
import { type Loading } from "@/lib/types";
import { Search } from "lucide-react";

export const InputSearch = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = React.useState(urlSearch);
  const [loading, setLoading] = React.useState<Loading>("initial");

  const setParamsWithSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("search", value);
      params.set("page", "1"); // always back to the first page
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const debouncedSetParams = React.useMemo(() => {
    return debounce(setParamsWithSearch, 600);
  }, [searchParams, pathname, router]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const cleaned = value.replace(/[.,-]/g, ""); // remove all . and -
    setSearch(value);

    debouncedSetParams(cleaned);
    setLoading("loading");
  };

  React.useEffect(() => {
    if (urlSearch === search) {
      setLoading("initial");
    }
  }, [searchParams, search, urlSearch]);

  return (
    <Input
      placeholder="Busque por nome, doc, email, Nr LGND"
      value={search ?? ""}
      onChange={handleSearchChange}
      inputSize="sm"
      autoFocus
      leftIcon={<Search className="size-4" />}
      rightIcon={loading === "loading" && <Spinner size={24} />}
    />
  );
};
