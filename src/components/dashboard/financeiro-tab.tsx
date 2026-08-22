"use client";

import { CardDashboard } from "@/components/card-dashboard";
import { reais } from "@/lib/utils/money";
import { api } from "@/trpc/react";
import { Axe, DollarSign, TentTree } from "lucide-react";
import { GridTwoColumns } from "../grid-two-columns";
import { ChartSkeleton } from "../ui/chart-skeleton";
import { DataTable } from "../ui/data-table";
import { DataTableSkeleton } from "../ui/data-table-skeleton";
import { TextWithIcon } from "../ui/text-with-icon";
import { toast } from "../ui/use-toast";
import { ChartCupomDesconto } from "./chart-cupom-desconto";
import { ChartPaymentMethod } from "./chart-payment-method";
import { ColumnCuponsUsed } from "./columns-cupons-used";
import { columns_general } from "./columns-general-data";
import { useEventStore } from "@/lib/store/EventStore";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { labelsFinancialReportParticipantAndServeByEventType } from "@/lib/constants";

type FinanceiroTabProps = {
  eventoId: string;
};

export const FinanceiroTab = ({ eventoId }: FinanceiroTabProps) => {
  const { event } = useEventStore();

  if (!event) {
    toast({
      title: "Ops, não encontramos os dados do evento",
    });
    return;
  }

  const { data } =
    api.dashboard.getConfirmedAndPendingRegistersByRegisterType.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const { data: salesValueConfirmed } =
    api.dashboard.getEventSalesData.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: salesValuePending } =
    api.dashboard.getEventSalesPendingData.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: paymentMethods, isPending: paymentMethodsPending } =
    api.dashboard.getAllPaymentMethodData.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: cupomDescontoUsed, isPending: cupomDescontoUsedIsPending } =
    api.dashboard.getCupomsUsed.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: allCuponsUsed, isPending: allCuponsUsedPending } =
    api.dashboard.getAllCuponsUsed.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const availableSpotsToParticipate =
    data?.participantsConfirmed &&
    event.vagasParticipar - data?.participantsConfirmed;

  const availableSpotsToServe =
    data?.serveConfirmed && event.vagasServir - data.serveConfirmed;

  const salesConfimed = {
    label: "Vendas Confirmadas",
    icon: <DollarSign />,
    value: salesValueConfirmed && reais(salesValueConfirmed.totalReceived),
  };

  const totalToRecieved = {
    label: "Vendas Pendentes",
    icon: <DollarSign />,
    value: salesValuePending && reais(salesValuePending.totalPending),
    isPending: true,
    infoContent: (
      <p className="text-sm">
        Valor correspondente as inscrições de participantes e legendários que
        estão{" "}
        <strong className="text-primary">
          inscrevendo ou aguardando pagamento
        </strong>
        , descontado a taxa administrativa da plataforma.
      </p>
    ),
  };

  const dataParticipar = [
    {
      label: "Valor Recebido",
      icon: <DollarSign />,
      value:
        salesValueConfirmed && reais(salesValueConfirmed.participanteReceived),
    },
    {
      label: "Valor a Receber",
      icon: <DollarSign />,
      value:
        salesValuePending && reais(salesValuePending.totalparticipantePending),
      isPending: true,
    },
  ];

  const dataServir = [
    {
      label: "Valor Recebido",
      icon: <DollarSign />,
      value: salesValueConfirmed && reais(salesValueConfirmed.servirReceived),
    },
    {
      label: "Valor a Receber",
      icon: <DollarSign />,
      value: salesValuePending && reais(salesValuePending.totalServirPending),
      isPending: true,
    },
  ];

  const generalRegisterDataTable = [
    {
      tipo_ingresso:
        labelsFinancialReportParticipantAndServeByEventType[
          event.type as ENUM_EVENT_TYPE
        ].participant,
      vagas_ofertadas: event.vagasParticipar,
      confirmados: data?.participantsConfirmed ?? 0,
      pendentes: data?.participantsPending ?? 0,
      vagas_disponiveis: availableSpotsToParticipate ?? 0,
      a_receber:
        salesValuePending && reais(salesValuePending.totalparticipantePending),
      valor_total:
        salesValueConfirmed && reais(salesValueConfirmed.participanteReceived),
    },
    {
      tipo_ingresso:
        labelsFinancialReportParticipantAndServeByEventType[
          event.type as ENUM_EVENT_TYPE
        ].serveCertificate,
      vagas_ofertadas: "-",
      confirmados: data?.serveCertificatedConfirmed ?? 0,
      pendentes: data?.serveCertificatedPending ?? 0,
      vagas_disponiveis: "-",
      a_receber:
        salesValuePending &&
        reais(salesValuePending.totalLgndComCertificadoPending),
      valor_total:
        salesValueConfirmed &&
        reais(salesValueConfirmed.lgndComCertificadoReceived),
    },
    {
      tipo_ingresso:
        labelsFinancialReportParticipantAndServeByEventType[
          event.type as ENUM_EVENT_TYPE
        ].serveNotCertificate,
      vagas_ofertadas: event.vagasServir,
      confirmados: data?.serveNotCertificatedConfirmed ?? 0,
      pendentes: data?.serveNotCertificatedPending ?? 0,
      vagas_disponiveis: availableSpotsToServe ?? 0,
      a_receber:
        salesValuePending &&
        reais(salesValuePending.totalLgndSemCertificadoPending),
      valor_total:
        salesValueConfirmed &&
        reais(salesValueConfirmed.lgndSemCertificadoReceived),
    },
    {
      tipo_ingresso: "Total",
      vagas_ofertadas: event.vagasParticipar + event.vagasServir,
      confirmados: data?.totalRegistrationConfirmed ?? 0,
      pendentes: data?.totalRegistrationPending ?? 0,
      vagas_disponiveis:
        (availableSpotsToParticipate ?? 0) + (availableSpotsToServe ?? 0),
      a_receber: salesValuePending && reais(salesValuePending.totalPending),
      valor_total:
        salesValueConfirmed && reais(salesValueConfirmed.totalReceived),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <GridTwoColumns className="grid-cols-2 gap-2">
          <CardDashboard
            {...salesConfimed}
            className="bg-gradient-to-r from-primary/40"
          />
          <CardDashboard {...totalToRecieved} />
        </GridTwoColumns>

        <GridTwoColumns>
          <div className="flex flex-col gap-4">
            <TextWithIcon
              label="Participar"
              icon={<TentTree className="text-foreground" size={20} />}
            />

            <GridTwoColumns className="grid-cols-2 gap-2">
              {dataParticipar.map((data, i) => (
                <CardDashboard {...data} key={i} />
              ))}
            </GridTwoColumns>
          </div>

          <div className="flex flex-col gap-4">
            <TextWithIcon
              label="Servir"
              icon={<Axe className="text-foreground" size={20} />}
            />

            <GridTwoColumns className="grid-cols-2 gap-2">
              {dataServir.map((data, i) => (
                <CardDashboard {...data} key={i + 1} />
              ))}
            </GridTwoColumns>
          </div>
        </GridTwoColumns>

        <GridTwoColumns className="flex flex-col sm:grid">
          {paymentMethodsPending ? (
            <ChartSkeleton />
          ) : (
            paymentMethods && <ChartPaymentMethod data={paymentMethods.chart} />
          )}

          {cupomDescontoUsedIsPending ? (
            <ChartSkeleton />
          ) : (
            cupomDescontoUsed && <ChartCupomDesconto data={cupomDescontoUsed} />
          )}
        </GridTwoColumns>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="ml-2 text-xl font-bold">Visão Geral</h2>

        <DataTable columns={columns_general} data={generalRegisterDataTable} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="ml-2 text-xl font-bold">Cupons de Desconto</h2>

        {allCuponsUsedPending ? (
          <DataTableSkeleton columnCount={4} rowCount={6} />
        ) : (
          allCuponsUsed && (
            <DataTable columns={ColumnCuponsUsed} data={allCuponsUsed} />
          )
        )}
      </div>
    </div>
  );
};
