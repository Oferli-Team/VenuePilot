import { addMinutes } from "date-fns";
import { useState, useEffect } from "react";
import { countdownPayment } from "../../../lib/utils/countdownPayment";
import { usePixChargeStore } from "../../../lib/store/PixChargeStore";

export function useCountdown() {
  const [countdown, setCountdown] = useState<string | null>(null);
  const { charge } = usePixChargeStore();

  const startCountdown = () => {
    const expirationTime = addMinutes(new Date(), 15);
    const interval = setInterval(() => {
      if (expirationTime) {
        setCountdown(countdownPayment(expirationTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (charge) {
      startCountdown();
    }
  }, []);

  return {
    countdown,
    startCountdown,
  };
}
