import React from "react";
import { api } from "@/trpc/server";
import { SetVehicle } from "@/components/boarding-plan/set-vehicle";
import { Spinner } from "@/components/ui/spinner";

type VehicleIdProps = {
  readonly params: {
    id: string;
  };
};

export default async function VehicleId({ params }: VehicleIdProps) {
  const { id } = params;

  if (typeof id !== "string") {
    return <Spinner />;
  }

  const data = await api.vehicle.getById({
    id,
  });

  if (!data) {
    return <Spinner />;
  }

  return <SetVehicle initialData={data} />;
}
