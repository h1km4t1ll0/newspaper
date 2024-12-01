"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber } from "antd";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    meta: {
      populate: ["category"],
    },
  });

  const blogPostsData = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
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
          <InputNumber />
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
              <InputNumber />
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
