"use client";

import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../../Fiedset";
import { GridTwoColumns } from "../../grid-two-columns";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import type { RegisterSection } from "@/lib/types";
import { cn } from "@/lib/utils";

type HealthSection = Omit<RegisterSection, "selectOptions">;

export const HealthSection = ({
  title = "Dados de Saúde do Casal",
  className,
  disabled,
  sectionOnBlur,
  sectionOnFocus,
}: HealthSection) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <GridTwoColumns title={title} className={cn(className)}>
      <Fieldset
        isRequired
        legend="Esposa está grávida?"
        validationMessage={errors.isPregnant}
      >
        <div className="flex items-center">
          <Controller
            name="isPregnant"
            control={control}
            render={({ field }) => (
              <RadioGroup
                disabled={disabled}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
                onFocus={sectionOnFocus}
                onBlur={sectionOnBlur}
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="true"
                    id="isPregnant-1"
                    className="border-input bg-background ring-offset-background"
                  />
                  <Label htmlFor="isPregnant-1">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="false"
                    id="isPregnant-2"
                    className="border-input bg-background ring-offset-background"
                  />
                  <Label htmlFor="isPregnant-2">Não</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
      </Fieldset>

      <Fieldset
        isRequired
        legend="O casal tem algum problema que não poderá fazer atividade física?"
        validationMessage={errors.hasHealthIssues}
      >
        <div className="flex items-center">
          <Controller
            name="hasHealthIssues"
            control={control}
            render={({ field }) => (
              <RadioGroup
                disabled={disabled}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
                onFocus={sectionOnFocus}
                onBlur={sectionOnBlur}
                className="flex items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="true"
                    id="hasHealthIssues-1"
                    className="border-input bg-background ring-offset-background"
                  />
                  <Label htmlFor="hasHealthIssues-1">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="false"
                    id="hasHealthIssues-2"
                    className="border-muted bg-background ring-offset-background"
                  />
                  <Label htmlFor="hasHealthIssues-2">Não</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
      </Fieldset>

      <Fieldset
        legend="Detalhe observação ou problema de saúde do casal"
        validationMessage={errors.healthIssuesDescription}
      >
        <Textarea
          {...register("healthIssuesDescription")}
          disabled={disabled}
          onFocus={sectionOnFocus}
          onBlur={sectionOnBlur}
        />
      </Fieldset>
    </GridTwoColumns>
  );
};
