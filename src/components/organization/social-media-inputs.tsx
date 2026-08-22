"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import Fieldset from "../Fiedset";
import { Input } from "../ui/input";
import { LinkPreview } from "../ui/link-preview";

const socialMedia = [
  {
    name: "socialMediaInstagram",
    icon: FaInstagram,
    label: "Informe perfil do instagram",
    placeholder: "@perfil-da-conta",
    type: "text",
    url: "https://www.instagram.com",
  },
  {
    name: "socialMediaWhatsapp",
    icon: FaWhatsapp,
    label: "Informe o contato do WhatsApp",
    placeholder: "(00) 00000-0000",
    type: "tel",
    url: "https://wa.me",
  },
  {
    name: "socialMediaYoutube",
    icon: FaYoutube,
    label: "Informe link do canal do Youtube",
    placeholder: "perfil-do-canal",
    type: "text",
    url: "https://www.youtube.com",
  },
];

export function SocialMediaInputs({
  isPending = false,
}: Readonly<{
  isPending?: boolean;
}>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <div>
        <p>Redes sociais</p>
        <span className="text-sm text-muted-foreground">
          Clique para adicionar um contato
        </span>
      </div>

      <div className="flex items-center gap-3">
        {socialMedia.map((item) => (
          <Popover key={item.label}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className={`rounded-full ${errors[item.name] ? "bg-destructive hover:bg-destructive/90" : ""}`}
              >
                <item.icon className={`size-5`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Fieldset
                legend={item.label}
                validationMessage={errors[item.name]}
              >
                <Controller
                  name={item.name}
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <Input
                          {...field}
                          value={(field.value as string) ?? ""}
                          disabled={isPending}
                          placeholder={item.placeholder}
                          type={item.type}
                        />
                        {field.value && (
                          <LinkPreview
                            redirect={false}
                            url={`${item.url}/${field.value ?? ""}`}
                            className="mt-1 text-xs text-muted-foreground"
                          >
                            Confira seu link
                          </LinkPreview>
                        )}
                      </>
                    );
                  }}
                />
              </Fieldset>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
}
