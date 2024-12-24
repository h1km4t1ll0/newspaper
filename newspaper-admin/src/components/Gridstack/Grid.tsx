import React, {
    useRef,
    createRef,
    useEffect,
    FC,
    Children,
    MouseEventHandler,
    ReactElement, useMemo, useState, useCallback,
} from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import { GridItem } from "./GridItem";
import { Button, Card, Col, Modal, Row } from "antd";
import { Layout } from "@components/Gridstack/index";
import { API_URL } from "@utility/constants";
import ContentEditor from "@components/editor-js/ContentEditor";
import qs from "qs";
import { useCustom } from "@refinedev/core";

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

type GridProps = {
    layout: Layout;
    layoutSettings: LayoutSettings;
    updateLayoutHandle: (layout: Layout) => void;
    addWidget: MouseEventHandler<HTMLButtonElement>;
    addWidgetWithContent: MouseEventHandler<HTMLButtonElement>;
    removeWidget: (id: string) => void;
    children?: ReactElement | ReactElement[];
    onChangeLayout: (layout: Layout) => void;
    currentPageNumber: number; // Pass the current page number
    totalPages: number; // Pass the total number of pages
};

export const Grid: FC<GridProps> = ({
                                        layout,
                                        layoutSettings,
                                        addWidget,
                                        removeWidget,
                                        children,
                                        onChangeLayout,
                                        addWidgetWithContent,
                                        currentPageNumber,
                                        totalPages,
                                    }) => {
    const gridItemsRefs: React.MutableRefObject<{
        [key: string]: React.MutableRefObject<HTMLDivElement>;
    }> = useRef({});
    const gridRef: React.MutableRefObject<undefined | GridStack> = useRef();

    const query = qs.stringify(
        {
            fields: '*',
            populate: {
                photos: {
                    fields: '*',
                    populate: {
                        photo: {
                            fields: '*',
                        },
                    },
                },
            },
        },
        {
            encodeValuesOnly: true, // prettify URL
        }
    );

    const { data, isLoading, refetch } = useCustom<{
        data: {
            id: number,
            attributes: {
                id: number,
                text: any,
                name: string,
                photos: {
                    data: [{
                        id: number,
                        attributes: {
                            name: string,
                            width: number,
                            height: number,
                            createdAt: string,
                            updatedAt: string,
                            photo: {
                                data: {
                                    attributes: {
                                        url: string,
                                    },
                                },
                            },
                        },
                    }],
                },
            },
        }[],
    }>({
        url: `${API_URL}/api/articles?${query}`,
        method: "get",
    });
    const [items, setItems] = useState<{ title: string, content: any, id: number, images: string[] }[]>();

    const getItems = useCallback(
        async () => {
            const data = await refetch();
            console.log(data, 'data');
            setItems(data.data?.data.data.map(
                (rawData) => ({
                    title: rawData.attributes.name,
                    content: rawData.attributes.text,
                    id: rawData.id,
                    images: rawData.attributes.photos.data.map(
                        (image) => image.attributes.photo.data.attributes.url,
                    ),
                }),
            ));
        }, []
    );

    const rowHeight = 20;
    const rowCount = Math.floor((layoutSettings.pageHeight - layoutSettings.verticalFieldsHeight) / rowHeight);

    const saveData = () => {
        console.log("Saved data:", gridRef.current?.save());
    };

    const [visible, setVisible] = useState(false);
    const showModal = () => {
        getItems().then(() => setVisible(true));
    };
    const handleCancel = () => {
        setVisible(false);
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
                removable: '.trash',
                acceptWidgets: function(el) { return true },
                column: layoutSettings.columnCount,
                cellHeight: rowHeight,
                margin: 5,
                float: true,
                maxRow: rowCount,
            });

        const grid = gridRef.current;

        const nextId =  (layout.length + 1).toString();
        console.log(grid.save())

        grid.on("added", (event, items) => {
            const itemId: string | undefined = items[items.length - 1]?.id;
            if (!itemId) {
                console.error("Ошибка при изменении лейаута! Нет ид элемента!");
                return;
            }

            if (layout.filter((each) => each.id === itemId).length > 0) {
                return;
            }

            const curItem = items[items.length - 1];

            onChangeLayout([
                ...layout,
                {
                    content: curItem.content,
                    id: itemId,
                    lock: false,
                    h: curItem.h,
                    w: curItem.w,
                    x: curItem.x,
                    y: curItem.y,
                },
            ]);
        });

        gridRef.current.on("change", (event, items) => {
            const itemId = items[0]?.el?.id;

            console.log(items, 'items CHANGED')

            if (!itemId) {
                console.error("Ошибка при изменении лейаута! Нет ид элемента!");
                return;
            }

            const curItem = layout.find((each) => each.id === itemId);

            if (!curItem) {
                console.error("Ошибка при изменении лейаута! Элемента нет в layout");
                return;
            }

            onChangeLayout([
                ...layout.filter((each) => each.id !== itemId),
                {
                    ...curItem,
                    h: items[0].h,
                    w: items[0].w,
                    x: items[0].x,
                    y: items[0].y,
                },
            ]);
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
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Buttons above the header */}
                <div style={{
                    backgroundColor: "#ffffff",
                    padding: "20px 0",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd"
                }}>
                    <Button onClick={addWidget}>Add Widget</Button>
                    <Button onClick={saveData}>Save Layout</Button>
                    <Button onClick={() => console.log("Preview Page")}>Preview</Button>
                    <Button type="primary" onClick={showModal}>Open Popup</Button>
                </div>

                {/* Header */}
                <header style={{
                    backgroundColor: "#ffffff",
                    padding: "10px 20px",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd"
                }}>
                    <h1 style={{margin: 0, fontSize: "24px"}}>My Grid Layout</h1>
                </header>

                {/* Main Content Area */}
                <div style={{flex: 1, padding: '20px', backgroundColor: "#ffffff", overflowY: 'auto'}}>
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #ddd",
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
                                        <div>
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
                                                onClick={() => {
                                                    removeWidget(child?.props.id);
                                                }}
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
                </div>

                {/* Footer */}
                <footer
                    style={{
                        backgroundColor: "#ffffff",
                        padding: "10px 20px",
                        textAlign: "center",
                        borderTop: "1px solid #ddd",
                    }}
                >
                    <p>
                        Page {currentPageNumber} of {totalPages}
                    </p>
                </footer>
            </div>
            <Modal
                title="Scrollable Card List"
                open={visible}
                onCancel={handleCancel}
                footer={null} // No footer buttons
                width={600} // Set width of the modal
            >
                <div style={{height: '500px', overflowY: 'auto', padding: '16px', display: 'flex'}}>
                    <Row gutter={[16, 16]}>
                        {items?.map(item => (
                            <Col span={24} key={item.id}>
                                <Card title={item.title} bordered={true}>
                                    {item.images.length > 0 && (
                                        <img src={`${API_URL}${item.images[0]}`} style={{width: 300, height: 200}}/>
                                    )}
                                    {item.content && (
                                        <ContentEditor readOnly value={item.content}/>
                                    )}
                                    <Button type="primary" onClick={() => {
                                        addWidgetWithContent(item.content);
                                        console.log(items, 'before');
                                        setItems((prev) => prev?.filter((each) => each.id !== item.id));
                                        console.log(items, 'after');
                                    }}>Add to issue</Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Modal></>
    );
};
