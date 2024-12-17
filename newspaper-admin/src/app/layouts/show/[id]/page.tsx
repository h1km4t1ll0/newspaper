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

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"editorJSData"}</Title>
      <TextField value={record?.editorJSData} />
      <Title level={5}>{"columnCount"}</Title>
        <TextField value={record?.columnCount} />
      <Title level={5}>{"pageHeight"}</Title>
        <TextField value={record?.pageHeight} />
        <Title level={5}>{"availableTextStyles"}</Title>
        <TextField value={record?.availableTextStyles} />
        <Title level={5}>{"pageWidth"}</Title>
        <TextField value={record?.pageWidth} />
        <Title level={5}>{"horizontalFieldsWidth"}</Title>
        <TextField value={record?.horizontalFieldsWidth} />
        <Title level={5}>{"verticalFieldsHeight"}</Title>
        <TextField value={record?.verticalFieldsHeight} />
        <Title level={5}>{"fontFamily"}</Title>
        <TextField value={record?.fontFamily} />
    </Show>
  );
}
