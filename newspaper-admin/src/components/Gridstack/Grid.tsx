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
  Space,
  Empty,
} from "antd";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
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
import { axiosInstance } from "@utility/axios-instance";

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
    textContent: string;
    widgetId: string;
    originalTitle?: string;
  }>({
    visible: false,
    textContent: "",
    widgetId: "",
    originalTitle: "",
  });
  const [splitIndices, setSplitIndices] = useState<number[]>([]);

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

  // Функция для открытия модального окна разбиения текста
  const openSplitTextModal = (widgetId: string) => {
    const widget = layout.find((item) => item.id === widgetId);
    if (!widget || widget.content?.type === "image") return;

    const textContent =
      typeof widget.content === "string"
        ? widget.content
        : widget.content?.text || widget.content?.blocks?.[0]?.data?.text || "";
    const originalTitle = widget.content?.title || widget.content?.name || "Untitled Article";

    setSplitTextModal({
      visible: true,
      textContent,
      widgetId,
      originalTitle,
    });
  };

  // Функция для закрытия модального окна
  const closeSplitTextModal = () => {
    setSplitTextModal({
      visible: false,
      textContent: "",
      widgetId: "",
      originalTitle: "",
    });
  };

  // Функция для обработки разбиения текста
  const handleSplitText = () => {
    const { textContent, widgetId, originalTitle } = splitTextModal;
    if (!textContent.trim()) {
      message.error("The text is empty");
      return;
    }
    if (splitIndices.length === 0) {
      message.error("Select at least one split point");
      return;
    }
    // Split by splitIndices
    const words = textContent.split(/(\s+)/);
    let parts: string[] = [];
    let current = "";
    let wordIdx = 0;
    for (let i = 0; i < words.length; i++) {
      current += words[i];
      if (i % 2 === 0 && splitIndices.includes(wordIdx)) {
        parts.push(current.trim());
        current = "";
      }
      if (i % 2 === 0) wordIdx++;
    }
    if (current.trim()) parts.push(current.trim());
    if (parts.length === 0 && textContent) parts = [textContent];
    // Remove the original widget
    const updatedLayout = layout.filter((item) => item.id !== widgetId);
    onChangeLayout(updatedLayout);
    
    // Remove the original article from items
    setItems((prevItems) => {
      const currentItems = prevItems || [];
      const itemContent = typeof textContent === "string" ? textContent : (textContent as any)?.text || (textContent as any)?.blocks?.[0]?.data?.text || "";
      return currentItems.filter((item) => {
        const itemText = typeof item.content === "string" ? item.content : item.content.text || item.content.blocks?.[0]?.data?.text || "";
        return itemText !== itemContent;
      });
    });
    
    // Add the split article to splitArticles to prevent it from returning to available content
    const itemContent = typeof textContent === "string" ? textContent : (textContent as any)?.text || (textContent as any)?.blocks?.[0]?.data?.text || "";
    setSplitArticles((prev) => [...prev, itemContent]);
    
    // Add new parts as temporary content, with originalArticleName
    const newItems = parts.map((part, index) => ({
      id: Date.now() + index + Math.random(),
      title: `Part ${index + 1} of ${parts.length} — ${originalTitle || "Untitled Article"}`,
      content: part,
      originalArticleName: originalTitle || "Untitled Article",
    }));
    setTemporaryParts((prev) => {
      const currentParts = prev || [];
      const updatedParts = [...currentParts, ...newItems];
      return updatedParts;
    });
    message.success(`The text is divided into ${parts.length} parts`);
    setSplitIndices([]); // reset for next time
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
  const [temporaryParts, setTemporaryParts] = useState<
    { title: string; content: any; id: number; originalArticleName?: string }[]
  >([]);
  const [splitArticles, setSplitArticles] = useState<string[]>([]);
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

        console.log("photosData.data?.data.data", photosData.data?.data.data);
      // Get photos from the API и фильтруем по issue
      const imagesArray: { name: string; url: string; id: number }[] =
        photosData.data?.data.data
          ?.filter((photo: any) => {
            // Проверяем что у фото есть файл и оно принадлежит текущему issue
            const hasPhoto = photo?.attributes?.photo?.data?.attributes?.url;
            const photoIssueId = photo.attributes?.issue?.data?.id;
            console.log("photoIssueId", photoIssueId, issueId);
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
        // Исключаем статьи, которые уже используются в layout или были разбиты
        return !usedContent.includes(itemContent) && !splitArticles.includes(itemContent);
      });

      const filteredImages = imagesArray.filter(
        (image) => !usedContent.includes(image.url)
      );

      // Сохраняем только оригинальные статьи, не смешиваем с временными частями
      setItems(filteredItems || []);
      // НЕ перезаписываем temporaryParts при перезагрузке данных

      setImages(filteredImages);
    } catch (error) {
      console.error("Error loading articles and photos:", error);
      // При ошибке сохраняем существующие части текста
      setItems([]);
      // НЕ перезаписываем temporaryParts при ошибке
      setImages([]);
    }
  }, [allLayouts, refetch, refetchPhotos, issueId, splitArticles]);

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
          content: "Layout saved",
          duration: 2,
        });
      } else {
        message.error({
          content: "Error saving layout",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error({
        content: "Error saving layout",
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

    if (currentPageNumber === 2 && layout.length === 0) {
      const newTableOfContents = generateTableOfContents();
      if (newTableOfContents && newTableOfContents.length > 0) {
        onChangeLayout(newTableOfContents);
      }
    }

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
        let originalArticleName = widget.content?.originalArticleName;
        if (!originalArticleName && widget.content?.title && widget.content.title.startsWith('Part')) {
          const match = widget.content.title.match(/— (.+)$/);
          if (match) originalArticleName = match[1].trim();
        }
        if (textContent && textContent.trim()) {
          let title = "Removed Text";
          const isTextPart = textContent.length < 200;
          if (isTextPart) {
            const existingParts = temporaryParts.filter(
              (item) => item.title && item.title.startsWith("Part")
            );
            const nextPartNumber = existingParts.length + 1;
            title = `Part ${nextPartNumber} (returned)`;
          }
          setTemporaryParts((prev) => {
            const newItems = [
              ...prev,
              {
                id: Date.now() + Math.random(),
                title: title,
                content: textContent,
                originalArticleName,
              },
            ];
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
    setTemporaryParts((prev) => prev.filter((item) => item.id !== itemId));
    message.success("Some text has been removed");
  };

  // Функция для восстановления оригинальной статьи из частей
  const handleRestoreArticle = async (originalArticleName: string) => {
    // Находим все части этой статьи
    const articleParts = temporaryParts.filter(
      (item) => item.originalArticleName === originalArticleName
    );
    
    if (articleParts.length === 0) {
      message.error("No parts found for this article");
      return;
    }

    try {
      // Получаем оригинальную статью с бэкенда по названию
      const query = qs.stringify(
        {
          fields: "*",
          filters: {
            name: {
              $eq: originalArticleName
            },
            issue: {
              id: {
                $eq: issueId
              }
            }
          }
        },
        {
          encodeValuesOnly: true,
        }
      );

      const response = await axiosInstance.get(`${API_URL}/api/articles?${query}`);
      const data = response.data;

      if (!data.data || data.data.length === 0) {
        message.error(`Article "${originalArticleName}" not found on backend`);
        return;
      }

      const originalArticle = data.data[0];
      const originalText = originalArticle.attributes.text;

      // Удаляем все части из temporaryParts
      setTemporaryParts((prev) => 
        prev.filter((item) => item.originalArticleName !== originalArticleName)
      );

      // Удаляем статью из splitArticles
      setSplitArticles((prev) => 
        prev.filter((content) => {
          const itemContent = typeof content === "string" ? content : (content as any)?.text || (content as any)?.blocks?.[0]?.data?.text || "";
          return itemContent !== originalText;
        })
      );

      // Добавляем оригинальную статью обратно в items
      setItems((prev) => [
        ...prev,
        {
          id: originalArticle.id,
          title: originalArticle.attributes.name,
          content: originalText,
        },
      ]);

      message.success(`Article "${originalArticleName}" has been restored`);
    } catch (error) {
      console.error("Error restoring article:", error);
      message.error("Error restoring article from backend");
    }
  };

  const handleGeneratePDF = async () => {
    const { generatePDF } = await import("../../utils/pdfGenerator");
    if (issueId) {
      const key = "pdf-progress";
      message.open({
        key,
        type: "loading",
        content: "Preparing to generate PDF...",
      });

      try {
        await generatePDF(
          allLayouts,
          layoutSettings,
          issueDate,
          newspaperName,
          currentFont,
          issueCover,
          (progress) => {
            if (typeof progress === "number") {
              message.open({
                key,
                type: "loading",
                content: `Generating page ${progress} of ${totalPages}...`,
              });
            } else if (typeof progress === "string") {
              message.open({
                key,
                type: "success",
                content: `PDF has been successfully generated and saved as ${progress}`,
                duration: 5,
              });
            }
          }
        );
      } catch (e) {
        message.open({
          key,
          type: "error",
          content: "An error occurred while generating the PDF.",
          duration: 5,
        });
      }
    }
  };

  const renderTemporaryContentList = () => {
    console.log("Rendering temporary content list, temporaryParts:", temporaryParts); // Отладка
    console.log("Temporary parts length:", temporaryParts?.length || 0); // Отладка

    // Проверяем, есть ли временные части
    if (!temporaryParts || temporaryParts.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    // Группируем части по оригинальной статье
    const groupedParts = temporaryParts.reduce((groups, item) => {
      const articleName = item.originalArticleName || "Unknown Article";
      if (!groups[articleName]) {
        groups[articleName] = [];
      }
      groups[articleName].push(item);
      return groups;
    }, {} as Record<string, typeof temporaryParts>);

    return (
      <div>
        {Object.entries(groupedParts).map(([articleName, parts]) => (
          <div key={articleName} style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 8,
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                {articleName} ({parts.length} parts)
              </span>
              <Button
                type="primary"
                size="small"
                onClick={() => handleRestoreArticle(articleName)}
                style={{ fontSize: '12px' }}
              >
                Restore Article
              </Button>
            </div>
            <List
              itemLayout="vertical"
              dataSource={parts}
              loading={loading}
              style={{ width: "100%" }}
              renderItem={(item) => {
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
                        setTemporaryParts((prev) =>
                          prev.filter((each) => each.id !== item.id)
                        );
                      }}
                    />
                  </Tooltip>,
                  <Tooltip key="delete-text" title="Delete permanently">
                    <Button
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTemporaryItem(item.id)}
                    />
                  </Tooltip>,
                ];

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
                              temporary
                            </span>
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
          </div>
        ))}
      </div>
    );
  };

  // Функция для генерации оглавления
  const generateTableOfContents = useCallback(() => {
    if (currentPageNumber !== 2) return;
    
    const tableOfContents: any[] = [];
    let currentY = 0;
    
    // Добавляем заголовок оглавления
    tableOfContents.push({
      id: "toc-header",
      x: 0,
      y: currentY,
      w: safeLayoutSettings.columnCount,
      h: 3,
      lock: true,
      content: {
        blocks: [
          {
            id: "toc-header",
            data: {
              text: "# Table of Contents",
            },
            type: "paragraph",
          },
        ],
      },
    });
    currentY += 3;

    // Анализируем все страницы для создания оглавления
    Object.entries(allLayouts).forEach(([pageKey, pageLayout]) => {
      const pageNumber = parseInt(pageKey.replace('page', ''));
      
      // Пропускаем первую и вторую страницы (обложка и само оглавление)
      if (pageNumber <= 2) return;
      
      // Ищем текстовые виджеты на странице
      const textWidgets = pageLayout.filter(widget => 
        widget.content?.type === "text" && 
        widget.content?.title && 
        !widget.lock // Исключаем заблокированные виджеты (заголовки страниц)
      );
      
      if (textWidgets.length > 0) {
        // Добавляем разделитель страницы с красивым форматированием
        tableOfContents.push({
          id: `toc-page-${pageNumber}-header`,
          x: 0,
          y: currentY,
          w: safeLayoutSettings.columnCount,
          h: 2,
          lock: true,
          content: {
            blocks: [
              {
                id: `toc-page-${pageNumber}-header`,
                data: {
                  text: `## Page ${pageNumber}\n---`,
                },
                type: "paragraph",
              },
            ],
          },
        });
        currentY += 2;
        
        // Добавляем заголовки статей с красивым форматированием
        textWidgets.forEach((widget, index) => {
          const title = widget.content.title;
          if (title && title !== "Removed Text") {
            // Определяем тип статьи по заголовку
            
            tableOfContents.push({
              id: `toc-${pageNumber}-${index}`,
              x: 0,
              y: currentY,
              w: safeLayoutSettings.columnCount,
              h: 1,
              lock: true,
              content: {
                blocks: [
                  {
                    id: `toc-${pageNumber}-${index}`,
                    data: {
                      text: `• **${title}**`,
                    },
                    type: "paragraph",
                  },
                ],
              },
            });
            currentY += 1;
          }
        });
        
        // Добавляем пустую строку между страницами
        currentY += 1;
      }
    });

    // Если оглавление пустое, добавляем красивое сообщение
    if (tableOfContents.length === 1) {
      tableOfContents.push({
        id: "toc-empty",
        x: 0,
        y: currentY,
        w: safeLayoutSettings.columnCount,
        h: 3,
        lock: true,
        content: {
          blocks: [
            {
              id: "toc-empty",
              data: {
                text: "### 📭 No Articles Found\n\n*Add some articles to other pages to see them listed here.*",
              },
              type: "paragraph",
            },
          ],
        },
      });
    } else {
      // Добавляем финальную информацию
      const totalArticles = Object.entries(allLayouts).reduce((total, [pageKey, pageLayout]) => {
        const pageNumber = parseInt(pageKey.replace('page', ''));
        if (pageNumber <= 2) return total;
        
        const textWidgets = pageLayout.filter(widget => 
          widget.content?.type === "text" && 
          widget.content?.title && 
          !widget.lock &&
          widget.content.title !== "Removed Text"
        );
        return total + textWidgets.length;
      }, 0);
    }

    return tableOfContents;
  }, [allLayouts, currentPageNumber, safeLayoutSettings.columnCount]);

  // Функция для ручной генерации оглавления
  const handleGenerateTOC = () => {
    if (currentPageNumber === 2) {
      const newTableOfContents = generateTableOfContents();
      if (newTableOfContents && newTableOfContents.length > 0) {
        onChangeLayout(newTableOfContents);
        message.success("Table of Contents has been generated successfully!");
      } else {
        message.warning("No articles found to generate table of contents.");
      }
    } else {
      message.warning("Table of Contents can only be generated on page 2.");
    }
  };

  return (
    <Container>
      <Sidebar>
        <h3 style={{ marginBottom: 16 }}>Content List</h3>
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
            <strong>📝 First page</strong>
            <br />
            This page is not editable. It contains the cover of the issue.
          </div>
        )}
        {currentPageNumber === 2 && (
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
            <strong>📝 Second page</strong>
            <br />
            This page is not editable. It contains the table of contents of the issue.
          </div>
        )}
        {(currentPageNumber !== 1 && currentPageNumber !== 2) && (
          <>
            <Divider orientation="left">Available Content</Divider>
            {renderContentList()}
            <Divider orientation="left">Temporary Content</Divider>
            {renderTemporaryContentList()}
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
            onClick={handleGeneratePDF}
          >
            📄 Download PDF
          </Button>
          {currentPageNumber === 2 && (
            <Button
              type="default"
              onClick={handleGenerateTOC}
              style={{ 
                backgroundColor: '#f0f8ff', 
                borderColor: '#1890ff',
                color: '#1890ff'
              }}
            >
              📋 Generate TOC
            </Button>
          )}
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
                                  openSplitTextModal(child.id);
                                }}
                                title="Split text on parts"
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
                Page {currentPageNumber} of {totalPages}
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
                Page {currentPageNumber} of {totalPages}
              </span>
            </footer>
          )}
        </div>
      </Modal>

      {/* Модальное окно для разбиения текста */}
      <Modal
        title="Split text into parts"
        open={splitTextModal.visible}
        onOk={handleSplitText}
        onCancel={closeSplitTextModal}
        okText="Split"
        cancelText="Cancel"
        zIndex={1100}
      >
        <div style={{ marginBottom: 16 }}>
          <p><strong>Click between words to select where to split:</strong></p>
          <div
            style={{
              maxHeight: 200,
              overflow: "auto",
              padding: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              backgroundColor: "#fafafa",
              fontSize: "14px",
              lineHeight: "1.5",
              wordBreak: "break-word",
              userSelect: "text",
            }}
          >
            {(() => {
              const words = splitTextModal.textContent ? splitTextModal.textContent.split(/(\s+)/) : [];
              const wordIndices = words.filter((_, i) => i % 2 === 0).length;
              let wordCount = 0;
              return words.map((part, i) => {
                if (i % 2 === 0) {
                  // word
                  const el = <span key={`w${i}`}>{part}</span>;
                  if (i < words.length - 1) {
                    const splitIdx = wordCount;
                    const isActive = splitIndices.includes(splitIdx);
                    wordCount++;
                    return [
                      el,
                      <span
                        key={`split${i}`}
                        onClick={() => {
                          setSplitIndices((prev) =>
                            prev.includes(splitIdx)
                              ? prev.filter((idx) => idx !== splitIdx)
                              : [...prev, splitIdx].sort((a, b) => a - b)
                          );
                        }}
                        style={{
                          cursor: "pointer",
                          margin: "0 2px",
                          color: isActive ? "#fff" : "#1890ff",
                          background: isActive ? "#1890ff" : "#e6f7ff",
                          borderRadius: 6,
                          padding: "0 6px",
                          fontWeight: isActive ? "bold" : "normal",
                          userSelect: "none",
                          transition: "all 0.2s",
                        }}
                        title={isActive ? "Remove partition" : "Break here"}
                      >
                        |<span style={{ fontSize: 10 }}>{isActive ? "✔" : ""}</span>
                      </span>,
                    ];
                  } else {
                    return el;
                  }
                } else {
                  // space
                  return <span key={`s${i}`}>{part}</span>;
                }
              });
            })()}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <p><strong>Preview parts:</strong></p>
          {(() => {
            const words = splitTextModal.textContent ? splitTextModal.textContent.split(/(\s+)/) : [];
            let parts: string[] = [];
            let current = "";
            let wordIdx = 0;
            for (let i = 0; i < words.length; i++) {
              current += words[i];
              if (i % 2 === 0 && splitIndices.includes(wordIdx)) {
                parts.push(current.trim());
                current = "";
              }
              if (i % 2 === 0) wordIdx++;
            }
            if (current.trim()) parts.push(current.trim());
            if (parts.length === 0 && splitTextModal.textContent) parts = [splitTextModal.textContent];
            return parts.map((part, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  border: "1px solid #e8e8e8",
                  borderRadius: 4,
                  backgroundColor: "#f9f9f9",
                  fontSize: "12px",
                }}
              >
                <strong>Part {idx + 1}:</strong> {part.substring(0, 100)}{part.length > 100 ? "..." : ""}
              </div>
            ));
          })()}
        </div>
      </Modal>
    </Container>
  );
};
