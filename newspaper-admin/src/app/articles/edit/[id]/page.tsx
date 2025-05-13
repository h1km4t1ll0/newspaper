"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input } from "antd";
import MDEditor from '@uiw/react-md-editor';
import { useState, useEffect } from 'react';
import CustomSelect from "@components/custom/custom-select";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps, form } = useForm({});
  const [text, setText] = useState("");

  useEffect(() => {
    const initialText = form.getFieldValue("text");
    if (initialText) {
      setText(initialText);
    }
  }, [form]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
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
                    console.log(value, 'value');
                    setText(value || "");
                    form.setFieldValue("text", value);
                  }}
                />
              </div>
          </Form.Item>
      </Form>
    </Edit>
  );
}
