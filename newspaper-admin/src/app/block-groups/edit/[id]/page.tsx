"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

const typeSelectOptions = [
    {
        label: 'None',
        value: 'None',
    },
    {
        label: 'Photo',
        value: 'Photo',
    },
    {
        label: 'Article',
        value: 'Article',
    },
    {
        label: 'Advertisement',
        value: 'Advertisement',
    },
];

export default function BlogPostEdit() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Rows"}
          name={["rows"]}
          rules={[
            {
              required: false,
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
              required: false,
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
              <Select options={[...typeSelectOptions]}/>
          </Form.Item>
      </Form>
    </Edit>
  );
}
