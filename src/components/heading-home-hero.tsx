"use client";

import { useAbility } from "@/lib/auth/hooks/useAbility";
import { ITOP } from "@/lib/constants";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./ui/button";

export const HeadingHomeHero = ({ className }: { className?: string }) => {
  const ability = useAbility();
  const { orgsRoutes } = useEventRoutes({});

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-3 text-center sm:items-start sm:text-start",
        className,
      )}
    >
      <span className="rounded-md bg-muted/30 px-4 py-2 text-lg font-semibold tracking-wider text-primary">
        {ITOP.short_name}
      </span>
      <h1 className="m-0 p-0 text-3xl font-extrabold uppercase sm:text-6xl">
        {ITOP.name}
      </h1>

      <h2 className="font-semibold sm:text-xl">{ITOP.description}</h2>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {ability.can("read", "Organization") && (
          <Button size="lg">
            <Link href={orgsRoutes.dashboard}>Administrar Evento</Link>
          </Button>
        )}
        <Button size="lg" variant="outline">
          <Link href="/demo">Ver demonstração</Link>
        </Button>
      </div>
    </div>
  );
};
