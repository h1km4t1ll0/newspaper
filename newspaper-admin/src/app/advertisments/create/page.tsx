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
          label={"Название рекламы"}
          name={["Header"]}
          rules={[
            {
              required: true,
              message: "Введите название рекламы",
            },
          ]}
        >
          <Input placeholder="Название рекламного блока" />
        </Form.Item>

        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Фотография рекламы</Typography.Text>}
            rules={[{ required: true, message: "Загрузите фотографию" }]}
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
              title="Удалить фотографию"
              description="Вы уверены, что хотите удалить эту фотографию?"
              onConfirm={() => {
                form?.setFieldValue("photo", null);
                setPhoto(null);
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Tooltip placement="top" title={"Удалить"}>
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
          label={"Шаблон рекламы"}
          name={["ad_template"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select
            placeholder="Выберите шаблон размера"
            allowClear
            {...templateSelectProps}
          />
        </Form.Item>

        <Form.Item
          label={"Дата начала показа"}
          name={["DateFrom"]}
          rules={[
            {
              required: true,
              message: "Выберите дату начала",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Дата начала показа"
          />
        </Form.Item>
        <Form.Item
          label={"Дата окончания показа"}
          name={["DateTo"]}
          rules={[
            {
              required: true,
              message: "Выберите дату окончания",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Дата окончания показа"
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
