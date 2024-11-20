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
        <Title level={5}>{"Name"}</Title>
        <TextField value={record?.name} />
        <Title level={5}>{"Author"}</Title>
        <TextField value={record?.author} />
        <Title level={5}>{"Photos"}</Title>
        <TextField value={record?.photos} />
        <Title level={5}>{"Text"}</Title>
        <TextField value={record?.text} />
    </Show>
  );
}
