import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import "./grid-stack.css";
import { Grid } from "./Grid";
import ContentEditor from "@components/editor-js/ContentEditor";
import {API_URL} from "@utility/constants";
import {useCustom} from "@refinedev/core";
import { useUpdate } from "@refinedev/core";
import { Layout, Button, Select, Row, Col } from "antd";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons";
const { Sider, Content } = Layout;

export type CustomLayout = {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  content: any;
  lock: boolean;
}[];

export type PageLayout = {
  [pageId: string]: CustomLayout;
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
  issueCover: any;
  issueId: number | string;
  issueStatus: string;
};

const GridStack: FC<GridStackProps> = ({
                                         layoutSettings,
                                         issueDate,
                                         newspaperName,
                                         issueId,
                                         issueCover,
                                         issueStatus
                                       }: GridStackProps) => {
    const {pagesCount, availableTextStyles} = layoutSettings;

    const {mutate} = useUpdate();
    const {data, isLoading, refetch} = useCustom<{
        data: {
            id: number,
            attributes: {
                id: number,
                issueData: any,
            },
        },
    }>({
        url: `${API_URL}/api/issues/${issueId}`,
        method: "get",
    });

    // Initialize pages based on pagesCount
    const initializePages = (): PageLayout => {
        const initialPages: PageLayout = {};
        for (let i = 1; i <= pagesCount; i++) {
            initialPages[`page${i}`] = []; // Each page starts with an empty layout
        }
        return initialPages;
    };

    const [pages, setPages] = useState<PageLayout>(initializePages);

    const getIssueData = useCallback(
        async () => {
            const data = await refetch();
            setPages(data.data?.data.data.attributes.issueData);
        }, []
    );

    useEffect(() => {
        getIssueData().then(() => console.log('done'));
    }, []);

    const [currentPage, setCurrentPage] = useState<string>("page1");
    const [selectedFont, setSelectedFont] = useState<string>(
        layoutSettings.fontFamily
    );

    useEffect(() => {
        mutate({
            resource: "issues",
            id: issueId,
            values: {
                issueData: pages,
            },
            meta: {
                method: "post",
            },
        });
    }, [pages]);

    const updateLayoutHandle = useCallback((layout: CustomLayout) => {
        setPages((prev) => ({...prev, [currentPage]: layout}));
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
                style={{fontFamily: layout_.content?.fontFamily ?? 'Arial'}}
            >
                {layout_.content?.type === 'image' &&
                    <div style={{
                        // height: `${layoutSettings.pageHeight * 0.5}px`, // Fixed height for the container
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
        <Layout style={{ height: "100%", width: "100%" }}>
            {/* ── Left rail of page-circles ── */}
            <Sider
                width={64}
                style={{
                    background: "#fafafa",
                    padding: 16,
                    textAlign: "center",
                }}
            >
                {Object.keys(pages).map((pageId, idx) => (
                    <Button
                        key={pageId}
                        shape="circle"
                        size="small"
                        onClick={() => setCurrentPage(pageId)}
                        type={currentPage === pageId ? "primary" : "default"}
                        style={{ margin: "8px 0" }}
                    >
                        {idx + 1}
                    </Button>
                ))}
            </Sider>

            {/* ── Main area with toolbar + grid ── */}
            <Content style={{ padding: 0, overflow: "auto" }}>
                {/* ── Sticky Toolbar ── */}
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        background: "#fff",
                        padding: "8px 16px",
                        borderBottom: "1px solid #eee",
                    }}
                >
                    <Row align="middle" justify="space-between">
                        {/* Font Selector */}
                        <Col>
                            <span style={{ marginRight: 8, fontWeight: 500 }}>Font:</span>
                            <Select
                                // @ts-ignore
                                value={selectedFont}
                                onChange={handleFontChange}
                                style={{ width: 200 }}
                                dropdownMatchSelectWidth={false}
                            >
                                {availableTextStyles.fonts.map((font: any) => (
                                    <Select.Option key={font.fontFamily} value={font.fontFamily}>
                                        <span style={{ fontFamily: font.fontFamily }}>{font.name}</span>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </div>

                {/* ── Grid Component ── */}
                <div style={{ padding: 16 }}>
                    <Grid
                        layout={pages[currentPage]}
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
                        issueStatus={issueStatus}
                    >
                        {gridElementMemo}
                    </Grid>
                </div>
            </Content>
        </Layout>
    );

}

export default GridStack;
