"use client";

import { cn } from "@/lib/utils";
import { CardDashboard } from "../../card-dashboard";
import { GridTwoColumns } from "../../grid-two-columns";
import { Check, X } from "lucide-react";
import { GridThreeColumns } from "../../grid-three-column";
import { api } from "@/trpc/react";
import { useFindEvent } from "@/lib/hooks/event";
import { Chart } from "./chart";

export const GeneralTab = () => {
  const { event } = useFindEvent();

  const { data } =
    api.manadaDay.getConfirmedAndPendingRegistersDashoboard.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event },
    );

  const { data: checkInData } =
    api.manadaDay.getCheckinStateByCategory.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event },
    );

  const totalByCategory = [
    {
      title: "Adultos",
      value: data?.totalAdult,
      className: "border-blue-600/50 bg-gradient-to-r from-blue-600/30",
    },
    {
      title: "Crianças",
      label: "5 a 10 anos",
      value: data?.totalPaidChild,
      className: "border-green-600/50 bg-gradient-to-r from-green-600/30",
    },
    {
      title: "Crianças",
      label: "0 a 4 anos",
      value: data?.totalFreeChild,
      className: "border-yellow-600/50 bg-gradient-to-r from-yellow-600/30",
    },
  ];

  const total = [
    {
      label: "Total inscritos",
      value: data?.totalRegisterConfirmed,
      icon: <Check />,
      isPending: false,
      className: "bg-gradient-to-r from-primary/40",
      infoContent: "Ingressos pagos e confirmados",
    },
    {
      label: "Total Pendentes",
      value: data?.totalRegisterPending,
      icon: <X />,
      isPending: true,
      className: "",
      infoContent: "Ingressos aguardando pagamento",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <GridTwoColumns className="w-full ">
        {total.map((item, i) => (
          <CardDashboard key={item.label} {...item} />
        ))}
      </GridTwoColumns>

      <GridThreeColumns className="w-full ">
        {totalByCategory.map((item, i) => (
          <div
            key={`${item.title} - ${i}`}
            className={cn(
              `flex flex-col justify-between gap-1 rounded-md border bg-card px-2 py-2 md:gap-3 md:px-6`,
              item.className,
            )}
          >
            <div>
              <h5 className="font-semibold">{item.title}</h5>
              {item.label && (
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              )}
            </div>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </GridThreeColumns>

      <GridThreeColumns
        title="Check-in por categoria de ingresso"
        className="rounded-md border bg-card p-4 sm:grid-cols-2"
      >
        <Chart
          done={checkInData?.summary?.ADULT?.done ?? 0}
          pending={checkInData?.summary?.ADULT?.pending ?? 0}
          label="Adultos"
          title="Adultos"
          description="Adultos e crianças maiores de 11 anos"
          className="w-full"
        />
        <Chart
          done={checkInData?.summary?.PAID_CHILD?.done ?? 0}
          pending={checkInData?.summary?.PAID_CHILD?.pending ?? 0}
          label=""
          title="Crianças"
          description="Crianças de 5 a 10 anos"
          className="w-full"
        />
        <Chart
          done={checkInData?.summary?.FREE_CHILD?.done ?? 0}
          pending={checkInData?.summary?.FREE_CHILD?.pending ?? 0}
          label=""
          title="Crianças não pagantes"
          description="Crianças de 0 a 4 anos"
          className="w-full"
        />
      </GridThreeColumns>
    </div>
  );
};
