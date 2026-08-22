"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { ITOP } from "@/lib/constants";
import { useEventStore } from "@/lib/store/EventStore";
import { createPdfWithHeader } from "@/lib/utils/createPdfWithHeader";
import { reais } from "@/lib/utils/money";
import { api } from "@/trpc/react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { DataTableSkeleton } from "../ui/data-table-skeleton";
import { toast } from "../ui/use-toast";
import { columnsPaymentMethod } from "./column-paymnet-method";
import { columns } from "./column-relatorio";
import { columnsFinancialDetail } from "./columns-financial-detail";
import { CSVLink } from "react-csv";
import { formatedDataToCSVTable } from "@/lib/utils/formatedDataToCSVTable";

export const RelatorioTab = () => {
  const { event } = useEventStore();

  const { data, isPending } =
    api.dashboard.getEventSalesDataToRelatorio.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const { data: registerPaidReport, isPending: registerPaidReportIsPending } =
    api.dashboard.reportByRegistersAndPayment.useQuery(
      {
        eventId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const { data: paymentMethodReport, isPending: paymentMethodReportIsPending } =
    api.dashboard.getAllPaymentMethodData.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  // Função para obter os cabeçalhos renderizados
  const getColumnHeaders = <T,>(columns: ColumnDef<T>[]): string[] => {
    return columns.map((column) => {
      const headerValue =
        typeof column.header === "function" ? column.header() : column.header;

      return React.isValidElement(headerValue)
        ? (headerValue.props.value as string)
        : (headerValue as string);
    });
  };

  const downloadPdf = async () => {
    try {
      const doc = createPdfWithHeader({
        title: `Relatório de Vendas | ${event.pista} TOP ${event.topNumero}`,
        subtitle: `Relatório do dia: ${format(new Date(), "dd/MM/yyyy")}`,
        orientation: "landscape",
      });

      // Tabela "Relatório Total das Vendas"
      autoTable(doc, {
        head: [getColumnHeaders(columns)],
        body: data?.data?.map((item) => [
          item.tipoInscricao,
          item.totalRegisterFree,
          item.totalRegisterWithDiscount,
          item.totalRegisterNoDiscount,
          item.totalRegister,
          reais(item.salesWithDiscount),
          reais(item.salesNoDiscount),
          reais(item.totalSales),
          reais(item.valueToPassOn),
        ]),
        startY: 40,
        headStyles: {
          fillColor: "gray",
        },
        theme: "grid",
      });

      const finalY = doc.previousAutoTable?.finalY ?? 40;
      const text = `* Valor total referente a taxa administrativa (${event.itopFee}%) da plataforma ${ITOP.name} | ${reais(data?.itopFee.totalValue ?? 0)}`;
      doc.setFontSize(10);
      doc.text(text, 14, finalY + 10);

      // Tabela "Visão geral dos métodos de pagamento"
      autoTable(doc, {
        head: [getColumnHeaders(columnsPaymentMethod)],
        body: paymentMethodReport?.relatorio.map((item) => [
          item.tipoInscricao,
          item.pix,
          item.creditCard,
          item.free,
          item.total,
        ]),
        startY: finalY + 20,
        headStyles: {
          fillColor: "gray",
        },
        theme: "grid",
      });

      doc.save(
        `relatorio-vendas-${event?.pista.replace("ç", "c")}-top${event?.topNumero}.pdf`,
      );
    } catch (error) {
      console.log(error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao tentar gerar o relatório em PDF",
        variant: "destructive",
      });
    }
  };

  const reportDetailCSVData = useMemo(() => {
    const headers = columnsFinancialDetail.map((col) => ({
      key: col.id!,
      label: col.header as string,
    }));

    const tipoInscricaoIndex = headers.findIndex(
      (h) => h.key === "tipoInscricao",
    );

    if (tipoInscricaoIndex !== -1) {
      headers.splice(tipoInscricaoIndex + 1, 0, {
        key: "lgndCertificado",
        label: "Certificado?",
      });
    }

    const formattedData = formatedDataToCSVTable(registerPaidReport ?? []);

    return {
      headers,
      data: formattedData,
      filename: `Relatorio-detalhado-vendas-evento-${event?.slug}-${event?.pista.replace("ç", "c")}.csv`,
    };
  }, [event, registerPaidReport]);

  return (
    <Section className="mt-2 flex w-full max-w-screen-2xl flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Heading lineLeft title="Relatório Total das Vendas" />

          <Button
            onClick={downloadPdf}
            disabled={isPending || paymentMethodReportIsPending}
            size="sm"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:block">Exportar Relatório</span>
          </Button>
        </div>

        {isPending ? (
          <DataTableSkeleton columnCount={6} rowCount={4} />
        ) : (
          <>
            <DataTable
              data={data?.data}
              columns={columns}
              showFooterTable={false}
            />

            <p className="text-xs">
              Taxa Administrativa Plataforma ITOP Inscrições: {event?.itopFee}%
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Heading lineLeft title="Visão geral dos métodos de pagamento" />

        {paymentMethodReportIsPending ? (
          <DataTableSkeleton columnCount={6} rowCount={4} />
        ) : (
          <DataTable
            data={paymentMethodReport.relatorio}
            columns={columnsPaymentMethod}
            showFooterTable={false}
          />
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Heading
            lineLeft
            title="Relatório Total de Vendas Detalhado"
            subtitle="Valores brutos das vendas. Taxa de repasse da ITOP não estão aplicadas neste relatório."
          />
          <Button asChild variant="secondary" size="sm">
            <CSVLink
              {...reportDetailCSVData}
              href="#"
              className="flex items-center"
              separator=";"
              enclosingCharacter={`"`}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:block">Exportar Relatório</span>
            </CSVLink>
          </Button>
        </div>
        {registerPaidReportIsPending ? (
          <DataTableSkeleton columnCount={6} rowCount={4} />
        ) : (
          <DataTable
            data={registerPaidReport ?? []}
            columns={columnsFinancialDetail}
          />
        )}
      </div>
    </Section>
  );
};
