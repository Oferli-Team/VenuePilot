import { create } from 'zustand';

interface TimerType {
  time: number;
  setTime: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  localInterval?: NodeJS.Timeout |  number | undefined;
  setLocalInterval: (localInterval?: NodeJS.Timeout |  number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerType>((set, get) => ({
  time: 1200,
  isRunning: false,
  setTime: (time) => set(() => ({ time })),
  setIsRunning: (isRunning) => set(() => ({ isRunning })),
  localInterval: undefined,
  setLocalInterval: (localInterval) => set(() => ({ localInterval })),
  startTimer: () => {
    const { isRunning, time, setIsRunning, setLocalInterval } = get();
    if (!isRunning && time > 0) {
      setIsRunning(true);
      const interval = setInterval(() => {
        const { time, setTime, setIsRunning, localInterval } = get();
        if (time > 0) {
          setTime(time - 1);
        } else {
          clearInterval(localInterval);
          setIsRunning(false);
        }
      }, 1000);
      setLocalInterval(interval);
    }
  },
  stopTimer: () => {
    const { setIsRunning, localInterval, setLocalInterval } = get();
    if (localInterval) {
      clearInterval(localInterval);
      setLocalInterval(undefined);
    }
    setIsRunning(false);
  },
  resetTimer: () => {
    const { localInterval, setLocalInterval } = get();
    if (localInterval) {
      clearInterval(localInterval);
      setLocalInterval(undefined);
    }
    set(() => ({ time: 1200, isRunning: false }));
  },
}));
