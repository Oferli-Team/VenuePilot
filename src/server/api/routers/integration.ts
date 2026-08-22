import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const integrationRoute = createTRPCRouter({

  getConfirmedRegistration: publicProcedure
    .input(z.object({
      topNumber: z.number(),
      secret_token: z.string(),
      orderBy: z.enum(['nome', 'saude', 'familia', 'createdAt']).default('nome'),
      orderType: z.enum(['asc', 'desc']).default('asc')
    }))
    .query(async ({ ctx, input }) => {

      if (input.secret_token !== process.env.SECRET_TOKEN_HAKUNAS_TAG) {
        throw new Error(`Token: ${input.secret_token} inválido, acesso não autorizado.`);
      }

      const evento = await ctx.db.evento.findFirst({
        where: {
          topNumero: input.topNumber,
        },
      })

      if (!evento) {
        throw new Error(`Evento não encontrado com o topNumber: ${input.topNumber}`);
      }

      const inscricoes = await ctx.db.inscricao.findMany({
        where: {
          eventoId: evento.id,
          status: 'CONFIRMADA',
          tipoInscricao: 'PARTICIPANTE',
        },
        orderBy: { [input.orderBy]: input.orderType },
        select: {
          checkinCode: true,
          saude: true,
          saude_obs: true,
          familia: true,
          nome: true,
          cpf: true,
          estado: true,
          cidade: true,
          peso: true,
          altura: true,
          imc: true,
          biotipo: true,
          dataNascimento: true,
          possuiPlanoSaude: true,
          nomePlanoSaude: true,
          possuiAlergia: true,
          possuiDiabetes: true,
          possuiConvulsoes: true,
          possuiDesmaios: true,
          possuiProblemasCardiacos: true,
          possuiDisturbiosAlimentares: true,
          possuiProblemasRespiratorios: true,
          cuidadosPsiquiatricos: true,
          medicacaoDepressao: true,
          possuiProblemasMusculoesqueleticos: true,
          doencaOuCondicao: true,
          medicacoes: true,
          outrasInformacoesMedicas: true,
        },
      });

      if (!inscricoes) {
        throw new Error(`Nenhuma inscrição encontrada para o evento com o topNumber: ${input.topNumber}`);
      }

      return inscricoes;
    }),
});
