"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import imageDashboardHero from "../../../public/lading-page/image-dashboard.png";
import imageDashboardHeroLight from "../../../public/lading-page/image-dashboard-light.png";
import mockTwoCelPhone from "../../../public/lading-page/two-phones-mock.png";
import { Button } from "@/components/ui/button";
import { DetailBlur } from "@/components/DetailBlur";
import {
  Activity,
  BarChartIcon,
  NotebookTabs,
  SquareCheck,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import Link from "next/link";
import { createWhatsappLink } from "@/lib/whatsapp";
import { ITOP } from "@/lib/constants";
import { Logo } from "@/components/logo";

const services = [
  {
    title: "Administração Financeira Completa",
    description:
      "Controle de pagamentos, relatórios financeiros e gestão de taxas de inscrição em um só lugar. Tudo isso de forma clara e intuitiva.",
    icon: BarChartIcon,
  },
  {
    title: "Check-in Simplificado",
    description:
      "Gerencie a entrada dos participantes com facilidade, garantindo agilidade e segurança no dia do evento.",
    icon: SquareCheck,
  },
  {
    title: "Automação de famílias",
    description:
      "Organize os participantes em cada famílias automaticamente, com apenas um clique os inscritos no TOP estarão dispostos nas suas famílias de acordo com idade, força e outros.",
    icon: NotebookTabs,
  },
  {
    title: "Classificação de Saúde",
    description:
      "Hakunas irão classificar a saúde dos participantes direto na plataforma em poucos cliques, além disso conseguem adicionar observações necessárias para cada participante.",
    icon: Activity,
  },
];

export default function ITopProduct() {
  const { theme } = useTheme();
  const imageByTheme =
    theme === "dark" ? imageDashboardHero : imageDashboardHeroLight;

  const sendTalkToSaleWhatsApp = createWhatsappLink({
    phone: ITOP.whatsapp_demo,
    text: ITOP.demoScheduleWhatsApp,
  });

  return (
    <div className="mx-auto mt-24 flex w-full flex-col">
      <Section className="relative flex w-full flex-col items-center justify-center gap-12">
        <DetailBlur direction="top" side="full" orientation="horizontal" />
        <div className="flex flex-col items-center justify-center text-center sm:w-[80%]">
          <Logo size="lg" />
          <h1 className="text-lg font-bold md:text-3xl">
            A plataforma ideal para você que deseja criar e gerenciar eventos
            incríveis para Legendários!
          </h1>
          <h3 className="text-sm leading-6 text-muted-foreground sm:w-[80%] sm:text-base">
            {`Desenvolvido para o gerenciamento completo dos TOP's. Tudo em um só
            lugar, desde inscrições dos participantes até classificação das
            famílias, saúde, entrega dos bonés e muito mais.`}
          </h3>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full">
              <Link target="_blank" href={sendTalkToSaleWhatsApp}>
                Agendar Demonstração
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative flex h-full w-full max-w-[900px] items-center justify-center self-center overflow-hidden rounded-md drop-shadow-lg ">
          <Image
            src={imageByTheme}
            alt="Inscrições TOP Dashboard"
            className="w-full"
            width={900}
            height={800}
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-1/2 z-10 bg-gradient-to-t from-background to-transparent" />
      </Section>

      <Section className="mt-12 flex flex-col gap-6 sm:gap-12">
        <h2 className="text-center text-lg font-bold md:text-3xl">
          Principais{" "}
          <span className="relative before:absolute before:bottom-0 before:z-[-1] before:h-3 before:w-full before:bg-primary">
            Funcionalidades
          </span>{" "}
          da Plataforma
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((item, i) => (
            <div
              key={i}
              className={`group flex h-full flex-col gap-4 rounded-md border border-input/50 px-2 py-4 hover:border-input hover:bg-input/20`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-card bg-muted p-2 shadow-lg sm:h-12 sm:w-12">
                {<item.icon className="h-6 w-6 text-primary" />}
              </div>
              <div className="flex flex-col gap-3 leading-6">
                <h2 className="text-sm font-bold sm:text-lg">{item.title}</h2>
                <p className="text-xs sm:text-base">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className={`relative my-24 flex w-full gap-12 bg-card`}>
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-12 py-6 sm:flex-row sm:py-0">
          <div className="flex flex-col gap-2 text-xs leading-6 sm:w-2/3 sm:gap-6 sm:text-base">
            <h3 className="text-lg font-bold sm:text-3xl">
              Desfrute o Caminho
            </h3>
            <p>
              Deixe o trabalho pesado com o Inscrições TOP e foque naquilo que
              realmente importa: vidas!
            </p>
            <strong className="">Criar experiências inesquecíveis!</strong>

            <Button className="mt-3 w-fit sm:mt-6">
              <Link href={sendTalkToSaleWhatsApp} target="_blank">
                Começar agora!
              </Link>
            </Button>

            <p className="text-muted-foreground">
              Clique em Criar Pista para começar agora.
            </p>
          </div>
          <div className="flex h-full w-full justify-end overflow-hidden rounded-md drop-shadow-lg">
            <Image
              src={mockTwoCelPhone}
              alt="Inscrições TOP Dashboard"
              width={600}
              height={400}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
