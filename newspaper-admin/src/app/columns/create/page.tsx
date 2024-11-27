"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, InputNumber, Select } from "antd";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
            <Form.Item
                label={"Width"}
                name={["Width"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <InputNumber />
            </Form.Item>
      </Form>
    </Create>
  );
}
