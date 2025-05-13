"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import CustomSelect from "@components/custom/custom-select";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps, form } = useForm({});
  const [text, setText] = useState("");

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
              <CustomSelect
                resource="photos"
                mode="multiple"
                optionLabel="name"
                optionValue="id"
                placeholder="Select photos"
              />
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
              <div data-color-mode="light">
                <MDEditor
                  preview="edit"
                  value={text}
                  onChange={(value) => {
                    setText(value || "");
                    form.setFieldValue("text", value);
                  }}
                />
              </div>
          </Form.Item>
      </Form>
    </Create>
  );
}
