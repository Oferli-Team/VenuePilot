const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export const generateExpiryOptions = () => {
  const options: string[] = [];
  for (let year = currentYear; year <= 2035; year++) {
    months.forEach((month) => {
      if (year === currentYear && month < currentMonth) return;
      const formattedMonth = month < 10 ? `0${month}` : month;
      options.push(`${formattedMonth}/${year}`);
    });
  }
  return options;
};
