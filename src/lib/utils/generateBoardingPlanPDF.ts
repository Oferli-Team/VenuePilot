import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImgData from "../../../public/logo/logopreta.png";
import { type Evento } from "@prisma/client";

type data = {
  vehicle: {
    id: string;
    name: string;
    identifier: string;
    plate: string | null;
    owner: string | null;
    totalCapacity: number;
    usedCapacity: number;
  };
  registers: {
    lgnd_funcao: string | null;
    familia: number | null;
    nome: string | null;
    tipoInscricao: string | null;
  }[];
}[];

const drawBackground = (
  doc: jsPDF,
  vehicleName: string,
  pageHeight: number,
) => {
  doc.setFillColor(241, 108, 47);
  doc.rect(0, 0, 30, pageHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(40);
  doc.saveGraphicsState();
  doc.text(vehicleName, 20, pageHeight / 2, { angle: 90 });
  doc.restoreGraphicsState();
};

export const generateBoardingPlanPDF = (data: data, event: Evento) => {
  const doc = new jsPDF();

  data.forEach((item, index) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página
    const marginLeft = 35;

    if (index > 0) {
      doc.addPage();
    }

    // --- Adiciona a imagem do logo ---
    const imgWidth = 30;
    const imgHeight = (logoImgData.height / logoImgData.width) * imgWidth;
    const imageX = pageWidth - imgWidth - 20;
    doc.addImage(
      logoImgData.src,
      "JPEG",
      imageX,
      12,
      imgWidth,
      imgHeight,
      "MEDIUM",
    );

    // --- Adiciona um título no topo ---
    const subTitle = `Identificador: ${item.vehicle.identifier} - ${item.vehicle.plate}`;
    const vehicleCapacity = `Capacidade total: ${item.vehicle.totalCapacity}`;
    const vehicleUsedCapacity = `Vagas preenchidas: ${item.vehicle.usedCapacity}`;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.text(subTitle, marginLeft, 15);
    doc.setFontSize(10);
    doc.text(vehicleCapacity, marginLeft, 20);
    doc.text(vehicleUsedCapacity, marginLeft, 25);

    drawBackground(doc, item.vehicle.name, pageHeight);

    // --- Criar a tabela com as inscrições ---
    const familyCounters: Record<string, number> = {};
    const tableRows = item.registers.map((register, idx) => {
      const familyId = register.familia ?? "sem_familia";
      familyCounters[familyId] = (familyCounters[familyId] ?? 0) + 1;
      return [
        idx + 1, // Número do assento
        register.tipoInscricao === "PARTICIPANTE"
          ? "PARTICIPANTE"
          : (register.lgnd_funcao?.replaceAll("_", " ") ?? ""),
        register.familia ?? "",
        register.familia ? familyCounters[familyId] : "",
        register.nome?.toUpperCase() ?? "",
      ];
    });

    // --- Geração da tabela ---
    autoTable(doc, {
      startY: 40, // Ajustado para não sobrepor o título
      margin: { left: marginLeft },
      head: [["Assento", "Função", "Família", "", "Nome"]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [169, 169, 169],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      didDrawPage: () => {
        drawBackground(doc, item.vehicle.name, pageHeight);
      },
    });
  });

  doc.save(`Plano de Embarque - ${event.pista} - TOP#${event.topNumero}`);
};
