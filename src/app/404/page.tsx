import React from "react";
import Link from "next/link";
import { DetailBlur } from "@/components/DetailBlur";
import { X } from "lucide-react";

const Custom404 = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center ">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-card bg-muted shadow-md">
        <X className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mb-3 mt-4 text-7xl font-extrabold text-primary drop-shadow-md">
        404
      </h1>
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <h2 className="text-xl">Ops, Algo deu Errado!</h2>
        <h3 className="">Página não encontrada</h3>

        <Link
          className="mt-6 rounded-md bg-primary p-3 font-medium hover:opacity-90"
          href="/"
        >
          Página Inicial
        </Link>
      </div>

      <DetailBlur side="left" direction="bottom" />
      <DetailBlur side="right" direction="top" />
    </div>
  );
};

export default Custom404;
