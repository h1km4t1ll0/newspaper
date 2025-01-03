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
import dayjs from 'dayjs';

const relationsQuery = {
  populate: {
    ad_template: {
      populate: "*"
    },
  },
};

type AdTemplateType = {
  widthInColumns: number,
  heightInRows: number,
}

export default function BlogPostList() {
  const { tableProps, filters } = useTable<{
    DateFrom: Date,
    DateTo: Date,
    Header: string,
    ad_template: AdTemplateType,
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
        <Table.Column dataIndex="DateFrom"
                      title={"Date From"}
                      render={(_, record: BaseRecord) => dayjs(record.DateFrom).format('YYYY-MM-DD')}
        />
        <Table.Column dataIndex="DateTo"
                      title={"Date To"}
                      render={(_, record: BaseRecord) => dayjs(record.DateTo).format('YYYY-MM-DD')}
        />
        <Table.Column dataIndex="Header" title={"Header"} />
        <Table.Column
            title={"AD Template"}
            dataIndex="ad_template"
            render={(_, record: BaseRecord) => JSON.stringify(record.ad_template)}
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
