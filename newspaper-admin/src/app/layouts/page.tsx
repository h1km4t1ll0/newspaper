"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";

export default function BlogPostList() {
  const { tableProps, filters } = useTable<{
    editorJSData: JSON,
    columnCount: number,
    pageHeight: number,
    availableTextStyles: JSON,
    pageWidth: number,
    horizontalFieldsWidth: number,
    verticalFieldsHeight: number,
    fontFamily: string,
    pagesCount: number,
    createdAt: Date,
    updatedAt: Date,
    id: number | string,
  }[]>({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: 'id',
          order: 'desc',
        },
      ],
    },
  });

  const renderAvailableTextStyles = (value: any) => {
    let fonts: any[] = [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        fonts = parsed.fonts || [];
      } catch {
        fonts = [];
      }
    } else if (value && typeof value === 'object' && Array.isArray(value.fonts)) {
      fonts = value.fonts;
    }
    if (!fonts.length) return '-';
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #d9d9d9' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 'bold', fontSize: 12, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 'bold', fontSize: 12, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>Font family</th>
          </tr>
        </thead>
        <tbody>
          {fonts.map((font, idx) => (
            <tr key={idx}>
              <td style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #d9d9d9' }}>{font.name}</td>
              <td style={{ padding: '4px 8px', fontFamily: font.fontFamily, fontSize: 12, border: '1px solid #d9d9d9' }}>{font.fontFamily}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderPixelValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    return `${value}px`;
  };

  return (
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title={"ID"} />
          <Table.Column dataIndex="columnCount" title={"Column count"} />
          <Table.Column dataIndex="pageHeight" title={"Header height"} render={renderPixelValue} />
          <Table.Column dataIndex="availableTextStyles" title={"Available text styles"} render={renderAvailableTextStyles} />
          <Table.Column dataIndex="pageWidth" title={"Page width"} render={renderPixelValue} />
          <Table.Column dataIndex="horizontalFieldsWidth" title={"Horizontal fields width"} render={renderPixelValue} />
          <Table.Column dataIndex="verticalFieldsHeight" title={"Vertical fields height"} render={renderPixelValue} />
          <Table.Column dataIndex="fontFamily" title={"Default font family"} />
          <Table.Column dataIndex="pagesCount" title={"Pages count"} />
          <Table.Column
              title={"Actions"}
              dataIndex="actions"
              render={(_, record: BaseRecord) => (
                  <Space>
                    <EditButton hideText size="small" recordItemId={record.id} />
                    <ShowButton hideText size="small" recordItemId={record.id} />
                    <DeleteButton hideText size="small" recordItemId={record.id} />
                  </Space>
              )}
          />
        </Table>
      </List>
  );
}
