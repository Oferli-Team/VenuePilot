"use client";

import { reais } from "@/lib/utils/money";
import { api } from "@/trpc/react";
import { DollarSign } from "lucide-react";
import { GridTwoColumns } from "../../grid-two-columns";
import { CardDashboard } from "../../card-dashboard";
import { useFindEvent } from "@/lib/hooks/event";
import { ChartSkeleton } from "../../ui/chart-skeleton";
import { ChartPaymentMethod } from "../chart-payment-method";
import { ChartCupomDesconto } from "../chart-cupom-desconto";
import { DataTable as DataTableUI } from "@/components/ui/data-table";
import { Heading } from "../../ui/heading";
import { columns } from "../column-relatorio";

export const FinancialTab = () => {
  const { event } = useFindEvent();

  const { data: paymentMethods, isPending: paymentMethodsPending } =
    api.manadaDay.getAllPaymentMethodData.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event },
    );

  const { data: coupons, isPending: couponsIsPending } =
    api.manadaDay.getCupomsUsed.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event },
    );

  const { data: financialReport } = api.manadaDay.getFinancialReport.useQuery(
    {
      eventoId: event?.id,
    },
    { enabled: !!event },
  );

  const salesConfirmed = {
    label: "Vendas Confirmadas",
    icon: <DollarSign />,
    value: financialReport && reais(financialReport.salesConfirmed),
  };

  const totalToReceived = {
    label: "Vendas Pendentes",
    icon: <DollarSign />,
    value: financialReport && reais(financialReport.salesPending),
    isPending: true,
    infoContent: (
      <p className="text-sm">
        Valor correspondente aos ingressos que estão{" "}
        <strong className="text-primary">aguardando pagamento</strong>,
        descontado a taxa administrativa da plataforma.
      </p>
    ),
  };
  return (
    <div className="flex flex-col gap-8">
      <GridTwoColumns className="grid-cols-2 gap-2">
        <CardDashboard
          {...salesConfirmed}
          className="bg-gradient-to-r from-primary/40"
        />
        <CardDashboard {...totalToReceived} />
      </GridTwoColumns>

      <div className="space-y-4">
        <Heading lineLeft title="Relatório Financeiro" />
        <DataTableUI
          data={financialReport?.report ?? []}
          columns={columns}
          showFooterTable={false}
        />

        <p className="text-xs">
          Taxa Administrativa Plataforma ITOP Inscrições: {event?.itopFee}%
        </p>
      </div>

      <GridTwoColumns className="flex flex-col sm:grid">
        {paymentMethodsPending ? (
          <ChartSkeleton />
        ) : (
          paymentMethods && <ChartPaymentMethod data={paymentMethods.chart} />
        )}

        {couponsIsPending ? (
          <ChartSkeleton />
        ) : (
          coupons && <ChartCupomDesconto data={coupons} />
        )}
      </GridTwoColumns>
    </div>
  );
};
