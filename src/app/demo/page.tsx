"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Lang = "pt" | "en";

type Chapter = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  stack: string[];
  shots: { src: string; alt: string; caption?: string }[];
};

type Copy = {
  badge: string;
  heroTitle: React.ReactNode;
  heroSubtitle: React.ReactNode;
  intro: string;
  techStackLabel: string;
  highlightsLabel: string;
  stackLabel: string;
  outroTitle: string;
  outroBody: string;
  backHome: string;
  signIn: string;
  chapters: Chapter[];
};

const techStack = [
  "Next.js 14 (App Router)",
  "TypeScript",
  "tRPC",
  "Prisma + PostgreSQL",
  "NextAuth.js",
  "Tailwind CSS + shadcn/ui",
  "CASL (RBAC)",
  "react-hook-form + Zod",
  "TanStack Query & Table",
  "Recharts",
  "Tiptap",
  "Inngest (jobs)",
  "Resend (e-mail)",
  "Asaas / Woovi (payments)",
  "UploadThing / Vercel Blob",
  "PWA + QR Scanner",
];

const ptCopy: Copy = {
  badge: "Modo Demonstração — somente leitura",
  heroTitle: (
    <>
      Plataforma <span className="text-primary">ITOP</span> — gestão completa
      de eventos
    </>
  ),
  heroSubtitle: (
    <>
      Tour por um SaaS multi-tenant de inscrições para grandes eventos:
      inscrições online, pagamentos, check-in via QR, dashboards operacionais,
      RBAC e PWA. Construído como portfólio de skills de{" "}
      <strong className="text-foreground">produto</strong> e{" "}
      <strong className="text-foreground">engenharia</strong>.
    </>
  ),
  intro:
    "Este tour usa screenshots reais do produto, sem necessidade de login. Para explorar a plataforma em produção, entre em contato.",
  techStackLabel: "Stack",
  highlightsLabel: "Destaques",
  stackLabel: "Stack",
  outroTitle: "Quer ver mais?",
  outroBody:
    "O sistema completo inclui ainda módulos de famílias, saúde, entrega de bonés, geração de PDFs com termos assinados, integração com WhatsApp (Evolution API), webhooks de pagamento (Asaas/Woovi), notificações push (Web Push) e jobs durables com Inngest. Posso mostrar ao vivo em uma conversa.",
  backHome: "Voltar para a Home",
  signIn: "Tela de Login",
  chapters: [
    {
      id: "discovery",
      number: "01",
      title: "Descoberta de Eventos",
      subtitle: "Landing pública com hero, próximos e encerrados",
      description:
        "Página inicial pública lista todos os eventos disponíveis em carrosséis segmentados. Hero destaca eventos em alta, com SSR no App Router do Next 14 e tRPC server-side para zero-waterfall.",
      highlights: [
        "Server Components com data fetching paralelo",
        "Carrosséis acessíveis com Embla + autoplay",
        "OG/SEO otimizados por evento",
      ],
      stack: ["Next.js 14 App Router", "tRPC", "Tailwind", "Embla Carousel"],
      shots: [
        {
          src: "/demo-screenshots/1-home-listagem-dos-eventos-pagina-do-itop.png",
          alt: "Home com listagem dos eventos",
          caption: "Home pública — hero + próximos + encerrados",
        },
        {
          src: "/demo-screenshots/2-tickets.png",
          alt: "Tickets disponíveis",
          caption: "Tickets ativos exibidos no header da home",
        },
      ],
    },
    {
      id: "public-event",
      number: "02",
      title: "Página Pública do Evento",
      subtitle: "Página de inscrição com identidade visual configurável",
      description:
        "Cada evento tem uma landing page própria, customizável pelo organizador: capa, descrição rica, regras, cronograma, termos e rodapé. Inclui meta tags dinâmicas para compartilhamento.",
      highlights: [
        "Editor rich-text (Tiptap) para descrições",
        "Layouts responsivos com identidade do evento",
        "Termos e políticas versionados por evento",
      ],
      stack: ["Tiptap", "Zod", "Next Metadata API"],
      shots: [
        {
          src: "/demo-screenshots/8-pagina-publicada-do-evento.png",
          alt: "Página pública do evento — topo",
        },
        {
          src: "/demo-screenshots/9-pagina-publicada-do-evento-com-mais-info.png",
          alt: "Página pública do evento — detalhes",
        },
        {
          src: "/demo-screenshots/10-pagina-publicada-do-evento-rodape.png",
          alt: "Página pública do evento — rodapé",
        },
      ],
    },
    {
      id: "org-events",
      number: "03",
      title: "Organização & Lista de Eventos",
      subtitle: "Multi-tenant com seleção de organização por slug",
      description:
        "Após o login, o organizador escolhe a organização e acessa a lista de eventos sob sua gestão. Permissões via CASL garantem isolamento entre orgs e papéis.",
      highlights: [
        "Multi-tenant via slug em URL e cookie",
        "RBAC com CASL (Admin, Manager, Staff)",
        "Membership com convite por email",
      ],
      stack: ["CASL", "NextAuth", "Prisma multi-tenant"],
      shots: [
        {
          src: "/demo-screenshots/3-after-login-as-event-organizer-selecoinando-organizacao.png",
          alt: "Seleção de organização após login",
        },
        {
          src: "/demo-screenshots/4-lista-de-eventos-para-organizacao-selecionada.png",
          alt: "Lista de eventos da organização",
        },
      ],
    },
    {
      id: "event-edit",
      number: "04",
      title: "Criação e Edição de Evento",
      subtitle: "Formulários complexos com validação tipada",
      description:
        "Wizard completo para criar/editar eventos: dados gerais, datas, capacidade, termos de aceite e configurações avançadas (lotes, faixas etárias, gênero, REM). Tudo validado com Zod e tipos compartilhados entre client e server via tRPC.",
      highlights: [
        "Forms com react-hook-form + Zod resolver",
        "Editor de termos com versionamento",
        "Configurações por tipo de evento (TOP, REM, Ladies, Hakuna)",
      ],
      stack: ["react-hook-form", "Zod", "tRPC", "Tiptap"],
      shots: [
        {
          src: "/demo-screenshots/15-edicao-criar-evento-novo.png",
          alt: "Criar novo evento",
        },
        {
          src: "/demo-screenshots/11-edicao-do-evento.png",
          alt: "Edição do evento",
        },
        {
          src: "/demo-screenshots/12-edicao-do-evento.png",
          alt: "Edição do evento — continuação",
        },
        {
          src: "/demo-screenshots/13-edicao-do-evento-termos-de-aceite-inscricao-evento.png",
          alt: "Termos de aceite",
        },
        {
          src: "/demo-screenshots/14-edicao-configuracao-do-evento.png",
          alt: "Configurações avançadas",
        },
      ],
    },
    {
      id: "dashboards",
      number: "05",
      title: "Dashboards Operacionais",
      subtitle: "Visão geral, financeiro e vendas em tempo real",
      description:
        "Três dashboards integrados para o organizador: status geral do evento (capacidade, check-in, cancelados), financeiro (PIX, cartão, cupons, descontos) e vendas (funis, conversão, ticket médio). Gráficos com Recharts e agregações no Postgres.",
      highlights: [
        "KPIs com refresh sob demanda",
        "Recharts customizado com tema do app",
        "Agregações Prisma com cache via tRPC",
      ],
      stack: ["Recharts", "Prisma aggregations", "tRPC"],
      shots: [
        {
          src: "/demo-screenshots/5-dashboard-visao-geral-do-evento-status.png",
          alt: "Dashboard — visão geral",
        },
        {
          src: "/demo-screenshots/6-dashboard-financeiro.png",
          alt: "Dashboard financeiro",
        },
        {
          src: "/demo-screenshots/7-dashboard-vendas.png",
          alt: "Dashboard de vendas",
        },
      ],
    },
    {
      id: "ops",
      number: "06",
      title: "Operação do Evento",
      subtitle: "Inscritos, check-in via QR, cupons e link secreto",
      description:
        "Suite operacional: lista de inscritos com filtros e busca, check-in manual e via QR Code (com câmera no PWA), gestão de cupons de desconto e link secreto para inscrições privadas/cortesias.",
      highlights: [
        "Tabela com TanStack Table (paginação, ordenação, filtros)",
        "Leitor de QR no navegador via @yudiel/react-qr-scanner",
        "Cupons com regras (percentual, fixo, limite de uso, validade)",
        "Link secreto com token único e revogável",
      ],
      stack: ["TanStack Table", "QR Scanner", "PWA", "nanoid"],
      shots: [
        {
          src: "/demo-screenshots/16-lista-inscritos-filtros-search-infos.png",
          alt: "Lista de inscritos",
        },
        {
          src: "/demo-screenshots/17-pagina-de-checkin-manual-qrcode.png",
          alt: "Check-in via QR Code",
        },
        {
          src: "/demo-screenshots/18-criacao-listagem-cupom-de-desconto-para-evento.png",
          alt: "Cupons de desconto",
        },
        {
          src: "/demo-screenshots/19-link-secreto-para-formulario-inscricao.png",
          alt: "Link secreto",
        },
      ],
    },
    {
      id: "team",
      number: "07",
      title: "Time & Permissões",
      subtitle: "Convites, papéis e configurações da organização",
      description:
        "Convite de novos membros por email com escolha de papel (Admin, Manager, Staff). Cada papel tem permissões específicas aplicadas tanto no client (UI condicional) quanto no server (tRPC procedures protegidas por CASL).",
      highlights: [
        "Convite por email com magic link (NextAuth)",
        "RBAC consistente client + server (CASL)",
        "Auditoria de mudanças de papel",
      ],
      stack: ["CASL", "NextAuth Email Provider", "Resend"],
      shots: [
        {
          src: "/demo-screenshots/20-organizacao-configuracao.png",
          alt: "Configuração da organização",
        },
        {
          src: "/demo-screenshots/21-convidar-novo-membro-para-gerir-evento-em-nivel-de-papel-permissao.png",
          alt: "Convidar membro",
        },
        {
          src: "/demo-screenshots/22-atribuicao-permissao-membro-do-evento.png",
          alt: "Atribuição de permissão",
        },
      ],
    },
  ],
};

