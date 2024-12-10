"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber } from "antd";

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
              label={"Width"}
              name={["width"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <InputNumber />
          </Form.Item>
          <Form.Item
              label={"Height"}
              name={["height"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <InputNumber />
          </Form.Item>
          <Form.Item
              label={"Photo"}
              name={["photo"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Article"}
              name={["article"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
      </Form>
    </Create>
  );
}
