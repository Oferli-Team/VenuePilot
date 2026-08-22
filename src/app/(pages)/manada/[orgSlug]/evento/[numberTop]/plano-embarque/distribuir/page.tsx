"use client";

import React from "react";
import { api } from "@/trpc/react";
import { useFindEvent } from "@/lib/hooks/event";
import { useTabsBoardingPlan } from "@/components/boarding-plan/tabs-store";
import { DistributorLegendary } from "@/components/boarding-plan/distributor-legendary";
import { DistributorParticipants } from "@/components/boarding-plan/distributor-participants";
import { useBoardingPlanStore } from "@/components/boarding-plan/boarding-plan-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-modal";

export default function BoardingPlanDistributorPage({
  params,
}: {
  params: { orgSlug: string; numberTop: string };
}) {
  const { event } = useFindEvent();
  const { tab } = useTabsBoardingPlan();
  const {
    hasUnsavedCarsChanges,
    hasUnsavedBusChanges,
    setInitialItemParentsParticipants,
    setInitialItemParentsLegendary,
  } = useBoardingPlanStore();

  const [showAlertModal, setShowAlertModal] = React.useState(false);

  const { data: families } =
    api.inscricao.getAllParticipantsAndLegendaryFamilies.useQuery(
      {
        eventId: event?.id,
      },
      {
        enabled: !!event?.id,
      },
    );

  const { data: allLegendary } = api.inscricao.getAllLegendary.useQuery(
    {
      eventId: event?.id,
    },
    {
      enabled: !!event?.id,
    },
  );

  const { data: vehicles } = api.vehicle.getAllBus.useQuery(
    {
      eventId: event?.id,
    },
    { enabled: !!event?.id },
  );

  const { data: cars } = api.vehicle.getAllCars.useQuery(
    {
      eventId: event?.id,
    },
    { enabled: !!event?.id },
  );

  const renderTabsContent = React.useMemo(() => {
    switch (tab) {
      case "participants":
        return (
          <DistributorParticipants families={families} vehicles={vehicles} />
        );
      case "legendary":
        return <DistributorLegendary cars={cars} users={allLegendary} />;

      default:
        return null;
    }
  }, [params.numberTop, families, vehicles, cars, allLegendary]);

  const BOARDING_PLAN_ALERT_MODAL = "boarding-plan-alert-modal";

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedBusChanges || hasUnsavedCarsChanges) {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedBusChanges, hasUnsavedCarsChanges]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nearLeft = e.clientX <= 230;
      const blockByPreference =
        localStorage.getItem(BOARDING_PLAN_ALERT_MODAL) === "true";

      if (blockByPreference) return;

      if (
        (nearLeft && hasUnsavedBusChanges) ||
        (nearLeft && hasUnsavedCarsChanges)
      ) {
        setShowAlertModal(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasUnsavedBusChanges, hasUnsavedCarsChanges]);

  React.useEffect(() => {
    if (hasUnsavedCarsChanges || hasUnsavedBusChanges) {
      return;
    }

    setInitialItemParentsLegendary(cars, allLegendary);
    setInitialItemParentsParticipants(vehicles, families);
  }, [
    event?.topNumero,
    params.numberTop,
    vehicles,
    families,
    cars,
    allLegendary,
    hasUnsavedBusChanges,
    hasUnsavedCarsChanges,
  ]);

  const handleConfirmExit = () => {
    setShowAlertModal(false);
    localStorage.setItem(BOARDING_PLAN_ALERT_MODAL, "true");
  };

  return (
    <>
      {renderTabsContent}

      <AlertDialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas no plano de embarque. Se sair,
              todas as alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlertModal(false)}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Ok, entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
