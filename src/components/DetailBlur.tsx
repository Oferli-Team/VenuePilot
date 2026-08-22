import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

type DetailBlurProps = {
  direction?: "top" | "bottom" | "center";
  side?: "right" | "left" | "full";
  orientation?: "vertical" | "horizontal";
  className?: string;
};

const blurEffectVariants = cva(
  "absolute pointer-events-none blur-3xl opacity-30 z-[-1]",
  {
    variants: {
      direction: {
        top: "top-0",
        bottom: "bottom-0",
        center: "top-1/2 transform -translate-y-1/2",
      },
      side: {
        left: "left-0 w-1/2",
        right: "right-0 w-1/2",
        full: "left-0 right-0 mx-[14rem]",
      },
      orientation: {
        vertical: "h-2/3",
        horizontal: "h-[12rem]",
      },
    },
    defaultVariants: {
      direction: "top",
      side: "full",
      orientation: "horizontal",
    },
  },
);

export const DetailBlur = ({
  direction,
  side,
  orientation,
  className,
}: DetailBlurProps) => {
  return (
    <div
      className="pointer-events-none absolute -top-24 left-[70%] -z-[-1] h-full w-36 -translate-x-1/2 rotate-[25deg] 
        transform rounded-full bg-gradient-to-b from-primary/10
        to-transparent blur-2xl"
    ></div>
    // <div
    //   className={cn(
    //     blurEffectVariants({ direction, side, orientation }),
    //     `bg-gradient-to-b from-primary/90 to-card`,
    //     className,
    //   )}
    // />
  );
};