const enCopy: Copy = {
  badge: "Demo Mode — read-only",
  heroTitle: (
    <>
      <span className="text-primary">ITOP</span> Platform — end-to-end event
      management
    </>
  ),
  heroSubtitle: (
    <>
      A guided tour through a multi-tenant SaaS for large-event registrations:
      online sign-up, payments, QR check-in, operational dashboards, RBAC and
      PWA. Built as a portfolio of{" "}
      <strong className="text-foreground">product</strong> and{" "}
      <strong className="text-foreground">engineering</strong> skills.
    </>
  ),
  intro:
    "This tour uses real product screenshots, no login required. To explore the production platform, get in touch.",
  techStackLabel: "Stack",
  highlightsLabel: "Highlights",
  stackLabel: "Stack",
  outroTitle: "Want to see more?",
  outroBody:
    "The full system also includes modules for families, health intake, branded-cap delivery, signed-term PDF generation, WhatsApp integration (Evolution API), payment webhooks (Asaas/Woovi), push notifications (Web Push) and durable jobs with Inngest. Happy to walk through it live.",
  backHome: "Back to Home",
  signIn: "Sign-in page",
  chapters: [
    {
      id: "discovery",
      number: "01",
      title: "Event Discovery",
      subtitle: "Public landing with hero, upcoming and past events",
      description:
        "Public homepage lists all available events in segmented carousels. The hero highlights trending events, with SSR via Next 14 App Router and server-side tRPC for zero waterfall.",
      highlights: [
        "Server Components with parallel data fetching",
        "Accessible carousels with Embla + autoplay",
        "Per-event OG/SEO tuned for sharing",
      ],
      stack: ["Next.js 14 App Router", "tRPC", "Tailwind", "Embla Carousel"],
      shots: [
        {
          src: "/demo-screenshots/1-home-listagem-dos-eventos-pagina-do-itop.png",
          alt: "Home listing all events",
          caption: "Public home — hero + upcoming + past",
        },
        {
          src: "/demo-screenshots/2-tickets.png",
          alt: "Active tickets",
          caption: "Active tickets surfaced in the home header",
        },
      ],
    },
    {
      id: "public-event",
      number: "02",
      title: "Public Event Page",
      subtitle: "Per-event registration page with configurable branding",
      description:
        "Every event has its own landing page, customizable by the organizer: cover, rich description, rules, schedule, terms and footer. Includes dynamic meta tags for social sharing.",
      highlights: [
        "Rich-text editor (Tiptap) for descriptions",
        "Responsive layouts per event identity",
        "Versioned terms and policies per event",
      ],
      stack: ["Tiptap", "Zod", "Next Metadata API"],
      shots: [
        {
          src: "/demo-screenshots/8-pagina-publicada-do-evento.png",
          alt: "Public event page — top",
        },
        {
          src: "/demo-screenshots/9-pagina-publicada-do-evento-com-mais-info.png",
          alt: "Public event page — details",
        },
        {
          src: "/demo-screenshots/10-pagina-publicada-do-evento-rodape.png",
          alt: "Public event page — footer",
        },
      ],
    },
    {
      id: "org-events",
      number: "03",
      title: "Organization & Event List",
      subtitle: "Multi-tenant org selection by slug",
      description:
        "After login the organizer picks their organization and sees the events they manage. CASL permissions enforce isolation across orgs and roles.",
      highlights: [
        "Multi-tenant via URL slug + cookie",
        "RBAC with CASL (Admin, Manager, Staff)",
        "Membership via email invite",
      ],
      stack: ["CASL", "NextAuth", "Prisma multi-tenant"],
      shots: [
        {
          src: "/demo-screenshots/3-after-login-as-event-organizer-selecoinando-organizacao.png",
          alt: "Selecting an organization after login",
        },
        {
          src: "/demo-screenshots/4-lista-de-eventos-para-organizacao-selecionada.png",
          alt: "Event list for the selected organization",
        },
      ],
    },
    {
      id: "event-edit",
      number: "04",
      title: "Event Creation & Editing",
      subtitle: "Complex forms with typed validation",
      description:
        "Full wizard to create/edit events: general data, dates, capacity, terms of acceptance and advanced settings (batches, age ranges, gender, REM). All validated with Zod and types shared between client and server via tRPC.",
      highlights: [
        "Forms with react-hook-form + Zod resolver",
        "Terms editor with versioning",
        "Settings per event type (TOP, REM, Ladies, Hakuna)",
      ],
      stack: ["react-hook-form", "Zod", "tRPC", "Tiptap"],
      shots: [
        {
          src: "/demo-screenshots/15-edicao-criar-evento-novo.png",
          alt: "Create new event",
        },
        {
          src: "/demo-screenshots/11-edicao-do-evento.png",
          alt: "Event editor",
        },
        {
          src: "/demo-screenshots/12-edicao-do-evento.png",
          alt: "Event editor — continued",
        },
        {
          src: "/demo-screenshots/13-edicao-do-evento-termos-de-aceite-inscricao-evento.png",
          alt: "Terms of acceptance",
        },
        {
          src: "/demo-screenshots/14-edicao-configuracao-do-evento.png",
          alt: "Advanced settings",
        },
      ],
    },
    {
      id: "dashboards",
      number: "05",
      title: "Operational Dashboards",
      subtitle: "Overview, finance and sales in real time",
      description:
        "Three integrated dashboards for the organizer: event overview (capacity, check-in, cancellations), finance (PIX, card, coupons, discounts) and sales (funnels, conversion, average ticket). Charts via Recharts and aggregations in Postgres.",
      highlights: [
        "KPIs with on-demand refresh",
        "Recharts themed to match the app",
        "Prisma aggregations cached via tRPC",
      ],
      stack: ["Recharts", "Prisma aggregations", "tRPC"],
      shots: [
        {
          src: "/demo-screenshots/5-dashboard-visao-geral-do-evento-status.png",
          alt: "Dashboard — overview",
        },
        {
          src: "/demo-screenshots/6-dashboard-financeiro.png",
          alt: "Finance dashboard",
        },
        {
          src: "/demo-screenshots/7-dashboard-vendas.png",
          alt: "Sales dashboard",
        },
      ],
    },
    {
      id: "ops",
      number: "06",
      title: "Event Operations",
      subtitle: "Attendees, QR check-in, coupons and secret links",
      description:
        "Operational suite: attendee list with filters and search, manual and QR check-in (camera-driven in the PWA), discount-coupon management and secret links for private/comp registrations.",
      highlights: [
        "TanStack Table (pagination, sorting, filters)",
        "In-browser QR reader via @yudiel/react-qr-scanner",
        "Coupons with rules (percent, fixed, usage cap, validity)",
        "Secret links with unique revocable tokens",
      ],
      stack: ["TanStack Table", "QR Scanner", "PWA", "nanoid"],
      shots: [
        {
          src: "/demo-screenshots/16-lista-inscritos-filtros-search-infos.png",
          alt: "Attendee list",
        },
        {
          src: "/demo-screenshots/17-pagina-de-checkin-manual-qrcode.png",
          alt: "QR check-in",
        },
        {
          src: "/demo-screenshots/18-criacao-listagem-cupom-de-desconto-para-evento.png",
          alt: "Discount coupons",
        },
        {
          src: "/demo-screenshots/19-link-secreto-para-formulario-inscricao.png",
          alt: "Secret link",
        },
      ],
    },
    {
      id: "team",
      number: "07",
      title: "Team & Permissions",
      subtitle: "Invites, roles and org settings",
      description:
        "Invite new members by email with role selection (Admin, Manager, Staff). Each role has specific permissions enforced both on the client (conditional UI) and on the server (CASL-protected tRPC procedures).",
      highlights: [
        "Email invites with magic link (NextAuth)",
        "Consistent RBAC across client + server (CASL)",
        "Role-change audit trail",
      ],
      stack: ["CASL", "NextAuth Email Provider", "Resend"],
      shots: [
        {
          src: "/demo-screenshots/20-organizacao-configuracao.png",
          alt: "Organization settings",
        },
        {
          src: "/demo-screenshots/21-convidar-novo-membro-para-gerir-evento-em-nivel-de-papel-permissao.png",
          alt: "Invite member",
        },
        {
          src: "/demo-screenshots/22-atribuicao-permissao-membro-do-evento.png",
          alt: "Permission assignment",
        },
      ],
    },
  ],
};

