import React, {FC, useEffect, useMemo, useState} from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import ContentEditor from "@components/editor-js/ContentEditor";

export type Layout = { id: string; x?: number; y?: number; w?: number; h?: number, content: any, lock: boolean }[];
type LayoutSettings = {
  editorJSData: JSON,
  columnCount: number,
  pageHeight: number,
  availableTextStyles: JSON,
  pageWidth: number,
  horizontalFieldsWidth: number,
  verticalFieldsHeight: number,
  fontFamily: string,
};

type GridStackProps = {
  layoutSettings?: LayoutSettings; // Allow optional prop with default
};

const GridStack: FC<GridStackProps> = ({ layoutSettings }: GridStackProps) => {
  const [layout, setLayout] = useState<Layout>([
    { id: "1", x: 0, y: 0, w: 1, h: 1, content: "widget 1", lock: false },
    { id: "2", x: 1, y: 0, w: 1, h: 1, content: "widget 2", lock: false },
    { id: "3", x: 2, y: 0, w: 1, h: 1, content: "widget 3", lock: false },
    { id: "4", x: 3, y: 0, w: 1, h: 1, content: "widget 4", lock: false },
  ]);

  useEffect(() => {
    console.log(layout);
  }, [layout]);

  const updateLayoutHandle = (layout: Layout) => console.log(layout);

  const addWidget = () => {
    setLayout([
      ...layout,
      {
        id: (Object.keys(layout).length + 1).toString(),
        content: "widget " + (Object.keys(layout).length + 1).toString(),
        lock: false,
      },
    ]);
  };

  const addWidgetWithContent = (content: any) => {
    setLayout([
      ...layout,
      {
        id: (Object.keys(layout).length + 1).toString(),
        content: content,
        lock: false,
      },
    ]);
  };

  const removeWidget = (id: string) => {
    setLayout(layout.filter(each => each.id !== id));
  };

  const gridElementMemo = useMemo(() =>{
    return layout.map((layout_) => (
      <div
        className="widget"
        key={layout_.id}
        id={layout_.id}
        data-lock={layout_.lock}
      >
        <div className="editor-js">
          <ContentEditor readOnly value={typeof layout_.content === 'string' ? null : layout_.content}/>
        </div>
      </div>
    ));
  }, [layout]);


  return (
      <Grid
          layout={layout}
          // @ts-ignore
          layoutSettings={layoutSettings} // Pass layoutSettings to Grid
          updateLayoutHandle={updateLayoutHandle}
          addWidget={addWidget}
          addWidgetWithContent={addWidgetWithContent}
          removeWidget={removeWidget}
          onChangeLayout={setLayout}
      >
        {gridElementMemo}
      </Grid>
  );
};

export default GridStack;
