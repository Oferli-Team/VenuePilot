import Header from "@/components/layout/header";
import Layout from "@/components/layout/manada/index";
import { Section } from "@/components/ui/section";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Unauthorized } from "@/components/unauthorized";
import { ability } from "@/lib/auth/ability";
import { getServerAuthSession } from "@/server/auth";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Administrar Evento",
    default: "Administrar Evento",
  },
};

export default async function OrgSlugLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  let permissions = null;

  if (session?.user) {
    permissions = await ability();
  }

  const canReadOrganization = permissions?.can("read", "Organization");

  if (!canReadOrganization) {
    return (
      <Section className="flex h-screen flex-col items-center justify-center">
        <Header hidden={false} />

        <Unauthorized />
      </Section>
    );
  }

  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}
