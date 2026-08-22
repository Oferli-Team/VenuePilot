import { Onboarding } from "@/components/Onboarding";
import { Suspense } from "react";

export default async function OnboardingPage() {
  return (
    <div className="relative flex h-screen flex-col items-center justify-center px-5">
      <Suspense fallback={<div>Carregando...</div>}>
        <Onboarding />
      </Suspense>
    </div>
  );
}
