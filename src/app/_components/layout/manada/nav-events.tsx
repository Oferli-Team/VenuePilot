"use client";

import { ExternalLink, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavEventsProps = {
  events: {
    title: string;
    url: string;
    icon: LucideIcon;
    enable: boolean;
  }[];
};

export const NavEvents = ({ events }: NavEventsProps) => {
  const pathname = usePathname();

  const isRouteActive = (itemRoute: string) => {
    if (pathname === itemRoute) {
      return true;
    }
    return false;
  };

  const hasItemEnable = events.some((item) => item.enable);

  return (
    hasItemEnable && (
      <SidebarGroup>
        <SidebarGroupLabel>Evento</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {events.map(
              (item) =>
                item.enable && (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isRouteActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  );
};
