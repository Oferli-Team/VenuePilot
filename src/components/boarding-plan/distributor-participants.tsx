"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { DraggableCardFamily } from "@/components/boarding-plan/draggable-card-family";
import { Droppable } from "@/components/droppable";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type Vehicle } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import Link from "next/link";
import { DroppableVehicles } from "./droppable-vehicles";
import { ScrollArea } from "../ui/scroll-area";
import { generateBoardingPlanPDF } from "@/lib/utils/generateBoardingPlanPDF";
import { useFindEvent } from "@/lib/hooks/event";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-modal";
import { SuccessCard } from "../success-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DraggableCardLegendary } from "./draggable-card-legendary";
import { useBoardingPlanStore } from "./boarding-plan-store";
import { ButtonsAction } from "./buttons-action";
import { Bus, ChevronLeft, ChevronRight } from "lucide-react";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

export type ItemParentsType = {
  id: string;
  participants?: number;
  legendary?: number;
  name: string;
  family?: string;
  service?: string;
  identifier?: string;
  type: "SERVIR" | "PARTICIPANTE";
  vehicleId?: string;
};

export type VehicleType = Pick<
  Vehicle,
  | "name"
  | "identifier"
  | "id"
  | "totalCapacity"
  | "owner"
  | "function"
  | "notes"
  | "plate"
>;

type DistributorParticipantsProps = {
  vehicles: VehicleType[];
  families: ItemParentsType[];
  className?: string;
};

