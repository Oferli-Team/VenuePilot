"use client";

import { useFindEvent } from "@/lib/hooks/event";
import { api } from "@/trpc/react";
import { ArrowDownToLine } from "lucide-react";
import { useMemo } from "react";
import { CSVLink } from "react-csv";
import { GridTwoColumns } from "../../grid-two-columns";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ChartSkeleton } from "../../ui/chart-skeleton";
import { DataTable } from "../../ui/data-table";
import { ChartFarda } from "../chart-farda";
import { columnsLinksSecreto } from "../columns-link-secreto";
import { shirtSizesREM } from "@/lib/constants";

export const AdminRemTab = () => {
  const { event } = useFindEvent();

  const { data, isPending: dataIsPending } =
    api.dashboard.getRemTshirts.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const { data: linksSecretosUsed, isPending: isPendingLinks } =
    api.dashboard.getLinkSecretoUsed.useQuery(
      {
        eventoId: event?.id,
      },
      { enabled: !!event?.id },
    );

  const csv = {
    data: data?.tshirtSizesList ?? [],
    filename: `Relatório-Camisetas-REM-${event?.topNumero}`,
  };

  const chartDataByType = useMemo(() => {
    if (!data?.tshirtSizesList) return undefined;

    const processData = (tipoInscricao: "PARTICIPANTE" | "SERVIR") => {
      const sizeCounts = new Map<string, number>();

      data.tshirtSizesList
        .filter((item) => item.tipo === tipoInscricao)
        .forEach((item) => {
          if (item.camisetaMasculina && item.camisetaMasculina !== "-") {
            sizeCounts.set(
              item.camisetaMasculina,
              (sizeCounts.get(item.camisetaMasculina) ?? 0) + 1,
            );
          }

          if (item.camisetaFeminina && item.camisetaFeminina !== "-") {
            sizeCounts.set(
              item.camisetaFeminina,
              (sizeCounts.get(item.camisetaFeminina) ?? 0) + 1,
            );
          }
        });

      return Array.from(sizeCounts.entries())
        .map(([tamanho, quantidade]) => ({ tamanho, quantidade, checked: 0 }))
        .sort((a, b) => {
          const indexA = shirtSizesREM.indexOf(a.tamanho ?? "");
          const indexB = shirtSizesREM.indexOf(b.tamanho ?? "");
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          return (a.tamanho ?? "").localeCompare(b.tamanho ?? "");
        });
    };

    return {
      participantes: processData("PARTICIPANTE"),
      servir: processData("SERVIR"),
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <p>Baixe o relatório da quantidade de camisetas por inscrito</p>
        <Button asChild>
          <CSVLink
            {...csv}
            href="#"
            enclosingCharacter={'"'}
            separator={";"}
            className="flex items-center gap-1"
          >
            <span className="text-xs sm:text-sm">Baixar</span>
            <ArrowDownToLine className="h-4 w-4 sm:ml-1" />
          </CSVLink>
        </Button>
      </div>

      <GridTwoColumns className="flex flex-col sm:grid">
        {dataIsPending || !chartDataByType?.participantes ? (
          <ChartSkeleton />
        ) : (
          <ChartFarda
            title="Participantes"
            description="Quantidade de camisetas por tamanho para quem irá participar"
            data={chartDataByType.participantes}
            allData={chartDataByType}
            sizeOrder={shirtSizesREM}
          />
        )}

        {dataIsPending || !chartDataByType?.servir ? (
          <ChartSkeleton />
        ) : (
          <ChartFarda
            title="Servir"
            description="Quantidade de camisetas por tamanho para quem irá servir"
            data={chartDataByType.servir}
            allData={chartDataByType}
            sizeOrder={shirtSizesREM}
          />
        )}
      </GridTwoColumns>

      {isPendingLinks || !linksSecretosUsed?.chartData ? (
        <ChartSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Links Secretos</CardTitle>
            <CardDescription>
              Lista de links secretos que foram utilizados para realizar
              inscrição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columnsLinksSecreto}
              data={linksSecretosUsed.chartData}
              startSortingBy={[{ id: "quantidade", desc: true }]}
              pagination={{ pageIndex: 0, pageSize: 20 }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
