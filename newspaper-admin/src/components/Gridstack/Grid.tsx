import React, {
  Children,
  createRef,
  FC,
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {GridStack} from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import {GridItem} from "./GridItem";
import {Button, Card, Col, Row, List, Tooltip, Skeleton, Divider} from "antd";
import {CustomLayout} from "@components/Gridstack/index";
import {API_URL} from "@utility/constants";
import qs from "qs";
import {useCustom} from "@refinedev/core";
import ContentEditor from "@components/editor-js/ContentEditor";
import { SaveOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from "styled-components";

const Container = styled.div`
  display: grid;
  grid-template-columns: 300px auto 300px;
  gap: 16px;
  height: 100vh;
  background: #f0f2f5;
`;

const Sidebar = styled.div`
  background: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-y: auto;
`;

const calculateMainWidth = (settings: LayoutSettings) =>
    settings.pageWidth - (settings.horizontalFieldsWidth * 2);

const MainContent = styled.div<{ layoutSettings: LayoutSettings }>`
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-direction: column;
    width: ${props => calculateMainWidth(props.layoutSettings)}px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 24px;
`;

const NewspaperPage = styled.div<{ pageHeight: number }>`
  position: relative;
  background: white;
  height: ${props => props.pageHeight}px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin: 0 auto;
`;

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
  layout: CustomLayout;
  layoutSettings: LayoutSettings;
  updateLayoutHandle: (layout: CustomLayout) => void;
  addWidgetWithContent: MouseEventHandler<HTMLButtonElement>;
  removeWidget: (id: string) => void;
  children?: ReactElement | ReactElement[];
  onChangeLayout: (layout: CustomLayout) => void;
  currentPageNumber: number; // Pass the current page number
  totalPages: number; // Pass the total number of pages
  issueDate: string;
  newspaperName: string;
  currentFont: string;
  issueCover: any;
};

export const Grid: FC<GridProps> = ({
                                      layout,
                                      layoutSettings,
                                      removeWidget,
                                      children,
                                      onChangeLayout,
                                      addWidgetWithContent,
                                      currentPageNumber,
                                      totalPages,
                                      issueDate,
                                      newspaperName,
                                      currentFont,
                                      issueCover
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getItems(), getAdvertisement()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
  }, []);

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

  const advertisementQuery = qs.stringify(
    {
      fields: '*',
      populate: {
        photo: '*',
      },
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  const { refetch } = useCustom<{
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

  const { refetch: refetchAdvertisement } = useCustom<{
    data: {
      id: number,
      attributes: {
        id: number,
        header: string,
        photo: {
          data: {
            attributes: {
              url: string,
            },
          },
        },
      },
    }[],
  }>({
    url: `${API_URL}/api/advertisments?${advertisementQuery}`,
    method: "get",
  });
  const [items, setItems] = useState<{ title: string, content: any, id: number }[]>();
  const [images, setImages] = useState<{ name: string, url: string, id: number }[]>();
  const [advertisement, setAdvertisement] = useState<{header: string, id: number, url: string}[]>();

  const getItems = useCallback(
    async () => {
      const data = await refetch();
      console.log(data, 'data');
      const imagesArray: { name: string, url: string, id: number }[] = [];
      setItems(data.data?.data.data.map(
        (rawData) => {
          imagesArray.push(...rawData.attributes.photos.data.map(
            (image) => ({
              name: image.attributes.name,
              url: image.attributes.photo.data.attributes.url,
              id: image.id,
            }),
          ));

          return {
            title: rawData.attributes.name,
            content: rawData.attributes.text,
            id: rawData.id,
        }},
      ));
      setImages(imagesArray);
    }, [items]
  );

  const getAdvertisement = useCallback(
    async () => {
      const data = await refetchAdvertisement();
      console.log('advertisement', data)
      setAdvertisement(data.data?.data.data.map(
        (rawData) => ({
          header: rawData.attributes.header,
          id: rawData.id,
          url: rawData.attributes.photo.data.attributes.url,
        }),
      ));
    }, [items]
  );

  const rowHeight = 20;
  const rowCount = Math.floor((layoutSettings.pageHeight - layoutSettings.verticalFieldsHeight) / rowHeight);

  const saveData = () => {
    console.log("Saved data:", gridRef.current?.save());
  };

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getItems().then(() => setVisible(true));
    getAdvertisement().then(() => setVisible(true));
  }, []);

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

    if (!gridRef.current) {
      gridRef.current = GridStack.init({
        removable: '.trash',
        acceptWidgets: function (el) {
          return true
        },
        column: layoutSettings.columnCount,
        cellHeight: rowHeight,
        sizeToContent: true,
        margin: 5,
        float: true,
        maxRow: rowCount,
      });
    }

    const grid = gridRef.current;
    grid.off("added change");

    const nextId = (layout.length + 1).toString();
    console.log(grid.save())
    const initialWidthWidth = layoutSettings.columnCount;

    if (currentPageNumber === 1 && layout.length === 0) {
      const initialWidgets = [
        {id: "widget-1", x: 0, y: 0, w: initialWidthWidth, h: 2, lock: true, content: {
          blocks: [{
            id: "widget-1",
            data:{
              text:`${newspaperName}`
            },
            type:"paragraph"
          }]
          }},
        {id: "widget-2", x: 0, y: 2, w: initialWidthWidth, h: 2, lock: true, content: {type: "image", url: `${issueCover}`}},
        {id: "widget-3", x: 0, y: 0, w: initialWidthWidth, h: 2, lock: true, content: {
            blocks: [{
              id: "widget-3",
              data:{
                text:`${issueDateBeautified}`
              },
              type:"paragraph"
            }]
          }},
      ];
      onChangeLayout(initialWidgets);
    }

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
  console.log("COLUMN WIDTH");
  console.log(columnWidth);
    console.log("layoutSettings.pageWidth");
    console.log(layoutSettings.pageWidth);
    console.log("layoutSettings.horizontalFieldsWidth");
    console.log(layoutSettings.horizontalFieldsWidth);
    console.log("layoutSettings.columnCount");
    console.log(layoutSettings.columnCount);
  const isFirstOrLast = (currentPageNumber === 1 || currentPageNumber === totalPages);


  const renderContentList = () => (
      <List
          itemLayout="vertical"
          dataSource={items}
          loading={loading}
          style={{ width: '100%' }}
          renderItem={item => (
              <List.Item
                  style={{ padding: '8px 0' }}
                  actions={[
                    <Tooltip title="Add to layout">
                      <Button
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          disabled={isFirstOrLast}
                          onClick={() => {
                            addWidgetWithContent(item.content);
                            setItems(prev => prev?.filter(each => each.id !== item.id));
                          }}
                      />
                    </Tooltip>
                  ]}
              >
                <Skeleton avatar title={false} loading={loading} active>
                  <List.Item.Meta
                      title={item.title}
                      description={
                        <div style={{
                            maxHeight: "5%",
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal', // Force wrapping
                            paddingRight: 8, // Prevent scrollbar overlap
                            width: '100%' // Ensure full width
                        }}>
                          <ContentEditor readOnly value={item.content} />
                        </div>
                      }
                  />
                </Skeleton>
              </List.Item>
          )}
      />
  );

  const renderImageList = () => (
      <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={images}
          loading={loading}
          renderItem={item => (
              <List.Item>
                <Card
                    cover={
                      <img
                          alt={item.name}
                          src={`${API_URL}${item.url}`}
                          style={{ height: 120, objectFit: 'cover' }}
                      />
                    }
                    actions={[
                      <Tooltip title="Add to layout">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            disabled={isFirstOrLast}
                            onClick={() => {
                              addWidgetWithContent({ type: 'image', url: item.url });
                              setImages(prev => prev?.filter(each => each.id !== item.id));
                            }}
                        />
                      </Tooltip>
                    ]}
                >
                  <Card.Meta title={item.name} />
                </Card>
              </List.Item>
          )}
      />
  );

  const renderAdvertisementList = () => (
      <List
          itemLayout="vertical"
          dataSource={advertisement}
          loading={loading}
          renderItem={item => (
              <List.Item
                  actions={[
                    <Tooltip title="Add to layout">
                      <Button
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          disabled={isFirstOrLast}
                          onClick={() => {
                            addWidgetWithContent({ type: 'image', url: item.url });
                            setAdvertisement(prev => prev?.filter(each => each.id !== item.id));
                          }}
                      />
                    </Tooltip>
                  ]}
              >
                <Skeleton avatar title={false} loading={loading} active>
                  <img
                      alt={item.header}
                      src={`${API_URL}${item.url}`}
                      style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                  <Divider style={{ margin: '8px 0' }} />
                  <h4 style={{ margin: 0 }}>{item.header}</h4>
                </Skeleton>
              </List.Item>
          )}
      />
  );


  return (
      <Container>
          <Sidebar>
              <h3 style={{ marginBottom: 16 }}>Available Content</h3>
              {renderContentList()}
              <Divider orientation="left">Images</Divider>
              {renderImageList()}
          </Sidebar>

          <MainContent layoutSettings={layoutSettings}>

            {/* Buttons above the header */}
              <Toolbar>
                  <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={saveData}
                  >
                      Save Layout
                  </Button>
                  <Button
                      icon={<EyeOutlined />}
                      onClick={() => console.log("Preview Page")}
                  >
                      Preview
                  </Button>
                  <div style={{ flex: 1 }} />
                  <span>
            Page {currentPageNumber} of {totalPages}
          </span>
              </Toolbar>


              {/* Main Content Area */}
            <div className={`newspaper-page-${currentPageNumber}`} style={{
              backgroundColor: "#ffffff",
              height: layoutSettings.pageHeight,
              fontFamily: currentFont,
            }}>

              {/* Header */}
              {(currentPageNumber !== 1 && currentPageNumber !== totalPages) && (<header
                  style={{
                    height: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ddd",
                  }}
              >
                <p style={{ margin: 0 }}>{issueDateBeautified}</p>
                <p style={{ margin: 0 }}>{newspaperName}</p>
              </header>)}

              {/* Main Content Area */}
              <div style={{
                flex: 1,
                backgroundColor: "#ffffff",
                overflowY: 'clip',
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
                      const childLayout = layout.find(hui => hui.id === child?.props.id);
                      return (
                          <GridItem
                              itemRef={gridItemsRefs.current[child?.props.id]}
                              id={child?.props.id}
                              childLayout={childLayout}
                          >
                            <div>
                              {(currentPageNumber !== 1) && (<button
                                  style={{
                                    zIndex: 9999,
                                    position:"absolute",
                                    top:"5px",
                                    right:"5px",
                                    backgroundColor:"transparent",
                                    border:"none",
                                    color:"#454545",
                                    fontSize:"16px",
                                    cursor:"pointer"
                                  }}
                                  onClick={() => {
                                    removeWidget(child?.props.id);
                                  }}
                              >
                                X
                              </button>)}
                              {child}
                            </div>
                          </GridItem>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              {(currentPageNumber !== 1 && currentPageNumber !== totalPages) && (<footer
                  style={{
                    height:"20px",
                    padding:"10px 0px",
                    textAlign:"center",
                    borderTop:"1px solid #ddd"
                  }}
              >
                <p>Page {currentPageNumber} of {totalPages}</p>
              </footer>)}

            </div>

              </MainContent>
          {/* Right Sidebar */}
          <Sidebar>
              <h3 style={{ marginBottom: 16 }}>Advertisements</h3>
              {renderAdvertisementList()}
          </Sidebar>
      </Container>
  );
};
