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
    rows: {
      populate: {
        column: {
          populate: "*"
        },
      },
    },
    layout: {
      populate: {
        column: {
          populate: "*"
        },
      },
    },
  },
};

type BlockType = "Advertisement" | "Photo" | "Article" | "None"

type RowType = {
  column: ColumnType
};

type ColumnType = {
  width: number,
  rows: RowType[]
}

type LayoutType = {
  editorJSData: JSON,
  columnCount: number,
  headerHeight: number,
  availableTextStyles: JSON,
  column: ColumnType
}

export default function BlogPostList() {
  const { tableProps, filters } = useTable<{
    rows: RowType[],
    layout: LayoutType[],
    type: BlockType,
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
        <Table.Column dataIndex="type" title={"Type"} />
        <Table.Column
            title={"Rows"}
            dataIndex="rows"
            render={(_, record: BaseRecord) => JSON.stringify(record.rows)}
        />
        <Table.Column
            title={"Layout"}
            dataIndex="layout"
            render={(_, record: BaseRecord) => JSON.stringify(record.layout)}
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
