import parsePhoneNumberFromString from "libphonenumber-js";
import { Button, type ButtonProps } from "./ui/button";
import { FaWhatsapp } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { CopyButton } from "./ui/copy-button";

type InternationalPhoneWppButtonProps = {
  phone: string;
  className?: string;
  variant?: ButtonProps["variant"];
  hasWppIcon?: boolean;
};

export const InternationalPhoneWppButton = ({
  phone,
  className,
  variant,
  hasWppIcon = true,
}: InternationalPhoneWppButtonProps) => {
  const phoneNumber = parsePhoneNumberFromString(`+${phone}`);

  if (!phoneNumber) {
    return (
      <div>
        <Button className={cn(className)} asChild variant={variant}>
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
            {hasWppIcon && (
              <FaWhatsapp className="mr-2 h-4 w-4 text-green-600 duration-150 group-hover:scale-110" />
            )}
            +{phone}
          </a>
        </Button>
        <CopyButton textToCopy={phone} />
      </div>
    );
  }

  const formattedPhone = phoneNumber.formatInternational();

  return (
    <div className="flex items-center justify-center gap-2 px-3">
      {hasWppIcon && <FaWhatsapp className="h-4 w-4 text-green-600" />}
      <a
        href={`https://wa.me/${phoneNumber.number}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-max items-center gap-1 text-sm"
      >
        {formattedPhone}
      </a>
      <CopyButton textToCopy={formattedPhone} />
    </div>
  );
};
