import MDEditor from "@uiw/react-md-editor";
import { API_URL } from "@utility/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import { createRoot } from "react-dom/client";

// Функция для рендеринга Markdown в HTML используя тот же компонент что и в браузере
const renderMarkdownToHTML = async (text: string): Promise<string> => {
  return new Promise((resolve) => {
    // Создаем временный контейнер
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "-10000px";
    tempDiv.style.left = "-10000px";
    tempDiv.style.visibility = "hidden";
    document.body.appendChild(tempDiv);

    // Создаем React root и рендерим MDEditor.Markdown
    const root = createRoot(tempDiv);

    const MarkdownComponent = React.createElement(
      "div",
      { "data-color-mode": "light" },
      React.createElement(MDEditor.Markdown, {
        source: text,
        style: {
          backgroundColor: "transparent",
          padding: "0",
          margin: "0",
        },
      })
    );

    root.render(MarkdownComponent);

    // Даем время на рендеринг
    setTimeout(() => {
      const htmlContent = tempDiv.innerHTML;

      // Очищаем
      root.unmount();
      document.body.removeChild(tempDiv);

      resolve(htmlContent);
    }, 100);
  });
};

type CustomLayout = {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  content: any;
  lock: boolean;
}[];

type PageLayout = {
  [pageId: string]: CustomLayout;
};

