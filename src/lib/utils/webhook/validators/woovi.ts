import * as crypto from "crypto";
import { type WooviWebhookPayload } from "../types";
import { eventToSecretKey } from "../eventToSecret";

export function validateWooviHook(
  headers: Headers,
  body: WooviWebhookPayload,
): boolean {
  const secretKeyEnvVarName = eventToSecretKey[body.event!];
  if (!secretKeyEnvVarName) {
    throw new Error(`No secret key found for event ${body.event}`);
  }

  const secretKey = process.env[secretKeyEnvVarName];
  if (!secretKey) {
    throw new Error(`Environment variable ${secretKeyEnvVarName} is not set`);
  }

  const hmac = crypto.createHmac("sha1", secretKey);
  const digest = Buffer.from(
    hmac.update(JSON.stringify(body)).digest("base64"),
    "utf8",
  );
  const signature = Buffer.from(
    headers.get("x-openpix-signature") ?? "",
    "utf8",
  );
  return crypto.timingSafeEqual(digest, signature);
}
