"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Droppable } from "@/components/droppable";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { GridThreeColumns } from "../grid-three-column";
import { GridTwoColumns } from "../grid-two-columns";
import { Button } from "../ui/button";
import Link from "next/link";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { toast } from "../ui/use-toast";
import { api } from "@/trpc/react";
import { generateBoardingPlanPDF } from "@/lib/utils/generateBoardingPlanPDF";
import { useFindEvent } from "@/lib/hooks/event";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { DraggableCardLegendary } from "./draggable-card-legendary";
import { SuccessCard } from "../success-card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-modal";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useBoardingPlanStore } from "./boarding-plan-store";
import { ButtonsAction } from "./buttons-action";
import { DroppableVehicles } from "./droppable-vehicles";
import { Vehicle } from "@prisma/client";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

export type Legendary = {
  id: string;
  name: string;
  service: string;
  family: string;
  identifier: string;
  vehicleId: string | null;
};

export type Cars = Pick<
  Vehicle,
  | "id"
  | "name"
  | "identifier"
  | "totalCapacity"
  | "owner"
  | "plate"
  | "function"
  | "notes"
>;

type DistributorLegendary = {
  users: Legendary[];
  cars: Cars[];
  className?: string;
};

export const DistributorLegendary = ({
  users,
  cars,
  className,
}: DistributorLegendary) => {
  const { open } = useSidebar();
  const { orgsRoutes } = useEventRoutes({});
  const { event } = useFindEvent();
  const { invalidateVehicleTypeCar } = useInvalidateQueries();
  const {
    itemParentsLegendary,
    setItemParentsLegendary,
    hasUnsavedCarsChanges,
    setHasUnsavedCarsChanges,
  } = useBoardingPlanStore();

  const [activeItem, setActiveItem] = useState<Legendary | null>(null);
  const [enableExport, setEnableExport] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [isDataSave, setIsDataSave] = useState(false);

  const { mutateAsync: update, isPending } =
    api.inscricao.updateLegendaryWithVehicle.useMutation({
      async onSuccess() {
        setHasUnsavedCarsChanges(false);
        await invalidateVehicleTypeCar();
      },
    });

  const { refetch: getBoardingPlanResult } =
    api.inscricao.getBoardingPlanResult.useQuery(
      { eventId: event?.id ?? "" },
      { enabled: enableExport },
    );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over) return;

    const data = active?.data?.current as Legendary | undefined;
    if (data) {
      setActiveItem(data);
    } else {
      console.error("Dados ausentes durante o arrasto:", active);
    }

    setActiveItem(null);

    const legendaryId = active.id.toString();
    const newVehicleId = over.id.toString();

    const legendary = users.find((f) => f.id === legendaryId);
    if (!legendary) return;

    updateLegendaryInVehicle(
      newVehicleId,
      legendaryId,
      legendary.name,
      legendary.service,
      legendary.family,
      legendary.vehicleId ?? "",
      legendary.identifier,
    );
  };

  const updateLegendaryInVehicle = (
    newVehicleId: string | null,
    legendaryId: string,
    name: string,
    service: string,
    family: string,
    vehicleId: string,
    identifier: string,
  ) => {
    const updatedItemParents = { ...itemParentsLegendary };

    for (const [vehicleId, families] of Object.entries(updatedItemParents)) {
      updatedItemParents[vehicleId] = families.filter(
        (f) => f.id !== legendaryId,
      );
    }

    Object.keys(updatedItemParents).forEach((vehicleId) => {
      if ((updatedItemParents[vehicleId] ?? []).length === 0) {
        updatedItemParents[vehicleId] = [];
      }
    });

    const targetVehicle = newVehicleId ?? "unallocated";

    updatedItemParents[targetVehicle] ??= [];

    updatedItemParents[targetVehicle].push({
      id: legendaryId,
      name,
      family,
      service,
      vehicleId,
      identifier,
    });

    setItemParentsLegendary(updatedItemParents);
  };

  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleSave = async () => {
    try {
      const boarding = Object.entries(itemParentsLegendary).map(
        ([vehicleId, users]) => ({
          vehicleId,
          users: users.map((user) => ({
            id: user.id,
          })),
        }),
      );

      await update({
        eventId: event?.id ?? "",
        boarding,
      });

      setIsDataSave(true);
    } catch (error) {
      console.log({ error });
      toast({
        title: "Algo deu errado!",
        description: "Não foi possível realizar o plano de embarque",
        variant: "destructive",
      });
    }
  };

  const handleExportBoardingPlan = async () => {
    setEnableExport(true);
    try {
      const { data } = await getBoardingPlanResult();

      if (!data || data.length === 0) {
        toast({
          title: "Não há dados para gerar relatório",
          variant: "destructive",
        });
        return;
      }

      generateBoardingPlanPDF(data, event!);
    } catch (error) {
      toast({
        title: "Erro ao Gerar relatório",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setEnableExport(false);
    }
  };

  const handleRemoveAll = async () => {
    const formattedData: Record<string, Legendary[]> = {};

    cars.forEach((car) => {
      formattedData[car.id] = [];
    });

    formattedData.unallocated = users.map((user) => user);

    setItemParentsLegendary(formattedData);
  };

  const getTotalLegendary = (vehicleId: string) =>
    (itemParentsLegendary[vehicleId] ?? []).length;

  const hasBoardingPlan = useMemo(() => {
    const hasSomeFamily = Object.entries(itemParentsLegendary).some((item) => {
      const families = item[1];
      const vehicleId = item[0];
      return vehicleId !== "unallocated" && families.length > 0;
    });
    return hasSomeFamily;
  }, [itemParentsLegendary]);

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          const data = event.active.data.current as Legendary | undefined;
          setActiveItem(data ?? null);
        }}
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full min-h-screen overflow-hidden"
          key={open ? "open" : "closed"}
        >
          <ResizablePanel
            defaultSize={open ? 40 : 96}
            className="h-full w-full !overflow-hidden !overflow-x-hidden !overflow-y-hidden [&[data-panel]]:!overflow-y-hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Viaturas</h2>
                <p>Carros</p>
              </div>
              <ButtonsAction
                hasUnsaved={hasUnsavedCarsChanges}
                hasBoardingPlan={hasBoardingPlan}
                enableExport={enableExport}
                handleRemoveAll={handleRemoveAll}
                handleExportBoardingPlan={handleExportBoardingPlan}
                handleOpenAlert={handleOpenAlert}
              />
            </div>

            <GridTwoColumns className="md:grid-cols-1 lg:grid-cols-2">
              {cars && cars.length === 0 && (
                <div className="col-span-full w-full space-y-2 p-2">
                  <p>Não há viaturas cadastradas, comece agora!</p>
                  <Button asChild>
                    <Link href={orgsRoutes.event.boardingPlan.createVehicle}>
                      Cadastrar Viatura
                    </Link>
                  </Button>
                </div>
              )}
              {cars
                ? cars.map((car) => (
                    <DroppableVehicles
                      key={car.id}
                      vehicle={car}
                      icon={Car}
                      totalLegendary={getTotalLegendary(car.id)}
                    >
                      <GridTwoColumns className="grid-cols-2 gap-2">
                        {itemParentsLegendary[car.id]?.map((item) => (
                          <DraggableCardLegendary
                            key={item.id}
                            {...item}
                            data={item}
                          />
                        ))}
                      </GridTwoColumns>
                    </DroppableVehicles>
                  ))
                : Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton
                      key={`${i + 1}`}
                      className="h-56 border bg-background p-4"
                    >
                      <Skeleton className="h-4 w-full bg-card" />
                    </Skeleton>
                  ))}
            </GridTwoColumns>
          </ResizablePanel>

          <ResizablePanel defaultSize={open ? 30 : 4}>
            <Sidebar
              side="right"
              collapsible="icon"
              variant="inset"
              className="w-[35%] border bg-card"
            >
              <SidebarHeader className="flex flex-row items-center justify-between bg-card pt-[5.5rem]">
                {open && (
                  <h4 className="font-semibold">
                    Legendários: {users?.length}
                  </h4>
                )}

                <SidebarTrigger title={open ? "reduzir" : "ampliar"}>
                  {open ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronLeft className="size-4" />
                  )}
                </SidebarTrigger>
              </SidebarHeader>
              <SidebarContent className="bg-card">
                <Droppable
                  id="unallocated"
                  className="w-full border bg-transparent"
                >
                  <ScrollArea className="relative h-[38rem] w-full pr-3">
                    <GridThreeColumns className="gap-2">
                      {itemParentsLegendary.unallocated &&
                        itemParentsLegendary.unallocated.length > 0 &&
                        itemParentsLegendary.unallocated.map((item) => (
                          <DraggableCardLegendary
                            key={item.id}
                            {...item}
                            data={item}
                            className={
                              activeItem?.id === item.family
                                ? "invisible scale-0 opacity-0"
                                : ""
                            }
                          />
                        ))}

                      {!itemParentsLegendary.unallocated &&
                        Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton
                            key={`${i + 1}`}
                            className="h-16 border bg-background px-3 py-2"
                          />
                        ))}
                    </GridThreeColumns>
                  </ScrollArea>
                </Droppable>
              </SidebarContent>
              <SidebarRail />
            </Sidebar>
          </ResizablePanel>
        </ResizablePanelGroup>
        <DragOverlay>
          {activeItem ? (
            <DraggableCardLegendary {...activeItem} data={activeItem} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogTrigger />

        <AlertDialogContent className={`${isDataSave && "border-none p-0"}`}>
          <AlertDialogHeader className={`${isDataSave && "hidden"}`}>
            <AlertDialogTitle>{!isDataSave && "Tem certeza?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {!isDataSave &&
                "Confirme se deseja criar/alterar plano de embarque. Esta é uma ação irreversível."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isDataSave && (
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button onClick={handleSave} loading={isPending}>
                Confirmar
              </Button>
            </AlertDialogFooter>
          )}

          {isDataSave && (
            <SuccessCard
              title="Criado com Sucesso"
              description="Plano de embarque para Legendários foi criado com sucesso!"
              content={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDataSave(false);
                    setOpenAlert(false);
                  }}
                >
                  Concluir
                </Button>
              }
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
