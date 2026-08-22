"use client";

import { useAbility } from "@/lib/auth/hooks/useAbility";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { UserLogged } from "../user-logged";
import { SelectEventMobile } from "./select-event-mobile";
import { ThemeToggle } from "./theme-toggle";

export default function Header({
  hidden = true,
}: Readonly<{ hidden?: boolean }>) {
  const { data: session } = useSession();
  const ability = useAbility();
  const pathname = usePathname();

  const isManada = pathname.includes("/manada");
  const isMobile = useIsMobile();

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getHeaderClasses = () => {
    const baseClasses =
      "fixed right-0 top-0 lef-0 w-full z-20 border-b transition-colors duration-300";

    const background = hasScrolled
      ? "bg-background shadow-sm"
      : "border-transparent bg-transparent";

    return `${baseClasses} ${background}`;
  };

  if (isManada && hidden) return null;

  return (
    <header className={getHeaderClasses()}>
      <nav
        className={`left relative mx-auto flex h-20 w-full max-w-screen-xl flex-row items-center justify-between gap-2 px-4 md:flex-row`}
      >
        <div className="hidden w-full items-center gap-4 md:flex">
          <Link href="/" className="hidden md:block">
            <Logo size="sm" />
          </Link>
        </div>

        <ThemeToggle className="flex md:hidden" />
        {ability.can("read", "Event") && <SelectEventMobile />}

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle className="hidden md:block" />

          {!session && isMobile && (
            <Button variant="outline" className="">
              <Link href="/ticket">Ver ticket</Link>
            </Button>
          )}

          <Button variant="outline" className="hidden sm:block">
            <Link href="/ticket">Ver ticket</Link>
          </Button>

          {session ? (
            <UserLogged />
          ) : (
            <div>
              <Button onClick={() => signIn("email")}>Administrar</Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
