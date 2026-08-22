// Define the expected field types (field: type).
const fieldTypes: Record<string, "number" | "boolean" | "string"> = {
  familia: "number", // Values like ["4", "5"] will be converted to numbers
  saude: "number",
  cartas_recebida: "boolean", // Values like ["true", "false"] will be converted to booleans
  cartas_contato_valido: "boolean",
  checkin: "boolean",
  status: "string", // Values like ["CONFIRMADA", "PENDENTE"]
  cidade: "string",
  estado: "string",
  linkSecreto: "string",
  pagamento_couponValue: "string",
  lgnd_funcao: "string",
  checkinStatus: "string",
  // add more fields if necessary
};

// This function generates dynamic filters for queries based on the provided filter values and their types.
// It handles null checks, number conversions, boolean evaluations, string matching, and array-based filters.
export const setDynamicFilters = (
  filters?: Record<string, string | string[] | undefined>,
) => {
  // If filters exist, process each filter; otherwise, return an empty object.
  const dynamicFilters = filters
    ? Object.entries(filters).reduce(
        (acc, [key, value]) => {
          const fieldType = fieldTypes[key];

          // Handle undefined or empty values
          if (
            value === undefined ||
            (Array.isArray(value) && value.length === 0)
          ) {
            return acc;
          }

          // If the value is "null" (string), set the filter as not set (isSet: false).
          if (
            value === "null" ||
            (Array.isArray(value) && value.includes("null"))
          ) {
            acc[key] = { isSet: false };
            return acc;
          }

          // Handle array values
          if (Array.isArray(value)) {
            if (fieldType === "number") {
              // Convert array of strings to array of numbers
              const numericValues = value
                .map((v) => Number(v))
                .filter((v) => !isNaN(v));
              if (numericValues.length > 0) {
                acc[key] = { in: numericValues };
              }
            } else if (fieldType === "boolean") {
              // Convert array of strings to array of booleans
              const booleanValues = value.map((v) => v === "true");
              if (booleanValues.length > 0) {
                acc[key] = { in: booleanValues };
              }
            } else {
              // Treat as strings
              acc[key] = { in: value };
            }
          }
          // Handle single string values
          else {
            if (fieldType === "number") {
              const numericValue = Number(value);
              if (!isNaN(numericValue)) {
                acc[key] = { equals: numericValue };
              }
            } else if (fieldType === "boolean") {
              acc[key] = { equals: value === "true" };
            } else {
              acc[key] = { equals: value };
            }
          }

          return acc;
        },
        {} as Record<string, any>,
      )
    : {};

  return dynamicFilters; // Example: { status: { in: ["CONFIRMADA", "PENDENTE"] }, familia: { in: [4, 5] }, checkin: { in: [true, false] } }
};
