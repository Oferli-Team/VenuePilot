export function maskCPF(cpf: string) {
  const maskedCPF = `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
  return maskedCPF;
}

export function maskCNPJ(cnpj: string) {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return cnpj;
  return `***.***.${clean.slice(6, 9)}/${clean.slice(9, 13)}-**`;
}
