import {useEffect, useState} from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";

type layout = { id: string; x: number; y: number; w: number; h: number }[];
type widget = { id: string; content: string; lock: boolean };

/*
[
    {
        "id": "1",
        "content": "widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1",
        "lock": false
    },
    {
        "id": "2",
        "content": "widget 2",
        "lock": false
    },
    {
        "id": "3",
        "content": "widget 3",
        "lock": false
    },
    {
        "id": "4",
        "content": "widget 4",
        "lock": false
    },
    {
        "id": "5",
        "content": "widget 5",
        "lock": false
    },
    {
        "id": "6",
        "content": "widget 6",
        "lock": false
    },
    {
        "id": "7",
        "content": "widget 7",
        "lock": false
    },
    {
        "id": "8",
        "content": "widget 8",
        "lock": false
    },
    {
        "id": "9",
        "content": "widget 9",
        "lock": false
    },
    {
        "id": "10",
        "content": "widget 10",
        "lock": false
    },
    {
        "id": "11",
        "content": "widget 11",
        "lock": false
    }
]
 */

const GridStack = () => {
  const [layout, setLayout] = useState<any>({
    "1": {x: 0, y: 0, w: 1, h: 1},
    "2": {x: 1, y: 0, w: 1, h: 1},
    "3": {x: 2, y: 0, w: 1, h: 1},
    "4": {x: 3, y: 0, w: 1, h: 1},
  });

  const [widgets, setWidgets] = useState<widget[]>([
    { id: "1", content: "widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1widget 1", lock: false },
    { id: "2", content: "widget 2", lock: false },
    { id: "3", content: "widget 3", lock: false },
    { id: "4", content: "widget 4", lock: false },
  ]);

  useEffect(() => {
    console.log(layout, widgets)
  }, [widgets, layout]);

  const updateLayoutHandle = (layout: layout) => console.log(layout);

  const addWidget = () => {
    const newWidget: widget = {
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
            {widget.content}
          </div>
        ))}
      </Grid>
  );
};

export default GridStack;
