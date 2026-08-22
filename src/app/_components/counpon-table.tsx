import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Coupon = {
  id: string;
  code: string;
  used: number;
  available: number;
  percentage: number | string;
};

type CouponTableProps = {
  coupons: Coupon[];
};

export const CouponTable = ({ coupons }: CouponTableProps) => {
  return (
    <Table>
      <TableCaption>Lista dos cupons cadastrados</TableCaption>
      <TableHeader>
        <TableRow className="bg-background/50">
          <TableHead className="w-[100px] py-3">Código</TableHead>
          <TableHead className="py-3 text-center">QTD Usado</TableHead>
          <TableHead className="py-3 text-center">QTD Disponível</TableHead>
          <TableHead className="py-3 text-center">% Porcentagem</TableHead>
          <TableHead className="py-3 text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell className="font-medium">{coupon.code}</TableCell>
            <TableCell className="py-3 text-center">{coupon.used}</TableCell>
            <TableCell className="py-3 text-center">
              {coupon.available}
            </TableCell>
            <TableCell className="py-3 text-center">
              {coupon.percentage}
            </TableCell>
            <TableCell className="py-3 text-right">{coupon.actions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
