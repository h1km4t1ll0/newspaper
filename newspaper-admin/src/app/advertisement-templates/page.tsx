"use client";

import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export default function BlogPostList() {
  const { tableProps, filters } = useTable<
    {
      name: string;
      widthInColumns: number;
      heightInRows: number;
      createdAt: Date;
      updatedAt: Date;
      id: number | string;
    }[]
  >({
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        },
      ],
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} width={60} />
        <Table.Column dataIndex="name" title={"Название шаблона"} />
        <Table.Column
          dataIndex="widthInColumns"
          title={"Ширина (колонки)"}
          width={130}
          render={(value) => <Tag color="cyan">{value} кол.</Tag>}
        />
        <Table.Column
          dataIndex="heightInRows"
          title={"Высота (строки)"}
          width={130}
          render={(value) => <Tag color="orange">{value} стр.</Tag>}
        />
        <Table.Column
          title={"Размер"}
          width={100}
          render={(_, record: BaseRecord) => (
            <Tag color="blue">
              {record.widthInColumns} × {record.heightInRows}
            </Tag>
          )}
        />
        <Table.Column
          title={"Действия"}
          dataIndex="actions"
          width={120}
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
