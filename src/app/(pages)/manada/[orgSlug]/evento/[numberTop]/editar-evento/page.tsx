"use client";

import { EventStepsComponent } from "@/components/event/event-steps-component";
import { Section } from "@/components/ui/section";
import { Spinner } from "@/components/ui/spinner";
import { Unauthorized } from "@/components/unauthorized";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isSuperAdmin } from "@/lib/utils/hasRole";

export default function EditEventPage() {
  const { membership } = getCurrentMembership();

  if (!membership) {
    return (
      <Section className="flex flex-col items-center justify-center">
        <Spinner size={40} />
      </Section>
    );
  }

  if (!isSuperAdmin(membership)) return <Unauthorized />;

  return (
    <Section className="px-0 pb-6">
      <EventStepsComponent isEdit />
    </Section>
  );
}
