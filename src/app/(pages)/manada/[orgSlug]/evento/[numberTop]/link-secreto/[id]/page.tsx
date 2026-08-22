import React from "react";
import { api } from "@/trpc/server";
import { SetSecretLink } from "@/components/set-secret-link";

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

  const data = await api.linkSecreto.getById({
    id,
  });

  if (!data) {
    return <p>loading</p>;
  }

  return <SetSecretLink initialData={data} />;
}
