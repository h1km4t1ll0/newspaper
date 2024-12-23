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

  return (
      <List>
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title={"ID"} />
          <Table.Column dataIndex="editorJSData" title={"editorJSData"} />
          <Table.Column dataIndex="columnCount" title={"column Count"} />
          <Table.Column dataIndex="pageHeight" title={"header Height"} />
          <Table.Column dataIndex="availableTextStyles" title={"availableTextStyles"} />
          <Table.Column dataIndex="pageWidth" title={"pageWidth"} />
          <Table.Column dataIndex="horizontalFieldsWidth" title={"horizontalFieldsWidth"} />
          <Table.Column dataIndex="verticalFieldsHeight" title={"verticalFieldsHeight"} />
          <Table.Column dataIndex="fontFamily" title={"fontFamily"} />
          <Table.Column dataIndex="pagesCount" title={"fontFamily"} />
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
