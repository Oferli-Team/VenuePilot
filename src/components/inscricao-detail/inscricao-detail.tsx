"use client";

import React from "react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useInscricaoDetail } from "./useInscricaoDetailStore";
import { cn } from "@/lib/utils";

const SidebarContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ScrollArea className={cn("h-full w-full pr-4", className)}>
      {children}
    </ScrollArea>
  );
};

export const InscricaoDetails = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { isOpenDrawer, isOpenSheet, setIsOpenDrawer, setIsOpenSheet } =
    useInscricaoDetail();

  return (
    <>
      {/* Sheet para telas maiores */}
      <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
        <SheetContent className="mb-6 h-screen pr-0 sm:max-w-[40rem]">
          <SheetHeader>
            <SheetTitle>Dados da Inscrição</SheetTitle>
            <SheetDescription />
          </SheetHeader>
          <SidebarContent>{children}</SidebarContent>
        </SheetContent>
      </Sheet>

      {/* Drawer para telas menores */}
      <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
        <DrawerContent>
          <DrawerHeader className="p-0 px-4 pt-6">
            <DrawerTitle>Dados da Inscrição</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <DrawerFooter className="p-0 px-4 pb-4">
            <SidebarContent className="h-[32rem]">{children}</SidebarContent>
            <DrawerClose asChild>
              <Button className="w-full" variant="outline">
                Concluir
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
