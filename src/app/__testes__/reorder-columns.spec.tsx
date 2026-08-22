import { reorderColumns } from "@/lib/utils/reorderColumns";

describe("reorderColumns", () => {
  it("should reorder columns in the correct order", () => {
    const columns = [
      { id: "nome", header: "Nome" },
      { id: "email", header: "Email" },
      { id: "idade", header: "Idade" },
    ];

    const desiredOrder = ["email", "nome", "idade"];

    const expectedOutput = [
      { id: "email", header: "Email" },
      { id: "nome", header: "Nome" },
      { id: "idade", header: "Idade" },
    ];

    const result = reorderColumns(columns, desiredOrder);

    expect(result).toEqual(expectedOutput);
  });

  it("should ignore columns not included in the desired order", () => {
    const columns = [
      { id: "nome", header: "Nome" },
      { id: "email", header: "Email" },
      { id: "idade", header: "Idade" },
      { id: "telefone", header: "Telefone" },
    ];

    const desiredOrder = ["nome", "idade"];

    const expectedOutput = [
      { id: "nome", header: "Nome" },
      { id: "idade", header: "Idade" },
    ];

    const result = reorderColumns(columns, desiredOrder);

    expect(result).toEqual(expectedOutput);
  });

  it("should return an empty array if no columns match the desired order", () => {
    const columns = [
      { id: "nome", header: "Nome" },
      { id: "email", header: "Email" },
    ];

    const desiredOrder = ["telefone", "endereco"];

    const result = reorderColumns(columns, desiredOrder);

    expect(result).toEqual([]);
  });

  it("should handle an empty desired order and return an empty array", () => {
    const columns = [
      { id: "nome", header: "Nome" },
      { id: "email", header: "Email" },
    ];

    const desiredOrder: string[] = [];

    const result = reorderColumns(columns, desiredOrder);

    expect(result).toEqual([]);
  });
});
