"use client";

import { EventStepsComponent } from "@/components/event/event-steps-component";
import { Section } from "@/components/ui/section";
import { Spinner } from "@/components/ui/spinner";
import { Unauthorized } from "@/components/unauthorized";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isSuperAdmin } from "@/lib/utils/hasRole";

export default function CreateEventPage() {
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
    <Section className="flex flex-col gap-12 px-0 pb-6">
      <EventStepsComponent isEdit={false} />
    </Section>
  );
}