export const DistributorParticipants = ({
  vehicles,
  families,
  className,
}: DistributorParticipantsProps) => {
  const { orgsRoutes } = useEventRoutes({});
  const { event } = useFindEvent();
  const { open } = useSidebar();
  const { invalidateVehicleTypeBus } = useInvalidateQueries();
  const {
    itemParentsParticipants,
    setItemParentsParticipants,
    hasUnsavedBusChanges,
    setHasUnsavedBusChanges,
  } = useBoardingPlanStore();

  const [activeItem, setActiveItem] = useState<ItemParentsType | null>(null);
  const [enableExport, setEnableExport] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [isDataSave, setIsDataSave] = useState(false);

  const { mutateAsync: updateRegisters, isPending: updatePending } =
    api.inscricao.updateParticipantsWithVehicleWithInngest.useMutation({
      async onSuccess() {
        await invalidateVehicleTypeBus();
      },
    });

  const { refetch: getBoardingPlanResult } =
    api.inscricao.getBoardingPlanResult.useQuery(
      { eventId: event?.id ?? "" },
      { enabled: enableExport },
    );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Aumentando a distância de ativação para suavizar o início do arrasto
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const updateItemInVehicle = (
    item: ItemParentsType,
    newVehicleId: string | null,
  ) => {
    const updated = { ...itemParentsParticipants };

    for (const [vehicleId, items] of Object.entries(updated)) {
      updated[vehicleId] = items.filter((i) => i.id !== item.id);
    }

    const targetVehicle = newVehicleId ?? "unallocated";
    updated[targetVehicle] ??= [];

    updated[targetVehicle].push(item);

    setItemParentsParticipants(updated);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as ItemParentsType | undefined;
    setActiveItem(data ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const item = active.data.current as ItemParentsType;
    const newVehicleId = over.id.toString();

    updateItemInVehicle(item, newVehicleId);
  };

  const getTotalParticipants = (vehicleId: string) =>
    (itemParentsParticipants[vehicleId] ?? []).reduce(
      (sum, f) => sum + (f.type === "PARTICIPANTE" ? (f.participants ?? 0) : 0),
      0,
    );

  const getTotalLegendary = (vehicleId: string) =>
    (itemParentsParticipants[vehicleId] ?? []).filter(
      (f) => f.type === "SERVIR",
    ).length;

  const getTotalUsed = (vehicleId: string) =>
    getTotalParticipants(vehicleId) + getTotalLegendary(vehicleId);

  const handleRemoveAll = async () => {
    const formattedData: Record<string, ItemParentsType[]> = {};

    vehicles.forEach((vehicle) => {
      formattedData[vehicle.id] = [];
    });

    formattedData.unallocated = families.map((family) => family);

    setItemParentsParticipants(formattedData);
  };

  const handleOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleSave = async () => {
    try {
      const boarding = Object.entries(itemParentsParticipants).map(
        ([vehicleId, users]) => ({
          vehicleId,
          users: users.map((user) => ({
            id: user.id,
            type: user.type,
          })),
        }),
      );

      await updateRegisters({
        boarding,
        eventId: event?.id ?? "",
      });

      setHasUnsavedBusChanges(false);
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

  const hasBoardingPlan = useMemo(() => {
    const hasSomeFamily = Object.entries(itemParentsParticipants).some(
      (item) => {
        const families = item[1];
        const vehicleId = item[0];
        return vehicleId !== "unallocated" && families.length > 0;
      },
    );
    return hasSomeFamily;
  }, [itemParentsParticipants]);

  return (
    <>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveItem(null)}
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
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-bold">Viaturas</h2>
                <p>Ônibus</p>
              </div>
              <ButtonsAction
                hasUnsaved={hasUnsavedBusChanges}
                hasBoardingPlan={hasBoardingPlan}
                enableExport={enableExport}
                handleRemoveAll={handleRemoveAll}
                handleExportBoardingPlan={handleExportBoardingPlan}
                handleOpenAlert={handleOpenAlert}
              />
            </div>
            <GridTwoColumns className="h-fit w-full md:grid-cols-1 lg:grid-cols-2">
              {vehicles && vehicles.length === 0 && (
                <div className="col-span-full w-full space-y-2 p-2">
                  <p>Não há viaturas cadastradas, comece agora!</p>
                  <Button asChild>
                    <Link href={orgsRoutes.event.boardingPlan.createVehicle}>
                      Cadastrar Viatura
                    </Link>
                  </Button>
                </div>
              )}
              {vehicles
                ? vehicles.map((vehicle) => (
                    <DroppableVehicles
                      key={vehicle.id}
                      vehicle={vehicle}
                      icon={Bus}
                      totalParticipants={getTotalParticipants(vehicle.id)}
                      totalLegendary={getTotalLegendary(vehicle.id)}
                      totalUsed={getTotalUsed(vehicle.id)}
                    >
                      <GridTwoColumns className="grid-cols-2 gap-2">
                        {itemParentsParticipants[vehicle.id]?.map((item) =>
                          item.type === "PARTICIPANTE" ? (
                            <DraggableCardFamily
                              key={item.id}
                              id={item.id}
                              name={`Família ${item.id}`}
                              users={item.participants ?? 0}
                              data={{
                                ...item,
                                name: `Família ${item.id}`,
                              }}
                            />
                          ) : item.type === "SERVIR" ? (
                            <DraggableCardLegendary
                              key={item.id}
                              {...item}
                              data={item}
                            />
                          ) : null,
                        )}
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
              <Tabs defaultValue="participant">
                <SidebarHeader className="bg-card pt-[5.5rem]">
                  {open ? (
                    <div className="flex items-center justify-between">
                      <TabsList>
                        <TabsTrigger
                          value="participant"
                          className="font-semibold"
                        >
                          Sentinelas
                        </TabsTrigger>
                        <TabsTrigger
                          value="legendary"
                          className="font-semibold"
                        >
                          Legendários
                        </TabsTrigger>
                      </TabsList>
                      <SidebarTrigger title="reduzir">
                        <ChevronRight className="size-4" />
                      </SidebarTrigger>
                    </div>
                  ) : (
                    <SidebarTrigger title="ampliar">
                      <ChevronLeft className="size-4" />
                    </SidebarTrigger>
                  )}
                </SidebarHeader>
                <SidebarContent className="bg-card">
                  <Droppable
                    id="unallocated"
                    className="w-full border bg-transparent"
                  >
                    <ScrollArea className="relative h-[38rem] w-full pr-3">
                      <TabsContent value="participant">
                        <p className="text-sm">
                          Famílias:{" "}
                          {itemParentsParticipants.unallocated
                            ? itemParentsParticipants.unallocated.filter(
                                (item) => item.type === "PARTICIPANTE",
                              ).length
                            : 0}
                        </p>
                        <Separator className="mt-3" />

                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                          {itemParentsParticipants.unallocated &&
                            itemParentsParticipants.unallocated.length > 0 &&
                            itemParentsParticipants.unallocated.map(
                              (item) =>
                                item.type === "PARTICIPANTE" && (
                                  <DraggableCardFamily
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    users={item.participants ?? 0}
                                    data={item}
                                    className={
                                      activeItem?.id === item.id
                                        ? "invisible scale-0 opacity-0"
                                        : ""
                                    }
                                  />
                                ),
                            )}

                          {!itemParentsParticipants.unallocated &&
                            Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton
                                key={`${i + 1}`}
                                className="h-16 border bg-background px-3 py-2"
                              />
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="legendary">
                        <p className="text-sm">
                          Legendários:{" "}
                          {itemParentsParticipants.unallocated
                            ? itemParentsParticipants.unallocated.filter(
                                (item) => item.type === "SERVIR",
                              ).length
                            : 0}
                        </p>

                        <Separator className="mt-3" />

                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                          {itemParentsParticipants.unallocated &&
                            itemParentsParticipants.unallocated.length > 0 &&
                            itemParentsParticipants.unallocated.map(
                              (item) =>
                                item.type === "SERVIR" && (
                                  <DraggableCardLegendary
                                    {...item}
                                    data={item}
                                    key={item.id}
                                    className={
                                      activeItem?.id === item.id
                                        ? "invisible scale-0 opacity-0"
                                        : ""
                                    }
                                  />
                                ),
                            )}

                          {!itemParentsParticipants.unallocated &&
                            Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton
                                key={`${i + 1}`}
                                className="h-16 border bg-background px-3 py-2"
                              />
                            ))}
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </Droppable>
                </SidebarContent>
              </Tabs>
              <SidebarRail />
            </Sidebar>
          </ResizablePanel>

          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "ease",
            }}
          >
            {activeItem && activeItem.type === "PARTICIPANTE" ? (
              <DraggableCardFamily
                id={activeItem.id}
                name={activeItem.name}
                users={activeItem.participants ?? 0}
                data={activeItem}
              />
            ) : (
              activeItem?.type === "SERVIR" && (
                <DraggableCardLegendary {...activeItem} data={activeItem} />
              )
            )}
          </DragOverlay>
        </ResizablePanelGroup>
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
              <Button onClick={handleSave} loading={updatePending}>
                Confirmar
              </Button>
            </AlertDialogFooter>
          )}

          {isDataSave && (
            <SuccessCard
              title="Criado com Sucesso"
              description="Plano de embarque para Sentinelas foi criado com sucesso!"
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
