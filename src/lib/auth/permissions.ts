import { type AbilityBuilder } from "@casl/ability";
import { type AppAbility } from ".";
import { type User } from "./models/user";
import { type Role } from "./roles";

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

export const permissions: Record<Role, PermissionsByRole> = {
  SUPER_ADMIN(_, { can }) {
    can("manage", "all");
  },
  ADMIN(user, { can, cannot }) {
    cannot(["transfer_ownership", "update"], "Organization");
    can(["transfer_ownership", "update"], "Organization", {
      ownerId: { $eq: user.id },
    });
    can("manage", "all");
  },
  HAKUNA(user, { can }) {
    can("read", "Organization");
    can("read", "Event");
  },
  CHECKIN(user, { can }) {
    can("read", "Organization");
    can("read", "Event");
  },
  LADIES(user, { can }) {
    can("read", "Organization");
    can("read", "Event");
  },
  MEMBER(user, { can }) {
    can("read", "Organization");
    can("read", "User");
    can(["read", "create"], "Event");
    can(["update", "delete"], "Event", {
      ownerId: { $eq: user.id },
    });
  },
  BILLING(_, { can }) {
    can("read", "Organization");
    can("read", "Event");
    can("manage", "Billing");
  },
  USER(_, { can }) {
    can("read", "User");
  },
};
