import { useAbility } from "@/lib/auth/hooks/useAbility";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { ChevronDown, LayoutDashboard, LogOut, Ticket } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const UserLogged = () => {
  const { data: session } = useSession();
  const ability = useAbility();
  const { orgsRoutes, publicRoutes } = useEventRoutes({});
  const isMobile = useIsMobile();

  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const userLogged = () => {
    const name = session?.user?.name;
    const email = session?.user.email;
    if (!name) {
      return email?.split("@")[0];
    }
    const nameParts = name.split(" ").filter(Boolean);
    const firstName = nameParts[0] ?? "";
    const secondName = nameParts[1] ?? "";
    return `${firstName} ${secondName}`.trim();
  };

  const isManada = pathname.includes("/manada");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {isMobile ? (
          !isManada && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border p-2 uppercase">
              {userLogged()?.slice(0, 2)}
            </div>
          )
        ) : (
          <div
            className={`group flex w-36 cursor-pointer items-center gap-2 rounded-md bg-muted/50 px-2 py-1 text-sm hover:bg-muted/30 ${open && "bg-muted/50"}`}
          >
            Olá, {userLogged()}
            <ChevronDown
              className={`text-primary transition-transform ${open ? "rotate-180" : "rotate-0"} `}
            />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        {ability.can("read", "Organization") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer py-3">
              <Link href={orgsRoutes.dashboard}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Administrar Evento
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          asChild
          className="flex cursor-pointer py-3 sm:hidden"
        >
          <Link href="/ticket">
            <Ticket className="mr-2 h-4 w-4" />
            Ver ticket
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Button
            className="w-full"
            variant="outline"
            onClick={() =>
              signOut({ callbackUrl: publicRoutes.home, redirect: true })
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
