"use client";

import { DateField, MarkdownField, Show, TextField } from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export default function BlogPostShow() {
  const { queryResult } = useShow({
    meta: {
      populate: ["category"],
    },
  });
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "categories",
    id: record?.category?.id || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"editorJSData"}</Title>
      <TextField value={record?.editorJSData} />
      <Title level={5}>{"columnCount"}</Title>
        <TextField value={record?.columnCount} />
      <Title level={5}>{"headerHeight"}</Title>
        <TextField value={record?.headerHeight} />
        <Title level={5}>{"availableTextStyles"}</Title>
        <TextField value={record?.availableTextStyles} />
        <Title level={5}>{"blockGroups"}</Title>
        <TextField value={record?.block_groups} />
        <Title level={5}>{"column"}</Title>
        <TextField value={record?.column} />
    </Show>
  );
}
