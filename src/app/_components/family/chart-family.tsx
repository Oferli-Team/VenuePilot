"use client";

import * as React from "react";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { InputQuantityFamily } from "./quantity-family-input";

export type ChartFamily = {
  family: number | string;
  registers: number;
};

type ChartFamilyProps = {
  data: ChartFamily[];
};

const chartConfig = {
  GiFamilyHouse: {
    label: "Família",
  },
  registers: {
    label: "Participantes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ChartFamily({ data }: ChartFamilyProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col justify-between gap-1 space-y-0 border-b p-0 sm:flex-row sm:p-0">
        <div className="flex w-full flex-1 flex-col justify-center gap-1 p-3">
          <CardTitle>Classificação de Família</CardTitle>
          <CardDescription>
            Distribuição da quantidade de participantes por família
          </CardDescription>
          <p className="pt-2 text-sm text-primary/70">
            Critérios de classificação: Saúde, Idade e IMC
          </p>
        </div>
        <div className="flex w-full bg-muted/10 px-3 py-3 sm:py-6 md:w-[35%]">
          <InputQuantityFamily />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 4,
              right: 4,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="family"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              minTickGap={24}
              tickFormatter={(value: string) => {
                return value.split(" ")[1]?.toString();
              }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="registers"
                />
              }
            />

            <Bar
              dataKey="registers"
              fill={`var(--color-registers)`}
              radius={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
