"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, InputNumber } from "antd";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

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
              <InputNumber />
          </Form.Item>
          <Form.Item
              label={"Header Height"}
              name="pageHeight"
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
              label={"Page Width"}
              name={["pageWidth"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Horizontal Fields Width"}
              name={["horizontalFieldsWidth"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Vertical Fields Height"}
              name={["verticalFieldsHeight"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Font Family"}
              name={["fontFamily"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Pages Count"}
              name={["pagesCount"]}
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
