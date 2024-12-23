import React, { FC, useEffect, useMemo, useState } from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import ContentEditor from "@components/editor-js/ContentEditor";

export type Layout = {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  content: any;
  lock: boolean;
}[];

export type PageLayout = {
  [pageId: string]: Layout;
};

type LayoutSettings = {
  editorJSData: JSON;
  columnCount: number;
  pageHeight: number;
  availableTextStyles: JSON;
  pageWidth: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
  fontFamily: string;
  pagesCount: number;
};

type GridStackProps = {
  layoutSettings: LayoutSettings; // Required
};

const GridStack: FC<GridStackProps> = ({ layoutSettings }: GridStackProps) => {
  const { pagesCount } = layoutSettings;

  // Initialize pages based on pagesCount
  const initializePages = (): PageLayout => {
    const initialPages: PageLayout = {};
    for (let i = 1; i <= pagesCount; i++) {
      initialPages[`page${i}`] = []; // Each page starts with an empty layout
    }
    return initialPages;
  };

  const [pages, setPages] = useState<PageLayout>(initializePages);
  const [currentPage, setCurrentPage] = useState<string>("page1");

  useEffect(() => {
    console.log(`Current page: ${currentPage}`, pages[currentPage]);
  }, [currentPage, pages]);

  const updateLayoutHandle = (layout: Layout) => {
    setPages((prev) => ({ ...prev, [currentPage]: layout }));
  };

  const addWidget = () => {
    const pageLayout = pages[currentPage];
    setPages({
      ...pages,
      [currentPage]: [
        ...pageLayout,
        {
          id: `${currentPage}-widget-${pageLayout.length + 1}`,
          x: 0, // Default x position
          y: Infinity, // Places the widget at the bottom
          w: 1, // Default width
          h: 1, // Default height
          content: `widget ${pageLayout.length + 1}`,
          lock: false,
        },
      ],
    });
  };

  const addWidgetWithContent = (content: any) => {
    const pageLayout = pages[currentPage];
    setPages({
      ...pages,
      [currentPage]: [
        ...pageLayout,
        {
          id: `${currentPage}-widget-${pageLayout.length + 1}`,
          x: 0, // Default x position
          y: Infinity, // Places the widget at the bottom
          w: 1, // Default width
          h: 1, // Default height
          content,
          lock: false,
        },
      ],
    });
  };

  const removeWidget = (id: string) => {
    const pageLayout = pages[currentPage];
    setPages({
      ...pages,
      [currentPage]: pageLayout.filter((block) => block.id !== id),
    });
  };

  const gridElementMemo = useMemo(() => {
    const pageLayout = pages[currentPage];
    return pageLayout.map((layout_) => (
        <div
            className="widget"
            key={layout_.id}
            id={layout_.id}
            data-lock={layout_.lock}
            data-w={layout_.w}
            data-h={layout_.h}
            data-x={layout_.x}
            data-y={layout_.y}
        >
          <div className="editor-js">
            <ContentEditor
                readOnly
                value={typeof layout_.content === "string" ? null : layout_.content}
            />
          </div>
        </div>
    ));
  }, [pages, currentPage]);

  return (
      <div>
        {/* Page Navigation */}
        <div className="page-controls">
          {Object.keys(pages).map((pageId) => (
              <button
                  key={pageId}
                  onClick={() => setCurrentPage(pageId)}
                  style={{ fontWeight: currentPage === pageId ? "bold" : "normal" }}
              >
                {pageId}
              </button>
          ))}
        </div>

        {/* Grid Component */}
        <Grid
            layout={pages[currentPage]} // Pass the layout for the current page
            layoutSettings={layoutSettings}
            updateLayoutHandle={updateLayoutHandle}
            addWidget={addWidget}
            addWidgetWithContent={addWidgetWithContent}
            removeWidget={removeWidget}
            onChangeLayout={(newLayout) =>
                setPages((prev) => ({ ...prev, [currentPage]: newLayout }))
            }
        >
          {gridElementMemo}
        </Grid>
      </div>
  );
};

export default GridStack;
