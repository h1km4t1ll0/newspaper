"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import EditorJSInput from "@components/editor-js/EditorJSInput";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
          <Form.Item
              label={"Name"}
              name={["name"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Photos"}
              name={["photos"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Text"}
              name={["text"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
             <EditorJSInput/>
          </Form.Item>
      </Form>
    </Create>
  );
}
