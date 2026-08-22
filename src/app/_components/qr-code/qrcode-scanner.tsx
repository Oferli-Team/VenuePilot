"use client";

import { useMemo, useState } from "react";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { api } from "@/trpc/react";
import { ENUM_CHECKIN_STATUS, ENUM_STATUS } from "@/lib/enum";
import { useUserCheckInStore } from "./user-checkin-store";
import { QRCodeSVG } from "qrcode.react";
import { Spinner } from "../ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useFindEvent } from "@/lib/hooks/event";

export const QRCodeScanner = ({
  registerType,
}: {
  registerType: "PARTICIPANTE" | "SERVIR";
}) => {
  const { event } = useFindEvent();

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkinCode, setCheckInCode] = useState<string | null>(null);

  const { setUser, user } = useUserCheckInStore();

  const { refetch: registerByCheckInCode, isLoading } =
    api.inscricao.getRegisterByCheckInCode.useQuery(
      {
        checkinCode: checkinCode ?? "",
        eventId: event?.id ?? "",
        tipoInscricao: registerType,
      },
      { enabled: !!scannedData && !!checkinCode },
    );

  const getUser = async () => {
    try {
      const { data } = await registerByCheckInCode();

      if (!data) {
        setError(
          "Inscrição não encontrada, confirme o evento atual ou o tipo de inscrição",
        );
        setCheckInCode(null);
        return;
      }

      setUser(data);
      setError(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleScan = async (results: IDetectedBarcode[]) => {
    if (results.length === 0) return;

    const qrCodeResult = results[0]?.rawValue;
    setCheckInCode(qrCodeResult ?? null);
    setScannedData(qrCodeResult ?? null);
    await getUser();

    setScannedData(null);
  };

  const customTracker = (
    detectedCodes: IDetectedBarcode[],
    ctx: CanvasRenderingContext2D,
  ) => {
    ctx.strokeStyle = error ? "red" : "yellow"; // Bordas cinza por padrão, vermelha no erro
    ctx.lineWidth = 4;

    detectedCodes.forEach((code) => {
      ctx.strokeRect(
        code.boundingBox.x,
        code.boundingBox.y,
        code.boundingBox.width,
        code.boundingBox.height,
      );
    });
  };

  const readyForCheckIn = useMemo(() => {
    if (
      user?.checkinCode &&
      user.checkinStatus === ENUM_CHECKIN_STATUS.VALID_DOCUMENTS
    ) {
      return true;
    }
    return false;
  }, [user]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[28rem] overflow-hidden rounded-lg">
        {user?.checkinCode ? (
          <div className="hidden h-full w-full items-center justify-center sm:flex ">
            <div
              className={`w-full border-spacing-4 rounded-md border-4 p-3 ${readyForCheckIn ? "border-success/80" : "border-primary/80"}`}
            >
              <QRCodeSVG
                value={checkinCode ?? ""}
                size={140}
                className="h-full w-full min-w-16 rounded-md bg-white p-2 sm:min-w-36"
              />
            </div>
          </div>
        ) : (
          <Scanner
            components={{ tracker: customTracker }}
            allowMultiple={false}
            scanDelay={2000}
            onScan={handleScan}
            onError={(error) => console.log(error)}
          />
        )}

        {isLoading && (
          <div className="z-100 absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center gap-2 bg-card/80">
            <Spinner size={30} />
          </div>
        )}
      </div>

      {error && (
        <Alert
          className="mt-4 flex w-fit items-center justify-center"
          variant="destructive"
        >
          <AlertTitle className="text-center sm:text-start">{error}</AlertTitle>
          <AlertDescription></AlertDescription>
        </Alert>
      )}
    </div>
  );
};
