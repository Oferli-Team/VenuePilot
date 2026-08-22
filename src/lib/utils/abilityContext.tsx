'use client'

import { createMongoAbility } from "@casl/ability";

import { createContext } from "react";

import { type MongoAbility } from "@casl/ability";
import { type Role } from "@prisma/client";
import { defineAbilityFor } from "../auth";

export const AbilityContext = createContext<MongoAbility>(createMongoAbility([]));

export function AbilityProvider({ user, children }: { user: {
  id: string;
  role: Role;
}, children: React.ReactNode }) {

  const ability = defineAbilityFor(
    {
      id: user.id, 
      role: user.role,
      __typename: "User",
    },
  );

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
} 