export const calcIMC = (weigh: number, height: number) => {
  const newIMC = weigh / ((height / 100) * (height / 100));
  return Number(newIMC.toFixed(8));
};
