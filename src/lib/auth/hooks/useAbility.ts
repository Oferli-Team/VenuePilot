import { AbilityContext } from "@/lib/utils/abilityContext";
import { useAbility as useAbilityCasl } from "@casl/react";

export const useAbility = () => {
  const ability = useAbilityCasl(AbilityContext);
  
  if (ability === undefined) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  
  return ability;
};