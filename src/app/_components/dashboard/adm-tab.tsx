"use client";

import { api } from "@/trpc/react";
import { GridTwoColumns } from "../grid-two-columns";
import { ChartFarda } from "./chart-farda";
import { ChartSkeleton } from "../ui/chart-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DataTable } from "../ui/data-table";
import { columnsLinksSecreto } from "./columns-link-secreto";
import { ArrowDownToLine } from "lucide-react";
import { CSVLink } from "react-csv";
import { useMemo } from "react";

type AdmTabProps = {
  eventoId: string;
};

export const AdmTab = ({ eventoId }: AdmTabProps) => {
  const { data: dataFarda, isPending: isPendingFarda } =
    api.dashboard.getFarda.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const { data: linksSecretosUsed, isPending: isPendingLinks } =
    api.dashboard.getLinkSecretoUsed.useQuery(
      {
        eventoId,
      },
      { enabled: !!eventoId },
    );

  const csv = {
    data: dataFarda?.familiaFardaParticipantes ?? [],
    filename: "fardas-novos-legendarios-top",
  };

  const clipboardData = useMemo(() => {
    if (!dataFarda?.chartData) return undefined;

    return {
      participantes: dataFarda.chartData,
      servir: [],
    };
  }, [dataFarda]);

  return (
    <div className="flex flex-col gap-4">
      <GridTwoColumns className="flex flex-col sm:grid">
        {isPendingFarda ? (
          <ChartSkeleton />
        ) : (
          dataFarda && (
            <ChartFarda
              data={dataFarda?.chartData}
              allData={clipboardData}
              download={
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
              }
            />
          )
        )}
      </GridTwoColumns>

      {isPendingLinks ? (
        <ChartSkeleton />
      ) : (
        linksSecretosUsed?.chartData && (
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
        )
      )}
    </div>
  );
};
