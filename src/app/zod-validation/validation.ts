"use client";

import { z } from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { isBefore, parse, subYears } from "date-fns";
import { PhoneNumberUtil } from "google-libphonenumber";
import cardValidator from "card-validator";
import { unmask } from "remask";

export const errorMessage = "Este campo é obrigatório";
export const errorInputRadio = "Selecione uma opção";

export const isValidCpf = (value: string) => {
  // Remove todos os caracteres não numéricos do CPF
  const cleanedCpf = value.replace(/[^\d]/g, "");

  // Verifica se o CPF tem 11 dígitos e não consiste em dígitos iguais
  if (cleanedCpf.length !== 11 || /^(\d)\1+$/.test(cleanedCpf)) {
    return false;
  }

  // Verifica os dígitos verificadores
  const cpfDigits = cleanedCpf.split("").map(Number);

  const calcDigit = (digits: number[], factor: number) => {
    const sum = digits.reduce((acc: number, digit: number, index: number) => {
      const weight = factor - index;
      return acc + digit * weight;
    }, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(cpfDigits.slice(0, 9), 10);
  const secondDigit = calcDigit(cpfDigits.slice(0, 9).concat(firstDigit), 11);

  return cpfDigits[9] === firstDigit && cpfDigits[10] === secondDigit;
};

export const isValidCpfCnpj = (value: string) => {
  return cpf.isValid(value) || cnpj.isValid(value);
};

export const createZodValidationRadioField = () => {
  return z
    .string({ message: errorInputRadio })
    .refine((value: string) => value === "true" || value === "false", {
      message: errorInputRadio,
    })
    .refine((value: string) => value !== undefined && value !== null, {
      message: errorInputRadio,
    });
};

export const createZodValidationToStringRequired = () => {
  return z
    .string({ message: errorMessage })
    .refine((value) => value.length !== 0, { message: errorMessage })
    .transform((value) => value.trim());
};

export const createZodValidationToNumbersAndSymbolsFields = () => {
  return z
    .string({ message: errorMessage })
    .refine((value: string) => /^[0-9.()-\s]+$/.test(value), {
      message: "Digite apenas números",
    });
};

export const createZodCPFValidation = () => {
  return z
    .string({ required_error: "Campo obrigatório" })
    .refine(isValidCpf, { message: "Digite um CPF válido" })
    .transform((value) => unmask(value));
};

export const createZodValidationJustNumbers = () => {
  return z
    .string({ message: errorMessage })
    .refine((value) => value.length !== 0, { message: errorMessage })
    .refine((value: string) => /^\d+$/.test(value), {
      message: "Digite apenas números",
    });
};

export const validateDateOfBirth = (value: string) => {
  const data = value.split("/");
  const day = Number(data[0]);
  const month = Number(data[1]);
  const year = Number(data[2]);

  const isValidDate =
    /^\d{2}\/\d{2}\/\d{4}$/.test(value) &&
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 1900;

  if (isValidDate) return true;
  return false;
};

export const validateIfIsAtLeast15YearsOld = (value: string) => {
  // Converte a string no formato dd/MM/yyyy para um objeto Date
  const birthDate = parse(value, "dd/MM/yyyy", new Date());

  // Calcula a data mínima para ter 15 anos
  const minimumDate = subYears(new Date(), 15);

  const isUnderAng =
    isBefore(birthDate, minimumDate) ||
    birthDate.getTime() === minimumDate.getTime();

  return isUnderAng;
};

export const validatePhoneNumber = (value: string) => {
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

type CreditCardData = {
  cc_number: string;
  cc_cvc: string;
};

export const validateCreditCard = (data: CreditCardData) => {
  const errors: { path: string[]; message: string }[] = [];
  const { cc_number, cc_cvc: cvc } = data;

  const { card } = cardValidator.number(cc_number);

  if (card) {
    // Validar o CVC com base no tipo do cartão
    if (card.type === "american-express") {
      if (!/^\d{4}$/.test(cvc)) {
        errors.push({
          path: ["cc_cvc"],
          message: "Preencha corretamente o Código CVC",
        });
      }
    } else {
      if (!/^\d{3}$/.test(cvc)) {
        errors.push({
          path: ["cc_cvc"],
          message: "Preencha corretamente o Código CVC",
        });
      }
    }
  } else {
    errors.push({
      path: ["cc_cvc"],
      message: "Número do cartão inválido",
    });
  }

  return errors;
};

export const maritalStatusOptions = [
  "Solteiro",
  "Casado",
  "Viúvo",
  "Divorciado",
];

export const acceptedCardTypes = [
  "visa",
  "mastercard",
  "american-express",
  "cielo",
  "diners-club",
  "hipercard",
  "elo",
  "discover",
];
