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
      <Title level={5}>{"Название шаблона"}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{"Ширина (в колонках)"}</Title>
      <TextField value={record?.widthInColumns} />
      <Title level={5}>{"Высота (в строках)"}</Title>
      <TextField value={record?.heightInRows} />
    </Show>
  );
}
