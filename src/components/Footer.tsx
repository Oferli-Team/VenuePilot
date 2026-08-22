"use client";

import { Headset, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";
import { WHATSAPP_BASE_URL } from "@/lib/whatsapp";
import { ITOP } from "@/lib/constants";
import { mask } from "remask";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Logo } from "./logo";

const medias = [
  {
    icon: <FaWhatsapp size={16} className="text-primary" />,
    label: mask(ITOP.whatsapp_suporte, "+55 (99) 99999-9999"),
    iconName: "WhatsApp",
  },
  // {
  //   icon: <Mail size={16} className="text-primary" />,
  //   label: ITOP.email_suporte,
  //   iconName: "E-mail",
  // },
];

const mock = [
  {
    title: "Plataforma",
    items: [
      {
        label: "iTOP",
        href: "/itop",
        isButton: false,
      },
      {
        label: "Meu ticket",
        href: "/ticket",
        isButton: false,
      },
      {
        label: "Perguntas Frequentes",
        href: "/perguntas-frequentes",
        isButton: false,
      },
      {
        label: "Planos e Preços",
        href: "#",
        isButton: false,
      },
      {
        label: "Funcionalidades",
        href: "#",
        isButton: false,
      },
    ],
  },
  {
    title: "Comece Agora",
    items: [
      {
        label: "Login",
        href: "/auth/signin",
        isButton: false,
      },

      {
        label: "Cadastrar Pista",
        href: "#",
        isButton: true,
      },
    ],
  },
  {
    title: "Política",
    items: [
      {
        label: "Política de Cancelamento",
        href: "/politica-de-cancelamento",
        isButton: false,
      },
      {
        label: "Política de Privacidade",
        href: "/politica-de-privacidade",
        isButton: false,
      },
    ],
  },
];

type FooterProps = {
  className?: string;
  hidden?: boolean;
};

export default function Footer({ className, hidden = true }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const pathname = usePathname();

  const isManada = pathname.startsWith("/manada");
  const isEventPage = pathname.includes("/evento");

  const footerClass = cn(
    ` w-full bg-background`,
    {
      "mb-24 md:mb-0": isEventPage,
      hidden: isManada && hidden,
    },
    className,
  );

  const hiddenFooter = cn({ hidden: isEventPage });

  return (
    <footer className={footerClass}>
      <div className={`space-y-6 border-b border-muted ${hiddenFooter}`}>
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-4 px-2 py-8 text-center sm:flex-row sm:px-4">
          <h5 className="text-lg font-bold sm:text-xl">
            Precisa da nossa ajuda?
          </h5>

          <Link
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-3 font-medium hover:bg-primary/90"
            href={`${WHATSAPP_BASE_URL}/${ITOP.whatsapp_suporte}`}
          >
            Falar com suporte <Headset size={16} className="ml-2" />
          </Link>
        </div>
      </div>

      <div
        className={`mx-auto flex w-full max-w-screen-xl flex-col px-2 py-12 sm:px-4 ${hiddenFooter}`}
      >
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className=" text-sm">
            <Logo size="lg" />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3`}>
              {mock.map((item, index) => (
                <ul
                  key={index}
                  className="flex flex-col gap-4 text-sm sm:gap-4"
                >
                  <p className="text-xs font-semibold sm:mb-2 sm:text-sm">
                    {item.title}
                  </p>

                  {item.items.map((link) => (
                    <li
                      key={link.label}
                      className="text-muted-foreground hover:text-foreground hover:duration-150"
                    >
                      {link.isButton ? (
                        <button
                          onClick={() => link.href}
                          className="text-start"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link href={link.href}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              {medias.map((socialLink, index) => (
                <Card className="flex w-full flex-col gap-6 p-2" key={index}>
                  <CardContent className="flex flex-col gap-4">
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      {socialLink.icon} {socialLink.iconName}
                    </span>
                    <p className="text-xs">{socialLink.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col bg-primary px-2 py-4 text-xs sm:px-4">
        <div
          suppressHydrationWarning={true}
          className="mx-auto flex w-full max-w-screen-xl flex-col font-semibold"
        >
          <p>Inscrições TOP © {currentYear} </p>
          <p>{ITOP.description}</p>
        </div>
      </div>
    </footer>
  );
}
