import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavEventsSwitcher } from "./layout/manada/nav-events-switcher";
import { NavOrganizationSwitcher } from "./layout/manada/nav-organization-switcher";
import { NavEvents } from "./layout/manada/nav-events";
import { NavAdministration } from "./layout/manada/nav-admnistration";
import { NavSettings } from "./layout/manada/nav-settings";
import { Logo } from "./logo";
import Link from "next/link";
import { SidebarItems } from "./layout/manada/sidebar-items";
import { getCurrentMembership } from "@/lib/hooks/member";
import { X } from "lucide-react";

export function AppSidebar() {
  const { open: isOpen, setOpenMobile, openMobile } = useSidebar();
  const { membership } = getCurrentMembership();

  const data = SidebarItems(membership);

  return (
    <Sidebar collapsible="icon" className="p-0">
      <div
        className={`mb-2 flex h-20 w-full justify-center border-b border-input bg-card`}
      >
        <button
          className="absolute right-0 top-0 m-2 p-2 text-muted-foreground sm:hidden"
          onClick={() => setOpenMobile(false)}
        >
          <X className="h-4 w-4 " />
        </button>
        <Link
          href="/"
          className={`flex items-center gap-2 ${isOpen || openMobile ? "scale-100" : "scale-0 opacity-0"}`}
        >
          <Logo size="sm" />
        </Link>
      </div>
      <SidebarHeader>
        <NavEventsSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavEvents events={data.events} />

        <NavAdministration administration={data.administration} />

        <NavSettings settings={data.settings} />
      </SidebarContent>

      <SidebarFooter>
        <NavOrganizationSwitcher organization={data.organization} />
      </SidebarFooter>
    </Sidebar>
  );
}
