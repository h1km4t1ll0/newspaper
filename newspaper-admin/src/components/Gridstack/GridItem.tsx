import { FC, PropsWithChildren } from "react";

type GridItemProps = PropsWithChildren<{
  itemRef: React.MutableRefObject<HTMLDivElement>;
  id: string;
  childLayout: any;
  isPreview?: boolean;
  columnWidth?: number; // Add column width for preview positioning
  rowHeight?: number; // Add row height for preview positioning
}>;

export const GridItem: FC<GridItemProps> = ({
  itemRef,
  id,
  children,
  childLayout,
  isPreview = false,
  columnWidth = 50,
  rowHeight = 40,
}) => {
  // For preview mode, let GridStack handle positioning
  const getPreviewStyle = () => {
    if (!isPreview) return {};

    // Don't override GridStack positioning in preview mode
    return {};
  };

  return (
    <div
      ref={itemRef}
      key={id}
      className={`grid-stack-item ${isPreview ? "preview-mode" : ""}`}
      gs-id={childLayout?.id}
      gs-x={childLayout?.x}
      gs-y={childLayout?.y}
      gs-w={childLayout?.w}
      gs-h={childLayout?.h}
      id={id}
      style={isPreview ? getPreviewStyle() : undefined}
    >
      <div className="grid-stack-item-content">{children}</div>
    </div>
  );
};
