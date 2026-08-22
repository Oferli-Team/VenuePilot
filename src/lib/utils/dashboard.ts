import { type PrismaClient } from "@prisma/client";
import { calcFee } from "./calcPlatformFee";
import { convertFromBasisPoint } from "./basisPoint";
import type { ENUM_EVENT_TYPE } from "../enum";
import { labelsFinancialReportParticipantAndServeByEventType } from "../constants";

type RegisterSummary = {
  tipoInscricao: string;
  totalRegisterFree: number;
  totalRegisterWithDiscount: number;
  totalRegisterNoDiscount: number;
  totalRegister: number;
  salesWithDiscount: number;
  salesNoDiscount: number;
  totalSales: number;
  valueToPassOn: number;
};

type DashboardSummary = {
  itopFee: {
    totalValue: number;
  };
  data: RegisterSummary[];
};

type CalcValuePaidResult = {
  totalSales: number;
  totalSalesNoDiscount: {
    count: number;
    value: number;
  };
  totalSalesWithDiscount: {
    count: number;
    value: number;
  };
};

type CalcValuePaidOptions = {
  db: PrismaClient;
  eventId: string;
  tipoInscricao: "PARTICIPANTE" | "SERVIR";
  lgndCertificado?: boolean | null;
};

export const getRegisterFree = async (
  db: PrismaClient,
  eventId: string,
  tipoInscricao: string,
  lgndCertificado: boolean | null,
) =>
  db.inscricao.count({
    where: {
      eventoId: eventId,
      tipoInscricao,
      ...(lgndCertificado !== null && { lgndCertificado }),
      metodo_pagamento: "CUPOM_GRATUITO",
      pagamento_status: "GRATUITO",
      status: "CONFIRMADA",
    },
  });

export const buildRegisterSummary = (
  tipoInscricao: string,
  totalRegisterFree: number,
  totalRegisterWithDiscount: number,
  totalRegisterNoDiscount: number,
  salesWithDiscount: number,
  salesNoDiscount: number,
  totalSales: number,
  itopFee: number,
): RegisterSummary => ({
  tipoInscricao,
  totalRegisterFree,
  totalRegisterWithDiscount,
  totalRegisterNoDiscount,
  totalRegister:
    totalRegisterNoDiscount + totalRegisterWithDiscount + totalRegisterFree,
  salesWithDiscount,
  salesNoDiscount,
  totalSales,
  valueToPassOn: calcFee(totalSales, itopFee),
});

