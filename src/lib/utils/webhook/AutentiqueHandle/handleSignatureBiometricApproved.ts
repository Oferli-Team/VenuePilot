import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export const handleSignatureBiometricApproved = async (documentId: string) => {
  try {
    const register = await api.inscricao.getRegisterByAutentiqueDocumentId({
      documentId,
    });

    if (register) {
      await api.inscricao.updateCheckinStatus({
        id: register.id,
        eventoId: register.eventoId,
        checkinStatus: ENUM_CHECKIN_STATUS.VALID_DOCUMENTS,
        documentId,
      });
    }

    return NextResponse.json({ message: "Document approved" }, { status: 200 });
  } catch (error) {
    console.log("Error handleSignatureBiometricApproved :", error);
    return NextResponse.json({ message: error }, { status: 400 });
  }
};
