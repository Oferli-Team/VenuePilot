import { userSchema } from "@/lib/auth/models/user";
import { defineAbilityFor } from "../auth";
import { type Role } from "../auth/roles";

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  });

  const ability = defineAbilityFor(authUser);

  const can = ability.can.bind(ability);
  const cannot = ability.cannot.bind(ability);

  return { can, cannot };
}
