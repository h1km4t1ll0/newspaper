"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Block Group"}
          name={["block_group"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Column"}
          name={["column"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
}
