import { useQuery } from "@tanstack/react-query";

export function usePayloadWoovi(searchQuery: string) {
  const {
    data: payloads,
    isLoading,
  } = useQuery({
    queryKey: [searchQuery],
    queryFn: async () => {
      const url = new URL("https://lgnd-api.onrender.com/woovi");
      url.searchParams.set("correlationID", searchQuery);
      const response = await fetch(url);
      // const response = await fetch(
      //   `https://lgnd-api.onrender.com/woovi?correlationID=${searchQuery}`,
      // );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      return response.json();
    },
  });


  return { payloads, isLoading };
}
