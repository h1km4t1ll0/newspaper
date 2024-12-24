import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import ContentEditor from "@components/editor-js/ContentEditor";
import {API_URL} from "@utility/constants";
import {useCustom, useNotification} from "@refinedev/core";
import axios from "axios";
import { useUpdate } from "@refinedev/core";


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
  issueId: number;
  issueCover: any;
};

const GridStack: FC<GridStackProps> = ({
                                         layoutSettings,
                                         issueDate,
                                         newspaperName,
                                         issueId,
                                         issueCover
                                       }: GridStackProps) => {
  const { pagesCount, availableTextStyles } = layoutSettings;

  const { mutate } = useUpdate();

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

  const { open } = useNotification();

  useEffect(() => {
    console.log(`Current page: ${currentPage}`, pages[currentPage]);
    open?.({
      type: 'success',
      message: 'You must select at least one row',
      description: 'An error occurred',
    });

    mutate({
      resource: "posts",
      id: 1,
      values: {
        title: "New title",
      },
      meta: {
        method: "post",
      },
    });
  }, [pages]);

  const updateLayoutHandle = useCallback((layout: Layout) => {
    setPages((prev) => ({ ...prev, [currentPage]: layout }));
  }, [currentPage]);

  const addWidgetWithContent = (content: any) => {
    const pageLayout = pages[currentPage];
    setPages({
      ...pages,
      [currentPage]: [
        ...pageLayout,
        {
          id: `${currentPage}-widget-${pageLayout.length + 1}`,
          x: 0, // Default x position
          y: 0, // Places the widget at the bottom
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
            style={{ fontFamily: layout_.content?.fontFamily ?? 'Arial' }}
        >
          {layout_.content?.type === 'image' &&
              <div style={{
                height: `${layoutSettings.pageHeight * 0.5}px`, // Fixed height for the container
                overflow: 'hidden', // Hide overflow to prevent cropping
                display: 'flex', // Use flexbox to center the image
                justifyContent: 'center', // Center horizontally
                alignItems: 'center', // Center vertically
                padding: '10px' // Add padding around the image
              }}>
                <img
                    alt="issueCover"
                    style={{
                      maxHeight: '100%', // Ensure the image does not exceed the container height
                      maxWidth: '100%', // Ensure the image does not exceed the container width
                      objectFit: 'contain' // Maintain aspect ratio and fit within the container
                    }}
                    src={`${API_URL}${layout_.content.url}`}
                />
              </div>
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
            issueCover={issueCover}
        >
          {gridElementMemo}
        </Grid>
      </div>
  );
};

export default GridStack;
