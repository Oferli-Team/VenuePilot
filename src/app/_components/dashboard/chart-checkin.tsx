"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useEventStore } from "@/lib/store/EventStore";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";
import { eventTypeMap } from "@/lib/constants";

export type ChartCheckin = {
  checkin: string;
  registers: number;
  fill: "var(--color-done)" | "var(--color-pending)";
};

export type CheckinChartDataProps = {
  chartDataParticipante: ChartCheckin[];
  chartDataServir: ChartCheckin[];
  label?: string;
};

const chartConfig = {
  registers: {
    label: "Inscritos",
  },
  done: {
    label: "Realizado",
    color: "hsl(var(--chart-primary))",
  },
  pending: {
    label: "Pendente",
    color: "hsl(var(--chart-primary-ghost))",
  },
} satisfies ChartConfig;

export const CheckinChart = ({
  chartDataParticipante,
  chartDataServir,
  label = "Participantes e Legendários que fizeram o check-in.",
}: CheckinChartDataProps) => {
  const isMobile = useIsMobile();
  const { event } = useEventStore();

  const totalParticipantesChecked = React.useMemo(() => {
    return chartDataParticipante
      .filter((item) => item.checkin === "done")
      .reduce((acc, curr) => acc + curr.registers, 0);
  }, [chartDataParticipante]);

  const totalServirChecked = React.useMemo(() => {
    return chartDataServir
      .filter((item) => item.checkin === "done")
      .reduce((acc, curr) => acc + curr.registers, 0);
  }, [chartDataServir]);

  const totalRegisterParticipar = React.useMemo(() => {
    return chartDataParticipante.reduce((acc, curr) => acc + curr.registers, 0);
  }, [chartDataParticipante]);

  const totalRegisterServir = React.useMemo(() => {
    return chartDataServir.reduce((acc, curr) => acc + curr.registers, 0);
  }, [chartDataServir]);

  const charts = [
    {
      label: "Participantes",
      total: totalParticipantesChecked,
      checked: totalRegisterParticipar,
      data: chartDataParticipante,
      chartConfig: {
        tipoInscricao: {
          label: "Participante",
        },
        ...chartConfig,
      },
    },

    {
      label: "Legendários",
      total: totalServirChecked,
      checked: totalRegisterServir,
      data: chartDataServir,
      chartConfig: {
        tipoInscricao: {
          label: "Servir",
        },
        ...chartConfig,
      },
    },
  ];

  return (
    <Card>
      <CardHeader className="items-center sm:pb-0">
        <CardTitle>Checkin</CardTitle>
        <CardDescription>
          {eventTypeMap[event?.type as ENUM_EVENT_TYPE]} #{event?.topNumero}
        </CardDescription>
      </CardHeader>
      {totalRegisterParticipar === 0 && totalRegisterServir === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 pt-6 text-center">
          <p>Não há inscritos no evento.</p>
        </div>
      ) : (
        <CardContent className="grid flex-1 grid-cols-2 px-6 sm:px-0 sm:pb-0 sm:pt-0">
          {charts.map((chart, i) => (
            <ChartContainer
              key={i}
              config={chart.chartConfig}
              className="aspect-square"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  payload={[{ value: "tipoInscricao" }]}
                  content={<ChartLegendContent />}
                  className="-translate-y-2 gap-0 sm:hidden [&>div:first-child]:mr-4"
                />
                <Pie
                  data={chart.data}
                  dataKey="registers"
                  nameKey="checkin"
                  innerRadius={isMobile ? 35 : 60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={isMobile ? (viewBox.cy ?? 0) + 6 : viewBox.cy}
                              className="fill-foreground text-xl font-bold sm:text-2xl"
                            >
                              {chart.total.toString()} /{" "}
                              {chart.checked.toString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 24}
                              className="hidden fill-muted-foreground sm:block"
                            >
                              {chart.label}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          ))}
        </CardContent>
      )}

      <CardFooter className="flex-col gap-2 text-center text-sm">
        {totalRegisterParticipar > 0 && totalRegisterServir > 0 && (
          <p className="text-muted-foreground">{label}</p>
        )}
      </CardFooter>
    </Card>
  );
};
