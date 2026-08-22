import { Controller, useFormContext } from "react-hook-form";
import Fieldset from "../Fiedset";
import { GridThreeColumns } from "../grid-three-column";
import { Input } from "../ui/input";
import { DollarSign, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { CurrencyInput } from "react-currency-mask";
import { CopyButton } from "../ui/copy-button";

export const TicketRem = () => {
  const {
    formState: { errors },
    control,
  } = useFormContext();
  return (
    <>
      <div className="flex flex-col gap-2 rounded-md bg-background p-2">
        <GridThreeColumns
          title="Casal que irá participar pela primeira vez"
          className="items-center"
        >
          <Fieldset
            legend="Máximo de Vagas"
            validationMessage={errors.vagasParticipar}
          >
            <Controller
              control={control}
              name="vagasParticipar"
              render={({ field }) => (
                <Input
                  type="tel"
                  {...field}
                  value={field.value ?? ""}
                  leftIcon={<Users className="size-4" />}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Valor do ingresso"
            validationMessage={errors.valorParticipante}
          >
            <Controller
              control={control}
              name="valorParticipante"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChangeValue={field.onChange}
                  InputElement={
                    <Input
                      type="tel"
                      leftIcon={<DollarSign className="size-4" />}
                    />
                  }
                />
              )}
            />
          </Fieldset>
        </GridThreeColumns>

        <Fieldset
          legend="Link do convite do grupo do WhatsApp"
          validationMessage={errors.linkWhatsappGrupoParticipante}
        >
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Este link será enviado após a confimação de inscrição do casal{" "}
            </p>
            <Controller
              control={control}
              name="linkWhatsappGrupoParticipante"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://chat.whatsapp.com"
                  leftIcon={<FaWhatsapp className="size-4" />}
                  rightIcon={<CopyButton textToCopy={field.value as string} />}
                />
              )}
            />
          </div>
        </Fieldset>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-background p-2">
        <GridThreeColumns title="Casal que irá Servir" className="items-center">
          <Fieldset
            legend="Máximo de vagas"
            validationMessage={errors.vagasServir}
            className="col-span-full md:w-1/2"
          >
            <Controller
              control={control}
              name="vagasServir"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="tel"
                  leftIcon={<Users className="size-4" />}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Valor ingresso para quem NÃO vai adquirir a camiseta do evento"
            validationMessage={errors.valorParaLgndCertificados}
          >
            <Controller
              control={control}
              name="valorParaLgndCertificados"
              render={({ field }) => (
                <CurrencyInput
                  onChangeValue={field.onChange}
                  value={field.value ?? ""}
                  InputElement={
                    <Input
                      type="tel"
                      leftIcon={<DollarSign className="size-4" />}
                    />
                  }
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Valor ingresso para quem vai adquirir a camiseta do evento"
            validationMessage={errors.valorParaObterCertificacao}
          >
            <Controller
              control={control}
              name="valorParaObterCertificacao"
              render={({ field }) => (
                <CurrencyInput
                  onChangeValue={field.onChange}
                  value={field.value ?? ""}
                  InputElement={
                    <Input
                      type="tel"
                      leftIcon={<DollarSign className="size-4" />}
                    />
                  }
                />
              )}
            />
          </Fieldset>
        </GridThreeColumns>

        <Fieldset
          legend="Link do convite do grupo do WhatsApp"
          validationMessage={errors.linkWhatsappGrupoServir}
        >
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Este link será enviado após a confimação de inscrição do
              legendário{" "}
            </p>
            <Controller
              control={control}
              name="linkWhatsappGrupoServir"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://chat.whatsapp.com"
                  leftIcon={<FaWhatsapp className="size-4" />}
                  rightIcon={<CopyButton textToCopy={field.value as string} />}
                />
              )}
            />
          </div>
        </Fieldset>
      </div>
    </>
  );
};
