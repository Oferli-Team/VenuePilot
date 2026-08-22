"use server";

import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { defineAbilityFor } from ".";

export async function getCurrentOrg() {
  return cookies().get("orgSlug")?.value ?? null;
}

export async function getCurrentMembership() {
  console.log("🔍 getCurrentMembership: Starting function execution");

  const org = await getCurrentOrg();
  console.log("🍪 getCurrentMembership: Cookie orgSlug value:", org);

  if (org) {
    console.log(
      "✅ getCurrentMembership: Found orgSlug in cookies, fetching membership",
    );
    const result = await api.member.getUserMembership({ slug: org });
    if (result?.membership) {
      console.log(
        "✅ getCurrentMembership: Successfully found membership using cookie orgSlug",
      );
      return result.membership;
    } else {
      console.log(
        "❌ getCurrentMembership: No membership found for orgSlug in cookie",
      );
    }
  }

  try {
    console.log(
      "🔄 getCurrentMembership: Trying fallback - looking for any user organization",
    );
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      console.log("❌ getCurrentMembership: No user session found");
      return null;
    }
    console.log(
      "👤 getCurrentMembership: User email from session:",
      session.user.email,
    );

    const organizations = await api.organization.getOrganizations();
    console.log(
      "🏢 getCurrentMembership: Found organizations count:",
      organizations?.length || 0,
    );

    if (!organizations || organizations.length === 0) {
      console.log("❌ getCurrentMembership: User has no organizations");
      return null;
    }

    const firstOrg = organizations[0];
    if (!firstOrg || !firstOrg.slug) {
      console.log("❌ getCurrentMembership: First organization has no slug");
      return null;
    }
    console.log("🏢 getCurrentMembership: Selected organization:", {
      id: firstOrg.id,
      slug: firstOrg.slug,
    });

    cookies().set("orgSlug", firstOrg.slug, {
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });
    console.log(
      "🍪 getCurrentMembership: Set cookie with orgSlug:",
      firstOrg.slug,
    );

    const userMember = firstOrg.members.find(
      (member) => member.user.id === session.user.id,
    );

    if (!userMember) {
      console.log(
        "❌ getCurrentMembership: User is not a member of the selected organization",
      );
      return null;
    }

    console.log(
      "✅ getCurrentMembership: Found membership via fallback mechanism",
    );
    return {
      id: userMember.id,
      role: userMember.role,
      organizationId: firstOrg.id,
      userId: userMember.user.id,
    };
  } catch (error) {
    console.error(
      "❌ getCurrentMembership: Error in fallback mechanism:",
      error,
    );
    return null;
  }
}

export async function ability() {
  const membership = await getCurrentMembership();
  if (!membership) return null;

  const ability = defineAbilityFor({
    id: membership.userId,
    role: membership.role,
    __typename: "User",
  });

  return ability;
}
