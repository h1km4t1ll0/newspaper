import React, {
  useRef,
  createRef,
  useEffect,
  FC,
  Children,
  MouseEventHandler,
  ReactElement,
} from "react";
import { GridStack } from "gridstack";

import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import { GridItem } from "./GridItem";
import {Button} from "antd";

const layoutSettings = {
  rowHeight: 50,
  rowCount: 10,
};

type layout = { id: string; x: number; y: number; w: number; h: number }[];
type GridProps = {
  layout: layout;
  updateLayoutHandle: (layout: layout) => void;
  addWidget: MouseEventHandler<HTMLButtonElement>;
  removeWidget: (id: string) => void;
  children?: ReactElement | ReactElement[];
  onChangeLayout: (layout: any) => void
};

export const Grid: FC<GridProps> = ({
  layout,
  addWidget,
  removeWidget,
  children,
  onChangeLayout,
}) => {
  const {rowHeight, rowCount} = layoutSettings;
  const gridItemsRefs: React.MutableRefObject<{
    [key: string]: React.MutableRefObject<HTMLDivElement>;
  }> = useRef({});
  const gridRef: React.MutableRefObject<undefined | GridStack> = useRef();

  const saveData = () => {
    console.log('Saved data:', gridRef.current?.save())
  };

  if (children) {
    Children.forEach(children, (child) => {
      gridItemsRefs.current[child.props.id] =
        gridItemsRefs.current[child.props.id] || createRef();
    });
  }

  useEffect(() => {
    if (!children) return;

    gridRef.current =
      gridRef.current ||
      GridStack.init({
        column: 4,
        cellHeight: rowHeight,
        margin: 5,
        float: true,
        maxRow: rowCount,
      });

    const grid = gridRef.current;

    grid.on('added', (event, items) => {
      // console.log(Object.keys(layout).length, items.length, event)
      const itemId: string | undefined = items[items.length - 1]?.el?.id;
      // console.log('added')
      if (!itemId) {
        console.error('Ошибка при изменении лейаута! Нет ид элемента!');
        return;
      }

      if (layout[itemId]) {
        return;
      }

      if (
        Object.keys(layout).length == items.length
        // layout[itemId].h == items[items.length - 1].h &&
        // layout[itemId].w == items[items.length - 1].w &&
        // layout[itemId].x == items[items.length - 1].x &&
        // layout[itemId].y == items[items.length - 1].y
      ) {
        return;
      }

      // onChangeLayout({
      //   ...layout,
      //   [itemId]: {
      //     h: items[items.length - 1].h,
      //     w: items[items.length - 1].w,
      //     x: items[items.length - 1].x,
      //     y: items[items.length - 1].y
      //   }
      // });
    });

    gridRef.current.on('change', (event, items) => {
      const itemId = items[0]?.el?.id;

      if (!itemId) {
        console.error('Ошибка при изменении лейаута! Нет ид элемента!');
        return;
      }

      // console.log(items, 'items', {
      //   ...layout,
      //   [itemId]: {
      //     h: items[0].h,
      //     w: items[0].w,
      //     x: items[0].x,
      //     y: items[0].y
      //   }
      // });

      onChangeLayout({
        ...layout,
        [itemId]: {
          h: items[0].h,
          w: items[0].w,
          x: items[0].x,
          y: items[0].y
        }
      });
    });

    grid.batchUpdate();
    grid.removeAll(false);
    Children.forEach(children, (child) => {
      grid.makeWidget(gridItemsRefs.current[child.props.id].current,
        // {id: child.props.id}
      );
    });

    grid.batchUpdate(false);
  }, [children]);

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <Button onClick={addWidget}>Add new widget</Button>
        <Button onClick={saveData}>Serialize</Button>
      </div>
      <div style={{backgroundColor: '#e5e7eb', height: rowHeight * rowCount}}>
        <div className={"grid-stack"}>
          {Children.map(children, (child) => {
            const childLayout = layout[child?.props.id];

            // console.log('childLayout', childLayout)
            return (
              <GridItem
                itemRef={gridItemsRefs.current[child?.props.id]}
                id={child?.props.id}
                gs-id={childLayout?.id}
                gs-x={childLayout?.x}
                gs-y={childLayout?.y}
                gs-w={childLayout?.w}
                gs-h={childLayout?.h}
              >
                <div style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  <button style={{height: '20px'}} onClick={() => removeWidget(child?.props.id)}>
                    Remove Widget
                  </button>
                  {child}
                </div>
              </GridItem>
            );
          })}
        </div>
      </div>
    </>
  );
};
