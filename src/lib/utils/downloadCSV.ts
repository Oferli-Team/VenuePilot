export const downloadCSV = (
  data: any[],
  headers: { label: string; key: string }[],
  filename: string,
) => {
  // Gerar os headers
  const headerRow = headers.map((header) => header.label).join(",");
  // Gerar os dados
  const rows = data
    .map(
      (row) => headers.map((header) => `"${row[header.key] || ""}"`).join(","), // Escapar valores
    )
    .join("\n");

  // Combinar headers e rows
  const csvContent = [headerRow, rows].join("\n");

  // Criar Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Criar link de download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", filename || "export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
