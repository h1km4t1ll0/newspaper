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
    layout: {
      populate: {
        column: {
          populate: "*"
        },
      },
    },
  },
};

type ColumnType = {
  width: number;
  rows: { column: ColumnType }[];
};

type LayoutType = {
  editorJSData: JSON;
  columnCount: number;
  headerHeight: number;
  availableTextStyles: JSON;
  column: ColumnType;
};

export default function BlogPostList() {
  const searchParams = useSearchParams();
  const newspaperId = searchParams.get("newspaperId");

  const { tableProps } = useTable<{
    name: string;
    layout: LayoutType;
    PublishDate: Date;
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
          <Table.Column
              title={"Layout"}
              dataIndex="layout"
              render={(_, record: BaseRecord) => JSON.stringify(record.layout)}
          />
          <Table.Column dataIndex="PublishDate" title={"Publish Date"} />
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
