import { FC, PropsWithChildren } from "react";

type GridItemProps = PropsWithChildren<{
  itemRef: React.MutableRefObject<HTMLDivElement>;
  id: string;
  childLayout: any,
}>;

export const GridItem: FC<GridItemProps> = ({ itemRef, id, children, childLayout }) => {
  return (
    <div ref={itemRef} key={id} className={"grid-stack-item"} gs-id={childLayout?.id}
         data-gs-x={childLayout?.x}
         data-gs-y={childLayout?.y}
         data-gs-w={childLayout?.w}
         data-gs-h={childLayout?.h} id={id}>
      <div className="grid-stack-item-content"> {children}</div>
    </div>
  );
};
