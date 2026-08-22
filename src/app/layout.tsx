import "@/styles/globals.css";
import { Montserrat } from "next/font/google";

import { getCurrentMembership } from "@/lib/auth/ability";
import { ITOP } from "@/lib/constants";
import CheckTimerProvider from "@/lib/store/CheckStartTimerStore";
import { AbilityProvider } from "@/lib/utils/abilityContext";
import { getServerAuthSession } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { extractRouterConfig } from "uploadthing/server";
import Layout from "@/components/layout";
import { CheckAndResetFormData } from "@/components/layout/check-and-reset-formData";
import { Toaster } from "@/components/ui/toaster";
import { ourFileRouter } from "./api/uploadthing/core";
import { StepsRegisterProvider } from "./hook/useStepsRegister";
import { StepsServirProvider } from "./hook/useStepsServir";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(ITOP.site),
  title: {
    template: "%s | Inscrições TOP",
    default: "Inscrições Top",
  },
  description: "Sistema de Gerenciamento de Inscrições Legendários",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    {
      rel: "android-chrome-192x192",
      type: "image/png",
      sizes: "192x192",
      url: "/android-chrome-192x192",
    },
    {
      rel: "android-chrome-512x512",
      type: "image/png",
      sizes: "512x512",
      url: "/android-chrome-512x512",
    },
  ],
  referrer: "origin-when-cross-origin",
  keywords: ["Legendários", "Inscrição", "Inscrições", "TOP", "Manada"],
  authors: [
    { name: "Inscrições TOP", url: "https://www.inscricoestop.com.br" },
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "ITOP Inscrições",
    description: "Sistema de Gerenciamento de Inscrições Legendários",
    images: [
      {
        url: "/itop-og.png",
        width: 1200,
        height: 630,
        alt: "Plataforma ITOP Inscrições",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plataforma ITOP Inscrições",
    description: "Sistema de Gerenciamento de Inscrições Legendários",
    images: ["/itop-og.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  let membership = null;

  if (session?.user) {
    membership = await getCurrentMembership();
  }

  return (
    <html lang="pt-br">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <body className={`${montserrat.className}`}>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AbilityProvider
              user={{
                id: membership?.userId ?? "",
                role: membership?.role ?? "USER",
              }}
            >
              <StepsRegisterProvider>
                <StepsServirProvider>
                  <CheckTimerProvider>
                    <NextTopLoader
                      zIndex={1000}
                      color="#EA580B"
                      showSpinner={false}
                    />
                    <Layout>{children}</Layout>
                    <CheckAndResetFormData />
                    <Analytics />
                    <SpeedInsights />
                  </CheckTimerProvider>
                </StepsServirProvider>
              </StepsRegisterProvider>
            </AbilityProvider>
          </ThemeProvider>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
