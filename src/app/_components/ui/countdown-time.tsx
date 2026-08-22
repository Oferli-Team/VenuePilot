import { useTimerStore } from "@/lib/store/TimerStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secondsLeft).padStart(
    2,
    "0",
  )}`;
};

export const Countdown = () => {
  const { time, resetTimer } = useTimerStore();

  const pathname = usePathname();

  useEffect(() => {
    // Reset the timer when the pathname changes
    resetTimer();
  }, [pathname, resetTimer]);

  return (
    <div className="fixed right-0 top-14 z-20 mx-4 my-6 sm:mx-8">
      <div
        className={`flex min-w-max flex-col items-center justify-center gap-1 rounded-md border border-ring/20 bg-input/50 px-3 py-2 backdrop-blur-md backdrop-sepia-0 ${time > 0 ? "w-20" : "w-full"}`}
      >
        {time > 0 ? (
          <>
            <span className="text-sm font-bold md:text-lg">
              {formatTime(time)}
            </span>
          </>
        ) : (
          <p className="font-bold">tempo esgotado</p>
        )}
      </div>
    </div>
  );
};
