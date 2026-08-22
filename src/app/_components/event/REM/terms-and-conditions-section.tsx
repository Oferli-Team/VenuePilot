import { Controller, useFormContext } from "react-hook-form";
import { GridTwoColumns } from "../../grid-two-columns";
import { TermAndConditional } from "../../term-and-conditionals";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import type { RegisterSection } from "@/lib/types";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

type TermsAndConditionsSection = Omit<RegisterSection, "selectOptions">;

export const TermsAndConditionsSection = ({
  title = "Termos e condições",
  disabled,
  sectionOnBlur,
  sectionOnFocus,
}: TermsAndConditionsSection) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const isMobile = useIsMobile();

  return (
    <GridTwoColumns title={title}>
      <div className="col-span-full flex w-full flex-col gap-4 sm:gap-0">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button">Ler Termo</Button>
            </SheetTrigger>
            <SheetContent className="w-[90%]">
              <SheetHeader>
                <SheetTitle />
                <SheetDescription />
              </SheetHeader>
              <TermAndConditional className="max-h-[90%] p-0 pb-2" />
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="secondary">
                    Fechar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <TermAndConditional />
        )}
        <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-orange-50 dark:has-[[aria-checked=true]]:border-orange-900 dark:has-[[aria-checked=true]]:bg-orange-950">
          <Controller
            name="aceitaTermos"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="check-term"
                disabled={disabled}
                checked={field.value as boolean}
                onCheckedChange={(e) => field.onChange(e)}
                className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-orange-700 dark:data-[state=checked]:bg-orange-700"
                onFocus={sectionOnFocus}
                onBlur={sectionOnBlur}
              />
            )}
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm font-medium leading-none sm:text-base">
              Declaro que li e estou de acordo.
            </p>
            {isMobile && (
              <p className="text-sm text-muted-foreground">
                Clique em Ler termo, leia o conteúdo e aceite para prosseguir
                com a inscrição.
              </p>
            )}
            <p className="text-sm text-destructive">
              {errors.aceitaTermos?.message?.toString()}
            </p>
          </div>
        </Label>
      </div>
    </GridTwoColumns>
  );
};
