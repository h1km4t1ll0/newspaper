export type CustomLayoutItem = {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  content: any;
  lock: boolean;
};

export type CustomLayout = CustomLayoutItem[];

export type PageLayout = {
  [pageId: string]: CustomLayout;
};

export type LayoutSettings = {
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