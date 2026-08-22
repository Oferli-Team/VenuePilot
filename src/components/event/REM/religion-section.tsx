import type { RegisterSection } from "@/lib/types";
import Fieldset from "../../Fiedset";
import { GridTwoColumns } from "../../grid-two-columns";
import { Input } from "../../ui/input";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

type ReligionSection = Omit<RegisterSection, "selectOptions">;

export const ReligionSection = ({
  title = "Religião",
  disabled,
  className,
  sectionOnBlur,
  sectionOnFocus,
}: ReligionSection) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <GridTwoColumns title={title} className={cn(className)}>
      <Fieldset
        legend="Nome da sua igreja/comunidade?"
        validationMessage={errors.igreja}
        isRequired
      >
        <Input
          {...register("igreja")}
          placeholder="Igreja..."
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>

      <Fieldset
        isRequired
        validationMessage={errors.igreja_pastor}
        legend="Nome do seu pastor/padre/lider?"
      >
        <Input
          {...register("igreja_pastor")}
          placeholder="Pr ..."
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
    </GridTwoColumns>
  );
};
