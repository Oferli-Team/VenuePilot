import { Check, Copy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Button } from "../ui/button";
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
import { toast } from "../ui/use-toast";
import { shirtSizesOptions } from "@/lib/constants";

export type TamanhoFarda = {
  tamanho: string | null;
  quantidade: number;
  checked: number;
};

type ChartFardaProps = {
  title?: string;
  description?: string;
  data: TamanhoFarda[];
  download?: React.ReactNode;
  allData?: {
    participantes: TamanhoFarda[];
    servir: TamanhoFarda[];
  };
  sizeOrder?: string[];
};

export const ChartFarda = ({
  data,
  download,
  title = "Fardas",
  description = "Quantidade de fardas por tamanho",
  allData,
  sizeOrder,
}: ChartFardaProps) => {
  const chartConfig = {
    quantidade: {
      label: "Total",
      color: "hsl(var(--chart-primary))",
    },
    checked: {
      label: "Checkin",
      color: "hsl(var(--chart-primary-ghost))",
    },
  } satisfies ChartConfig;

  const totalFardsChecked = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.checked, 0);
  }, [data]);

  const [copied, setCopied] = useState(false);

  const formatClipboardText = useCallback(() => {
    if (!allData) return "";

    const formatSizes = (sizes: TamanhoFarda[], label: string) => {
      const order = sizeOrder ?? shirtSizesOptions.map((shirt) => shirt.value);
      const sortedSizes = sizes
        .filter((size) => size.tamanho && size.quantidade > 0)
        .sort((a, b) => {
          const indexA = order.indexOf(a.tamanho ?? "");
          const indexB = order.indexOf(b.tamanho ?? "");
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          return (a.tamanho ?? "").localeCompare(b.tamanho ?? "");
        });

      const sizeText = sortedSizes
        .map((size) => `${size.tamanho}: ${size.quantidade}`)
        .join("\n");

      return `Tamanhos das Fardas ${label}:\n${sizeText}`;
    };

    const participantesText = formatSizes(
      allData.participantes,
      "Participantes",
    );
    const servirText = formatSizes(allData.servir, "Servir");

    const sections = [];
    if (allData.participantes.length > 0) {
      sections.push(participantesText);
    }
    if (allData.servir.length > 0) {
      sections.push(servirText);
    }

    const note =
      allData.participantes.length > 0 && allData.servir.length > 0
        ? "\n\nNota: Os dados mostram o total combinado de homens e mulheres para cada categoria."
        : "";

    return sections.join("\n\n") + note;
  }, [allData, sizeOrder]);

  const handleCopySuccess = () => {
    setCopied(true);
    toast({
      title: "Informações copiadas!",
      description: "Dados copiados para a área de transferência",
      variant: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="tamanho"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="quantidade"
              stackId="a"
              fill="var(--color-quantidade)"
              radius={2}
              offset={12}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
            <Bar
              dataKey="checked"
              stackId="b"
              offset={12}
              fill="var(--color-checked)"
              radius={2}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col justify-between gap-2 px-2 sm:flex-row">
        <p className="flex text-xs font-medium leading-5 text-muted-foreground sm:text-sm">
          Quantidade total de Fardas dos inscritos que fizeram check-in |{" "}
          {totalFardsChecked}
        </p>

        <div className="flex gap-2">
          {allData && (
            <CopyToClipboard
              text={formatClipboardText()}
              onCopy={handleCopySuccess}
            >
              <Button variant="outline" className="flex items-center gap-1">
                <span className="text-xs sm:text-sm">
                  {copied ? "Copiado!" : "Copiar"}
                </span>
                {copied ? (
                  <Check className="h-4 w-4 sm:ml-1" />
                ) : (
                  <Copy className="h-4 w-4 sm:ml-1" />
                )}
              </Button>
            </CopyToClipboard>
          )}
          {download && <Button variant="outline">{download}</Button>}
        </div>
      </CardFooter>
    </Card>
  );
};
