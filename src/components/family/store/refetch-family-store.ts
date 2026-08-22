import { type Inscricao } from "@prisma/client";
import {
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";
import { create } from "zustand";

type Refetch = {
  refetchTableList: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<Inscricao[]>>;
  refetchChart: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        family: string;
        registers: number;
      }[]
    >
  >;
};

interface RefetchFamilyData {
  refetchTableList: Refetch["refetchTableList"];
  refetchChart: Refetch["refetchChart"];
  setRefetchData: (
    refetchChart: Refetch["refetchChart"],
    refetchTableList: Refetch["refetchTableList"],
  ) => void;
}

const defaultQueryObserverResult = async <T>(): Promise<
  QueryObserverResult<T>
> => {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
    isFetching: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isLoadingError: false,
    isRefetchError: false,
    isPaused: false,
    errorUpdateCount: 0,
    isPlaceholderData: false,
    isRefetching: false,
    isPending: true,
    isInitialLoading: false,
    fetchStatus: "idle",
    failureCount: 0,
    errorUpdatedAt: 0,
    dataUpdatedAt: 0,
    isStale: true,
    failureReason: null,
    promise: Promise.resolve(undefined as unknown as T),
    refetch: async () => defaultQueryObserverResult<T>(),
    status: "pending",
  };
};

export const useRefetchData = create<RefetchFamilyData>((set) => ({
  refetchTableList: (options) =>
    defaultQueryObserverResult<Inscricao[]>(options),
  refetchChart: (options) =>
    defaultQueryObserverResult<{ family: string; registers: number }[]>(
      options,
    ),
  setRefetchData: (
    refetchChart: Refetch["refetchChart"],
    refetchTableList: Refetch["refetchTableList"],
  ) =>
    set(() => ({
      refetchChart,
      refetchTableList,
    })),
}));
