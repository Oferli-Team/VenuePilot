"use client";
import { type ReactNode } from "react";
import Heading from "./Heading";

type ItemsContainerProps = {
  title: string;
  children: ReactNode;
};

export default function ItemsContainer({
  title,
  children,
}: ItemsContainerProps) {
  return (
    <div className="bg-gray-950/20 py-8 md:px-16 flex relative flex-col items-center justify-center mt-8">
      <Heading isCenter>{title}</Heading>

      <div className="flex w-full flex-col px-4 gap-3 mt-8 divide-y-2 divide-gray-950">
        {children}
      </div>
    </div>
  );
}
