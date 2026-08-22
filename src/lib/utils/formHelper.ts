export function pickFieldsFromValues<T extends Record<string, any>>(
  values: Record<string, any>,
  keys: (keyof T)[],
): T {
  return keys.reduce((acc, key) => {
    acc[key] = values[key];
    return acc;
  }, {} as T);
}