type LayoutSettings = {
  editorJSData: JSON;
  columnCount: number;
  pageHeight: number;
  availableTextStyles: {
    fonts: Array<{
      fontFamily: string;
      name: string;
    }>;
  };
  pageWidth: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
  fontFamily: string;
  pagesCount: number;
};

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

  // Create a temporary container for rendering pages
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

      if (progress) progress(pageNumber); // Notify progress for this page

      // Create page container
      const pageContainer = document.createElement("div");
      pageContainer.style.width = `${safeLayoutSettings.pageWidth}px`;
      pageContainer.style.height = `${safeLayoutSettings.pageHeight}px`;
      pageContainer.style.backgroundColor = "#ffffff";
      pageContainer.style.position = "relative";
      pageContainer.style.fontFamily = currentFont;
      pageContainer.style.fontSize = "14px";
      pageContainer.style.margin = "0";
      pageContainer.style.padding = "0";

      // Add header (except for first page)
      if (pageNumber !== 1) {
        const header = document.createElement("header");
        header.style.height = "30px";
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.borderBottom = "1px solid #ddd";
        header.style.padding = "5px 10px";
        header.style.fontSize = "12px";
        header.style.fontWeight = "bold";
        header.style.backgroundColor = "#f8f9fa";

        const dateSpan = document.createElement("span");
        dateSpan.style.margin = "0";
        dateSpan.textContent = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(issueDate));

        const nameSpan = document.createElement("span");
        nameSpan.style.margin = "0";
        nameSpan.textContent = newspaperName;

        header.appendChild(dateSpan);
        header.appendChild(nameSpan);
        pageContainer.appendChild(header);
      }

      // Add main content area
      const contentArea = document.createElement("div");
      contentArea.style.backgroundColor = "#ffffff";
      contentArea.style.height = `${
        pageNumber !== 1
          ? safeLayoutSettings.pageHeight - 60 // Subtract header and footer
          : safeLayoutSettings.pageHeight - 30
      }px`; // Only footer
      contentArea.style.position = "relative";
      // Убираем padding, так как теперь учитываем отступы в позиционировании элементов
      contentArea.style.padding = "0";
      contentArea.style.boxSizing = "border-box";

      // Render page content in preview style
      for (const item of pageLayout) {
        const columnWidth =
          (safeLayoutSettings.pageWidth -
            safeLayoutSettings.horizontalFieldsWidth * 2) /
          safeLayoutSettings.columnCount;
        const rowHeight = 40;

        const itemElement = document.createElement("div");
        itemElement.style.position = "absolute";
        // Добавляем horizontalFieldsWidth к позиции X для учета левого отступа
        itemElement.style.left = `${
          (item.x || 0) * columnWidth + safeLayoutSettings.horizontalFieldsWidth
        }px`;
        // Добавляем verticalFieldsHeight к позиции Y для учета верхнего отступа
        itemElement.style.top = `${
          (item.y || 0) * rowHeight + safeLayoutSettings.verticalFieldsHeight
        }px`;
        itemElement.style.width = `${(item.w || 1) * columnWidth}px`;
        itemElement.style.height = `${(item.h || 1) * rowHeight}px`;
        itemElement.style.overflow = "hidden";

        if (item.content?.type === "image") {
          const imageContainer = document.createElement("div");
          imageContainer.style.overflow = "hidden";
          imageContainer.style.display = "flex";
          imageContainer.style.justifyContent = "center";
          imageContainer.style.alignItems = "center";
          imageContainer.style.padding =
            item.id === "first-page-issue-cover" ? "5px" : "6px";
          imageContainer.style.height = "100%";
          imageContainer.style.width = "100%";

          const img = document.createElement("img");
          img.style.maxHeight = "100%";
          img.style.maxWidth = "100%";
          img.style.objectFit =
            item.id === "first-page-issue-cover" ? "cover" : "contain";
          img.style.borderRadius =
            item.id === "first-page-issue-cover" ? "8px" : "0px";
          img.src = `${API_URL}${item.content.url}`;

          imageContainer.appendChild(img);
          itemElement.appendChild(imageContainer);
        } else {
          const textContainer = document.createElement("div");
          textContainer.style.backgroundColor = "transparent";
          textContainer.style.padding = "6px";
          textContainer.style.whiteSpace = "pre-wrap";
          textContainer.style.wordBreak = "break-word";
          textContainer.style.lineHeight = "1.4";
          textContainer.style.textAlign =
            item.id === "first-page-title" || item.id === "first-page-date"
              ? "center"
              : "left";
          textContainer.style.fontSize =
            item.id === "first-page-title"
              ? "24px"
              : item.id === "first-page-date"
              ? "16px"
              : "inherit";
          textContainer.style.fontWeight =
            item.id === "first-page-title" ? "bold" : "inherit";

          const textContent =
            typeof item.content === "string"
              ? item.content
              : item.content.text || item.content.blocks?.[0]?.data?.text || "";

          // Отладочная информация
          console.log("PDF Generation - Item content:", item.content);
          console.log("PDF Generation - Extracted text:", textContent);

          // Обрабатываем Markdown разметку используя тот же компонент что и в браузере
          const processedHTML = await renderMarkdownToHTML(textContent);
          console.log("PDF Generation - Processed HTML:", processedHTML);

          // Добавляем базовые стили для правильного отображения
          textContainer.style.fontFamily = currentFont;
          textContainer.style.fontSize =
            item.id === "first-page-title"
              ? "24px"
              : item.id === "first-page-date"
              ? "16px"
              : "14px";

          textContainer.innerHTML = processedHTML;

          // Применяем дополнительные стили к элементам внутри контейнера
          const headings = textContainer.querySelectorAll(
            "h1, h2, h3, h4, h5, h6"
          );
          headings.forEach((heading: any) => {
            heading.style.fontWeight = "bold";
            heading.style.margin = "0";
            heading.style.padding = "0";
            heading.style.lineHeight = "1.4";
            heading.style.fontFamily = currentFont;
          });

          const strongElements = textContainer.querySelectorAll("strong");
          strongElements.forEach((strong: any) => {
            strong.style.fontWeight = "bold";
            strong.style.fontFamily = currentFont;
          });

          const emElements = textContainer.querySelectorAll("em");
          emElements.forEach((em: any) => {
            em.style.fontStyle = "italic";
            em.style.fontFamily = currentFont;
          });

          itemElement.appendChild(textContainer);
        }

        contentArea.appendChild(itemElement);
      }

      pageContainer.appendChild(contentArea);

      // Add footer (except for first page)
      if (pageNumber !== 1) {
        const footer = document.createElement("footer");
        footer.style.position = "absolute";
        footer.style.bottom = "0";
        footer.style.left = "0";
        footer.style.right = "0";
        footer.style.height = "30px";
        footer.style.padding = "5px 10px";
        footer.style.textAlign = "center";
        footer.style.borderTop = "1px solid #ddd";
        footer.style.fontSize = "12px";
        footer.style.fontWeight = "bold";
        footer.style.backgroundColor = "#f8f9fa";
        footer.style.display = "flex";
        footer.style.justifyContent = "center";
        footer.style.alignItems = "center";

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Page ${pageNumber} of ${pageIds.length}`;
        footer.appendChild(pageInfo);
        pageContainer.appendChild(footer);
      }

      tempContainer.appendChild(pageContainer);

      // Wait for images to load
      const images = pageContainer.querySelectorAll("img");
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

      // Generate canvas from the page
      const canvas = await html2canvas(pageContainer, {
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

      // Clean up
      tempContainer.removeChild(pageContainer);
    }

    // Generate filename with current date
    const today = new Date();
    const filename = `${newspaperName}_${today.getFullYear()}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}.pdf`;

    if (progress) progress(filename); // Notify progress for saving

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // Clean up temporary container
    document.body.removeChild(tempContainer);
  }
};
