"use client";

import {
  DeleteButton,
  EditButton,
  ImageField,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { MEDIA_URL } from "../../utility/constants";

const relationsQuery = {
  populate: {
    ad_template: {
      populate: "*",
    },
    photo: {
      populate: "*",
    },
  },
};

type AdTemplateType = {
  id: number;
  name: string;
  widthInColumns: number;
  heightInRows: number;
};

type PhotoType = {
  id: number;
  url: string;
  name: string;
};

export default function BlogPostList() {
  const { tableProps, filters } = useTable<
    {
      DateFrom: Date;
      DateTo: Date;
      Header: string;
      ad_template: AdTemplateType;
      photo: PhotoType;
      createdAt: Date;
      updatedAt: Date;
      id: number | string;
    }[]
  >({
    syncWithLocation: true,
    meta: relationsQuery,
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
        <Table.Column dataIndex="Header" title={"Name"} />
        <Table.Column
          title={"Photo"}
          dataIndex="photo"
          width={100}
          render={(_, record: BaseRecord) =>
            record.photo ? (
              <ImageField
                value={`${MEDIA_URL}${record.photo.url}`}
                title={record.photo.name}
                width={50}
                height={50}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span>Нет фото</span>
            )
          }
        />
        <Table.Column
          title={"Template"}
          dataIndex="ad_template"
          render={(_, record: BaseRecord) =>
            record.ad_template ? (
              <div>
                <div>{record.ad_template.name}</div>
                <Tag color="blue">
                  {record.ad_template.widthInColumns} ×{" "}
                  {record.ad_template.heightInRows}
                </Tag>
              </div>
            ) : (
              <span style={{ color: "#999" }}>Не выбран</span>
            )
          }
        />
        <Table.Column
          dataIndex="DateFrom"
          title={"Start Date"}
          render={(_, record: BaseRecord) =>
            dayjs(record.DateFrom).format("DD.MM.YYYY")
          }
          width={120}
        />
        <Table.Column
          dataIndex="DateTo"
          title={"End Date"}
          render={(_, record: BaseRecord) =>
            dayjs(record.DateTo).format("DD.MM.YYYY")
          }
          width={120}
        />
        <Table.Column
          title={"Actions"}
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
