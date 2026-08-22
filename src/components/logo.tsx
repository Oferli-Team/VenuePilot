import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

import logoWhite from "../../public/logo/logobranca.png";
import logoBlack from "../../public/logo/logopreta.png";

const logoVariants = cva("h-auto", {
  variants: {
    size: {
      xs: "w-16",
      sm: "w-20",
      normal: "w-20 sm:w-28",
      lg: "w-28 sm:w-36",
      xl: "w-36 sm:w-48",
    },
  },
  defaultVariants: {
    size: "normal",
  },
});

type LogoProps = {
  size?: "xs" | "sm" | "normal" | "lg" | "xl";
};

export const Logo = ({ size }: LogoProps) => {
  const [src, setSrc] = useState(logoWhite);

  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "light") {
      setSrc(logoBlack);
    } else {
      setSrc(logoWhite);
    }
  }, [theme]);

  return (
    <div className={cn(logoVariants({ size }))}>
      <Image
        src={src}
        alt="ITOP - Logo"
        width={600}
        height={600}
        className="h-full w-full"
      />
    </div>
  );
};
