import parsePhoneNumberFromString from "libphonenumber-js";
import { allowedCountry, countryCodeMap } from "../constants";

export const formatPhoneNumber = (phone: string) => {
  const code = allowedCountry.codes.find((code) => phone.startsWith(code));

  if (code) {
    const country = countryCodeMap[code];
    console.log("País:", country);

    const phoneNumber = parsePhoneNumberFromString(phone, country);
    if (phoneNumber) {
      console.log("Número formatado:", phoneNumber.formatInternational());
      return phoneNumber.formatInternational();
    } else {
      console.log("Número inválido.");
    }
  } else {
    console.log("Código de país não encontrado.");
  }
  const phoneNumber = parsePhoneNumberFromString(phone, "BR");
  return phoneNumber?.formatInternational();
};
