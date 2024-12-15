import { FC, PropsWithChildren } from "react";

type GridItemProps = PropsWithChildren<{
  itemRef: React.MutableRefObject<HTMLDivElement>;
  id: string;
}>;

export const GridItem: FC<GridItemProps> = ({ itemRef, id, children }) => {
  return (
    <div ref={itemRef} key={id} className={"grid-stack-item"} id={id}>
      <div className="grid-stack-item-content">{children}</div>
    </div>
  );
};
