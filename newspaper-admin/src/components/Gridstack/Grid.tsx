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
import { Button } from "antd";

type Layout = { id: string; x: number; y: number; w: number; h: number }[];

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

type GridProps = {
    layout: Layout;
    layoutSettings: LayoutSettings;
    updateLayoutHandle: (layout: Layout) => void;
    addWidget: MouseEventHandler<HTMLButtonElement>;
    removeWidget: (id: string) => void;
    children?: ReactElement | ReactElement[];
    onChangeLayout: (layout: any) => void;
};

export const Grid: FC<GridProps> = ({
                                        layout,
                                        layoutSettings,
                                        addWidget,
                                        removeWidget,
                                        children,
                                        onChangeLayout,
                                    }) => {
    const gridItemsRefs: React.MutableRefObject<{
        [key: string]: React.MutableRefObject<HTMLDivElement>;
    }> = useRef({});
    const gridRef: React.MutableRefObject<undefined | GridStack> = useRef();

    const rowHeight = 20;
    const rowCount = Math.floor((layoutSettings.pageHeight - layoutSettings.verticalFieldsHeight) / rowHeight);

    const saveData = () => {
        console.log("Saved data:", gridRef.current?.save());
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
                column: layoutSettings.columnCount,
                cellHeight: rowHeight,
                margin: 5,
                float: true,
                maxRow: rowCount,
            });

        const grid = gridRef.current;

        grid.on("added", (event, items) => {
            const itemId: string | undefined = items[items.length - 1]?.el?.id;
            if (!itemId) {
                console.error("Ошибка при изменении лейаута! Нет ид элемента!");
                return;
            }

            // @ts-ignore
            if (layout[itemId]) {
                return;
            }

            if (Object.keys(layout).length === items.length) {
                return;
            }
        });

        gridRef.current.on("change", (event, items) => {
            const itemId = items[0]?.el?.id;

            if (!itemId) {
                console.error("Ошибка при изменении лейаута! Нет ид элемента!");
                return;
            }

            onChangeLayout({
                ...layout,
                [itemId]: {
                    h: items[0].h,
                    w: items[0].w,
                    x: items[0].x,
                    y: items[0].y,
                },
            });
        });

        grid.batchUpdate();
        grid.removeAll(false);
        Children.forEach(children, (child) => {
            grid.makeWidget(gridItemsRefs.current[child.props.id].current);
        });

        grid.batchUpdate(false);
    }, [children, rowHeight, rowCount]);

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row", marginBottom: 20 }}>
                <Button onClick={addWidget}>Add Widget</Button>
                <Button onClick={saveData}>Save Layout</Button>
                <Button onClick={() => console.log("Preview Page")}>Preview</Button>
            </div>
            <div
                style={{
                    backgroundColor: "#e5e7eb",
                    height: layoutSettings.pageHeight,
                    padding: `${layoutSettings.verticalFieldsHeight}px ${layoutSettings.horizontalFieldsWidth}px`,
                }}
            >
                <div className="grid-stack">
                    {Children.map(children, (child) => {
                        const childLayout = layout[child?.props.id];

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
                                <div >
                                    {/* Remove Button positioned at the top-right corner */}
                                    <button
                                        style={{
                                            position: "absolute",
                                            top: 5,
                                            right: 5,
                                            backgroundColor: "transparent",
                                            border: "none",
                                            color: "#454545",
                                            fontSize: "16px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => removeWidget(child?.props.id)}
                                    >
                                        X
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
