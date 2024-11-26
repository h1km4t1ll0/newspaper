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
              label={"Rows"}
              name={["rows"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Layout"}
              name={["layout"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Type"}
              name={["type"]}
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
