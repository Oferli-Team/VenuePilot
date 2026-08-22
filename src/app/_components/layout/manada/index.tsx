"use client";

import { useEventStore } from "@/lib/store/EventStore";
import { AppSidebar } from "../../sidebar-app";
import { Container } from "../../ui/container";
import { ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import Header from "./header";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { event } = useEventStore();
  return (
    <ResizablePanelGroup direction="horizontal">
      <AppSidebar />
      <ResizablePanel defaultSize={82}>
        <Header />
        <ResizablePanel defaultSize={90} className="min-h-screen border-none">
          <Container className="flex-1 pt-24">
            {event && (
              <p className="mb-1 text-end text-xs text-muted-foreground">
                Evento {event?.slug}
              </p>
            )}
            {children}
          </Container>
        </ResizablePanel>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
