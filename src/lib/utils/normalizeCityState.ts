export const normalizeCityState = (cityState: string): string => {
  const stateMap: Record<string, string> = {
    // MS, MS
    "Mato Grosso do Sul": "MS",
    "MATO GROSSO DO SUL": "MS",
    MS: "MS",
    "Mato Grosso": "MT",
    MT: "MT",
    MTT: "MT",
    "Rio Grande do Sul": "RS",
    "RIO GRANDE DO SUL": "RS",
    GOIAS: "GO",
    GOIÁS: "GO",
    RS: "RS",
    PARANÁ: "PR",
    "SANTA CATARINA": "SC",
  };

  const normalizedCityState = cityState.trim().toUpperCase(); // CAMPO GRANDE
  return stateMap[normalizedCityState] ?? normalizedCityState;
};
