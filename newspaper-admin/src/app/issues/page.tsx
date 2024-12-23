"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Button } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const relationsQuery = {
  populate: {
    newspaper: {
      populate: {
          layout: {
              populate: "*"
          }
      }
    },
  },
};

type LayoutType = {
    editorJSData: JSON,
    columnCount: number,
    pageHeight: number,
    availableTextStyles: JSON,
    pageWidth: number,
    horizontalFieldsWidth: number,
    verticalFieldsHeight: number,
    fontFamily: string,
    pagesCount: number,
};

type NewspaperType = {
    name: JSON,
    cover: number,
    layout: LayoutType,
};

export default function BlogPostList() {
  const searchParams = useSearchParams();
  const newspaperId = searchParams.get("newspaperId");

  const { tableProps } = useTable<{
    name: string;
    PublishDate: Date;
    newspaper: NewspaperType;
    createdAt: Date;
    updatedAt: Date;
    id: number | string;
  }[]>({
    resource: "issues",
    meta: relationsQuery,
    filters: {
      initial: [
        {
          field: "newspaper",
          operator: "eq",
          value: newspaperId,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "id",
          order: "desc",
        },
      ],
    },
  });

  const router = useRouter();

  return (
      <List>
        {/* Add Create Button */}
        <Space style={{ marginBottom: 16 }}>
          <Button
              type="primary"
              onClick={() =>
                  router.push(`/issues/create?newspaperId=${newspaperId}`)
              }
          >
            Create Issue
          </Button>
        </Space>

        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title={"ID"} />
          <Table.Column dataIndex="name" title={"Name"} />
          <Table.Column dataIndex="PublishDate" title={"Publish Date"} />
            <Table.Column
                title={"Newspaper"}
                dataIndex="newspaper"
                render={(_, record: BaseRecord) => JSON.stringify(record.layout)}
            />
          <Table.Column
              title={"Actions"}
              dataIndex="actions"
              render={(_, record: BaseRecord) => (
                  <Space>
                    <EditButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        onClick={() =>
                            router.push(`/issues/edit/${record.id}`)
                        }
                    />
                    <ShowButton
                        hideText
                        size="small"
                        recordItemId={record.id}
                        onClick={() =>
                            router.push(
                                `/issues/show/${record.id}?newspaperId=${newspaperId}`
                            )
                        }
                    />
                    <DeleteButton hideText size="small" recordItemId={record.id} />
                  </Space>
              )}
          />
        </Table>
      </List>
  );
}
