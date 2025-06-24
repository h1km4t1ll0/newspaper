import React from "react";
import { createRoot } from "react-dom/client";
import MDEditor from "@uiw/react-md-editor";

export const renderMarkdownToHTML = async (text: string): Promise<string> => {
  return new Promise((resolve) => {
    // Создаем временный контейнер
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "-10000px";
    tempDiv.style.left = "-10000px";
    tempDiv.style.visibility = "hidden";
    document.body.appendChild(tempDiv);

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