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
  [pageId: string]: Layout
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
};

type GridStackProps = {
  layoutSettings?: LayoutSettings;
};

const GridStack: FC<GridStackProps> = ({ layoutSettings }: GridStackProps) => {
  const [pages, setPages] = useState<PageLayout>({
    page1: [
      { id: "page1-widget-1", x: 0, y: 0, w: 1, h: 1, content: "widget 1", lock: false },
      { id: "page2-widget-2", x: 1, y: 0, w: 1, h: 1, content: "widget 2", lock: false },
    ],
  });
  const [currentPage, setCurrentPage] = useState<string>("page1");

  useEffect(() => {
    console.log(`Current page: ${currentPage}`, pages[currentPage]);
    console.log('content', pages)
  }, [currentPage, pages]);

  const updateLayoutHandle = (layout: Layout) => {
    setPages((prev) => ({ ...prev, [currentPage]: layout }));
  };

  const addPage = () => {
    const newPageId = `page${Object.keys(pages).length + 1}`;
    setPages({ ...pages, [newPageId]: [] });
    setCurrentPage(newPageId);
  };

  const addWidget = () => {
    const pageLayout = pages[currentPage];
    setPages({
      ...pages,
      [currentPage]: [
        ...pageLayout,
        {
          id: `${currentPage}-widget-${pageLayout.length + 1}`,
          content: `widget ${pageLayout.length + 1}`,
          lock: false
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
        >
          <div className="editor-js">
            <ContentEditor readOnly value={typeof layout_.content === "string" ? null : layout_.content} />
          </div>
        </div>
    ));
  }, [pages, currentPage]);

  return (
      <div>
        {/* Page Navigation */}
        <div className="page-controls">
          <button onClick={addPage}>Add Page</button>
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
            layout={pages[currentPage]}
            // @ts-ignore
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
