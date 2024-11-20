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
        <Title level={5}>{"Width"}</Title>
        <TextField value={record?.width} />
    </Show>
  );
}
