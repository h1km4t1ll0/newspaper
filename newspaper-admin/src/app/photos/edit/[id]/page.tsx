"use client";

import { DeleteOutlined } from "@ant-design/icons";
import CustomSelect from "@components/custom/custom-select";
import UploadImage from "@components/Upload";
import { Edit, useForm } from "@refinedev/antd";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState } from "react";

export default function BlogPostEdit() {
  const { form, formProps, query, saveButtonProps } = useForm<any>({
    meta: {
      populate: {
        photo: "*",
        article: "*",
      },
      fields: ["*"],
    },
  });

  const initialValues = useMemo(() => {
    const photo = query?.data?.data?.photo;
    return {
      ...query?.data?.data,
      photo: {
        url: photo?.url,
        id: photo?.id,
        fileName: `${photo?.hash}${photo?.ext}`,
        type: photo?.mime?.split("/")[0],
        ext: photo?.ext.replace(".", ""),
      },
    };
  }, [query?.data?.data?.photo]);

  const [photo, setPhoto] = useState<null | any>(initialValues.photo);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
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
          label={"Width"}
          name={["width"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label={"Height"}
          name={["height"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Agent photo</Typography.Text>}
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
              title="Delete the attachment item"
              description="Are you sure you want to delete this attachment?"
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
                  Delete
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
        <Form.Item
          label={"Article"}
          name={["article"]}
          rules={[
            {
              required: false,
            },
          ]}
          getValueProps={(value) => {
            // Преобразуем данные из Strapi в формат для селекта
            if (value && typeof value === "object" && value.id) {
              return { value: value.id };
            }
            return { value: value };
          }}
        >
          <CustomSelect
            resource="articles"
            optionLabel="name"
            optionValue="id"
            placeholder="Select article"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
}
