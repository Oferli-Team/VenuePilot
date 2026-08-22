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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  cupom: {
    label: "Cupom",
    color: "hsl(var(--chart-1))",
  },
  usado: {
    label: "Inscritos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export type ChartCupomDescontoType = {
  cupom: string;
  usado: number;
};

type ChartCupomDescontoProps = {
  data: ChartCupomDescontoType[];
};

export const ChartCupomDesconto = ({ data }: ChartCupomDescontoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupom de Desconto</CardTitle>
        <CardDescription>
          Relação de cupons de desconto que foram usados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="cupom"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="usado" fill="var(--color-usado)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
