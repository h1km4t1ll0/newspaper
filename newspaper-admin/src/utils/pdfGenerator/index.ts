import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { buildPageElement } from "./pageBuilder";
import { LayoutSettings, PageLayout } from "./types";

export const generatePDF = async (
  allLayouts: PageLayout,
  layoutSettings: LayoutSettings | null,
  issueDate: string,
  newspaperName: string,
  currentFont: string,
  issueCover: any,
  progress?: (stage: number | string) => void
) => {
  if (!allLayouts || !layoutSettings) {
    console.error("Missing required data for PDF generation");
    return;
  }

  const safeLayoutSettings = layoutSettings || {
    editorJSData: {} as JSON,
    columnCount: 12,
    pageHeight: 800,
    availableTextStyles: { fonts: [{ fontFamily: "Arial", name: "Arial" }] },
    pageWidth: 600,
    horizontalFieldsWidth: 50,
    verticalFieldsHeight: 50,
    fontFamily: "Arial",
    pagesCount: 1,
  };

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.top = "-10000px";
  tempContainer.style.left = "-10000px";
  tempContainer.style.width = `${safeLayoutSettings.pageWidth}px`;
  tempContainer.style.height = "auto";
  tempContainer.style.backgroundColor = "#ffffff";
  document.body.appendChild(tempContainer);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [safeLayoutSettings.pageWidth, safeLayoutSettings.pageHeight],
  });

  const pageIds = Object.keys(allLayouts);

  try {
    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i];
      const pageLayout = allLayouts[pageId] || [];
      const pageNumber = i + 1;

      if (progress) progress(pageNumber);

      const pageElement = await buildPageElement(
        pageLayout,
        safeLayoutSettings,
        pageNumber,
        pageIds.length,
        issueDate,
        newspaperName,
        currentFont
      );
      tempContainer.appendChild(pageElement);

      const images = pageElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          });
        })
      );

      const canvas = await html2canvas(pageElement, {
        width: safeLayoutSettings.pageWidth,
        height: safeLayoutSettings.pageHeight,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        safeLayoutSettings.pageWidth,
        safeLayoutSettings.pageHeight
      );

      tempContainer.removeChild(pageElement);
    }

    const today = new Date();
    const filename = `${newspaperName}_${today.getFullYear()}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}.pdf`;

    if (progress) progress(filename);

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    document.body.removeChild(tempContainer);
  }
}; 