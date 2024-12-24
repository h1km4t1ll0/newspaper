import React, { FC, useEffect, useMemo, useState } from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import ContentEditor from "@components/editor-js/ContentEditor";
import {API_URL} from "@utility/constants";

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
  layoutSettings: LayoutSettings;
  issueDate: string;
  newspaperName: string;
};

const GridStack: FC<GridStackProps> = ({
                                         layoutSettings,
                                         issueDate,
                                         newspaperName,
                                       }: GridStackProps) => {
  const { pagesCount, availableTextStyles } = layoutSettings;

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
  const [selectedFont, setSelectedFont] = useState<string>(
      layoutSettings.fontFamily
  );

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

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = e.target.value;
    setSelectedFont(newFont);

    // Apply font change to all widgets in the current page
    const updatedLayout = pages[currentPage].map((widget) => ({
      ...widget,
      content: {
        ...widget.content,
        fontFamily: newFont,
      },
    }));
    setPages({
      ...pages,
      [currentPage]: updatedLayout,
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
            style={{ fontFamily: layout_.content.fontFamily }}
        >
          {layout_.content.type === 'image' &&
              <img src={`${API_URL}${layout_.content.url}`} style={{width: "100%", height: "auto"}}/>
          }
          {layout_.content?.type !== 'image' &&
              <div className="editor-js">
                  <ContentEditor
                      readOnly
                      value={typeof layout_.content === "string" ? null : layout_.content}
                  />
              </div>
          }
        </div>
    ));
  }, [pages, currentPage]);

  return (
    <div>
      {/* Font Selection */}
      <div className="font-selector">
        <label>Select Font: </label>
        <select onChange={handleFontChange} value={selectedFont}>
            {availableTextStyles.fonts.map((font: any) => (
                <option key={font.name} value={font.fontFamily}>
                  {font.name}
                </option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div className="page-controls">
          {Object.keys(pages).map((pageId, index) => (
              <button
                  key={pageId}
                  onClick={() => setCurrentPage(pageId)}
                  style={{ fontWeight: currentPage === pageId ? "bold" : "normal" }}
              >
                Page {index + 1}
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
            currentPageNumber={Object.keys(pages).indexOf(currentPage) + 1}
            totalPages={Object.keys(pages).length}
            issueDate={issueDate}
            newspaperName={newspaperName}
            currentFont={selectedFont}
        >
          {gridElementMemo}
        </Grid>
      </div>
  );
};

export default GridStack;
