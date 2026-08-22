import { jsPDF } from "jspdf";
import logoImgData from "../../../public/logo/logopreta.png";

interface PdfOptions {
  title?: string;
  subtitle?: string;
  orientation?: "portrait" | "landscape";
}

export function createPdfWithHeader({
  title,
  subtitle,
  orientation = "portrait",
}: PdfOptions) {
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, 20);
  }

  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 14, title ? 26 : 20);
  }

  // Calcular o tamanho da imagem
  const imgWidth = 30;
  const imgHeight = (logoImgData.height / logoImgData.width) * imgWidth;
  const imageX = pageWidth - imgWidth - 20; // 20 mm de margem da borda direita

  doc.addImage(
    logoImgData.src,
    "JPEG",
    imageX,
    12,
    imgWidth,
    imgHeight,
    "MEDIUM",
  );

  return doc;
}
