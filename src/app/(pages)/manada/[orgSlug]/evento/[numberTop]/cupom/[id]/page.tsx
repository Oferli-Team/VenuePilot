import React from "react";
import { api } from "@/trpc/server";
import { SetCoupon } from "@/components/set-counpon";

type CupomIdProps = {
  params: {
    id: string;
  };
};

export default async function CupomId({ params }: CupomIdProps) {
  const { id } = params;

  if (typeof id !== "string") {
    return <p>loading</p>;
  }

  const data = await api.cupom.getById({
    id,
  });

  if (!data) {
    return <p>loading</p>;
  }

  return <SetCoupon initialData={data} />;
}
