import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { CustomLayout } from "@components/Gridstack/index";
import { useCustom } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import { API_URL } from "@utility/constants";
import {
  Button,
  Card,
  Divider,
  InputNumber,
  List,
  message,
  Modal,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.css";
import qs from "qs";
import React, {
  Children,
  createRef,
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import "./grid-stack.css";
import { GridItem } from "./GridItem";
import { v4 as uuidv4 } from "uuid";
import SplitTextModal from "./modals/SplitTextModal";

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const calculateMainWidth = (settings: LayoutSettings | null) =>
  settings ? settings.pageWidth - settings.horizontalFieldsWidth * 2 : 600;

const MainContent = styled.div<{ layoutSettings: LayoutSettings }>`
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  width: ${(props) => calculateMainWidth(props.layoutSettings)}px;
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
  height: ${(props) => props.pageHeight}px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
`;

// Add custom styles for markdown content
const MarkdownContainer = styled.div<{ fontFamily: string }>`
  font-family: ${(props) => props.fontFamily};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: ${(props) => props.fontFamily};
  }

  p,
  span,
  div {
    font-family: ${(props) => props.fontFamily};
  }

  strong,
  em,
  b,
  i {
    font-family: ${(props) => props.fontFamily};
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
  type: "image" | "text";
  url?: string;
  text?: string;
  fontFamily?: string;
  template?: {
    widthInColumns: number;
    heightInRows: number;
    name: string;
  };
  title?: string;
};

type GridProps = {
  layout: CustomLayout;
  allLayouts: { [pageId: string]: CustomLayout };
  layoutSettings: LayoutSettings | null;
  updateLayoutHandle: (layout: CustomLayout) => void;
  addWidgetWithContent: (content: WidgetContent) => void;
  removeWidget: (id: string) => void;
  children?: ReactElement | ReactElement[];
  onChangeLayout: (layout: CustomLayout) => void;
  onSaveLayout: () => Promise<boolean>;
  currentPageNumber: number; // Pass the current page number
  totalPages: number; // Pass the total number of pages
  issueDate: string;
  newspaperName: string;
  currentFont: string;
  issueCover: any;
  issueStatus: string;
  issueId: number | string; // Add issueId prop
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
  issueCover,
  issueId,
  onSaveLayout,
}) => {
  // Provide default values if layoutSettings is null
  const safeLayoutSettings = layoutSettings || {
    editorJSData: {} as JSON,
    columnCount: 12,
    pageHeight: 800,
    availableTextStyles: { fonts: [{ fontFamily: "Arial", name: "Arial" }] },
    pageWidth: 600,
    horizontalFieldsWidth: 50,
    verticalFieldsHeight: 50,
    fontFamily: "Arial",
    pagesCount: 1,
  };
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
  const [splitTextModal, setSplitTextModal] = useState<{
    visible: boolean;
    text: string;
    title: string;
    id: string;
  }>({
    visible: false,
    text: "",
    title: "",
    id: "",
  });

  // Define rowHeight early so it can be used in useEffect
  const rowHeight = 40;
  const rowCount = Math.floor(
    (safeLayoutSettings.pageHeight - safeLayoutSettings.verticalFieldsHeight) /
      rowHeight
  );
  // Handler for opening preview
  const showPreview = () => setPreviewVisible(true);
  // Handler for closing preview
  const hidePreview = () => setPreviewVisible(false);

  const showSplitTextModal = (text: string, title: string, id: string) => {
    setSplitTextModal({ visible: true, text, title, id });
  };

  const closeSplitTextModal = () => {
    setSplitTextModal({ visible: false, text: "", title: "", id: "" });
  };

  const handleSplitText = (splitIndices: number[]) => {
    const { text, title, id } = splitTextModal;
    const words = text.split(" ");
    const sortedIndices = [...splitIndices].sort((a, b) => a - b);

    if (sortedIndices.length === 0) {
      closeSplitTextModal();
      return;
    }

    const parts: { title: string; content: string }[] = [];
    let lastIndex = 0;

    sortedIndices.forEach((index, i) => {
      const partContent = words.slice(lastIndex, index + 1).join(" ");
      parts.push({
        title: `Часть ${i + 1} из ${sortedIndices.length + 1} - ${title}`,
        content: partContent,
      });
      lastIndex = index + 1;
    });

    parts.push({
      title: `Часть ${sortedIndices.length + 1} из ${
        sortedIndices.length + 1
      } - ${title}`,
      content: words.slice(lastIndex).join(" "),
    });

    setItems((prev) => {
      const newItems = prev?.filter((article) => article.id !== id);
      return [...(newItems || []), ...parts.map(p => ({ ...p, id: uuidv4() }))];
    });

    closeSplitTextModal();
  };

  // No need for preview grid initialization since we use static positioning

  const query = qs.stringify(
    {
      fields: "*",
      populate: {
        photos: {
          fields: "*",
          populate: {
            photo: {
              fields: "*",
            },
          },
        },
        issue: {
          fields: ["id"],
        },
      },
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  // Добавляем фильтр вручную к URL
  const articlesUrl = `${API_URL}/api/articles?${query}`;
  // Варианты фильтрации для тестирования:
  // Вариант 1: &filters[issue][id][$eq]=${issueId}
  // Вариант 2: &filters[issue]=${issueId}
  // Вариант 3: &filters[$and][0][issue][id][$eq]=${issueId}

  const advertisementQuery = qs.stringify(
    {
      fields: "*",
      populate: {
        photo: {
          fields: "*",
        },
        ad_template: {
          fields: "*",
        },
      },
      filters: {
        DateFrom: {
          $lte: issueDate, // Дата начала рекламы <= дата публикации выпуска
        },
        DateTo: {
          $gte: issueDate, // Дата окончания рекламы >= дата публикации выпуска
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  );

  const queryPhotos = qs.stringify(
    {
      fields: "*",
      populate: {
        photo: {
          fields: "*",
        },
        issue: {
          fields: ["id"],
        },
      },
    },
    {
      encodeValuesOnly: true, // prettify URL
    }
  );

  // Добавляем фильтр вручную к URL для фото
  const photosUrl = `${API_URL}/api/photos?${queryPhotos}`;
  // Варианты фильтрации для тестирования:
  // Вариант 1: &filters[issue][id][$eq]=${issueId}
  // Вариант 2: &filters[issue]=${issueId}
  // Вариант 3: &filters[$and][0][issue][id][$eq]=${issueId}

  console.log("Articles URL:", articlesUrl);
  console.log("Photos URL:", photosUrl);
  console.log("Issue ID:", issueId);

  const { refetch } = useCustom<{
    data: {
      id: number;
      attributes: {
        id: number;
        text: any;
        name: string;
        photos: {
          data: [
            {
              id: number;
              attributes: {
                name: string;
                width: number;
                height: number;
                createdAt: string;
                updatedAt: string;
                photo: {
                  data: {
                    attributes: {
                      url: string;
                    };
                  };
                };
              };
            }
          ];
        };
      };
    }[];
  }>({
    url: articlesUrl,
    method: "get",
  });

  const { refetch: refetchAdvertisement } = useCustom<{
    data: {
      id: number;
      attributes: {
        id: number;
        Header: string;
        DateFrom: string;
        DateTo: string;
        photo: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
        ad_template?: {
          data: {
            id: number;
            attributes: {
              name: string;
              widthInColumns: number;
              heightInRows: number;
            };
          };
        };
      };
    }[];
  }>({
    url: `${API_URL}/api/advertisments?${advertisementQuery}`,
    method: "get",
  });

  const {
    data: photosData,
    isLoading: photosLoading,
    error: photosError,
    refetch: refetchPhotos,
  } = useCustom<{
    data: {
      id: number;
      attributes: {
        name: string;
        photo: {
          data: {
            attributes: {
              url: string;
            };
          };
        };
        issue?: {
          data: {
            id: number;
          };
        };
      };
    }[];
  }>({
    url: photosUrl,
    method: "get",
  });
  const [items, setItems] = useState<
    { title: string; content: any; id: number }[]
  >([]);
  const [images, setImages] =
    useState<{ name: string; url: string; id: number }[]>();
  const [advertisement, setAdvertisement] = useState<
    {
      header: string;
      id: number;
      url: string;
      template?: {
        widthInColumns: number;
        heightInRows: number;
        name: string;
      };
    }[]
  >();

  const getItems = useCallback(async () => {
    try {
      console.log("Loading articles and photos for issue:", issueId);

      const [articlesData, photosData] = await Promise.all([
        refetch(),
        refetchPhotos(),
      ]);

      console.log("Articles response:", articlesData);
      console.log("Photos response:", photosData);
      console.log("Current issue ID:", issueId);

      // Отладочная информация для статей
      const allArticles = articlesData.data?.data.data || [];
      console.log("Total articles loaded:", allArticles.length);
      allArticles.forEach((article: any, index: number) => {
        const articleIssueId = article.attributes?.issue?.data?.id;
        console.log(`Article ${index + 1}:`, {
          name: article.attributes.name,
          issueId: articleIssueId,
          matchesCurrentIssue:
            articleIssueId && articleIssueId.toString() === issueId.toString(),
        });
      });

      // Отладочная информация для фотографий
      const allPhotos = photosData.data?.data.data || [];
      console.log("Total photos loaded:", allPhotos.length);
      allPhotos.forEach((photo: any, index: number) => {
        const photoIssueId = photo.attributes?.issue?.data?.id;
        console.log(`Photo ${index + 1}:`, {
          name: photo.attributes.name,
          issueId: photoIssueId,
          matchesCurrentIssue:
            photoIssueId && photoIssueId.toString() === issueId.toString(),
        });
      });

      // Get articles from the API и фильтруем по issue
      const allItems = articlesData.data?.data.data
        ?.filter((rawData: any) => {
          // Фильтруем только статьи, принадлежащие текущему issue
          const articleIssueId = rawData.attributes?.issue?.data?.id;
          return (
            articleIssueId && articleIssueId.toString() === issueId.toString()
          );
        })
        ?.map((rawData: any) => ({
          title: rawData.attributes.name,
          content: rawData.attributes.text,
          id: rawData.id,
        }));

      // Get photos from the API и фильтруем по issue
      const imagesArray: { name: string; url: string; id: number }[] =
        photosData.data?.data.data
          ?.filter((photo: any) => {
            // Проверяем что у фото есть файл и оно принадлежит текущему issue
            const hasPhoto = photo?.attributes?.photo?.data?.attributes?.url;
            const photoIssueId = photo.attributes?.issue?.data?.id;
            return (
              hasPhoto &&
              photoIssueId &&
              photoIssueId.toString() === issueId.toString()
            );
          })
          .map((photo: any) => ({
            name: photo.attributes.name || "Untitled Image",
            url: photo.attributes.photo.data.attributes.url,
            id: photo.id,
          })) || [];

      console.log("Loaded articles:", allItems?.length || 0);
      console.log("Loaded photos:", imagesArray.length);

      // Filter out items that are already in any page's layout
      const usedContent = Object.values(allLayouts).flatMap((pageLayout) =>
        pageLayout
          .map((item) => {
            if (item.content?.type === "text") {
              return typeof item.content === "string"
                ? item.content
                : item.content.text ||
                    item.content.blocks?.[0]?.data?.text ||
                    "";
            }
            if (item.content?.type === "image") {
              return item.content.url;
            }
            return null;
          })
          .filter(Boolean)
      );

      const filteredItems = allItems?.filter((item) => {
        const itemContent =
          typeof item.content === "string"
            ? item.content
            : item.content.text || item.content.blocks?.[0]?.data?.text || "";
        return !usedContent.includes(itemContent);
      });

      const filteredImages = imagesArray.filter(
        (image) => !usedContent.includes(image.url)
      );

      // Сохраняем существующие части текста (добавленные через разбиение)
      setItems((prevItems) => {
        const currentItems = prevItems || [];
        // Находим части текста, добавленные через разбиение (у них title начинается с "Часть")
        const splitTextParts = currentItems.filter(
          (item) => item.title && item.title.startsWith("Часть")
        );

        // Объединяем новые статьи с сохраненными частями текста
        const combinedItems = [...(filteredItems || []), ...splitTextParts];
        console.log("Combined items with split parts:", combinedItems);
        return combinedItems;
      });

      setImages(filteredImages);
    } catch (error) {
      console.error("Error loading articles and photos:", error);
      // При ошибке сохраняем существующие части текста
      setItems((prevItems) => {
        const currentItems = prevItems || [];
        const splitTextParts = currentItems.filter(
          (item) => item.title && item.title.startsWith("Часть")
        );
        return splitTextParts;
      });
      setImages([]);
    }
  }, [allLayouts, refetch, refetchPhotos, issueId]);

  const getAdvertisement = useCallback(async () => {
    const data = await refetchAdvertisement();

    // Get all advertisements from the API with template data
    const allAds = data.data?.data.data
      .filter((ad) => ad?.attributes?.photo?.data?.attributes?.url)
      .map((rawData) => ({
        header: rawData.attributes.Header,
        id: rawData.id,
        url: rawData.attributes.photo.data.attributes.url,
        template: rawData.attributes.ad_template?.data
          ? {
              widthInColumns:
                rawData.attributes.ad_template.data.attributes.widthInColumns,
              heightInRows:
                rawData.attributes.ad_template.data.attributes.heightInRows,
              name: rawData.attributes.ad_template.data.attributes.name,
            }
          : undefined,
      }));

    // Filter out advertisements that are already in any page's layout
    const usedUrls = Object.values(allLayouts).flatMap((pageLayout) =>
      pageLayout
        .filter((item) => item.content?.type === "image")
        .map((item) => item.content.url)
    );

    const filteredAds = allAds?.filter((ad) => !usedUrls.includes(ad.url));
    setAdvertisement(filteredAds);
  }, [allLayouts, refetchAdvertisement]);

  useEffect(() => {
    Promise.all([getItems(), getAdvertisement()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [layout, getItems, getAdvertisement]);

  const saveData = async () => {
    console.log("Manual save triggered");
    console.log("Current layout:", layout);

    // Сначала обновляем локальное состояние
    onChangeLayout(layout);

    // Затем сохраняем в базу данных
    try {
      const success = await onSaveLayout();

      if (success) {
        message.success({
          content: "Макет сохранен",
          duration: 2,
        });
      } else {
        message.error({
          content: "Ошибка сохранения макета",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error({
        content: "Ошибка сохранения макета",
        duration: 3,
      });
    }
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
        removable: ".trash",
        acceptWidgets: function (el) {
          return true;
        },
        column: safeLayoutSettings.columnCount,
        cellHeight: rowHeight,
        margin: 5,
        float: false, // Отключаем автоматическое перемещение
        animate: false, // Отключаем анимации
        maxRow: rowCount,
        staticGrid: false, // Разрешаем перемещение, но контролируем его
        // Отключаем автоматическое перемещение других элементов
        disableResize: false, // Разрешаем изменение размера
        disableDrag: false, // Разрешаем перетаскивание
        // Ключевая настройка - отключаем автоматическое перемещение
        resizable: {
          handles: "e, se, s, sw, w",
        },
      });
    }

    const grid = gridRef.current;
    grid.off("added change");

    // Принудительно отключаем автоматическое перемещение
    grid.float(false);

    // Отключаем компактирование сетки
    if (grid.opts) {
      grid.opts.float = false;
    }

    const nextId = (layout.length + 1).toString();
    const initialWidthWidth = safeLayoutSettings.columnCount;

    if (currentPageNumber === 1 && layout.length === 0) {
      const initialWidgets = [
        {
          id: "widget-1",
          x: 0,
          y: 0,
          w: initialWidthWidth,
          h: 2,
          lock: true,
          content: {
            blocks: [
              {
                id: "widget-1",
                data: {
                  text: `${newspaperName}`,
                },
                type: "paragraph",
              },
            ],
          },
        },
        {
          id: "widget-2",
          x: 0,
          y: 2,
          w: initialWidthWidth,
          h: 2,
          lock: true,
          content: { type: "image", url: `${issueCover}` },
        },
        {
          id: "widget-3",
          x: 0,
          y: 4,
          w: initialWidthWidth,
          h: 2,
          lock: true,
          content: {
            blocks: [
              {
                id: "widget-3",
                data: {
                  text: `${issueDateBeautified}`,
                },
                type: "paragraph",
              },
            ],
          },
        },
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

    // Отключаем стандартный обработчик change и добавляем свой
    gridRef.current.off("change");

    gridRef.current.on("resizestop", (event, el) => {
      const itemId = el.id;
      if (!itemId) return;

      // Получаем данные элемента из GridStack
      const gridData = gridRef.current
        ?.getGridItems()
        .find((item) => item.id === itemId);
      if (!gridData) return;

      const curItem = layout.find((each) => each.id === itemId);
      if (!curItem) return;

      // Обновляем только размеры измененного элемента
      const updatedLayout = layout.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            h: parseInt(el.getAttribute("gs-h") || "1"),
            w: parseInt(el.getAttribute("gs-w") || "1"),
            // НЕ изменяем позицию при изменении размера
            x: item.x,
            y: item.y,
          };
        }
        return item;
      });

      onChangeLayout(updatedLayout);
    });

    gridRef.current.on("dragstop", (event, el) => {
      const itemId = el.id;
      if (!itemId) return;

      const curItem = layout.find((each) => each.id === itemId);
      if (!curItem) return;

      // Обновляем только позицию перемещенного элемента
      const updatedLayout = layout.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            x: parseInt(el.getAttribute("gs-x") || "0"),
            y: parseInt(el.getAttribute("gs-y") || "0"),
            // НЕ изменяем размеры при перемещении
            h: item.h,
            w: item.w,
          };
        }
        return item;
      });

      onChangeLayout(updatedLayout);
    });

    grid.batchUpdate();
    grid.removeAll(false);
    Children.forEach(children, (child) => {
      const widget = gridItemsRefs.current[child.props.id].current;
      if (widget) {
        grid.makeWidget(widget);
        // Принудительно устанавливаем позицию из layout
        const layoutItem = layout.find((item) => item.id === child.props.id);
        if (layoutItem) {
          grid.update(widget, {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          });
        }
      }
    });

    grid.batchUpdate(false);

    // После обновления принудительно отключаем float снова
    grid.float(false);
  }, [children, rowHeight, rowCount]);

  const remainingHeight =
    safeLayoutSettings.pageHeight -
    (currentPageNumber !== 1 ? 30 : 0) - // Header height (only for pages other than first)
    (currentPageNumber !== 1 ? 30 : 0); // Footer height (only for pages other than first)
  const mainContentHeight = remainingHeight > 0 ? remainingHeight : 0;
  const columnWidth =
    (safeLayoutSettings.pageWidth -
      safeLayoutSettings.horizontalFieldsWidth * 2) /
    safeLayoutSettings.columnCount;

  const isFirstOrLast = false;

  const renderContentList = () => {
    console.log("Rendering content list, items:", items); // Отладка
    console.log("Items length:", items?.length || 0); // Отладка

    return (
      <List
        itemLayout="vertical"
        dataSource={items}
        loading={loading}
        style={{ width: "100%" }}
        renderItem={(item) => {
          // Определяем, является ли это временной частью текста
          const isTemporaryPart =
            item.title &&
            (item.title.startsWith("Часть") || item.title === "Removed Text");

          const actions = [
            <Tooltip key="add-text" title="Add to layout">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                disabled={currentPageNumber === 1}
                onClick={() => {
                  addWidgetWithContent({
                    type: "text",
                    text: item.content,
                    fontFamily: currentFont,
                    title: item.title,
                  });
                  setItems((prev) =>
                    prev.filter((each) => each.id !== item.id)
                  );
                }}
              />
            </Tooltip>,
          ];

          // Добавляем кнопку удаления для временных частей
          if (isTemporaryPart) {
            actions.push(
              <Tooltip key="delete-text" title="Delete permanently">
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTemporaryItem(item.id)}
                />
              </Tooltip>
            );
          }

          return (
            <List.Item style={{ padding: "8px 0" }} actions={actions}>
              <Skeleton avatar title={false} loading={loading} active>
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{item.title}</span>
                      {isTemporaryPart && (
                        <span
                          style={{
                            fontSize: "10px",
                            backgroundColor: "#f0f0f0",
                            color: "#666",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontWeight: "normal",
                          }}
                        >
                          временный
                        </span>
                      )}
                    </div>
                  }
                  description={
                    <div
                      style={{
                        maxHeight: "5%",
                        overflow: "hidden",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        paddingRight: 8,
                        width: "100%",
                      }}
                    >
                      <MarkdownContainer fontFamily={currentFont}>
                        <MDEditor.Markdown
                          source={
                            typeof item.content === "string"
                              ? item.content
                              : item.content.text ||
                                item.content.blocks?.[0]?.data?.text ||
                                ""
                          }
                          style={{
                            backgroundColor: "transparent",
                            padding: "6px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: "1.4", // Добавляем фиксированную высоту строки
                          }}
                        />
                      </MarkdownContainer>
                    </div>
                  }
                />
              </Skeleton>
            </List.Item>
          );
        }}
      />
    );
  };

  const renderImageList = () => (
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={images}
      loading={loading}
      renderItem={(item) => (
        <List.Item>
          <Card
            cover={
              <img
                alt={item.name}
                src={`${API_URL}${item.url}`}
                style={{ height: 120, objectFit: "cover" }}
              />
            }
            actions={[
              <Tooltip key="add-image" title="Add to layout">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  disabled={currentPageNumber === 1}
                  onClick={() => {
                    addWidgetWithContent({
                      type: "image",
                      url: item.url,
                      title: item.name,
                    });
                    setImages((prev) =>
                      prev?.filter((each) => each.id !== item.id)
                    );
                  }}
                />
              </Tooltip>,
            ]}
          >
            <Card.Meta
              title={
                <Typography.Text style={{ whiteSpace: "normal" }}>
                  {item.name}
                </Typography.Text>
              }
            />
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
      renderItem={(item) => (
        <List.Item
          actions={[
            <Tooltip key="add-ad" title="Add to layout">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                disabled={currentPageNumber === 1}
                onClick={() => {
                  addWidgetWithContent({
                    type: "image",
                    url: item.url,
                    template: item.template,
                    title: item.header,
                  });
                  setAdvertisement((prev) =>
                    prev?.filter((each) => each.id !== item.id)
                  );
                }}
              />
            </Tooltip>,
          ]}
        >
          <Skeleton avatar title={false} loading={loading} active>
            <img
              alt={item.header}
              src={`${API_URL}${item.url}`}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <Divider style={{ margin: "8px 0" }} />
            <h4 style={{ margin: 0 }}>{item.header}</h4>
            {item.template && (
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
                Шаблон: {item.template.name} ({item.template.widthInColumns} ×{" "}
                {item.template.heightInRows})
              </p>
            )}
          </Skeleton>
        </List.Item>
      )}
    />
  );

  const handleRemoveWidget = (id: string) => {
    console.log("Removing widget with id:", id); // Отладка

    // Находим виджет в текущем макете
    const widget = layout.find((block) => block.id === id);
    console.log("Found widget:", widget); // Отладка

    if (widget) {
      // Определяем, является ли это текстовым виджетом
      const isImageWidget = widget.content?.type === "image";
      const isTextWidget = !isImageWidget; // Если не изображение, то текст

      console.log("Is image widget:", isImageWidget); // Отладка
      console.log("Is text widget:", isTextWidget); // Отладка

      // If the removed widget is a text widget, add it back to the available texts
      if (isTextWidget) {
        const textContent =
          typeof widget.content === "string"
            ? widget.content
            : widget.content?.text ||
              widget.content?.blocks?.[0]?.data?.text ||
              "";

        console.log("Text content to return:", textContent); // Отладка

        if (textContent && textContent.trim()) {
          // Определяем заголовок для возвращаемого элемента
          let title = "Removed Text";

          // Если это часть разбитого текста, сохраняем информацию о части
          const isTextPart = textContent.length < 200; // Предполагаем что части короче оригинальных статей
          if (isTextPart) {
            // Ищем существующие части в items, чтобы определить номер новой части
            const existingParts = items.filter(
              (item) => item.title && item.title.startsWith("Часть")
            );
            const nextPartNumber = existingParts.length + 1;
            title = `Часть ${nextPartNumber} (возвращена)`;
          }

          console.log("Adding item back to temporary content:", {
            title,
            content: textContent,
          }); // Отладка

          setItems((prev) => {
            const newItems = [
              ...prev,
              {
                id: Date.now() + Math.random(), // Уникальный ID
                title: title,
                content: textContent,
              },
            ];
            console.log("Updated items after adding back:", newItems); // Отладка
            return newItems;
          });
        }
      }

      // If the removed widget is an image widget, add it back to the available images
      if (isImageWidget && widget.content?.url) {
        setImages((prev) => [
          ...(prev || []),
          {
            id: Date.now(),
            name: "Removed Image",
            url: widget.content.url,
          },
        ]);
      }
    } else {
      console.log("Widget not found in layout"); // Отладка
    }

    // Удаляем виджет из макета
    removeWidget(id);
  };

  // Функция для удаления временной части текста из меню
  const handleDeleteTemporaryItem = (itemId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    message.success("Часть текста удалена");
  };

  return (
    <Container>
      <Sidebar>
        <h3 style={{ marginBottom: 16 }}>Available Content</h3>
        {currentPageNumber === 1 && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            <strong>📝 Первая страница</strong>
            <br />
            Эта страница не редактируется. Она содержит обложку выпуска.
          </div>
        )}
        {currentPageNumber !== 1 && (
          <>
            <Divider orientation="left">Temporary Content</Divider>
            {renderContentList()}
            <Divider orientation="left">Images</Divider>
            {renderImageList()}
            <Divider orientation="left">Advertisements</Divider>
            {renderAdvertisementList()}
          </>
        )}
      </Sidebar>

      <MainContent layoutSettings={safeLayoutSettings}>
        {/* Buttons above the header */}
        <Toolbar>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveData}>
            Save Layout
          </Button>
          <Button icon={<EyeOutlined />} onClick={showPreview}>
            Preview
          </Button>
          <Button
            type="default"
            onClick={async () => {
              const { generatePDF } = await import("../../utils/pdfGenerator");
              let hideLoading = message.loading("Generating PDF...", 0);
              try {
                await generatePDF(
                  allLayouts,
                  layoutSettings,
                  issueDate,
                  newspaperName,
                  currentFont,
                  issueCover,
                  (progress) => {
                    if (typeof progress === "string") {
                      message.open({ type: "loading", content: progress, duration: 0, key: "pdf-progress" });
                    } else if (typeof progress === "number") {
                      message.open({ type: "loading", content: `Generating page ${progress}...`, duration: 0, key: "pdf-progress" });
                    }
                  }
                );
                hideLoading();
                message.success("PDF has been successfully generated and downloaded", 5);
              } catch (e) {
                hideLoading();
                message.error("Error while generating PDF", 5);
              } finally {
                message.destroy("pdf-progress");
              }
            }}
          >
            📄 Скачать PDF
          </Button>
          <div style={{ flex: 1 }} />
          <span>
            Page {currentPageNumber} of {totalPages}
          </span>
        </Toolbar>

        {/* Main Content Area */}
        <div
          className={`newspaper-page-${currentPageNumber}`}
          style={{
            backgroundColor: "#ffffff",
            height: safeLayoutSettings.pageHeight,
            fontFamily: currentFont,
            fontSize: "14px", // Добавляем базовый размер шрифта
          }}
        >
          {/* Header - показываем на всех страницах кроме первой */}
          {currentPageNumber !== 1 && (
            <header
              style={{
                height: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ddd",
                padding: "5px 10px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: "#f8f9fa",
              }}
            >
              <span style={{ margin: 0 }}>{issueDateBeautified}</span>
              <span style={{ margin: 0 }}>{newspaperName}</span>
            </header>
          )}

          {/* Main Content Area */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#ffffff",
              overflowY: "clip",
              height: mainContentHeight,
              position: "relative",
            }}
          >
            {/* Add vertical dividers for each column */}
            {[...Array(safeLayoutSettings.columnCount - 1)].map((_, index) => {
              // Сначала получаем ширину основного макета
              const mainWidth = calculateMainWidth(safeLayoutSettings);
              // Затем вычитаем горизонтальные поля, которые используются как padding
              const gridStackWidth =
                mainWidth - safeLayoutSettings.horizontalFieldsWidth * 2;
              // GridStack рассчитывает ширину колонки на основе этого пространства
              const gridStackColumnWidth =
                gridStackWidth / safeLayoutSettings.columnCount;

              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    top: safeLayoutSettings.verticalFieldsHeight,
                    left:
                      (index + 1) * gridStackColumnWidth +
                      safeLayoutSettings.horizontalFieldsWidth,
                    width: "1px",
                    height: `calc(100% - ${
                      safeLayoutSettings.verticalFieldsHeight * 2
                    }px)`,
                    backgroundColor: "rgba(0,0,0,0.1)",
                  }}
                />
              );
            })}

            <div
              style={{
                paddingLeft: safeLayoutSettings.horizontalFieldsWidth,
                paddingRight: safeLayoutSettings.horizontalFieldsWidth,
                paddingTop: safeLayoutSettings.verticalFieldsHeight,
                paddingBottom: safeLayoutSettings.verticalFieldsHeight,
                height: "100%", // Растягиваем на всю доступную высоту
                boxSizing: "border-box", // Учитываем padding в размерах
              }}
            >
              <div className="grid-stack">
                {layout.map((child) => {
                  return (
                    <GridItem
                      key={child.id}
                      itemRef={gridItemsRefs.current[child.id]}
                      id={child.id}
                      childLayout={child}
                      isPreview={false}
                      columnWidth={columnWidth}
                      rowHeight={rowHeight}
                    >
                      <div
                        style={{
                          position: "relative",
                          border: child.lock ? "2px solid #d4edda" : undefined,
                          backgroundColor: child.lock ? "#f8f9fa" : undefined,
                          opacity: child.lock ? 0.8 : 1,
                        }}
                      >
                        {/* Показываем кнопку удаления только для не заблокированных элементов */}
                        {!child.lock && (
                          <>
                            <button
                              style={{
                                zIndex: 999, // Lower z-index so modal can cover it
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                border: "1px solid #ddd",
                                borderRadius: "50%",
                                color: "#ff4d4f",
                                fontSize: "14px",
                                width: "24px",
                                height: "24px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.7,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.opacity = "1";
                                target.style.backgroundColor = "#ff4d4f";
                                target.style.color = "white";
                                target.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.opacity = "0.7";
                                target.style.backgroundColor =
                                  "rgba(255, 255, 255, 0.9)";
                                target.style.color = "#ff4d4f";
                                target.style.transform = "scale(1)";
                              }}
                              onClick={() => {
                                handleRemoveWidget(child.id);
                              }}
                            >
                              ×
                            </button>

                            {/* Кнопка разделения текста - показываем только для текстовых блоков */}
                            {child.content?.type !== "image" && (
                              <button
                                style={{
                                  zIndex: 999,
                                  position: "absolute",
                                  top: "5px",
                                  right: "35px", // Размещаем слева от кнопки удаления
                                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  border: "1px solid #ddd",
                                  borderRadius: "50%",
                                  color: "#1890ff",
                                  fontSize: "12px",
                                  width: "24px",
                                  height: "24px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  opacity: 0.7,
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  const target = e.target as HTMLButtonElement;
                                  target.style.opacity = "1";
                                  target.style.backgroundColor = "#1890ff";
                                  target.style.color = "white";
                                  target.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  const target = e.target as HTMLButtonElement;
                                  target.style.opacity = "0.7";
                                  target.style.backgroundColor =
                                    "rgba(255, 255, 255, 0.9)";
                                  target.style.color = "#1890ff";
                                  target.style.transform = "scale(1)";
                                }}
                                onClick={() => {
                                  showSplitTextModal(child.content?.text || "", child.title || "", child.id || "");
                                }}
                                title="Разбить текст на части"
                              >
                                ✂
                              </button>
                            )}
                          </>
                        )}
                        {child.content?.type === "image" ? (
                          <div
                            style={{
                              overflow: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding:
                                child.id === "first-page-issue-cover"
                                  ? "5px"
                                  : "6px",
                              height: "100%",
                              width: "100%",
                            }}
                          >
                            <img
                              alt="widget"
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit:
                                  child.id === "first-page-issue-cover"
                                    ? "cover"
                                    : "contain",
                                borderRadius:
                                  child.id === "first-page-issue-cover"
                                    ? "8px"
                                    : "0px",
                              }}
                              src={`${API_URL}${child.content.url}`}
                            />
                          </div>
                        ) : (
                          <div data-color-mode="light">
                            <MarkdownContainer
                              fontFamily={
                                child.content?.fontFamily || currentFont
                              }
                            >
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
                                  padding: "6px",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  lineHeight: "1.4", // Добавляем фиксированную высоту строки
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

          {/* Footer - показываем на всех страницах кроме первой */}
          {currentPageNumber !== 1 && (
            <footer
              style={{
                height: "30px",
                padding: "5px 10px",
                textAlign: "center",
                borderTop: "1px solid #ddd",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span>
                Страница {currentPageNumber} из {totalPages}
              </span>
            </footer>
          )}
        </div>
      </MainContent>

      <Modal
        visible={previewVisible}
        onCancel={hidePreview}
        footer={null}
        width={safeLayoutSettings.pageWidth + 100}
        // you can adjust the width to comfortably show the page
        bodyStyle={{ backgroundColor: "#f0f2f5", padding: 0 }}
        destroyOnClose
        zIndex={1000} // Lower z-index to not interfere with other modals
      >
        {/* Inside this Modal, re-render the exact same "newspaper page" markup,
            but with ALL editing controls hidden:
            • No GridStack wrappers (or you can leave the gridstack div,
              but just don't initialize it in preview mode).
            • No "X" delete buttons.
            • No plus-icons in the sidebar (we're only showing the page itself here).
            For simplicity, we'll copy your entire page's JSX but wrap it in
            a "preview-mode" class (so we can hide any unwanted bits via CSS). */}

        <div
          className="newspaper-preview-container"
          style={{
            backgroundColor: "#ffffff",
            width: safeLayoutSettings.pageWidth,
            height: safeLayoutSettings.pageHeight,
            fontFamily: currentFont,
            fontSize: "14px", // Добавляем базовый размер шрифта
            margin: "20px auto 0", // Отступ только сверху и по бокам
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          {/* Preview Header - показываем на всех страницах кроме первой */}
          {currentPageNumber !== 1 && (
            <header
              style={{
                height: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ddd",
                padding: "5px 10px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: "#f8f9fa",
              }}
            >
              <span style={{ margin: 0 }}>{issueDateBeautified}</span>
              <span style={{ margin: 0 }}>{newspaperName}</span>
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
            {/* Vertical dividers hidden in preview for cleaner look */}

            {/* Static preview using exact GridStack positioning logic */}
            <div
              className="preview-grid-static"
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              {layout.map((child) => {
                // Use exact same calculations as main grid
                const actualColumnWidth = columnWidth;
                const actualRowHeight = rowHeight;
                const margin = 5;

                // Позиционирование с учетом боковых полей из layout
                const x =
                  (child.x || 0) * actualColumnWidth +
                  safeLayoutSettings.horizontalFieldsWidth;
                const y =
                  (child.y || 0) * actualRowHeight +
                  (currentPageNumber !== 1 ? 30 : 0) +
                  safeLayoutSettings.verticalFieldsHeight; // Учитываем header и вертикальные поля
                const w = (child.w || 1) * actualColumnWidth - margin;
                const h = (child.h || 1) * actualRowHeight - margin;

                return (
                  <div
                    key={`preview-${child.id}`}
                    className="preview-item"
                    style={{
                      position: "absolute",
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${w}px`,
                      height: `${h}px`,
                      border: "none", // Убираем обводку в превью
                      borderRadius: "0px", // Убираем скругления в превью
                      backgroundColor: "transparent", // Убираем фон в превью
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      {child.content?.type === "image" ? (
                        <div
                          style={{
                            overflow: "hidden",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            padding:
                              child.id === "first-page-issue-cover"
                                ? "5px"
                                : "6px",
                          }}
                        >
                          <img
                            alt="widget"
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit:
                                child.id === "first-page-issue-cover"
                                  ? "cover"
                                  : "contain",
                              borderRadius:
                                child.id === "first-page-issue-cover"
                                  ? "8px"
                                  : "0px",
                            }}
                            src={`${API_URL}${child.content.url}`}
                          />
                        </div>
                      ) : (
                        <div
                          data-color-mode="light"
                          style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                          }}
                        >
                          <MarkdownContainer
                            fontFamily={
                              child.content?.fontFamily || currentFont
                            }
                          >
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
                                padding: "6px",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                lineHeight: "1.4", // Добавляем фиксированную высоту строки
                              }}
                            />
                          </MarkdownContainer>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Preview Footer - показываем на всех страницах кроме первой */}
          {currentPageNumber !== 1 && (
            <footer
              style={{
                height: "30px",
                padding: "5px 10px",
                textAlign: "center",
                borderTop: "1px solid #ddd",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: "#f8f9fa",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span>
                Страница {currentPageNumber} из {totalPages}
              </span>
            </footer>
          )}
        </div>
      </Modal>

      {/* Модальное окно для разбиения текста */}
      <SplitTextModal
        visible={splitTextModal.visible}
        text={splitTextModal.text}
        onCancel={closeSplitTextModal}
        onOk={handleSplitText}
      />
    </Container>
  );
};
