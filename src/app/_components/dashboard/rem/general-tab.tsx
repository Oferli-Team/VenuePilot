"use client";

import { api } from "@/trpc/react";
import { CardDashboard } from "@/components/card-dashboard";
import { Axe, TentTree, Users2 } from "lucide-react";
import { columnsCitiesAndStates } from "@/components/dashboard/columns-cities-and-states";
import { groupByCityAndState } from "@/lib/utils/groupByCityAndState";
import { GridTwoColumns } from "../../grid-two-columns";
import { TextWithIcon } from "../../ui/text-with-icon";
import { ChartSkeleton } from "../../ui/chart-skeleton";
import { CheckinChart } from "../chart-checkin";
import { DataTableSkeleton } from "../../ui/data-table-skeleton";
import { DataTable } from "../../ui/data-table";
import { useFindEvent } from "@/lib/hooks/event";

export const GeneralRemTab = () => {
  const { event } = useFindEvent();

  const { data } =
    api.dashboard.getConfirmedAndPendingRegistersByRegisterType.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const { data: checkin, isPending: isCheckInPending } =
    api.dashboard.getCheckinState.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const {
    data: allConfirmedRegisterParticipate,
    isPending: getParticipateDataIsPending,
  } = api.inscricao.getAllParticipantes.useQuery(
    {
      status: "CONFIRMADA",
      eventoId: event?.id,
    },
    { enabled: !!event?.id },
  );

  const { data: allConfirmedRegisterServe, isPending: getServeDataIsPending } =
    api.inscricao.getAllServir.useQuery(
      {
        status: "CONFIRMADA",
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const formattedLabel = (value?: number) => {
    if (value && value > 1)
      return `${value} casais, ${calcTotalCouple(value)} pessoas`;
    if (value && value === 0)
      return `${value} casal, ${calcTotalCouple(value)} pessoas`;
    return "-";
  };

  const calcTotalCouple = (value?: number) => {
    if (value && value > 0) return value * 2;
    return value;
  };

  const totalConfirmed = {
    label: "Total Inscritos",
    icon: <Users2 />,
    value: data?.totalRegistrationConfirmed,
    subValue: formattedLabel(data?.totalRegistrationConfirmed),
  };

  const totalPending = {
    label: "Total Pendente",
    icon: <Users2 />,
    isPending: true,
    value: data?.totalRegistrationPending,
    subValue: formattedLabel(data?.totalRegistrationPending),
  };

  const dataParticipate = [
    {
      label: "Confirmados",
      icon: <Users2 />,
      value: data?.participantsConfirmed,
      subValue: formattedLabel(data?.participantsConfirmed),
    },
    {
      label: "Pendentes",
      icon: <Users2 />,
      isPending: true,
      value: data?.participantsPending ?? 0,
      subValue: formattedLabel(data?.participantsPending),
    },
  ];

  const dataServe = [
    {
      label: "Confirmados",
      icon: <Users2 />,
      value: data?.serveConfirmed,
      subValue: formattedLabel(data?.serveConfirmed),
    },
    {
      label: "Pendentes",
      icon: <Users2 />,
      value: data?.servePending,
      subValue: formattedLabel(data?.servePending),
      isPending: true,
    },
  ];

  const dataCitiesParticipateTable =
    allConfirmedRegisterParticipate &&
    groupByCityAndState(allConfirmedRegisterParticipate);

  const dataCitiesServeTable =
    allConfirmedRegisterServe && groupByCityAndState(allConfirmedRegisterServe);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <GridTwoColumns className="grid-cols-2 gap-2">
          <CardDashboard
            {...totalConfirmed}
            className="bg-gradient-to-r from-primary/40"
          />
          <CardDashboard {...totalPending} />
        </GridTwoColumns>

        <GridTwoColumns>
          <div className="flex flex-col gap-4">
            <TextWithIcon
              label="Participar"
              icon={<TentTree className="text-foreground" size={20} />}
            />

            <GridTwoColumns className="grid-cols-2 gap-2">
              {dataParticipate.map((data, i) => (
                <CardDashboard {...data} key={i + 1} />
              ))}
            </GridTwoColumns>
          </div>

          <div className="flex flex-col gap-4">
            <TextWithIcon
              label="Servir"
              icon={<Axe className="text-foreground" size={20} />}
            />
            <GridTwoColumns className="grid-cols-2 gap-2">
              {dataServe.map((data, i) => (
                <CardDashboard {...data} key={i + 1} />
              ))}
            </GridTwoColumns>
          </div>
        </GridTwoColumns>

        <GridTwoColumns className="flex flex-col sm:grid">
          {isCheckInPending ? (
            <ChartSkeleton />
          ) : (
            checkin && (
              <CheckinChart
                label="Quem irá Servir e Participar pela primeira vez no evento que fizeram o check-in."
                {...checkin}
              />
            )
          )}
        </GridTwoColumns>
      </div>

      <div className=" flex flex-col gap-4">
        <h2 className="ml-2 text-lg font-bold">
          Casais que irão participar pela primeira vez por Região
        </h2>

        {getParticipateDataIsPending ? (
          <DataTableSkeleton columnCount={4} rowCount={6} />
        ) : (
          dataCitiesParticipateTable && (
            <DataTable
              columns={columnsCitiesAndStates}
              data={dataCitiesParticipateTable}
              pagination={{ pageIndex: 0, pageSize: 15 }}
            />
          )
        )}
      </div>

      <div className=" flex flex-col gap-4">
        <h2 className="ml-2 text-lg font-bold">
          Casais que irão Servir por Região
        </h2>

        {getServeDataIsPending ? (
          <DataTableSkeleton columnCount={4} rowCount={6} />
        ) : (
          dataCitiesServeTable && (
            <DataTable
              columns={columnsCitiesAndStates}
              data={dataCitiesServeTable}
              pagination={{ pageIndex: 0, pageSize: 15 }}
            />
          )
        )}
      </div>
    </div>
  );
};
