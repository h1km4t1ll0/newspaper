import { API_URL } from "@utility/constants";
import { renderMarkdownToHTML } from "./markdownRenderer";
import { CustomLayoutItem, LayoutSettings } from "./types";

export const renderItem = async (
  item: CustomLayoutItem,
  layoutSettings: LayoutSettings,
  currentFont: string
): Promise<HTMLElement> => {
  const {
    pageWidth,
    horizontalFieldsWidth,
    columnCount,
    verticalFieldsHeight,
  } = layoutSettings;
  const columnWidth = (pageWidth - horizontalFieldsWidth * 2) / columnCount;
  const rowHeight = 40;

  const itemElement = document.createElement("div");
  itemElement.style.position = "absolute";
  itemElement.style.left = `${
    (item.x || 0) * columnWidth + horizontalFieldsWidth
  }px`;
  itemElement.style.top = `${
    (item.y || 0) * rowHeight + verticalFieldsHeight
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

    const processedHTML = await renderMarkdownToHTML(textContent);

    textContainer.style.fontFamily = currentFont;
    textContainer.style.fontSize =
      item.id === "first-page-title"
        ? "24px"
        : item.id === "first-page-date"
        ? "16px"
        : "14px";

    textContainer.innerHTML = processedHTML;

    const headings = textContainer.querySelectorAll("h1, h2, h3, h4, h5, h6");
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

  return itemElement;
}; 