import { api } from "@/trpc/react";

export function useInvalidateQueries() {
  const utils = api.useUtils();

  const invalidateDataTablePagination = async () => {
    await utils.inscricao.getAllRegistersWithPagination.invalidate();
  };

  const invalidateCheckIn = async () => {
    await Promise.all([
      utils.inscricao.getAllRegistersWithPagination.invalidate(),
      utils.inscricao.getCheckInStats.invalidate(),
    ]);
  };

  const invalidateFamily = async () => {
    await Promise.all([
      utils.inscricao.getAllRegistersWithPagination.invalidate(),
      utils.inscricao.getChartFamily.invalidate(),
      utils.inscricao.getUniqueColumnValueToFilter.refetch(), // update the filter options
    ]);
  };

  const invalidateHealth = async () => {
    await Promise.all([
      utils.inscricao.getAllRegistersWithPagination.invalidate(),
      utils.inscricao.getChartFamily.invalidate(),
      utils.inscricao.getHealthStats.invalidate(),
      utils.inscricao.getUniqueColumnValueToFilter.refetch(), // update the filter options
    ]);
  };

  const invalidateInputLegendaryNumber = async () => {
    await Promise.all([
      utils.inscricao.getAllRegistersWithPagination.invalidate(),
      utils.inscricao.getLegendaryNumberEditedStats.invalidate(),
    ]);
  };

  const invalidateLetters = async () => {
    await Promise.all([
      utils.inscricao.getLettersStats.invalidate(),
      utils.inscricao.getAllRegistersWithPagination.invalidate(),
    ]);
  };

  const invalidateVehicles = async () => {
    await utils.vehicle.getAll.invalidate();
  };

  const invalidateVehicleTypeBus = async () => {
    await utils.vehicle.getAllBus.invalidate();
    await utils.inscricao.getAllParticipantsAndLegendaryFamilies.invalidate();
  };

  const invalidateVehicleTypeCar = async () => {
    await utils.vehicle.getAllCars.invalidate();
    await utils.inscricao.getAllLegendary.invalidate();
  };

  const invalidateMembers = async () => {
    await utils.member.getOrganizationMembers.invalidate();
  };

  const invalidateEventSettings = async () => {
    await utils.evento.getSettingsEvent.invalidate();
  };

  const invalidateEventStore = async () => {
    await utils.evento.getEventDetails.invalidate();
  };

  return {
    invalidateDataTablePagination,
    invalidateCheckIn,
    invalidateFamily,
    invalidateHealth,
    invalidateInputLegendaryNumber,
    invalidateLetters,
    invalidateVehicles,
    invalidateVehicleTypeBus,
    invalidateVehicleTypeCar,
    invalidateMembers,
    invalidateEventSettings,
    invalidateEventStore,
  };
}
