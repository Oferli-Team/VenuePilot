import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
  type MongoAbility,
} from "@casl/ability";
import { type User } from "./models/user";
import { permissions } from "./permissions";

import { z } from "zod";
import { billingSubject } from "./subjects/billing";
import { eventSubject } from "./subjects/event";
import { inviteSubject } from "./subjects/invite";
import { organizationSubject } from "./subjects/organization";
import { userSubject } from "./subjects/user";

const appAbilitiesSchema = z.union([
  organizationSubject,
  eventSubject,
  userSubject,
  inviteSubject,
  billingSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
]);

export type AppAbilities = z.infer<typeof appAbilitiesSchema>;

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permission for role ${user.role} not found`);
  }

  permissions[user.role](user, builder);

  const ability = builder.build({
    detectSubjectType(item) {
      return item.__typename;
    },
  });

  return ability;
}