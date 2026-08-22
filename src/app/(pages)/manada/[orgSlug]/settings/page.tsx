import { Section } from "@/components/ui/section";
import { ability } from "@/lib/auth/ability";

export default async function SettingsOrgPage() {
  const permissions = await ability();
  const canUpdateOrganization = permissions?.can("update", "Organization");

  return (
    <>
      {canUpdateOrganization && (
        <Section className="mt-24 flex flex-col items-center gap-12 pb-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <h1 className="font-bold">Configurações da organização</h1>
            <h2>
              Configure suas informações da organização para começar a usar o
              sistema.
            </h2>
          </div>
          {/* Add your org settings form here */}
        </Section>
      )}
    </>
  );
}
