import { FC, PropsWithChildren } from "react";

type GridItemProps = PropsWithChildren<{
  itemRef: React.MutableRefObject<HTMLDivElement>;
  id: string;
  childLayout: any,
}>;

export const GridItem: FC<GridItemProps> = ({ itemRef, id, children, childLayout }) => {
  return (
    <div ref={itemRef} key={id} className={"grid-stack-item"} gs-id={childLayout?.id}
         gs-x={childLayout?.x}
         gs-y={childLayout?.y}
         gs-w={childLayout?.w}
         gs-h={childLayout?.h} id={id}>
      <div className="grid-stack-item-content"> {children}</div>
    </div>
  );
};