function ChapterSidebar({
  chapters,
  label,
}: {
  chapters: Chapter[];
  label: string;
}) {
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <aside className="sticky top-28 hidden h-fit lg:block">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ol className="flex flex-col gap-1 border-l border-border">
        {chapters.map((c) => {
          const active = activeId === c.id;
          return (
            <li key={c.id} className="relative">
              <a
                href={`#${c.id}`}
                className={
                  "group flex gap-3 py-1.5 pl-4 text-sm transition " +
                  (active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <span
                  aria-hidden
                  className={
                    "absolute -left-px top-0 h-full w-px transition " +
                    (active ? "bg-primary" : "bg-transparent")
                  }
                />
                <span
                  className={
                    "font-mono text-xs " +
                    (active ? "text-primary" : "text-muted-foreground/60")
                  }
                >
                  {c.number}
                </span>
                <span className="leading-snug">{c.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export default function DemoPage() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = lang === "pt" ? ptCopy : enCopy;
  const sidebarLabel = lang === "pt" ? "Sumário" : "Contents";

  return (
    <div className="relative flex flex-col gap-16 pb-24 pt-28">
      <Section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="outline" className="w-fit">
            {t.badge}
          </Badge>
          <div
            role="group"
            aria-label="Language"
            className="inline-flex overflow-hidden rounded-md border border-border text-xs"
          >
            <button
              type="button"
              onClick={() => setLang("pt")}
              aria-pressed={lang === "pt"}
              className={
                lang === "pt"
                  ? "bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                  : "bg-transparent px-3 py-1.5 text-muted-foreground hover:text-foreground"
              }
            >
              PT-BR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={
                lang === "en"
                  ? "bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                  : "bg-transparent px-3 py-1.5 text-muted-foreground hover:text-foreground"
              }
            >
              EN
            </button>
          </div>
        </div>

        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
          {t.heroTitle}
        </h1>
        <p className="max-w-3xl text-balance text-lg text-muted-foreground">
          {t.heroSubtitle}
        </p>

        <Card className="max-w-2xl border-primary/40 bg-primary/5">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {t.intro}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 pt-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>

        <nav className="flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm">
          {t.chapters.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="text-muted-foreground transition hover:text-primary"
            >
              {c.number}. {c.title}
            </a>
          ))}
        </nav>
      </Section>

      <Separator className="mx-auto max-w-screen-xl" />

      <Section className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        <ChapterSidebar chapters={t.chapters} label={sidebarLabel} />
        <div className="flex flex-col gap-16">
      {t.chapters.map((chapter) => (
        <section
          key={chapter.id}
          id={chapter.id}
          className="flex scroll-mt-28 flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-primary">{chapter.number}</span>
              <span>{chapter.subtitle}</span>
            </div>
            <h2 className="text-3xl font-bold">{chapter.title}</h2>
            <p className="max-w-3xl text-muted-foreground">
              {chapter.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t.highlightsLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  {chapter.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-primary">▹</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t.stackLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {chapter.stack.map((s) => (
                    <Badge key={s} variant="outline" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            {chapter.shots.map((shot) => (
              <figure
                key={shot.src}
                className="overflow-hidden rounded-lg border border-border bg-muted/30"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={2796}
                  height={1680}
                  className="h-auto w-full"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                {shot.caption && (
                  <figcaption className="border-t border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      ))}
        </div>
      </Section>

      <Separator className="mx-auto max-w-screen-xl" />

      <Section className="flex flex-col items-start gap-4">
        <h2 className="text-2xl font-bold">{t.outroTitle}</h2>
        <p className="max-w-2xl text-muted-foreground">{t.outroBody}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">{t.backHome}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signin">{t.signIn}</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
