import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavSettingsProps = {
  settings: {
    title: string;
    url: string;
    icon: LucideIcon;
    enable: boolean;
  }[];
};

export const NavSettings = ({ settings }: NavSettingsProps) => {
  const pathname = usePathname();

  const isRouteActive = (itemRoute: string) => {
    if (pathname === itemRoute) {
      return true;
    }
    return false;
  };

  const hasItemEnable = settings.some((item) => item.enable);

  return (
    hasItemEnable && (
      <SidebarGroup>
        <SidebarGroupLabel>Configuração</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {settings.map(
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
