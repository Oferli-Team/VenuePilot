import { type Session } from "next-auth";
import { type ENUM_USER } from "../enum";
import { Role } from "@prisma/client";

export const hasRole = (
  session: Session | null,
  roles: ENUM_USER[],
): boolean => {
  if (!session?.user?.role) return false;
  return roles.includes(session.user.role as ENUM_USER);
};

type Membership = {
    id: string;
    role: Role;
    organizationId: string;
    userId: string;
} | undefined | null;

export const isSuperAdmin = (membership: Membership) => {
  return membership?.role === Role.SUPER_ADMIN;
};

export const isAdmin = (membership: Membership) => {
  return membership?.role === Role.ADMIN || membership?.role === Role.SUPER_ADMIN;
};

export const isLadie = (membership: Membership) => {
  return membership?.role === Role.ADMIN || membership?.role === Role.SUPER_ADMIN || membership?.role === Role.LADIES;
};

export const isHakuna = (membership: Membership) => {
  return membership?.role === Role.ADMIN || membership?.role === Role.SUPER_ADMIN || membership?.role === Role.HAKUNA;
};

export const isCheckIn = (membership: Membership) => {
  return membership?.role === Role.ADMIN || membership?.role === Role.SUPER_ADMIN || membership?.role === Role.CHECKIN;
};

