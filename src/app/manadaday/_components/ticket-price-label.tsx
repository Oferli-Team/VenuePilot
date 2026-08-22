export const TicketPriceLabel = ({
  text,
  label,
  labelColor = "text-primary",
  price,
  button,
}: {
  text: string;
  label: string;
  labelColor?: string;
  price: string;
  button?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex flex-col items-start">
        <p>{text}</p>
        <p className="mt-1 font-medium">{price}</p>
        <p className={`mt-1 text-start text-xs ${labelColor}`}>{label}</p>
      </div>
      {button && <div>{button}</div>}
    </div>
  );
};
