"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapside";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type IconType } from "react-icons/lib";

export type NavAdministrationProps = {
  administration: {
    title: string;
    url: string;
    icon?: LucideIcon | IconType;
    enable: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
};

export const NavAdministration = ({
  administration,
}: NavAdministrationProps) => {
  const pathname = usePathname();

  const isRouteActive = (itemRoute: string) => {
    if (pathname === itemRoute) {
      return true;
    }
    return false;
  };

  const hasItemEnable = administration.some((item) => item.enable);

  const isMenuActive = (
    item: NavAdministrationProps["administration"]["0"],
  ) => {
    return (
      pathname === item.url ||
      item.items?.some((subItem) => pathname === subItem.url)
    );
  };

  const { setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    setOpenMobile(false);
  };

  return (
    hasItemEnable && (
      <SidebarGroup>
        <SidebarGroupLabel>Administração</SidebarGroupLabel>
        <SidebarMenu>
          {administration.map((item) => {
            if (item.items)
              return (
                item.enable && (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isMenuActive(item)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isMenuActive(item)}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isRouteActive(subItem.url)}
                                onClick={closeSidebar}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              );

            return (
              item.enable && (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.url)}
                    tooltip={item.title}
                    onClick={closeSidebar}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    )
  );
};
