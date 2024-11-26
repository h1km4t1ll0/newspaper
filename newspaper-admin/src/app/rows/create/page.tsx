"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
          <Form.Item
              label={"Block Group"}
              name={["block_group"]}
              rules={[
                  {
                      required: true,
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
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
      </Form>
    </Create>
  );
}
