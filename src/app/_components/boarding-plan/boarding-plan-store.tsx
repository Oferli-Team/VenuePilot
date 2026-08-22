import { create } from "zustand";
import type { ItemParentsType, VehicleType } from "./distributor-participants";
import type { Cars, Legendary } from "./distributor-legendary";

type ItemParentsParticipantState = Record<
  string | "unallocated",
  ItemParentsType[]
>;
type ItemParentsLegendaryState = Record<"unallocated" | string, Legendary[]>;

type BoardingPlanState = {
  itemParentsParticipants: ItemParentsParticipantState;
  itemParentsLegendary: ItemParentsLegendaryState;
  setItemParentsParticipants: (
    itemParentsParticipants: ItemParentsParticipantState,
  ) => void;
  setInitialItemParentsParticipants: (
    vehicles: VehicleType[],
    families: ItemParentsType[],
  ) => void;
  setInitialItemParentsLegendary: (cars: Cars[], users: Legendary[]) => void;
  setItemParentsLegendary: (
    itemParentsLegendary: ItemParentsLegendaryState,
  ) => void;
  hasUnsavedBusChanges: boolean;
  hasUnsavedCarsChanges: boolean;
  setHasUnsavedCarsChanges: (value: boolean) => void;
  setHasUnsavedBusChanges: (value: boolean) => void;
};

export const useBoardingPlanStore = create<BoardingPlanState>()((set) => ({
  itemParentsParticipants: {},
  itemParentsLegendary: {},
  hasUnsavedBusChanges: false,
  hasUnsavedCarsChanges: false,
  setItemParentsParticipants: (itemParentsParticipants) =>
    set((state) => ({
      ...state,
      itemParentsParticipants,
      hasUnsavedBusChanges: true,
    })),
  setItemParentsLegendary: (itemParentsLegendary) =>
    set((state) => ({
      ...state,
      itemParentsLegendary,
      hasUnsavedCarsChanges: true,
    })),
  setHasUnsavedCarsChanges: (value) =>
    set((state) => ({
      ...state,
      hasUnsavedCarsChanges: value,
    })),
  setHasUnsavedBusChanges: (value) =>
    set((state) => ({
      ...state,
      hasUnsavedBusChanges: value,
    })),
  resetStore: () =>
    set({
      itemParentsParticipants: {},
      itemParentsLegendary: {},
      hasUnsavedBusChanges: false,
      hasUnsavedCarsChanges: false,
    }),
  setInitialItemParentsParticipants: (
    vehicles: VehicleType[] | null,
    families: ItemParentsType[] | null,
  ) => {
    const formattedData: Record<string, ItemParentsType[]> = {};
    if (vehicles && families) {
      vehicles.forEach((vehicle) => {
        formattedData[vehicle.id] = families
          .filter((family) => family.vehicleId === vehicle.id)
          .map((family) => ({
            id: family.id,
            family: family.family,
            participants: family.participants,
            type: family.type,
            name: family.name,
            service: family.service,
            identifier: family.identifier,
          }));
      });
    }
    if (families) {
      formattedData.unallocated = families
        .filter((family) => !family.vehicleId)
        .map((family) => ({
          id: family.id,
          family: family.family,
          participants: family.participants,
          type: family.type,
          name: family.name,
          service: family.service,
          identifier: family.identifier,
        }));
    }
    set({
      itemParentsParticipants: formattedData,
      hasUnsavedBusChanges: false,
    });
  },
  setInitialItemParentsLegendary: (
    cars: Cars[] | null,
    users: Legendary[] | null,
  ) => {
    const formattedData: Record<string, ItemParentsLegendaryState[]> = {};

    if (cars && users) {
      cars.forEach((car) => {
        formattedData[car.id] = users
          .filter((user) => user.vehicleId === car.id)
          .map((user) => ({
            ...user,
          }));
      });
    }

    if (users) {
      formattedData.unallocated = users
        .filter((user) => !user.vehicleId)
        .map((user) => ({
          ...user,
        }));
    }
    set({
      itemParentsLegendary: formattedData,
      hasUnsavedCarsChanges: false,
    });
  },
}));
