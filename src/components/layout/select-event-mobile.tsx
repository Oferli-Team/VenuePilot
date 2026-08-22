"use client";

import { useAbility } from "@/lib/auth/hooks/useAbility";
import { useFindManyOrganizations } from "@/lib/hooks/organization";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const SelectEventMobile = () => {
  const ability = useAbility();
  const router = useRouter();

  const { organizations } = useFindManyOrganizations();
  const orgSlug = getCurrentOrgFromCookie();

  const [open, setOpen] = useState(false);

  const currentOrganization = organizations?.find(
    (org) => org.slug === orgSlug,
  );

  return (
    ability.can("read", "Organization") && (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="md:hidden">
          <span className="mb-1 text-xs text-muted-foreground">Pista</span>
          <div className="flex items-center text-sm font-semibold">
            {currentOrganization ? (
              <p>{currentOrganization?.name}</p>
            ) : (
              <p>Selecione a pista</p>
            )}

            <ChevronDown className="ml-3 h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 sm:hidden">
          <DropdownMenuGroup>
            {organizations?.map((org, i) => (
              <div key={org.id}>
                <DropdownMenuItem
                  onClick={() => router.push(`/manada/${org.slug}`)}
                  className="flex flex-1 items-center justify-between gap-1 font-medium"
                >
                  <div className="flex flex-col items-start gap-1 font-medium">
                    {org.name}
                  </div>
                  {org.slug === currentOrganization?.slug && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
                {i < organizations.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