export const calculateDashboardSummary = async (
  db: PrismaClient,
  eventId: string,
  type: ENUM_EVENT_TYPE,
  itopFee: number,
): Promise<DashboardSummary> => {
  const [
    registerFreeParticipante,
    registerFreeLgndCertificado,
    registerFreeLgndSemCertificado,
  ] = await Promise.all([
    getRegisterFree(db, eventId, "PARTICIPANTE", null),
    getRegisterFree(db, eventId, "SERVIR", true),
    getRegisterFree(db, eventId, "SERVIR", false),
  ]);

  const [
    totalPaidByParticipant,
    totalPaidByLgndCertificate,
    totalPaidByLgndNotCertificate,
  ] = await Promise.all([
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "PARTICIPANTE",
    }),
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "SERVIR",
      lgndCertificado: true,
    }),
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "SERVIR",
      lgndCertificado: false,
    }),
  ]);

  const totalRegisterFree =
    registerFreeParticipante +
    registerFreeLgndCertificado +
    registerFreeLgndSemCertificado;

  const totalRegisterWithDiscount =
    totalPaidByParticipant.totalSalesWithDiscount.count +
    totalPaidByLgndCertificate.totalSalesWithDiscount.count +
    totalPaidByLgndNotCertificate.totalSalesWithDiscount.count;

  const totalRegisterNoDiscount =
    totalPaidByParticipant.totalSalesNoDiscount.count +
    totalPaidByLgndCertificate.totalSalesNoDiscount.count +
    totalPaidByLgndNotCertificate.totalSalesNoDiscount.count;

  const totalSalesWithDiscount =
    totalPaidByParticipant.totalSalesWithDiscount.value +
    totalPaidByLgndCertificate.totalSalesWithDiscount.value +
    totalPaidByLgndNotCertificate.totalSalesWithDiscount.value;

  const totalSalesNoDiscount =
    totalPaidByParticipant.totalSalesNoDiscount.value +
    totalPaidByLgndCertificate.totalSalesNoDiscount.value +
    totalPaidByLgndNotCertificate.totalSalesNoDiscount.value;

  const totalSales =
    totalPaidByParticipant.totalSales +
    totalPaidByLgndCertificate.totalSales +
    totalPaidByLgndNotCertificate.totalSales;

  return {
    itopFee: {
      totalValue: (totalSales * itopFee) / 100,
    },
    data: [
      buildRegisterSummary(
        labelsFinancialReportParticipantAndServeByEventType[type].participant,
        registerFreeParticipante,
        totalPaidByParticipant.totalSalesWithDiscount.count,
        totalPaidByParticipant.totalSalesNoDiscount.count,
        totalPaidByParticipant.totalSalesWithDiscount.value,
        totalPaidByParticipant.totalSalesNoDiscount.value,
        totalPaidByParticipant.totalSales,
        itopFee,
      ),
      buildRegisterSummary(
        labelsFinancialReportParticipantAndServeByEventType[type]
          .serveCertificate,
        registerFreeLgndCertificado,
        totalPaidByLgndCertificate.totalSalesWithDiscount.count,
        totalPaidByLgndCertificate.totalSalesNoDiscount.count,
        totalPaidByLgndCertificate.totalSalesWithDiscount.value,
        totalPaidByLgndCertificate.totalSalesNoDiscount.value,
        totalPaidByLgndCertificate.totalSales,
        itopFee,
      ),
      buildRegisterSummary(
        labelsFinancialReportParticipantAndServeByEventType[type]
          .serveNotCertificate,
        registerFreeLgndSemCertificado,
        totalPaidByLgndNotCertificate.totalSalesWithDiscount.count,
        totalPaidByLgndNotCertificate.totalSalesNoDiscount.count,
        totalPaidByLgndNotCertificate.totalSalesWithDiscount.value,
        totalPaidByLgndNotCertificate.totalSalesNoDiscount.value,
        totalPaidByLgndNotCertificate.totalSales,
        itopFee,
      ),
      buildRegisterSummary(
        "Total",
        totalRegisterFree,
        totalRegisterWithDiscount,
        totalRegisterNoDiscount,
        totalSalesWithDiscount,
        totalSalesNoDiscount,
        totalSales,
        itopFee,
      ),
    ],
  };
};

export const calcValueReceive = async (
  db: PrismaClient,
  eventId: string,
  itopFee: number,
) => {
  const [
    totalPaidByParticipant,
    totalPaidByLgndCertificate,
    totalPaidByLgndNotCertificate,
  ] = await Promise.all([
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "PARTICIPANTE",
    }),
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "SERVIR",
      lgndCertificado: true,
    }),
    calcValuePaid({
      db,
      eventId,
      tipoInscricao: "SERVIR",
      lgndCertificado: false,
    }),
  ]);

  const totalParticipantPaid = totalPaidByParticipant.totalSales;

  const totalLgndCertificatedPaid = totalPaidByLgndCertificate.totalSales;

  const totalLgndNoCertificatedPaid = totalPaidByLgndNotCertificate.totalSales;

  const totalReceived =
    totalParticipantPaid +
    totalLgndCertificatedPaid +
    totalLgndNoCertificatedPaid;

  return {
    totalReceived: calcFee(totalReceived, itopFee),
    totalReceivedParticipant: calcFee(totalParticipantPaid, itopFee),
    totalReceivedLgndCertificated: calcFee(totalLgndCertificatedPaid, itopFee),
    totalReceivedLgndNotCertificated: calcFee(
      totalLgndNoCertificatedPaid,
      itopFee,
    ),
  };
};

