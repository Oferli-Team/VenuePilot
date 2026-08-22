import { Resend } from "resend";
import { type EmailConfig } from "next-auth/providers/email";
import type { ReactElement, ReactNode } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  email: string | string[],
  subject: string,
  emailHtml: string,
  provider?: EmailConfig,
) => {
  try {
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? (provider?.from ?? "nao-responda-aqui@inscricoestop.com.br")
        : process.env.SMTP_FROM;

    const response = await resend.emails.send({
      from: fromEmail ?? "no-reply@resend.dev",
      to: email,
      subject,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const getData = async (component: ReactElement | ReactNode) => {
  const ReactDOMServer = (await import("react-dom/server")).default;
  return ReactDOMServer.renderToStaticMarkup(component);
};
