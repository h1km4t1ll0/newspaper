"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name of template"}
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Enter the name of template",
            },
          ]}
        >
          <Input placeholder="Example: Banner 2x3, Square 1x1" />
        </Form.Item>
        <Form.Item
          label={"Width (in columns)"}
          name={["widthInColumns"]}
          rules={[
            {
              required: true,
              message: "Enter the width in columns",
            },
          ]}
        >
          <InputNumber min={1} max={12} placeholder="Number of columns" />
        </Form.Item>
        <Form.Item
          label={"Height (in rows)"}
          name={["heightInRows"]}
          rules={[
            {
              required: true,
              message: "Enter the height in rows",
            },
          ]}
        >
          <InputNumber min={1} max={20} placeholder="Number of rows" />
        </Form.Item>
      </Form>
    </Edit>
  );
}
