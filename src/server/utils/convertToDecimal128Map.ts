export const convertToDecimal128Map = (
  fees: Record<number, number>,
): Record<number, { $numberDecimal: string }> => {
  return Object.entries(fees).reduce(
    (acc, [key, value]) => {
      acc[parseInt(key)] = { $numberDecimal: value.toString() };
      return acc;
    },
    {} as Record<number, { $numberDecimal: string }>,
  );
};
