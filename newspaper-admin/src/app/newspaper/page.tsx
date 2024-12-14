"use client";

const settings = {
  width: 1080,
  height: 1920,
  columnCount: 3,
  rowHeight: 20,
  rowMargin: [5, 5],
};


export default function BlogPostList() {
  const getRowCount = (height: number, rowHeight: number, rowMargin: number[]) => {
    return  Number((height / (rowHeight + rowMargin[0] + rowMargin[1])).toFixed());
  }

  const getCellWidth = (width: number, columnCount: number) => {
    return Number((width / columnCount).toFixed());
  };

  const rowCount = getRowCount(settings.height, settings.rowHeight, settings.rowMargin);
  const cellWidth = getCellWidth(settings.width, settings.columnCount);


  const getCellElement = (content: string, width: number, id?: string) => {
    return (
      <div style={{width,}} key={crypto.randomUUID()} id={id}>
        {content}
      </div>
    );
  };

  const getRowElement = (rowHeight: number, rowMargin: number[], content: string[]) => {
    return (
      <div style={{
        height: `${rowHeight}px`,
        marginTop: rowMargin[0],
        marginBottom: rowMargin[1],
        display: "flex",
        flexDirection: 'row',
        justifyItems: 'center',
        justifyContent: 'space-between',
      }}
      key={crypto.randomUUID()}>
        {content.slice(0, settings.columnCount).map(each => getCellElement(each, cellWidth))}
      </div>
    );
  };

  // const func = () => {
  //   console.log(document?.getElementById('hfhdhfdhhfjhjdfjfjdjdhf')?.getBoundingClientRect(), 'rowCount');
  // };
  //
  // useEffect(() => {
  //   const d = setTimeout(func, 2000);
  // }, []);

  return (
    <div style={{width: '100%', height: '100%'}}>
      {
        Array.from({length: rowCount}, (_, i) => getRowElement(
          settings.rowHeight,
          settings.rowMargin,
          [
            'oweirfnejrfmsorfserfoweirfnejrfmsorfserjrfmsorfse',
            'erfijeriofnioerfnmeorf',
            'oweirfnejrfmsorfserf',
            'erfijeriofnioerfnmeorf',
          ],
        ),)
      }
    </div>
  );
}
