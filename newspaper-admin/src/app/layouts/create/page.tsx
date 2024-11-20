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
              label={"editorJSData"}
              name={["editorJSData"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Column Count"}
              name="columnCount"
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item
              label={"Header Height"}
              name="headerHeight"
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item
              label={"Available Text Styles"}
              name={["availableTextStyles"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Block Groups"}
              name={["block_groups"]}
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
