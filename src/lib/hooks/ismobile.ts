import { useEffect, useState } from "react";

// Hook para detectar se a tela é mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // 640px é o breakpoint 'sm' no Tailwind CSS
    };

    handleResize(); // Verifica o tamanho inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
