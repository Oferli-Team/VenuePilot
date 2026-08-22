import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    RESEND_API_KEY: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.number(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_FROM: z.string(),
    ASAAS_API_KEY: z.string(),
    ASAAS_API_URL: z.string(),
    WOOVI_API_KEY: z.string(),
    WOOVI_API_URL: z.string(),

    WOOVI_HMAC_SECRET_KEY_CHARGE_CREATED: z.string(),
    WOOVI_HMAC_SECRET_KEY_CHARGE_COMPLETED: z.string(),
    WOOVI_HMAC_SECRET_KEY_CHARGE_EXPIRED: z.string(),
    WOOVI_HMAC_SECRET_KEY_TRANSACTION_REFUND_RECEIVED: z.string(),

    ASAAS_WEBHOOK_ACCESS_TOKEN: z.string(),

    INNGEST_EVENT_KEY: z.string(),
    INNGEST_SIGNING_KEY: z.string(),

    DISCORD_WEBHOOK_URL: z.string(),

    SECRET_TOKEN_HAKUNAS_TAG: z.string(),
    AUTENTIQUE_API_TOKEN: z.string(),
    AUTENTIQUE_WEBHOOK_SECRET: z.string(),
    BLOB_READ_WRITE_TOKEN:
      process.env.NODE_ENV === "production" ? z.undefined() : z.string(),

    UPLOADTHING_TOKEN: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PIX_APP_ID: z.string(),
    NEXT_PUBLIC_STEP_CHANGE: z.string(),
    NEXT_PUBLIC_SHOW_CREDIT_CARD_PARTICIPANTE: z.string(),
    NEXT_PUBLIC_SHOW_CREDIT_CARD_SERVIR: z.string(),
    NEXT_PUBLIC_SHOW_CREDIT_CARD: z.string(),
    NEXT_PUBLIC_SHOW_REGISTER_CANCELED_DASHBOARD: z.string(),
    NEXT_PUBLIC_SECRET_LINK: z.string(),
    NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string(),
    NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME: z.string(),
    NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY: z.string(),
    NEXT_PUBLIC_EVOLUTION_API_SERVER_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    NEXT_PUBLIC_PIX_APP_ID: process.env.NEXT_PUBLIC_PIX_APP_ID,
    ASAAS_API_KEY: process.env.ASAAS_API_KEY,
    ASAAS_API_URL: process.env.ASAAS_API_URL,
    WOOVI_API_KEY: process.env.WOOVI_API_KEY,
    WOOVI_API_URL: process.env.WOOVI_API_URL,
    NEXT_PUBLIC_STEP_CHANGE: process.env.NEXT_PUBLIC_STEP_CHANGE,
    NEXT_PUBLIC_SHOW_CREDIT_CARD_PARTICIPANTE:
      process.env.NEXT_PUBLIC_SHOW_CREDIT_CARD_PARTICIPANTE,
    NEXT_PUBLIC_SHOW_CREDIT_CARD_SERVIR:
      process.env.NEXT_PUBLIC_SHOW_CREDIT_CARD_SERVIR,
    NEXT_PUBLIC_SHOW_CREDIT_CARD: process.env.NEXT_PUBLIC_SHOW_CREDIT_CARD,
    NEXT_PUBLIC_SHOW_REGISTER_CANCELED_DASHBOARD:
      process.env.NEXT_PUBLIC_SHOW_REGISTER_CANCELED_DASHBOARD,
    NEXT_PUBLIC_SECRET_LINK: process.env.NEXT_PUBLIC_SECRET_LINK,
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    ASAAS_WEBHOOK_ACCESS_TOKEN: process.env.ASAAS_WEBHOOK_ACCESS_TOKEN,
    WOOVI_HMAC_SECRET_KEY_CHARGE_CREATED:
      process.env.WOOVI_HMAC_SECRET_KEY_CHARGE_CREATED,
    WOOVI_HMAC_SECRET_KEY_CHARGE_COMPLETED:
      process.env.WOOVI_HMAC_SECRET_KEY_CHARGE_COMPLETED,
    WOOVI_HMAC_SECRET_KEY_CHARGE_EXPIRED:
      process.env.WOOVI_HMAC_SECRET_KEY_CHARGE_EXPIRED,
    WOOVI_HMAC_SECRET_KEY_TRANSACTION_REFUND_RECEIVED:
      process.env.WOOVI_HMAC_SECRET_KEY_TRANSACTION_REFUND_RECEIVED,
    NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME:
      process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_NAME,
    NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY:
      process.env.NEXT_PUBLIC_EVOLUTION_API_INSTANCE_API_KEY,
    NEXT_PUBLIC_EVOLUTION_API_SERVER_URL:
      process.env.NEXT_PUBLIC_EVOLUTION_API_SERVER_URL,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    SECRET_TOKEN_HAKUNAS_TAG: process.env.SECRET_TOKEN_HAKUNAS_TAG,
    AUTENTIQUE_API_TOKEN: process.env.AUTENTIQUE_API_TOKEN,
    AUTENTIQUE_WEBHOOK_SECRET: process.env.AUTENTIQUE_WEBHOOK_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
