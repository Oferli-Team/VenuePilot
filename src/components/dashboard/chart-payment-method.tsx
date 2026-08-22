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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  pix: {
    label: "Pix",
    color: "hsl(var(--chart-1))",
  },
  creditCard: {
    label: "Cartão",
    color: "hsl(var(--chart-2))",
  },
  cupom: {
    label: "Gratuito",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export type ChartPaymentMethodType = {
  inscricaoType: string;
  cupom: number;
  pix: number;
  creditCard: number;
};

type ChartPaymentMethodProps = {
  data: ChartPaymentMethodType[];
};

export const ChartPaymentMethod = ({ data }: ChartPaymentMethodProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
        <CardDescription>
          Métodos de pagamento em relação aos participantes e legendários
          certificados ou não.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="inscricaoType"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="pix" fill="var(--color-pix)" radius={4} />
            <Bar
              dataKey="creditCard"
              fill="var(--color-creditCard)"
              radius={4}
            />
            <Bar dataKey="cupom" fill="var(--color-cupom)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
