import { type Metadata } from "next";
import Header from "../_components/layout/header";
import Footer from "../_components/Footer";
import { api } from "@/trpc/server";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";
import { eventTypeMap } from "@/lib/constants";
import { MANADA_DAY } from "./participar/constant";

export const generateMetadata = async (): Promise<Metadata> => {
  const event = await api.evento.getEventPostedByNumberTop({ topNumber: 3 });
  const title = `${eventTypeMap[event.type as ENUM_EVENT_TYPE]} - ${event?.titulo}`;
  const description = `Inscreva-se no ${event?.titulo}. ${event?.subtitulo}`;
  const { titulo, subtitulo, banner } = MANADA_DAY;

  return {
    title: event?.id ? title : titulo,
    description: event?.id ? description : subtitulo,
    openGraph: {
      title: event?.id ? title : titulo,
      description: event?.id ? description : subtitulo,
      type: "website",
      images: [
        {
          url: event.banner ?? banner,
          width: 1200,
          height: 630,
          alt: "Imagem do evento",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event?.banner ?? banner],
    },
  };
};

export default function ManadaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header hidden={false} />
      {children}
      <Footer
        hidden={false}
        className="rounded-2xl border-t-8 border-t-muted"
      />
    </div>
  );
}
