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
import UploadImage from "@components/Upload";

const relationsQuery = {
  populate: {
    article: {
      populate: "*",
    },
  },
};

type ArticleType = {
  name: string,
  text: JSON,
}

export default function BlogPostList() {
  const { tableProps, filters } = useTable<{
    name: string,
    width: number,
    height: number,
    photo: string,
    article: ArticleType,
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
        <Table.Column dataIndex="width" title={"Width"} />
        <Table.Column dataIndex="height" title={"Height"} />
        <Table.Column
          dataIndex='photo'
          title={'Photo'}
          render={
            (value: any) => value ? (
              <UploadImage value={{
                url: value?.url,
                id: value?.id,
                fileName: `${value?.hash}${value?.ext}`,
                type: value?.mime?.split('/')[0],
                ext: value?.ext.replace('.', ''),
              }} index={0}/>
            ) : '-'
          }
        />
        <Table.Column
            title={"Article"}
            dataIndex="article"
            render={(_, record: BaseRecord) => JSON.stringify(record.article)}
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
