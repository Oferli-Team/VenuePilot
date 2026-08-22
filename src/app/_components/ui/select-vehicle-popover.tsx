import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Bus, Car, CheckIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const SelectItem = ({
  name,
  identifier,
  type,
  hasVacation,
}: {
  name: string;
  identifier: string;
  type: string;
  hasVacation: boolean;
}) => {
  return (
    <div className="flex w-full flex-col items-start text-start">
      <div className="flex space-x-1">
        <span>{name}</span>
        <span className="text-primary">
          {type === "CAR" ? (
            <Car className="h-4 w-4" />
          ) : (
            <Bus className="h-4 w-4" />
          )}
        </span>
      </div>
      <div className="flex w-full justify-between">
        <p className="text-xs text-muted-foreground">{identifier}</p>
        {!hasVacation && (
          <span className="text-xs text-destructive">lotado</span>
        )}
      </div>
    </div>
  );
};

type SelectItemPopoverProps = {
  enabled?: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedId: string | undefined;
  setSelectedId: (id: string) => void;
  options: {
    value: string;
    label: {
      name: string;
      identifier: string;
      type: string;
      hasVacation: boolean;
    };
  }[];
  onUpdate: () => Promise<void>;
  updateLoading?: boolean;
  placeholder?: string;
  description?: (selectedValue: string) => string;
  itemLabel?: string;
};

export const SelectVehiclePopover = ({
  enabled,
  setEnabled,
  selectedId,
  setSelectedId,
  options,
  onUpdate,
  updateLoading,
  description = (selectedValue) => `Deseja atribuir ${selectedValue}?`,
}: SelectItemPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | undefined>("");

  const selectedOption = options.find((option) => option.value === selectedId);

  const handleSelectChange = (value: string) => {
    setSelectedId(value);
    setSelectedValue(options.find((opt) => opt.value === value)?.label.name);
    setOpenDialog(true);
    setOpen(false);
    setEnabled(false);
  };

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await onUpdate();
    setOpenDialog(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex min-h-10 min-w-48 justify-between rounded-md border px-4 py-2 hover:bg-accent">
          {selectedValue === "Nenhum" || !selectedOption ? (
            " - "
          ) : (
            <SelectItem {...selectedOption.label} />
          )}
          <CaretSortIcon className="ml-2 h-4 w-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar..." className="h-12" />
            <CommandList>
              <CommandEmpty>Nenhum encontrado.</CommandEmpty>
              <CommandItem
                value={"null"}
                className="h-14 w-full items-center justify-between"
                onSelect={handleSelectChange}
                onClick={(e) => e.stopPropagation()}
              >
                <p>Nenhum</p>
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedValue === "null" ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={!option.label.hasVacation}
                  onSelect={() => handleSelectChange(option.value)}
                >
                  <SelectItem {...option.label} />

                  <CheckIcon
                    className={`ml-2 h-4 w-4 ${
                      selectedId === option.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              {description(selectedValue ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} loading={updateLoading}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
