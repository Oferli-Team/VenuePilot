import { z } from "zod";

import { cpf, cnpj } from "cpf-cnpj-validator";
import { unmask } from "remask";
import { PhoneNumberUtil } from "google-libphonenumber";

const optionalUrl = z.string().optional();

const validatePhoneNumber = (value: string) => {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const isPhoneValid = (phone: string) => {
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("+")
        ? cleanPhone
        : `+${cleanPhone}`;

      const number = phoneUtil.parseAndKeepRawInput(formattedPhone);
      const isValid = phoneUtil.isValidNumber(number);

      return isValid;
    } catch (error) {
      return false;
    }
  };

  return isPhoneValid(value);
};

const required_error = "Campo obrigatório";

export const baseOrganizationSchema = z.object({
  name: z
    .string({ required_error })
    .min(3)
    .transform((value) => value.trim()),
  domain: z.string().optional(),
  shouldAttachUsersByDomain: z.boolean().default(false),
  avatarUrl: z.string().optional(),
  cnpj: z
    .string({ required_error })
    .refine((value) => cnpj.isValid(String(value)), {
      message: "Informe CNPJ válido",
    })
    .transform((value) => unmask(value).trim()),
  // bankAgency: z.string({ required_error }),
  // bankCount: z.string({ required_error }),
  pixKeyType: z.enum(["cpf", "cnpj", "email", "phone", "random"], {
    required_error: "Selecione o tipo da chave Pix",
  }),
  pixKey: z
    .string({ required_error })
    .min(1, "Informe a chave Pix")
    .transform((value) => unmask(value).trim()),
  managerName: z.string({ required_error }),
  managerPhone: z
    .string({ required_error })
    .refine((value) => validatePhoneNumber(value), {
      message: "Preencha celular corretamente",
    })
    .transform((value) => {
      const cleanPhone = value.replace(/\D/g, "");
      return cleanPhone.trim();
    }),
  supportContact: z
    .string()
    .optional()
    .refine((value) => !value || validatePhoneNumber(value), {
      message: "Preencha celular corretamente",
    })
    .transform((value) => {
      if (!value) return value;
      const cleanPhone = value.replace(/\D/g, "");
      return cleanPhone.trim();
    }),
  socialMediaInstagram: optionalUrl,
  socialMediaWhatsapp: optionalUrl,
  socialMediaYoutube: optionalUrl,
});

export const createOrganizationSchema = baseOrganizationSchema.superRefine(
  (data, ctx) => {
    const { pixKeyType, pixKey } = data;
    const value = unmask(pixKey).trim();

    const addError = (message: string) =>
      ctx.addIssue({
        path: ["pixKey"],
        message,
        code: z.ZodIssueCode.custom,
      });

    switch (pixKeyType) {
      case "cpf":
        if (!cpf.isValid(value)) addError("CPF inválido");
        break;
      case "cnpj":
        if (!cnpj.isValid(value)) addError("CNPJ inválido");
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          addError("E-mail inválido");
        break;
      case "phone":
        if (!validatePhoneNumber(value)) addError("Telefone inválido.");
        break;
      case "random":
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value,
          )
        ) {
          addError("Chave aleatória inválida");
        }
        break;
    }
  },
);

// Schema for updating an organization
export const updateOrganizationSchema = baseOrganizationSchema.partial();
