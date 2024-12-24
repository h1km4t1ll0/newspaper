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
    issueDate: string;
    newspaperName: string;
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
                                        issueDate,
                                        newspaperName,
                                    }) => {
    const issueDateBeautified = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(issueDate));
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
                sizeToContent: true,
                margin: 5,
                float: true,
                maxRow: rowCount,
            });

        const grid = gridRef.current;

        const nextId = (layout.length + 1).toString();
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

    const remainingHeight = layoutSettings.pageHeight
        - layoutSettings.verticalFieldsHeight   // Padding for vertical fields
        - layoutSettings.horizontalFieldsWidth  // Padding for horizontal fields
        - 20                                    // Header height (adjust if needed)
        - 40;                                   // Footer height (adjust if needed)

    const mainContentHeight = remainingHeight > 0 ? remainingHeight : 0;
    const columnWidth = (layoutSettings.pageWidth - layoutSettings.horizontalFieldsWidth * 2) / layoutSettings.columnCount;

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: '100%',
                maxWidth: layoutSettings.pageWidth,
                margin: '0 auto'
            }}>
                {/* Buttons above the header */}
                <div style={{
                    padding: "20px 0",
                    textAlign: "center",
                    borderBottom: "1px solid #ddd"
                }}>
                    <Button onClick={addWidget}>Add Widget</Button>
                    <Button onClick={saveData}>Save Layout</Button>
                    <Button onClick={() => console.log("Preview Page")}>Preview</Button>
                    <Button type="primary" onClick={showModal}>Open Popup</Button>
                </div>

                <div className={`newspaper-page-${currentPageNumber}`} style={{
                    padding: `${layoutSettings.verticalFieldsHeight}px ${layoutSettings.horizontalFieldsWidth}px`,
                    backgroundColor: "#ffffff",
                    height: layoutSettings.pageHeight,
                }}>
                    {/* Header */}
                    <header
                        style={{
                            height: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #ddd",
                        }}
                    >
                        <p style={{margin: 0}}>{issueDateBeautified}</p>
                        <p style={{margin: 0}}>{newspaperName}</p>
                    </header>

                    {/* Main Content Area */}
                    <div style={{
                        flex: 1,
                        padding: '20px 0px',
                        backgroundColor: "#ffffff",
                        overflowY: 'auto',
                        height: mainContentHeight,
                        position: 'relative',
                    }}>
                        {/* Add vertical dividers for each column */}
                        {[...Array(layoutSettings.columnCount - 1)].map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: (index + 1) * columnWidth,
                                    width: '1px',
                                    height: '100%',
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                }}
                            />
                        ))}

                        <div>
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
                            height: "20px",
                            padding: "10px 0px",
                            textAlign: "center",
                            borderTop: "1px solid #ddd",
                        }}
                    >
                        <p>
                            Page {currentPageNumber} of {totalPages}
                        </p>
                    </footer>
                </div>
            </div>

            <Modal
                title="Select Article"
                visible={visible}
                onCancel={handleCancel}
                footer={null}
            >
                <Row>
                    <Col span={24}>
                        {items?.map((item) => (
                            <Card key={item.id} title={item.title} bordered={false}>
                                <p>{item.content}</p>
                                {item.images.map((image, index) => (
                                    <img key={index} src={image} alt="Article" style={{width: '100%'}} />
                                ))}
                            </Card>
                        ))}
                    </Col>
                </Row>
            </Modal>
        </>
    );
};
