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
  useMemo,
} from "react";
import {GridStack} from "gridstack";
// import "gridstack/dist/gridstack.min.css";
// import "gridstack/dist/gridstack-extra.min.css";
import {GridItem} from "./GridItem";
import {Button, Card, Col, Row, List, Tooltip, Skeleton, Divider, Modal,} from "antd";
import {CustomLayout} from "@components/Gridstack/index";
import {API_URL} from "@utility/constants";
import qs from "qs";
import "./grid-stack.css"
import {useCustom} from "@refinedev/core";
import ContentEditor from "@components/editor-js/ContentEditor";
import { SaveOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from "styled-components";
import MDEditor from '@uiw/react-md-editor';

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

// Add custom styles for markdown content
const MarkdownContainer = styled.div<{ fontFamily: string }>`
  font-family: ${props => props.fontFamily};
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.fontFamily};
  }
  
  p, span, div {
    font-family: ${props => props.fontFamily};
  }
  
  strong, em, b, i {
    font-family: ${props => props.fontFamily};
  }
`;

type LayoutSettings = {
  editorJSData: JSON;
  columnCount: number;
  pageHeight: number;
  availableTextStyles: {
    fonts: Array<{
      fontFamily: string;
      name: string;
    }>;
  };
  pageWidth: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
  fontFamily: string;
  pagesCount: number;
};

type WidgetContent = {
  type: 'image' | 'text';
  url?: string;
  text?: string;
  fontFamily?: string;
};

type GridProps = {
  layout: CustomLayout;
  allLayouts: {[pageId: string]: CustomLayout};
  layoutSettings: LayoutSettings;
  updateLayoutHandle: (layout: CustomLayout) => void;
  addWidgetWithContent: (content: WidgetContent) => void;
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
                                      allLayouts,
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

  const [previewVisible, setPreviewVisible] = useState(false);
  // Handler for opening preview
    const showPreview = () => setPreviewVisible(true);
    // Handler for closing preview
    const hidePreview = () => setPreviewVisible(false);

  useEffect(() => {
    Promise.all([getItems(), getAdvertisement()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
  }, [layout]);

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
      const imagesArray: { name: string, url: string, id: number }[] = [];


      // Get all items from the API
      const allItems = data.data?.data.data.map(
        (rawData) => {
          if (rawData.attributes.photos?.data) {
            imagesArray.push(...rawData.attributes.photos.data
              .filter(image => image?.attributes?.photo?.data?.attributes?.url)
              .map(
                (image) => ({
                  name: image.attributes.name || 'Untitled Image',
                  url: image.attributes.photo.data.attributes.url,
                  id: image.id,
                }),
              ));
          }

          return {
            title: rawData.attributes.name,
            content: rawData.attributes.text,
            id: rawData.id,
          };
        },
      );

      // Filter out items that are already in any page's layout
      const usedContent = Object.values(allLayouts).flatMap(pageLayout =>
        pageLayout.map(item => {
          if (item.content?.type === 'text') {
            return typeof item.content === "string"
              ? item.content
              : item.content.text || item.content.blocks?.[0]?.data?.text || '';
          }
          if (item.content?.type === 'image') {
            return item.content.url;
          }
          return null;
        }).filter(Boolean)
      );

      const filteredItems = allItems?.filter(item => {
        const itemContent = typeof item.content === "string"
          ? item.content
          : item.content.text || item.content.blocks?.[0]?.data?.text || '';
        return !usedContent.includes(itemContent);
      });

      const filteredImages = imagesArray.filter(image =>
        !usedContent.includes(image.url)
      );

      setItems(filteredItems);
      setImages(filteredImages);
    }, [allLayouts]
  );

  const getAdvertisement = useCallback(
    async () => {
      const data = await refetchAdvertisement();

      // Get all advertisements from the API
      const allAds = data.data?.data.data
        .filter(ad => ad?.attributes?.photo?.data?.attributes?.url)
        .map(
          (rawData) => ({
            header: rawData.attributes.header,
            id: rawData.id,
            url: rawData.attributes.photo.data.attributes.url,
          }),
        );

      // Filter out advertisements that are already in any page's layout
      const usedUrls = Object.values(allLayouts).flatMap(pageLayout =>
        pageLayout
          .filter(item => item.content?.type === 'image')
          .map(item => item.content.url)
      );

      const filteredAds = allAds?.filter(ad => !usedUrls.includes(ad.url));
      setAdvertisement(filteredAds);
    }, [allLayouts]
  );

  const rowHeight = 20;
  const rowCount = Math.floor((layoutSettings.pageHeight - layoutSettings.verticalFieldsHeight) / rowHeight);

  const saveData = () => {
    //console.log("Saved data:", gridRef.current?.save());
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
                            addWidgetWithContent({ 
                              type: 'text', 
                              text: item.content,
                              fontFamily: currentFont 
                            });
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
                                whiteSpace: 'normal',
                                paddingRight: 8,
                                width: '100%'
                            }}>
                                <MarkdownContainer fontFamily={currentFont}>
                                    <MDEditor.Markdown 
                                        source={typeof item.content === "string" ? item.content : JSON.stringify(item.content)} 
                                        style={{ 
                                            backgroundColor: 'transparent',
                                            padding: '10px'
                                        }}
                                    />
                                </MarkdownContainer>
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

  const handleRemoveWidget = (id: string) => {
    const pageLayout = layout.filter((block) => block.id === id);
    
    if (pageLayout.length > 0) {
      const widget = pageLayout[0];
      
      // If the removed widget is a text widget, add it back to the available texts
      if (widget.content?.type === 'text') {
        const textContent = typeof widget.content === "string" 
          ? widget.content 
          : widget.content.text || widget.content.blocks?.[0]?.data?.text || '';
        
        setItems(prev => [...(prev || []), {
          id: Date.now(),
          title: 'Removed Text',
          content: textContent,
          fontFamily: widget.content?.fontFamily || currentFont
        }]);
      }
      
      // If the removed widget is an image widget, add it back to the available images
      if (widget.content?.type === 'image' && widget.content?.url) {
        setImages(prev => [...(prev || []), {
          id: Date.now(),
          name: 'Removed Image',
          url: widget.content.url
        }]);
      }
    }
    
    removeWidget(id);
  };

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
                      onClick={showPreview}
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
                    {layout.map((child) => {
                      return (
                          <GridItem
                              itemRef={gridItemsRefs.current[child.id]}
                              id={child.id}
                              childLayout={child}
                          >
                            <div style={{
                                position:"relative",
                            }}>
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
                                    handleRemoveWidget(child.id);
                                  }}
                              >
                                X
                              </button>)}
                              {child.content?.type === 'image' ? (
                                <div style={{
                                  overflow: 'hidden',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  padding: '10px'
                                }}>
                                  <img
                                    alt="widget"
                                    style={{
                                      maxHeight: '100%',
                                      maxWidth: '100%',
                                      objectFit: 'contain'
                                    }}
                                    src={`${API_URL}${child.content.url}`}
                                  />
                                </div>
                              ) : (
                                <div data-color-mode="light">
                                    <MarkdownContainer fontFamily={child.content?.fontFamily || currentFont}>
                                        <MDEditor.Markdown
                                            source={typeof child.content === "string" ? child.content : child.content.text || child.content.blocks?.[0]?.data?.text || ''}
                                            style={{
                                                backgroundColor: 'transparent',
                                                padding: '10px',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word'
                                            }}
                                        />
                                    </MarkdownContainer>
                                </div>
                              )}
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

          <Modal
              visible={previewVisible}
              onCancel={hidePreview}
              footer={null}
              width={layoutSettings.pageWidth + 100}
              // you can adjust the width to comfortably show the page
              bodyStyle={{ backgroundColor: "#f0f2f5", padding: 20 }}
              destroyOnClose
          >
              {/* Inside this Modal, re-render the exact same “newspaper page” markup,
            but with ALL editing controls hidden:
            • No GridStack wrappers (or you can leave the gridstack div,
              but just don’t initialize it in preview mode).
            • No “X” delete buttons.
            • No plus-icons in the sidebar (we’re only showing the page itself here).
            For simplicity, we’ll copy your entire page’s JSX but wrap it in
            a “.preview-mode” class (so we can hide any unwanted bits via CSS). */}

              <div
                  className="newspaper-preview-container"
                  style={{
                      backgroundColor: "#ffffff",
                      width: layoutSettings.pageWidth,
                      height: layoutSettings.pageHeight,
                      fontFamily: currentFont,
                      margin: "0 auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      position: "relative",
                  }}
              >
                  {/* Preview Header (also hidden on page 1 or last page) */}
                  {currentPageNumber !== 1 && currentPageNumber !== totalPages && (
                      <header
                          style={{
                              height: "20px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid #ddd",
                              padding: "0 10px",
                          }}
                      >
                          <p style={{ margin: 0 }}>{issueDateBeautified}</p>
                          <p style={{ margin: 0 }}>{newspaperName}</p>
                      </header>
                  )}

                  {/* Preview Main Content (no editing handles!) */}
                  <div
                      style={{
                          flex: 1,
                          backgroundColor: "#ffffff",
                          overflow: "hidden",
                          height: mainContentHeight,
                          position: "relative",
                      }}
                  >
                      {/* Vertical dividers (same as before) */}
                      {[...Array(layoutSettings.columnCount - 1)].map((_, index) => (
                          <div
                              key={index}
                              style={{
                                  position: "absolute",
                                  top: 0,
                                  left: (index + 1) * columnWidth,
                                  width: "1px",
                                  height: "100%",
                                  backgroundColor: "rgba(0,0,0,0.1)",
                              }}
                          />
                      ))}

                      {/* Here’s the important part: render each “child” exactly as in the
                live grid, but WITHOUT the GridStack “.grid-stack” container,
                because we only need to show content blocks placed in their final
                positions. We can absolutely reuse your <GridItem> wrappers so
                that the CSS/positioning stays identical. */}
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                          {layout.map((child) => (
                              <GridItem
                                  // We still pass the same ref, id, and childLayout so that the
                                  // <GridItem> sets the correct absolute x/y + w/h. But because
                                  // gridstack isn’t “init”ed inside this modal, no drag handles appear.
                                  itemRef={gridItemsRefs.current[child.id]}
                                  id={child.id}
                                  childLayout={child}
                              >
                                  <div style={{ position: "relative" }}>
                                      {/* NB: No “X” button for deletion in preview */}
                                      {child.content?.type === "image" ? (
                                          <div
                                              style={{
                                                  overflow: "hidden",
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  padding: "10px",
                                                  width: "100%",
                                                  height: "100%",
                                              }}
                                          >
                                              <img
                                                  alt="widget"
                                                  style={{
                                                      maxHeight: "100%",
                                                      maxWidth: "100%",
                                                      objectFit: "contain",
                                                  }}
                                                  src={`${API_URL}${child.content.url}`}
                                              />
                                          </div>
                                      ) : (
                                          <div data-color-mode="light">
                                              <MarkdownContainer fontFamily={child.content?.fontFamily || currentFont}>
                                                  <MDEditor.Markdown
                                                      source={
                                                          typeof child.content === "string"
                                                              ? child.content
                                                              : child.content.text ||
                                                              child.content.blocks?.[0]?.data?.text ||
                                                              ""
                                                      }
                                                      style={{
                                                          backgroundColor: "transparent",
                                                          padding: "10px",
                                                          whiteSpace: "pre-wrap",
                                                          wordBreak: "break-word",
                                                      }}
                                                  />
                                              </MarkdownContainer>
                                          </div>
                                      )}
                                  </div>
                              </GridItem>
                          ))}
                      </div>
                  </div>
                  {/* Preview Footer */}
                  {currentPageNumber !== 1 && currentPageNumber !== totalPages && (
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
                  )}
              </div>
          </Modal>
      </Container>
  );
};
