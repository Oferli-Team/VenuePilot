'server-only';

import { api } from "@/trpc/server";


export const getCupomByCodigo = async (codigo: string) => {
 const data = await api.cupom.getByCodigo({
    codigo
  });
   
  return data;
};