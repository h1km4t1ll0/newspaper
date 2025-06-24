"use client";

import { RoleContext } from "@app/RefineApp";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord, useUpdate } from "@refinedev/core";
import { Button, Card, Col, Row, Space, Tag } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";

const relationsQuery = {
  populate: {
    newspaper: {
      populate: {
        layout: {
          populate: "*",
        },
      },
    },
    cover: {
      populate: "*",
    },
  },
};

type LayoutType = {
  editorJSData: JSON;
  columnCount: number;
  pageHeight: number;
  availableTextStyles: JSON;
  pageWidth: number;
  horizontalFieldsWidth: number;
  verticalFieldsHeight: number;
  fontFamily: string;
  pagesCount: number;
};

type NewspaperType = {
  name: JSON;
  cover: number;
  layout: LayoutType;
};

const STRAPI_BASE_URL = "http://localhost:1338";

export default function BlogPostList() {
  const role = useContext(RoleContext);
  const searchParams = useSearchParams();
  const newspaperId = searchParams.get("newspaperId");

  const { tableProps } = useTable<
    {
      name: string;
      PublishDate: Date;
      status: string; // Add status field to track draft/published state
      newspaper: NewspaperType;
      createdAt: Date;
      updatedAt: Date;
      id: number | string;
    }[]
  >({
    resource: "issues",
    meta: relationsQuery,
    filters: {
      initial: newspaperId
        ? [
            {
              field: "newspaper",
              operator: "eq",
              value: newspaperId,
            },
          ]
        : [],
    },
    sorters: {
      initial: [
        {
          field: "PublishDate", // Sort by PublishDate
          order: "desc", // Sort in descending order
        },
      ],
    },
  });

  const router = useRouter();
  const { mutate } = useUpdate();

  return (
    <List createButtonProps={{ hidden: true }}>
      {/* Add Create Button */}
      {role === "Authenticated" && (
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() =>
              router.push(`/issues/create?newspaperId=${newspaperId}`)
            }
          >
            Создать выпуск
          </Button>
        </Space>
      )}

      <Row gutter={16}>
        {tableProps.dataSource?.map((record: BaseRecord) => (
          <Col span={8} key={record.id}>
            <Card
              title={
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {record.name || "No name"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(record.PublishDate).toLocaleDateString()}
                  </div>
                </div>
              }
              cover={
                record.cover?.url ? (
                  <div
                    style={{
                      height: "200px", // Fixed height for the container
                      overflow: "hidden", // Hide overflow to prevent cropping
                      display: "flex", // Use flexbox to center the image
                      justifyContent: "center", // Center horizontally
                      alignItems: "center", // Center vertically
                      padding: "10px", // Add padding around the image
                    }}
                  >
                    <img
                      alt="newspaper"
                      style={{
                        maxHeight: "100%", // Ensure the image does not exceed the container height
                        maxWidth: "100%", // Ensure the image does not exceed the container width
                        objectFit: "contain", // Maintain aspect ratio and fit within the container
                      }}
                      src={`${STRAPI_BASE_URL}${record.cover.url}`}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: "200px", // Fixed height for the container
                      overflow: "hidden", // Hide overflow to prevent cropping
                      display: "flex", // Use flexbox to center the image
                      justifyContent: "center", // Center horizontally
                      alignItems: "center", // Center vertically
                      padding: "10px", // Add padding around the image
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    No image
                  </div>
                )
              }
              actions={[
                role === "Authenticated" ? (
                  <EditButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    resource="issues"
                    onClick={() => router.push(`/issues/edit/${record.id}`)}
                  />
                ) : undefined,
                role === "Authenticated" ? (
                  <ShowButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    resource="issues"
                    onClick={() =>
                      router.push(
                        `/issues/show/${record.id}?newspaperId=${record.newspaper.id}`
                      )
                    }
                  />
                ) : undefined,
                role === "Authenticated" ? (
                  <DeleteButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    resource="issues"
                  />
                ) : undefined,
              ].filter(Boolean)}
            >
              <p>
                <strong>Газета:</strong> {record.newspaper?.name}
              </p>
              <p>
                <strong>Статус:</strong>
                <Tag
                  color={
                    record.status === "draft"
                      ? "orange"
                      : record.status === "in_progress"
                      ? "blue"
                      : record.status === "review"
                      ? "purple"
                      : record.status === "ready"
                      ? "cyan"
                      : record.status === "published"
                      ? "green"
                      : "default"
                  }
                  style={{ marginLeft: "8px" }}
                >
                  {record.status === "draft"
                    ? "Черновик"
                    : record.status === "in_progress"
                    ? "В работе"
                    : record.status === "review"
                    ? "На проверке"
                    : record.status === "ready"
                    ? "Готов"
                    : record.status === "published"
                    ? "Опубликован"
                    : record.status}
                </Tag>
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </List>
  );
}
