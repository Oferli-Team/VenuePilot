import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import React from "react";

export type LinkSecreto = {
  link: string | null;
  quantidade: number;
};

type ChartFardaProps = {
  data: LinkSecreto[];
};

export const ChartLinkSecreto = ({ data }: ChartFardaProps) => {
  const chartConfig = {
    link: {
      label: "Link",
      color: "hsl(var(--chart-2))",
    },
    quantidade: {
      label: "Usado",
      color: "hsl(var(--chart-primary))",
    },
  } satisfies ChartConfig;

  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.quantidade, 0);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links Secretos</CardTitle>
        <CardDescription>
          Inscrições confirmadas usando Link Secreto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="link"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="quantidade"
              stackId="a"
              fill="var(--color-quantidade)"
              radius={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="justify-between gap-2 px-2">
        <div className="flex text-xs font-medium leading-5 text-muted-foreground sm:text-sm">
          Quantidade total de inscritos via link secreto | {total}
        </div>
      </CardFooter>
    </Card>
  );
};
