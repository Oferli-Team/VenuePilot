import { z } from "zod";

export const roleSchema = z.union([
  z.literal("SUPER_ADMIN"),
  z.literal("ADMIN"),
  z.literal("HAKUNA"),
  z.literal("CHECKIN"),
  z.literal("LADIES"),
  z.literal("BILLING"),
  z.literal("MEMBER"),
  z.literal("USER"),
]);

export type Role = z.infer<typeof roleSchema>;
