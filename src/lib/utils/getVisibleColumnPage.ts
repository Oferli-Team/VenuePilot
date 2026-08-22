import { type VISIBLE_COLUMNS, visibleColumnByEventType } from "../constants";
import { type ENUM_EVENT_TYPE } from "../enum";

type Params = {
  type: ENUM_EVENT_TYPE | undefined;
  page: keyof (typeof visibleColumnByEventType)[ENUM_EVENT_TYPE];
  fallback: keyof typeof VISIBLE_COLUMNS;
};

export const getVisibleColumnPage = ({
  type,
  page,
  fallback = "inscritos",
}: Params): keyof typeof VISIBLE_COLUMNS => {
  if (!type) return fallback;

  const config =
    visibleColumnByEventType[type as keyof typeof visibleColumnByEventType];
  const result = config?.[page];
  return result && typeof result === "string" && result.length > 0
    ? result
    : fallback;
};
