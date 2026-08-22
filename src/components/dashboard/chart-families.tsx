"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "../ui/button";
import { useRouter } from "nextjs-toploader/app";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";

const chartConfig = {
  registers: {
    label: "Total",
    color: "hsl(var(--chart-primary))",
  },
  registersCheked: {
    label: "Checkin realizado",
    color: "hsl(var(--chart-primary-ghost))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export type ChartFamily = {
  family: string;
  registers: number;
  registersCheked: number;
};

type ChartFamiliesProps = {
  data: ChartFamily[];
};

export const ChartFamilies = ({ data }: ChartFamiliesProps) => {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Família</CardTitle>
        <CardDescription>Participantes separados por família</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 1 && data[0]?.family === "Indefinida" ? (
          <div className="flex flex-col gap-6">
            <p className="leading-6">
              As Famíias dos participantes não foram definidas
            </p>
            <Button
              className="w-fit"
              onClick={() => router.push(orgsRoutes.event.checkIn.participant)}
              variant="outline"
            >
              Definir Famílias
            </Button>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="family"
                tickFormatter={(value) => {
                  if (value === "Não classificados") {
                    return "-";
                  }
                  return value.replace("Família ", "");
                }}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent className="w-40" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="registers"
                stackId="a"
                fill="var(--color-registers)"
                radius={2}
              />
              <Bar
                dataKey="registersCheked"
                stackId="b"
                fill="var(--color-registersCheked)"
                radius={2}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
