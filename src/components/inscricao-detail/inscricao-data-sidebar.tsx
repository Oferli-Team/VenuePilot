import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { type Inscricao } from "@prisma/client";
import { VISIBLE_FIELDS_SIDE_TABLE } from "@/lib/constants";
import { type VisibilityState } from "@tanstack/react-table";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useInscricaoDetail } from "./useInscricaoDetailStore";
import { type AllFieldsProps } from "./allFields";

const createSchema = z.object({
  nome: z.string(),
});

type FormData = z.infer<typeof createSchema>;

export const InscricaoDataSidebar = ({
  fields,
}: {
  fields: AllFieldsProps[];
}) => {
  const { selectedInscricao: data, page } = useInscricaoDetail();
  const [formData, setFormData] = useState<Inscricao | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const createForm = useForm<FormData>({
    resolver: zodResolver(createSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = createForm;

  // TODO: esse código está sendo utilizado ???
  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Lógica para enviar ou processar os dados
  };

  const categorizeFields = (allFields: AllFieldsProps[]) => {
    return allFields.reduce<Record<string, AllFieldsProps[]>>((acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = [];
      }
      acc[field.category].push(field);
      return acc;
    }, {});
  };

  useEffect(() => {
    setFormData(data);
  }, [data]);

  useEffect(() => {
    const visibleColumns = VISIBLE_FIELDS_SIDE_TABLE[page] || [];

    const newVisibilityState = fields.reduce((acc, field) => {
      const key = field.id;
      if (key) {
        acc[key] = visibleColumns.includes(key);
      }
      return acc;
    }, {} as VisibilityState);

    setColumnVisibility(newVisibilityState);
  }, [page, fields]);

  const categorizedFields = categorizeFields(fields);

  const renderFields = Object.entries(categorizedFields).map(
    ([category, fieldsAll]) => {
      // Filtrar campos que estão visíveis para a categoria atual
      const visibleFields = fieldsAll.filter(
        (field) => columnVisibility[field.id],
      );

      // Se não houver campos visíveis, não renderizar a categoria
      if (visibleFields.length === 0) {
        return null;
      }
      return { visibleFields, category };
    },
  );

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderFields.map((fields, i) => (
          <div key={`${fields?.category} - ${i}`}>
            {fields?.category && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <h4 className="text-sm font-bold sm:text-base">
                  {fields?.category}
                </h4>
              </div>
            )}

            <div className={`mt-4 grid grid-cols-1 gap-4 md:grid-cols-2`}>
              {formData &&
                fields?.visibleFields.map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <Label
                      htmlFor={field.id}
                      className="mb-2 block text-xs font-medium opacity-80 sm:text-sm"
                    >
                      {field.label}
                    </Label>
                    {field.component ? (
                      field.component({
                        value: formData[field.id],
                        onChange: () => {},
                        name: field.id,
                      })
                    ) : (
                      <div>
                        <Controller
                          name={field.id}
                          render={({ field: fieldControl }) => (
                            <Input
                              value={fieldControl.value || ""}
                              {...register(field.id as keyof FormData)}
                            />
                          )}
                        />

                        {errors[field.id] && (
                          <span className="mt-1 text-xs text-destructive">
                            {errors[field.id]?.message}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* <button type="submit">salvar</button> */}
      </form>
    </FormProvider>
  );
};
