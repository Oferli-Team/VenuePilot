export const calcFee = (value: number, itopFee: number) => {
  const fee = (value * itopFee) / 100;
  return value - fee;
};
