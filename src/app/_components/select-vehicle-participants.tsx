"use client";

import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { type Inscricao } from "@prisma/client";
import { type Row } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { SelectVehiclePopover } from "./ui/select-vehicle-popover";

type SelectVehicleProps = {
  row: Row<Inscricao>;
};

export const SelectVehicleParticipants = ({ row }: SelectVehicleProps) => {
  const { invalidateDataTablePagination } = useInvalidateQueries();

  const defaultIdValue = row.original.vehicleId ?? "null";

  const {
    mutateAsync: updateBoardingPlan,
    isPending: pendingUpdateBoardingPlan,
  } = api.inscricao.updateConfirmedSubscriptionWithBoardingPlan.useMutation({
    async onSuccess() {
      await invalidateDataTablePagination();
      toast({
        title: "Sucesso",
        description: `Viatura atribuída com sucesso.`,
        variant: "success",
      });
    },
    onError() {
      toast({
        title: "Erro",
        description: `Não foi possível atribuir a viatura.`,
        variant: "destructive",
      });
    },
  });

  const [enabled, setEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultIdValue,
  );

  const { data: vehicles } = api.vehicle.getVehiclesByParticipants.useQuery(
    {
      eventId: row.original.eventoId,
      active: true,
    },
    {
      enabled,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const vehicleOptions = useMemo(() => {
    if (vehicles && vehicles.length > 0) {
      return vehicles.map((vehicle) => {
        const hasVacation = vehicle?.totalCapacity >= vehicle?.usedCapacity;
        return {
          value: vehicle.id,
          label: {
            name: vehicle.name,
            identifier: vehicle.identifier,
            type: vehicle.type,
            hasVacation,
          },
        };
      });
    }
    return [
      {
        value: "",
        label: { name: "", identifier: "", type: "", hasVacation: true },
      },
    ];
  }, [vehicles]);

  const handleConfirm = async () => {
    const vehicleId = selectedId ?? "";
    try {
      await updateBoardingPlan({
        id: row.original.id,
        eventoId: row.original.eventoId,
        vehicleId: ["null", "undefined", "-", "Nenhum"].includes(vehicleId)
          ? undefined
          : vehicleId,
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Erro",
        description: `Não foi possível atribuir a viatura.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const vehicleId =
      row.getValue("vehicleId") === null
        ? "Nenhum"
        : row.getValue("vehicleId")?.toString();
    setSelectedId(vehicleId);
  }, [row.getValue("vehicleId")]);

  useEffect(() => {
    setEnabled(true);
  }, []);

  return (
    <SelectVehiclePopover
      setEnabled={setEnabled}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      options={vehicleOptions}
      onUpdate={handleConfirm}
      updateLoading={pendingUpdateBoardingPlan}
      placeholder="Selecione uma viatura"
      description={(selectedValue) =>
        `Certeza que deseja atribuir a viatura ${selectedValue} ao participante ${row.original.nome}?`
      }
    />
  );
};
