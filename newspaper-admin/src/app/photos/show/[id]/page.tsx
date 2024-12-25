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
        <Title level={5}>{"Width"}</Title>
        <TextField value={record?.width} />
        <Title level={5}>{"Height"}</Title>
        <TextField value={record?.height} />
        <Title level={5}>{"Photo"}</Title>
        <TextField value={record?.photo} />
        <Title level={5}>{"Article"}</Title>
        <TextField value={record?.article} />
    </Show>
  );
}
