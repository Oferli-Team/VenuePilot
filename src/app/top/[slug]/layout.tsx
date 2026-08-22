import { Section } from "@/components/ui/section";
import { eventTypeMap } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import Image from "next/image";

type TopEventPageParams = {
  params: {
    slug: string;
  };
};

export const generateMetadata = async ({
  params,
}: TopEventPageParams): Promise<Metadata> => {
  const topNumber = Number(params.slug);
  const evento = await api.evento.getEventPostedByNumberTop({ topNumber });

  return {
    title: `${eventTypeMap[evento.type as ENUM_EVENT_TYPE]} #${evento?.topNumero}`,
    description: `Inscreva-se no ${evento?.titulo}. ${evento?.subtitulo}`,
    openGraph: {
      title: `${eventTypeMap[evento.type as ENUM_EVENT_TYPE]} #${evento?.topNumero}`,
      description: `Inscreva-se no ${evento?.titulo}. ${evento?.subtitulo}`,
      type: "website",
      images: [
        {
          url: evento.banner ?? "/itop-og.png",
          width: 1200,
          height: 630,
          alt: "Imagem do evento",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${eventTypeMap[evento.type as ENUM_EVENT_TYPE]} #${evento?.topNumero}`,
      description: `Inscreva-se no ${evento?.titulo}. ${evento?.subtitulo}`,
      images: [evento?.banner ?? "/itop-og.png"],
    },
  };
};

export default async function TopEventPage({
  children,
  params,
}: {
  children: React.ReactNode;
} & TopEventPageParams) {
  const topNumber = Number(params.slug);
  const event = await api.evento.getEventPostedByNumberTop({ topNumber });

  return (
    <div className="relative flex min-h-screen">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-card via-card/70 to-transparent"></div>
      <div className="absolute bottom-0 right-0 top-0 z-0 flex w-[80%] items-end justify-end opacity-10 sm:opacity-20">
        <Image
          src={event.banner ?? ""}
          width={600}
          height={600}
          alt={`Banner do evento ${event?.topNumero}`}
          className="h-full w-full object-cover"
        />
      </div>
      <Section>{children}</Section>
    </div>
  );
}
