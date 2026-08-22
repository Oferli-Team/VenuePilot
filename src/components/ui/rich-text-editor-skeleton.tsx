// components/EditorSkeleton.js
import React from "react";
import { Skeleton } from "./skeleton";

export const RichTextEditorSkeleton = () => {
  return (
    <div className="w-full">
      {/* Skeleton da Barra de Ferramentas */}
      <div className="flex items-center space-x-4 rounded-t-sm border border-input p-2">
        {/* Headers */}
        <Skeleton className="h-6 w-10  "></Skeleton>
        <Skeleton className="h-6 w-10  "></Skeleton>

        {/* Font Picker */}
        <div className="h-6 w-24  "></div>

        {/* Outros Ícones */}
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
        <Skeleton className="h-6 w-6  "></Skeleton>
      </div>

      {/* Skeleton do Editor */}
      <div className="h-48 border border-t-0 border-input p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4  "></Skeleton>
          <Skeleton className="h-4 w-1/2  "></Skeleton>
          <Skeleton className="h-4 w-full  "></Skeleton>
          <Skeleton className="h-4 w-2/3  "></Skeleton>
          <Skeleton className="h-4 w-1/3  "></Skeleton>
        </div>
      </div>
    </div>
  );
};
