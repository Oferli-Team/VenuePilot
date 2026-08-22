import { differenceInYears, parse } from "date-fns";

export const calculateAge = (dataNascimento: string) => {
  const dataNascimentoObj = parse(dataNascimento, "dd/MM/yyyy", new Date());

  const hoje = new Date();
  const idade = differenceInYears(hoje, dataNascimentoObj);

  return idade;
};
