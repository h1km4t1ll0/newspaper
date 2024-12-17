import {FC, useEffect, useState} from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import EditorJSComponent from "./EditorJSComponent";

type Layout = { id: string; x: number; y: number; w: number; h: number }[];
type Widget = { id: string; content: string; lock: boolean };
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
  const [layout, setLayout] = useState<any>({
    "1": { x: 0, y: 0, w: 1, h: 1 },
    "2": { x: 1, y: 0, w: 1, h: 1 },
    "3": { x: 2, y: 0, w: 1, h: 1 },
    "4": { x: 3, y: 0, w: 1, h: 1 },
  });

  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "1", content: "widget 1", lock: false },
    { id: "2", content: "widget 2", lock: false },
    { id: "3", content: "widget 3", lock: false },
    { id: "4", content: "widget 4", lock: false },
  ]);

  useEffect(() => {
    console.log(layout, widgets);
  }, [widgets, layout]);

  const updateLayoutHandle = (layout: Layout) => console.log(layout);

  const addWidget = () => {
    const newWidget: Widget = {
      id: (widgets.length + 1).toString(),
      content: "widget " + (widgets.length + 1).toString(),
      lock: false,
    };

    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
  };


  return (
      <Grid
          layout={layout}
          // @ts-ignore
          layoutSettings={layoutSettings} // Pass layoutSettings to Grid
          updateLayoutHandle={updateLayoutHandle}
          addWidget={addWidget}
          removeWidget={removeWidget}
          onChangeLayout={setLayout}
      >
        {widgets.map((widget) => (
            <div
                className="widget"
                key={widget.id}
                id={widget.id}
                data-lock={widget.lock}
            >
              <div className="editor-js">
                <EditorJSComponent widgetId={widget.id} />
              </div>
            </div>
        ))}
      </Grid>
  );
};

export default GridStack;
