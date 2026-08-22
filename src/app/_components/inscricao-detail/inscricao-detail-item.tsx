import { getLinkInscritosOrLgndServir } from "@/lib/constants";
import { ENUM_USER } from "@/lib/enum";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { hasRole, isAdmin } from "@/lib/utils/hasRole";
import { Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { Separator } from "../ui/separator";
import { type AllFieldsProps } from "./allFields";
import { useInscricaoDetail } from "./useInscricaoDetailStore";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { getCurrentMembership } from "@/lib/hooks/member";

const LabelWithCopyButton = ({
  component,
  value,
}: {
  value: string | number;
  component: React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-1">
      {component}
      <CopyButton textToCopy={value.toString()} />
    </div>
  );
};

type InscricaoDetailItemProps = {
  fields?: AllFieldsProps[];
  title: string;
  children?: React.ReactNode;
};

export const InscricaoDetailItem = ({
  fields,
  title,
  children,
}: InscricaoDetailItemProps) => {
  const { membership } = getCurrentMembership();
  const pathname = usePathname();
  const link = getLinkInscritosOrLgndServir(pathname);

  const { selectedInscricao } = useInscricaoDetail();
  const { orgsRoutes } = useEventRoutes({
    userId: selectedInscricao?.id,
    userType: link,
  });

  const isMobile = useIsMobile();

  const fieldsWithCopyButton = ["cpf", "celular", "email"];
  const isLongFieldText = [
    "doencaOuCondicao",
    "medicacoes",
    "motivosDietaEspecial",
    "outrasInformacoesMedicas",
  ];

  const hasPermission = isAdmin(membership);

  return (
    <div className="mt-4">
      <Separator className="mb-4" />
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold sm:text-base">{title}</h4>

        {hasPermission && (
          <Button asChild variant="outline" size={isMobile ? "icon" : "sm"}>
            <Link href={orgsRoutes.event.userDetail}>
              {isMobile ? <Eye className="h-4 w-4" /> : " Ver detalhe"}
            </Link>
          </Button>
        )}
      </div>

      {fields && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field, i) => (
            <div
              key={`${field.id} - ${i + 1}`}
              className={`flex flex-col ${isLongFieldText.includes(field.id) ? "col-span-2 gap-1 sm:gap-0" : ""}`}
            >
              <label
                htmlFor={field.id}
                className="block text-xs font-medium text-muted-foreground/90 sm:text-sm"
              >
                {field.label}
              </label>
              {fieldsWithCopyButton.includes(field.id) ? (
                <LabelWithCopyButton
                  component={field.component({
                    value: selectedInscricao[field.id],
                  })}
                  value={selectedInscricao[field.id]}
                />
              ) : (
                field.component?.({
                  value: selectedInscricao[field.id],
                  onChange: () => {},
                  name: field.id,
                })
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">{children}</div>
    </div>
  );
};
