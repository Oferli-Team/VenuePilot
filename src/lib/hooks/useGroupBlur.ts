import { useRef } from "react";

export function useGroupBlur(onGroupBlur: () => void | Promise<void>) {
  const focusCounter = useRef(0);

  const handleFocus = () => {
    focusCounter.current += 1;
  };

  const handleBlur = () => {
    focusCounter.current -= 1;

    setTimeout(() => {
      if (focusCounter.current <= 0) {
        void onGroupBlur(); // Chamado quando todos os campos perderam o foco
      }
    }, 0);
  };

  return { handleFocus, handleBlur };
}
