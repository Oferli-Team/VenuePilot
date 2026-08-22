import type { DefaultSession } from "next-auth";

export interface SessionUser {
  id?: string;
  email?: string | null;
  cpf?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"];
  }

  type User = SessionUser;
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  type JWT = SessionUser;
}
