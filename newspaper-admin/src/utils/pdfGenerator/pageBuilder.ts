import { renderItem } from "./contentRenderer";
import { CustomLayout, LayoutSettings } from "./types";

export const buildPageElement = async (
  pageLayout: CustomLayout,
  layoutSettings: LayoutSettings,
  pageNumber: number,
  pagesCount: number,
  issueDate: string,
  newspaperName: string,
  currentFont: string
): Promise<HTMLElement> => {
  const { pageWidth, pageHeight } = layoutSettings;

  const pageContainer = document.createElement("div");
  pageContainer.style.width = `${pageWidth}px`;
  pageContainer.style.height = `${pageHeight}px`;
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
      ? pageHeight - 60 // Subtract header and footer
      : pageHeight - 30
  }px`; // Only footer
  contentArea.style.position = "relative";
  contentArea.style.padding = "0";
  contentArea.style.boxSizing = "border-box";

  for (const item of pageLayout) {
    const itemElement = await renderItem(item, layoutSettings, currentFont);
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
    pageInfo.textContent = `Page ${pageNumber} of ${pagesCount}`;
    footer.appendChild(pageInfo);
    pageContainer.appendChild(footer);
  }

  return pageContainer;
}; 