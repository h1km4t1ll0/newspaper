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

const relationsQuery = {
  populate: {
    column: {
      populate: {
        rows: {
          populate: "*"
        },
      },
    },
    block_groups: {
      populate: {
        rows: {
          populate: "*"
        },
      },
    },
  },
};

type BlockType = "Advertisement" | "Photo" | "Text" | "None"

type RowType = {
  column: ColumnType
};

type ColumnType = {
  width: number,
  rows: RowType[]
}

type BlockGroupType = {
  rows: RowType[],
  type: BlockType,
};

export default function BlogPostList() {
  const { tableProps, filters } = useTable<{
    editorJSData: JSON,
    columnCount: number,
    headerHeight: number,
    availableTextStyles: JSON,
    block_groups: BlockGroupType[],
    column: ColumnType,
    createdAt: Date,
    updatedAt: Date,
    id: number | string,
  }[]>({
    syncWithLocation: true,
    meta: relationsQuery,
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
          <Table.Column
              title={"block groups"}
              dataIndex="block_groups"
              render={(_, record: BaseRecord) => JSON.stringify(record.block_groups)}
          />
          <Table.Column
              title={"column"}
              dataIndex="column"
              render={(_, record: BaseRecord) => JSON.stringify(record.column)}
          />
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
