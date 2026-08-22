"use client";

import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContainerSpace } from "@/components/ui/container";
import { Ticket, type TicketProps } from "@/components/ticket/ticket";
import { mask, unmask } from "remask";
import { getAllInscricaoByCPF } from "@/lib/queries/client";
import { Search, TicketCheck, TicketIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cpfValidationSchema } from "../zod-validation/schemas";
import { type Loading } from "@/lib/types";
import { type z } from "zod";
import { Heading } from "@/components/ui/heading";
import { useRouter } from "nextjs-toploader/app";
import { Section } from "@/components/ui/section";
import { Spinner } from "@/components/ui/spinner";

type FormCPF = z.infer<typeof cpfValidationSchema>;

export default function TicketPage() {
  const router = useRouter();

  const [tickets, setTickets] = React.useState<TicketProps[] | []>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState<Loading>("initial");

  const createCpfForm = useForm<FormCPF>({
    resolver: zodResolver(cpfValidationSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = createCpfForm;

  const onSubmit = async (data: FormCPF) => {
    const cpf = unmask(data.cpfInitial);
    setLoading("loading");
    setError("");
    try {
      const registers = await getAllInscricaoByCPF(cpf);

      if (!registers.length) {
        setTickets(registers);
        setError("Ops, não encontramos nenhum resultado para o CPF informado.");
        setLoading("initial");
        return;
      }

      setTickets(registers);
      setError("");
      setLoading("initial");
    } catch (error) {
      console.log(error);
    }
  };

  const handleBackButton = () => {
    if (document.referrer === window.location.href) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <Section>
      <ContainerSpace>
        <div className="mt-20">
          <Button
            type="button"
            variant="link"
            className="mb-4"
            onClick={handleBackButton}
          >
            Voltar
          </Button>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <Heading title="Ticket" icon={TicketCheck} />

            <FormProvider {...createCpfForm}>
              <form
                className="w-full sm:w-fit"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="cpfInitial"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={loading === "loading"}
                      className="w-full sm:min-w-[24rem]"
                      placeholder="Digite seu CPF"
                      value={mask(field.value, "999.999.999-99") ?? ""}
                      autoFocus
                      rightIcon={
                        <Button
                          type="submit"
                          loading={loading === "loading"}
                          className="group px-2 py-4"
                        >
                          <Search className="group-hover:scale-105" />
                        </Button>
                      }
                    />
                  )}
                />

                <p className="mt-2 h-6 w-full text-sm text-destructive">
                  {errors.cpfInitial?.message}
                </p>
              </form>
            </FormProvider>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 pb-8">
          {tickets.length > 0 &&
            tickets.map((ticket) => (
              <Ticket key={ticket.register.id} {...ticket} />
            ))}

          {!tickets.length && (
            <div className="flex h-48 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-input bg-card p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border  bg-background shadow-lg">
                {loading === "loading" ? (
                  <Spinner />
                ) : (
                  !error && <TicketIcon size={32} className="text-primary" />
                )}

                {error && <X size={32} className="text-primary" />}
              </div>

              <div className="text-center text-sm font-semibold sm:text-base">
                {loading === "loading" ? (
                  <p>Buscando Ticket, aguarde...</p>
                ) : (
                  !error && (
                    <p>
                      Informe o CPF do participante para buscar a inscrição.
                    </p>
                  )
                )}
              </div>

              {error && (
                <p className="text-center text-sm font-semibold sm:text-base">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </ContainerSpace>
    </Section>
  );
}
