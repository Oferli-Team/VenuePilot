import { unmask } from "remask";

// Função para desmascarar e limpar dados
export const cleanData = (str: string) => unmask(str).trim();

// Função para remover DDI 55 do número de telefone para ASAAS
export const cleanPhoneForAsaas = (phone: string) => {
  const cleanPhone = cleanData(phone);
  
  // Remove o DDI 55 se estiver presente
  if (cleanPhone.startsWith("55")) {
    return cleanPhone.substring(2);
  }
  
  return cleanPhone;
};
