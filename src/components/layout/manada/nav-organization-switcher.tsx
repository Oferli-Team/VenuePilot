"use client";

import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useFindManyOrganizations } from "@/lib/hooks/organization";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { Skeleton } from "../../ui/skeleton";
import { maskCNPJ } from "@/lib/utils/maskCPF";

export type NavOrganizationSwitcherProps = Readonly<{
  organization: {
    title: string;
    url: string;
    enable: boolean;
    subItems?: {
      title: string;
      url: string;
    }[];
  }[];
}>;

export function NavOrganizationSwitcher({
  organization,
}: NavOrganizationSwitcherProps) {
  const { isMobile } = useSidebar();

  const { organizations, isLoading } = useFindManyOrganizations();
  const [currentOrgSlug, setCurrentOrgSlug] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setCurrentOrgSlug(getCurrentOrgFromCookie());
  }, [pathname]);

  const currentOrganization = organizations?.find(
    (org) => org.slug === currentOrgSlug,
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isLoading}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isLoading ? (
                <div className="grid flex-1 space-y-2 text-left leading-tight">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ) : (
                <div className="grid flex-1 space-y-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">
                    {currentOrganization?.name}
                  </span>
                  {currentOrganization?.cnpj && (
                    <span className="truncate text-xs text-muted-foreground">
                      {maskCNPJ(currentOrganization?.cnpj)}
                    </span>
                  )}
                </div>
              )}
              {isLoading ? (
                <Skeleton className="ml-auto h-6 w-6" />
              ) : (
                <EllipsisVertical className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left">
                <p className="truncate text-xs font-normal text-muted-foreground">
                  Configuração
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {organization.map(
                (item) =>
                  item.enable && (
                    <DropdownMenuItem
                      key={item.title}
                      asChild
                      className="cursor-pointer"
                    >
                      {item?.subItems ? (
                        <>
                          <DropdownMenuSeparator />

                          <DropdownMenuSub key={item.title}>
                            <DropdownMenuSubTrigger>
                              {item.title}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                {item.subItems.map((subItem) => (
                                  <DropdownMenuItem key={subItem.title}>
                                    <Link href={subItem.url}>
                                      {subItem.title}
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </>
                      ) : (
                        <Link href={item.url}>{item.title}</Link>
                      )}
                    </DropdownMenuItem>
                  ),
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