export const calcValuePaid = async ({
  db,
  eventId,
  tipoInscricao,
  lgndCertificado = null,
}: CalcValuePaidOptions): Promise<CalcValuePaidResult> => {
  const registers = await db.inscricao.findMany({
    where: {
      status: "CONFIRMADA",
      eventoId: eventId,
      tipoInscricao,
      ...(lgndCertificado !== null && { lgndCertificado }),
      pagamento_status: {
        not: "GRATUITO", // Exclui inscrições gratuitas
      },
      metodo_pagamento: {
        not: "CUPOM_GRATUITO", // Exclui inscrições gratuitas
      },
    },
    select: {
      pagamento_top_value: true,
      pagamento_discount_value: true,
      id: true,
      nome: true,
    },
  });

  const registersWithDiscount = registers.filter(
    (reg) => reg.pagamento_discount_value! > 0,
  );
  const registersNoDiscount = registers.filter(
    (reg) => reg.pagamento_discount_value === 0,
  );

  // Calcula o valor total pago para registros com desconto
  const totalValuesWithDiscount = registersWithDiscount.map((reg) => {
    const topValue = reg.pagamento_top_value!;
    const discount = reg.pagamento_discount_value!;
    return topValue - discount;
  });
  const totalPaidWithDiscount = totalValuesWithDiscount.reduce(
    (acc, curr) => acc + curr,
    0,
  );

  // Calcula o valor total pago para registros sem desconto
  const totalValuesNoDiscount = registersNoDiscount.map((reg) => {
    const topValue = reg.pagamento_top_value!;
    return topValue;
  });
  const totalPaidFullValue = totalValuesNoDiscount.reduce(
    (acc, curr) => acc + curr,
    0,
  );

  return {
    totalSales: convertFromBasisPoint(
      totalPaidWithDiscount + totalPaidFullValue,
    ),
    totalSalesNoDiscount: {
      count: registersNoDiscount.length,
      value: convertFromBasisPoint(totalPaidFullValue),
    },
    totalSalesWithDiscount: {
      count: registersWithDiscount.length,
      value: convertFromBasisPoint(totalPaidWithDiscount),
    },
  };
};

export const calcTotalValuePending = async (
  db: PrismaClient,
  eventId: string,
  tipoInscricao: "PARTICIPANTE" | "SERVIR",
  lgndCertificado: boolean | null,
  topValue: number,
  itopFee: number,
) => {
  const pendingStatus = [
    { status: "CANCELADA_TEMPO_EXPIRADO" },
    { status: "AGUARDANDO_PAGAMENTO" },
  ];

  const registers = await db.inscricao.findMany({
    where: {
      eventoId: eventId,
      tipoInscricao,
      ...(lgndCertificado !== null && { lgndCertificado }),
      AND: {
        OR: pendingStatus,
      },
    },
    select: {
      pagamento_top_value: true,
      pagamento_discount_value: true,
    },
  });

  const values = registers.map((reg) => {
    const topValue = reg.pagamento_top_value!;
    const discount = reg.pagamento_discount_value!;
    return convertFromBasisPoint(topValue - discount);
  });

  const totalValue = values.reduce((acc, curr) => acc + curr, 0);

  const registersWriting = await db.inscricao.count({
    where: {
      eventoId: eventId,
      tipoInscricao,
      ...(lgndCertificado !== null && { lgndCertificado }),
      status: "INSCREVENDO",
    },
  });

  const totalValuePendingFromRegisterWriting = registersWriting * topValue;

  return calcFee(totalValue + totalValuePendingFromRegisterWriting, itopFee);
};
