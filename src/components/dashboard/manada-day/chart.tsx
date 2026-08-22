import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { cn } from "@/lib/utils";

const chartConfig = {
  registers: {
    label: "Total",
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

type ChartCheckInUniqueProps = {
  done: number;
  pending: number;
  label: string;
  title: string;
  description?: string;
  className?: string;
};

export const Chart = ({
  pending,
  done,
  label,
  title,
  description,
  className,
}: ChartCheckInUniqueProps) => {
  const isMobile = useIsMobile();

  const data = [
    {
      state: "done",
      registers: done,
      fill: "var(--color-done)",
    },
    {
      state: "pending",
      registers: pending,
      fill: "var(--color-pending)",
    },
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="sm:text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="aspect-square">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend
            content={<ChartLegendContent />}
            className="-translate-y-2 gap-0 sm:hidden [&>div:first-child]:mr-4"
          />
          <Pie
            data={data}
            dataKey="registers"
            nameKey="state"
            innerRadius={isMobile ? 35 : 60}
            strokeWidth={10}
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
                        {done.toString()} / {pending.toString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 24}
                        className="hidden fill-muted-foreground sm:block"
                      >
                        {label.toLocaleString()}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </Card>
  );
};
