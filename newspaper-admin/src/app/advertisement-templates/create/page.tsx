"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Row, Col } from "antd";
import { BannerPreview } from "@components/BannerPreview";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps } = useForm({});
  
  // Track form changes in real time
  const name = Form.useWatch(['name'], formProps.form);
  const widthInColumns = Form.useWatch(['widthInColumns'], formProps.form);
  const heightInRows = Form.useWatch(['heightInRows'], formProps.form);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Row gutter={24}>
        <Col span={12}>
          <Form {...formProps} layout="vertical">
            <Form.Item
              label={"Name of template"}
              name={["name"]}
              rules={[
                {
                  required: true,
                  message: "Enter the name of template",
                },
              ]}
            >
              <Input placeholder="Example: Banner 2x3, Square 1x1" />
            </Form.Item>
            <Form.Item
              label={"Width (in columns)"}
              name={["widthInColumns"]}
              rules={[
                {
                  required: true,
                  message: "Enter the width in columns",
                },
              ]}
            >
              <InputNumber min={1} max={12} placeholder="Number of columns" />
            </Form.Item>
            <Form.Item
              label={"Height (in rows)"}
              name={["heightInRows"]}
              rules={[
                {
                  required: true,
                  message: "Enter the height in rows",
                },
              ]}
            >
              <InputNumber min={1} max={20} placeholder="Number of rows" />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <BannerPreview
            name={name}
            widthInColumns={widthInColumns}
            heightInRows={heightInRows}
            title="Interactive Banner Preview"
          />
        </Col>
      </Row>
    </Create>
  );
}
