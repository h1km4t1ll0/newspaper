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
      populate: "*",
    },
    block_groups: {
      populate: {
        layout: {
          populate: "*",
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
    block_group: BlockGroupType[],
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
        <Table.Column
            title={"Block Group"}
            dataIndex="block_group"
            render={(_, record: BaseRecord) => JSON.stringify(record)}
        />
        <Table.Column
            title={"Column"}
            dataIndex="column"
            render={(_, record: BaseRecord) => JSON.stringify(record)}
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
