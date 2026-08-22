export const normalizeValue = (value: string) => {
  return value
    .normalize("NFD") // separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos
    .replace(/[.,\-]/g, "") // remove ., -
    .replace(/[^\w\s]/g, "") // remove outros caracteres especiais, se quiser
    .toLowerCase(); // deixa tudo minúsculo
};
