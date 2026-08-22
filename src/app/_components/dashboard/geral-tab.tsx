"use client";

import { CardDashboard } from "@/components/card-dashboard";
import { Axe, ExternalLink, TentTree, Users2 } from "lucide-react";
import { columnsCitiesAndStates } from "@/components/dashboard/columns-cities-and-states";
import { groupByCityAndState } from "@/lib/utils/groupByCityAndState";
import { CheckinChart } from "./chart-checkin";
import { ChartFamilies } from "./chart-families";
import { GridTwoColumns } from "../grid-two-columns";
import { TextWithIcon } from "../ui/text-with-icon";
import { api } from "@/trpc/react";
import { DataTableSkeleton } from "../ui/data-table-skeleton";
import { ChartSkeleton } from "../ui/chart-skeleton";
import { DataTable } from "../ui/data-table";
import { useRouter } from "nextjs-toploader/app";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { getCurrentMembership } from "@/lib/hooks/member";
import { NEXT_PUBLIC_SHOW_REGISTER_CANCELED_DASHBOARD } from "@/lib/constants";

type GeralTabProps = {
  eventoId: string;
};

export const GeralTab = ({ eventoId }: GeralTabProps) => {
  const router = useRouter();

  const { membership } = getCurrentMembership();
  const { orgsRoutes } = useEventRoutes({});

  const { data } =
    api.dashboard.getConfirmedAndPendingRegistersByRegisterType.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: registersCanceled } =
    api.dashboard.getAllRegisterCanceled.useQuery(
      {
        eventId: eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: families, isPending: isFamiliesPending } =
    api.dashboard.getParticipantesPorFamilia.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: checkin, isPending: isCheckInPending } =
    api.dashboard.getCheckinState.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const {
    data: allInscricaoParticipanteConfirmed,
    isPending: getAllParticipantesIsPending,
  } = api.inscricao.getAllParticipantes.useQuery(
    {
      status: "CONFIRMADA",
      eventoId,
    },
    { enabled: !!eventoId },
  );

  const { data: allInscricaServirConfirmed, isPending: getAllServirIsPending } =
    api.inscricao.getAllServir.useQuery(
      {
        status: "CONFIRMADA",
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const totalConfimed = {
    label: "Total Inscritos",
    icon: <Users2 />,
    value: data?.totalRegistrationConfirmed,
  };

  const totalPending = {
    label: "Total Pendente",
    icon: <Users2 />,
    value: data?.totalRegistrationPending,
    isPending: true,
  };

  const dataParticipar = [
    {
      label: "Confirmados",
      icon: <Users2 />,
      value: data?.participantsConfirmed,
    },
    {
      label: "Pendentes",
      icon: <Users2 />,
      value: data?.participantsPending,
      isPending: true,
    },
  ];

  const dataServir = [
    {
      label: "Confirmados",
      icon: <Users2 />,
      value: data?.serveConfirmed,
    },
    {
      label: "Pendentes",
      icon: <Users2 />,
      value: data?.servePending,
      isPending: true,
    },
  ];

  const dataCitiesParticipantesTable =
    allInscricaoParticipanteConfirmed &&
    groupByCityAndState(allInscricaoParticipanteConfirmed);

  const dataCitiesLegendariosTable =
    allInscricaServirConfirmed &&
    groupByCityAndState(allInscricaServirConfirmed);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <GridTwoColumns className="grid-cols-2 gap-2">
          <CardDashboard
            {...totalConfimed}
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
                <CardDashboard {...data} key={i} />
              ))}
            </GridTwoColumns>
          </div>
        </GridTwoColumns>

        {NEXT_PUBLIC_SHOW_REGISTER_CANCELED_DASHBOARD && (
          <GridTwoColumns className="grid-cols-2">
            <CardDashboard
              icon={<ExternalLink className="size-4" />}
              label="Inscrições Canceladas"
              value={registersCanceled?.canceled.count}
              className="bg-gradient-to-r from-red-600/20"
              onRedirect={
                isSuperAdmin(membership)
                  ? () => router.push(orgsRoutes.event.canceled)
                  : undefined
              }
              isPending
            />
            <CardDashboard
              icon={<ExternalLink className="size-4" />}
              label="Inscrições Reembolsadas"
              value={registersCanceled?.refunded.count}
              className="bg-gradient-to-r from-red-600/20"
              onRedirect={
                isSuperAdmin(membership)
                  ? () => router.push(orgsRoutes.event.canceled)
                  : undefined
              }
              isPending
            />
          </GridTwoColumns>
        )}

        <GridTwoColumns className="flex flex-col sm:grid">
          {isFamiliesPending ? (
            <ChartSkeleton />
          ) : (
            families && <ChartFamilies data={families} />
          )}

          {isCheckInPending ? (
            <ChartSkeleton />
          ) : (
            checkin && <CheckinChart {...checkin} />
          )}
        </GridTwoColumns>
      </div>

      <div className=" flex flex-col gap-4">
        <h2 className="ml-2 text-lg font-bold">Participantes por Região</h2>

        {getAllParticipantesIsPending ? (
          <DataTableSkeleton columnCount={4} rowCount={6} />
        ) : (
          dataCitiesParticipantesTable && (
            <DataTable
              columns={columnsCitiesAndStates}
              data={dataCitiesParticipantesTable}
              pagination={{ pageIndex: 0, pageSize: 15 }}
            />
          )
        )}
      </div>

      <div className=" flex flex-col gap-4">
        <h2 className="ml-2 text-lg font-bold">Legendários por Região</h2>

        {getAllServirIsPending ? (
          <DataTableSkeleton columnCount={4} rowCount={6} />
        ) : (
          dataCitiesLegendariosTable && (
            <DataTable
              columns={columnsCitiesAndStates}
              data={dataCitiesLegendariosTable}
              pagination={{ pageIndex: 0, pageSize: 15 }}
            />
          )
        )}
      </div>
    </div>
  );
};
