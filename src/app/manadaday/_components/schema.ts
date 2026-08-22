import { unmask } from "remask";
import { z } from "zod";
import {
  isValidCpf,
  isValidCpfCnpj,
  validatePhoneNumber,
} from "@/app/zod-validation/validation";
import { stringToBoolean } from "@/lib/constants";
import { MANADA_DAY } from "../participar/constant";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";

export const participantSchema = z.object({
  participants: z.array(
    z
      .object({
        name: z.string({ required_error: "Nome é obrigatório" }).trim(),
        cpf: z.string().optional(),
        type: z.enum(["ADULT", "PAID_CHILD", "FREE_CHILD"]),
        value: z.number(),
      })
      .refine(
        (data) => {
          // CPF é obrigatório apenas para adultos
          if (data.type === "ADULT") {
            return data.cpf && data.cpf.trim().length > 0;
          }
          return true; // CPF é opcional
        },
        {
          message: "CPF é obrigatório",
          path: ["cpf"],
        },
      )
      .refine(
        (data) => {
          // Validar CPF apenas se for obrigatório e estiver preenchido
          if (data.type === "ADULT" && data.cpf && data.cpf.trim().length > 0) {
            return isValidCpf(data.cpf);
          }
          return true;
        },
        {
          message: "CPF inválido",
          path: ["cpf"],
        },
      )
      .refine(
        (data) => {
          if (
            data.type === "ADULT" ||
            data.type === "PAID_CHILD" ||
            data.type === "FREE_CHILD"
          ) {
            return data.name && data.name.trim().length > 0;
          }
          return true;
        },
        {
          message: "Nome é obrigatório",
          path: ["name"],
        },
      )
      .transform((data) => ({
        name: data.name.trim(),
        type: data.type,
        cpf: data.cpf && unmask(data.cpf),
        value: convertToBasisPoint(MANADA_DAY.ticketsValue[data.type]),
      })),
  ),
  name: z
    .string({
      required_error: "Campo nome é obrigatório",
    })
    .refine(
      (value) => {
        return value.trim().split(/\s+/).length >= 2;
      },
      {
        message: "Preencha nome e sobrenome",
      },
    )
    .transform((value) => value.trim()),
  email: z
    .string({ required_error: "Informe um E-mail" })
    .email({ message: "Informe um e-mail válido" })
    .transform((value) => value.trim()),
  cpf: z
    .string({ required_error: "Informe um CPF" })
    .refine(isValidCpfCnpj, {
      message: "Digite um CPF válido",
    })
    .transform((val) => val.replace(/[^\d]/g, "")),
  phone: z
    .string({ required_error: "Informe número de celular" })
    .refine(validatePhoneNumber, {
      message: "Informe um celular válido",
    })
    .transform((value) => unmask(value)),
  isLegendary: z
    .string({ required_error: "Campo Obrigatório" })
    .transform((value) => stringToBoolean(value)),
  legendaryNumber: z.string().optional(),
});
