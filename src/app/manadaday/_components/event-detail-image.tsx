import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";

export const EventDetailImage = ({ ...props }: ImageProps) => (
  <div
    className={cn(
      "relative h-64 w-full overflow-hidden rounded-md bg-card",
      props.className,
    )}
  >
    <Image
      {...props}
      className="h-full w-full"
      width={600}
      height={400}
      alt={props.alt}
    />
  </div>
);
