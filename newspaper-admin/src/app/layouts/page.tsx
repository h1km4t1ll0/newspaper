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
    headerHeight: number,
    availableTextStyles: JSON,
    block_groups: string,
    column: string,
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
          <Table.Column dataIndex="headerHeight" title={"header Height"} />
          <Table.Column dataIndex="availableTextStyles" title={"availableTextStyles"} />
          <Table.Column dataIndex="block_groups" title={"block groups"} />
          <Table.Column dataIndex="column" title={"column"} />
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
