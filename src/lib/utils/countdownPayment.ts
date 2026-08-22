export const countdownPayment = (end: Date) => {
  const start = new Date();
  const distance = end.getTime() - start.getTime();

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  if (days >= 1 && hours === 0) {
    return `${days}d`;
  }

  if (days >= 1 && hours >= 1) {
    return `${days}d ${hours}h`;
  }

  if (hours >= 1 && minutes === 0) {
    return `${hours}h`;
  }

  if (hours >= 1 && minutes >= 1) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes >= 1) {
    return `${minutes}min ${seconds}seg`;
  }

  if (seconds >= 1) {
    return `${seconds}sec`;
  }

  return "-";
};