"use client";

import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useEventStore } from "@/lib/store/EventStore";
import { Can } from "@casl/react";
import { Menu } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import OrganizationSwitcher from "../../organization/organization-switcher";
import { Button } from "../../ui/button";
import { SidebarTrigger, useSidebar } from "../../ui/sidebar";
import { UserLogged } from "../../user-logged";
import { SelectEventMobile } from "../select-event-mobile";
import { ThemeToggle } from "../theme-toggle";
import { routeTitleMap, usePageTitleStore } from "./page-title-store";
import { useAbility } from "@/lib/auth/hooks/useAbility";

export default function Header() {
  const { data: session } = useSession();
  const { open: isOpen } = useSidebar();
  const { setPageTitle } = usePageTitleStore();
  const { event } = useEventStore();
  const ability = useAbility();
  const pathname = usePathname();
  const routes = useEventRoutes({});

  const isManada = pathname.includes("/manada");

  useEffect(() => {
    const routeMap = routeTitleMap(routes);
    const currentTitle = routeMap[pathname];
    if (currentTitle) {
      setPageTitle(currentTitle);
    }
  }, [pathname, setPageTitle, event?.topNumero]);

  const getHeaderClasses = () => {
    const baseClasses =
      "fixed right-0 top-0 z-20 border-b transition-colors duration-300 bg-card";

    const manadaLeft = isOpen ? "md:left-64 left-0" : "md:left-12 left-0";

    return `${baseClasses} ${manadaLeft}`;
  };

  if (!isManada) return null;

  return (
    <header className={getHeaderClasses()}>
      <nav
        className={`left mx-auto flex h-20 w-full flex-row items-center justify-between gap-2 px-4 md:flex-row`}
      >
        <SidebarTrigger className="z-100 absolute -left-4 top-16 z-10 hidden items-center justify-center rounded-full md:flex" />

        <Can I="read" a="Organization" ability={ability}>
          <OrganizationSwitcher />
        </Can>

        <ThemeToggle className="flex md:hidden" />
        <SelectEventMobile />

        <div className="flex items-center">
          <div className="flex items-center gap-6 md:hidden">
            {!session && <Button onClick={() => signIn("email")}>ADMIN</Button>}
            <SidebarTrigger className="flex items-center justify-center rounded-md sm:hidden">
              <Menu />
            </SidebarTrigger>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle className="hidden md:block" />

            <Button variant="outline" className={`hidden md:block `}>
              <Link href="/ticket">Ver ticket</Link>
            </Button>
            {session ? (
              <UserLogged />
            ) : (
              <div className="hidden md:block">
                <Button onClick={() => signIn("email")}>Entrar</Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
