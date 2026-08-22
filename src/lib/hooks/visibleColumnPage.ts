import { useMemo } from "react";
import { getVisibleColumnPage } from "../utils/getVisibleColumnPage";
import type { ENUM_EVENT_TYPE } from "../enum";
import { useEventStore } from "../store/EventStore";
import type { VISIBLE_COLUMNS, visibleColumnByEventType } from "../constants";

type Props = {
  page: keyof (typeof visibleColumnByEventType)[ENUM_EVENT_TYPE];
  fallback: keyof typeof VISIBLE_COLUMNS;
};

export const useVisibleColumnPage = ({ page, fallback }: Props) => {
  const { event } = useEventStore();

  const visibleColumnPage = useMemo(() => {
    return getVisibleColumnPage({
      type: event?.type as ENUM_EVENT_TYPE,
      page,
      fallback,
    });
  }, [event, page, fallback]);

  return { visibleColumnPage };
};
