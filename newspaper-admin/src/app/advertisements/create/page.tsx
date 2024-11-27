"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
          <Form.Item
              label={"Date From"}
              name={["DateFrom"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <DatePicker />
          </Form.Item>
          <Form.Item
              label={"DateTo"}
              name={["DateTo"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <DatePicker />
          </Form.Item>
          <Form.Item
              label={"Header"}
              name={["Header"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"AD Template"}
              name={["ad_template"]}
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
