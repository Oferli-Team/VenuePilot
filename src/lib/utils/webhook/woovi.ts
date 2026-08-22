export function getValueFromAdditionalInfo(
  additionalInfo: {
    key: string;
    value: string;
  }[],
  key: string,
) {
  const info = additionalInfo.find((item) => item.key === key);
  return info ? info.value : null; // Return the value or null if not found
}
