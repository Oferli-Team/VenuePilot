import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./selects";

export const TablePaginationTotalItems = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSelectChange = (itemsPerPage: string) => {
    const params = new URLSearchParams(searchParams);

    if (itemsPerPage) {
      params.set("max", itemsPerPage);
    } else {
      params.delete("max");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pageSizeOptions = ["20", "30", "40", "50"];

  const value = searchParams.get("max") ?? "20";

  return (
    <Select onValueChange={(value) => handleSelectChange(value)} value={value}>
      <SelectTrigger size="sm" className="w-fit">
        <SelectValue placeholder="20" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {pageSizeOptions.map((option, i) => (
            <SelectItem size="sm" key={`item - ${i + 1}`} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
