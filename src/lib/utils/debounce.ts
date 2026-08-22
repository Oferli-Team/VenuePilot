export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer); // Limpa o timeout anterior
    timer = setTimeout(() => {
      func(...args); // Chama a função após o atraso
    }, delay);
  };
}
