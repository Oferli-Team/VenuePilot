import { api } from "@/trpc/server";
import { inngest } from "../client";
import { sendSubscriptionConfirmation } from "@/lib/actions/mail";
import { EVENTS_NAME } from "../events";
import { FLAGS, type NotificationsMessageType } from "../types";
import { type ENUM_EVENT_TYPE } from "@/lib/enum";

export const sendEmailRegisterConfirmed = inngest.createFunction(
  { id: "send-email-message" },
  { event: EVENTS_NAME.NOTIFICATION_USER_REGISTER_CONFIRMED },
  async ({ step, event }) => {
    const { inscricao, evento } = event.data as NotificationsMessageType;

    if (inscricao?.flags?.includes(FLAGS.EMAIL_MESSAGE)) {
      return {
        message: "User already notified by e-mail",
      };
    }

    const mailResponse = await step.run("send-email", async () => {
      return await sendSubscriptionConfirmation(
        inscricao.id,
        evento.id,
        evento.type as ENUM_EVENT_TYPE,
      );
    });

    let registerFlags: string[] = [];
    if (mailResponse?.data?.id) {
      const registerUpdated = await api.inscricao.updateInscricaoWithFlag({
        id: inscricao.id,
        flag: FLAGS.EMAIL_MESSAGE,
      });
      registerFlags = registerUpdated.flags;
    }

    return {
      success: !!mailResponse?.data?.id,
      flagsUpdated: registerFlags,
      error: {
        errorName: mailResponse?.error?.name,
        message: mailResponse?.error?.message,
      },
    };
  },
);
