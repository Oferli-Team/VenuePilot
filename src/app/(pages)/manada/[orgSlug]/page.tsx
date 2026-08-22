import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { GridTwoColumns } from "@/components/grid-two-columns";
import { getCurrentMembership } from "@/lib/auth/ability";
import { Section } from "@/components/ui/section";
import img from "../../../../../public/itop-dashboard-image.png";
import { OrgDashboardEvents } from "@/components/organization/org-dashboard-events";
import { OrgDashboardMembers } from "@/components/organization/org-dashboard-members";
import { OrgDashboardInvites } from "@/components/organization/org-dashboard-invites";
import { getServerAuthSession } from "@/server/auth";
export default async function OrganizationHomePage() {
  const session = await getServerAuthSession();
  let membership = null;

  if (session?.user) {
    membership = await getCurrentMembership();
  }

  if (!membership) {
    return redirect("/");
  }

  const orgSlug = cookies().get("orgSlug")?.value ?? "";
  const events = await api.evento.getEvents({ orgSlug: orgSlug });
  const members = await api.member.getOrganizationMembers({ slug: orgSlug });
  const invites = await api.invite.getInvites({ orgSlug });

  return (
    <Section className="space-y-4 pb-8 pt-4">
      <GridTwoColumns
        className={`${events && events?.length === 0 ? "md:grid-cols-2" : "md:grid-cols-1"}`}
      >
        <OrgDashboardEvents events={events} />
        {events && events?.length === 0 && (
          <div className="relative h-full w-full overflow-hidden rounded-md">
            <Image
              src={img}
              alt="iTOP Image"
              width={200}
              height={200}
              className="w-full opacity-80"
            />
            <p className="absolute bottom-4 left-4 z-10 font-bold">
              O TOP começa aqui!
            </p>
            <div className="absolute bottom-0 left-0 right-0 top-0 z-0 bg-card opacity-10" />
          </div>
        )}
      </GridTwoColumns>

      <GridTwoColumns>
        {members && <OrgDashboardMembers members={members ?? []} />}
        {invites && <OrgDashboardInvites invites={invites ?? []} />}
      </GridTwoColumns>
    </Section>
  );
}
