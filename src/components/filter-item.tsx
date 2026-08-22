type FilterItemProps = {
  label: string;
  children: React.ReactNode;
  loading?: boolean;
};

export const FilterItem = ({ label, children }: FilterItemProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <h5 className="text-sm">{label}</h5>

      {children}
    </div>
  );
};
