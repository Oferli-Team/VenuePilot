import React from "react";
import { formatDate } from "date-fns";
import type { VariablesRichTextTerms } from "@/lib/types";
import { useFormStore } from "./participante/useFormStore";
import { parseRichText } from "@/lib/utils/parseRichText";
import { cn } from "@/lib/utils";

export const TermAndConditional = ({ className }: { className?: string }) => {
  const { eventRegister } = useFormStore();

  const previewContent = React.useMemo(() => {
    if (!eventRegister?.terms) return "";

    const variables: VariablesRichTextTerms = {
      NR_TOP: eventRegister?.topNumero ?? 0,
      DATA_INICIO_EVENTO: eventRegister?.dataInicio
        ? formatDate(eventRegister?.dataInicio, "dd/MM/yyyy")
        : "",
      DATA_FIM_EVENTO: eventRegister?.dataFim
        ? formatDate(eventRegister?.dataFim, "dd/MM/yyyy")
        : "",
      PISTA: eventRegister?.pista ?? "",
    };

    const preview = parseRichText(eventRegister.terms, variables);
    return preview;
  }, [eventRegister]);

  return (
    <article
      dangerouslySetInnerHTML={{ __html: previewContent }}
      className={cn(
        "mb-8 max-h-[36rem] overflow-auto rounded-sm bg-background p-4 text-sm leading-7 tracking-wider [&>h1]:mb-6 [&>h2]:mb-5 [&>h3]:mb-4 [&>hr]:my-4 [&>ol]:mb-4 [&>p]:mb-4 [&>ul]:mb-4",
        className,
      )}
    ></article>
  );
};
