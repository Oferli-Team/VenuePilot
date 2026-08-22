import { columns } from "@/components/coupon/columns";
import { DataTable } from "@/components/ui/data-table";
import { SetCoupon } from "@/components/set-counpon";
import { type ManadaPagesParams } from "@/lib/types";
import { getEvent } from "@/lib/utils/getEvent";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function CupomDescontoPage({ params }: ManadaPagesParams) {
  const evento = await getEvent({
    params,
  });

  if (!evento) {
    redirect("/manada");
  }

  const coupons = await api.cupom.getAll({
    eventoId: evento.id,
  });

  const couponsWithRemaining = coupons.map((coupon) => ({
    ...coupon,
    quantidadeDisponivel: coupon.quantidade - coupon.usadoCount,
  }));

  return (
    <>
      <SetCoupon />

      <div className="rounded-md border border-input bg-card p-4 shadow-md">
        <DataTable
          columns={columns}
          data={couponsWithRemaining}
          search={{
            placeholder: "Busque pelo código do cupom",
            field: "codigo",
          }}
        />
      </div>
    </>
  );
}
