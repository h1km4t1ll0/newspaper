"use client";

import { DeleteOutlined } from "@ant-design/icons";
import UploadImage from "@components/Upload";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";

export default function BlogPostCreate() {
  const { formProps, saveButtonProps, form } = useForm({});
  const [photo, setPhoto] = useState<null>(form?.getFieldValue("photo"));

  const { selectProps: templateSelectProps } = useSelect({
    resource: "advertisement-templates",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      mode: "off",
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name of AD"}
          name={["Header"]}
          rules={[
            {
              required: true,
              message: "EEnter the name of AD",
            },
          ]}
        >
          <Input placeholder="Name of AD block" />
        </Form.Item>

        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Фотография рекламы</Typography.Text>}
            rules={[{ required: true, message: "Upload a photo" }]}
            style={{ margin: 0 }}
            name="photo"
          >
            <UploadImage
              value={photo}
              index={0}
              accepts=".png,.jpg,.jpeg"
              onChange={(value) => {
                setPhoto(value);
                form?.setFieldValue("photo", value);
              }}
            />
          </Form.Item>

          {photo && (
            <Popconfirm
              title="Delete a photo"
              description="Are you sure you want to delete the photo?"
              onConfirm={() => {
                form?.setFieldValue("photo", null);
                setPhoto(null);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip placement="top" title={"Delete"}>
                <Button
                  style={{ width: 120 }}
                  size="small"
                  block
                  danger
                  icon={<DeleteOutlined />}
                >
                  Удалить
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>

        <Form.Item
          label={"AD Template"}
          name={["ad_template"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select
            placeholder="Choose the AD Template of size"
            allowClear
            {...templateSelectProps}
          />
        </Form.Item>

        <Form.Item
          label={"Start Date"}
          name={["DateFrom"]}
          rules={[
            {
              required: true,
              message: "Choose thee start date",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Start date"
          />
        </Form.Item>
        <Form.Item
          label={"End Date"}
          name={["DateTo"]}
          rules={[
            {
              required: true,
              message: "Choose the end date",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="End date"
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
