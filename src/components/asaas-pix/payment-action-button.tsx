type PaymentContentButtonProps = {
  title: string;
  description?: string;
  button: React.ReactNode;
};

export const PaymentActionButton = ({
  title,
  description,
  button,
}: PaymentContentButtonProps) => (
  <div className="flex flex-row items-center justify-between gap-4 sm:gap-10">
    <div className="text-xs">
      <p className="mb-2 font-semibold">{title}</p>
      {description && <p>{description}</p>}
    </div>
    {button}
  </div>
);
