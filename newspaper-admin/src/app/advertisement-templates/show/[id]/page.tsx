"use client";

import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
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
      <Title level={5}>{"Name of template"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Width (in columns)"}</Title>
      <TextField value={record?.widthInColumns} />
      <Title level={5}>{"Height (in rows)"}</Title>
      <TextField value={record?.heightInRows} />
    </Show>
  );
}
