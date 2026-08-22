import { useEffect, useState } from "react";

type Props = {
  offset?: number;
};

// 100 px antes do final da página
export const useScrollPosition = ({ offset = 100 }: Props) => {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - offset;
      setIsNearBottom(scrollPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offset]);

  return { isNearBottom };
};
