"use client";

import { DeleteOutlined } from "@ant-design/icons";
import UploadImage from "@components/Upload";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogPostEdit() {
  console.log("BlogPostEdit component loaded");
  const params = useParams();
  const router = useRouter();
  const issueId = Array.isArray(params.issueId)
    ? params.issueId[0]
    : params.issueId;
  console.log("Issue ID:", issueId);

  // Загружаем данные отдельно
  const {
    data: issueData,
    isLoading,
    error,
  } = useOne({
    resource: "issues",
    id: issueId,
    meta: {
      populate: {
        cover: "*",
        newspaper: "*",
      },
    },
  });

  // Форма для сохранения
  const { form, formProps, saveButtonProps } = useForm({
    resource: "issues",
    action: "edit",
    id: issueId,
    redirect: false, // Отключаем автоматический редирект
    onMutationSuccess: (data) => {
      console.log("Issue updated successfully:", data);
      // Редиректим обратно к списку issues с newspaperId
      const newspaper = issueData?.data?.newspaper;
      if (newspaper?.id) {
        router.push(`/issues?newspaperId=${newspaper.id}`);
      } else {
        router.push(`/issues`);
      }
    },
    onMutationError: (error) => {
      console.error("Error updating issue:", error);
    },
  });

  console.log("Issue data loaded:", issueData);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  const { selectProps: newspaperSelectProps } = useSelect({
    resource: "newspapers",
    optionLabel: "name",
    optionValue: "id",
  });

  const [photo, setPhoto] = useState<null | any>(null);

  // Устанавливаем значения формы после загрузки данных
  useEffect(() => {
    if (issueData?.data) {
      const issue = issueData.data;
      const photoData = issue.cover;
      const publishDate = issue.PublishDate;
      const newspaper = issue.newspaper;

      console.log("Setting form data:", issue);

      // Преобразуем дату в формат datetime-local (YYYY-MM-DDTHH:mm)
      const formattedDate = publishDate
        ? new Date(publishDate).toISOString().slice(0, 16)
        : "";

      // Устанавливаем значения формы
      form?.setFieldsValue({
        name: issue.name,
        status: issue.status,
        PublishDate: formattedDate,
        newspaper: {
          id: newspaper?.id,
        },
      });

      // Устанавливаем фото
      if (photoData) {
        const photoValue = {
          url: photoData.url,
          id: photoData.id,
          fileName: `${photoData.hash}${photoData.ext}`,
          type: photoData.mime?.split("/")[0],
          ext: photoData.ext?.replace(".", ""),
        };
        console.log("Setting photo:", photoValue);
        setPhoto(photoValue);
        form?.setFieldValue("cover", photoValue);
      }
    }
  }, [issueData, form]);

  if (isLoading) {
    return <div>Loading issue data...</div>;
  }

  if (error) {
    console.error("Load error:", error);
    return <div>Error loading issue: {error.message}</div>;
  }

  if (!issueData?.data) {
    return <div>Issue not found</div>;
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        onFinish={(values: any) => {
          console.log("Form values before submit:", values);

          // Форматируем данные для отправки
          const formattedValues = {
            ...values,
            newspaper: values.newspaper?.id || values.newspaper,
            PublishDate: values.PublishDate
              ? new Date(values.PublishDate).toISOString()
              : null,
            cover: values.cover?.id || values.cover,
          };

          console.log("Formatted values:", formattedValues);
          formProps.onFinish?.(formattedValues);
        }}
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
          label={"Status"}
          name={["status"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select placeholder="Choose status">
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="in_progress">In Progress</Select.Option>
            <Select.Option value="review">Review</Select.Option>
            <Select.Option value="ready">Ready</Select.Option>
            <Select.Option value="published">Published</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={"PublishDate"}
          name={["PublishDate"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item
          label={"Newspaper"}
          name={["newspaper", "id"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...newspaperSelectProps} placeholder="Choose a newspaper" />
        </Form.Item>
        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Issue cover</Typography.Text>}
            rules={[{ required: true, message: "Upload a photo" }]}
            style={{ margin: 0 }}
            name="cover"
          >
            <UploadImage
              value={photo}
              index={0}
              accepts=".png,.jpg,.jpeg"
              onChange={(value) => {
                setPhoto(value);
                form?.setFieldValue("cover", value);
              }}
            />
          </Form.Item>
          {photo && (
            <Popconfirm
              title="Delete the attachment item"
              description="Are you sure you want to delete this attachment?"
              onConfirm={() => {
                form?.setFieldValue("cover", null);
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
      </Form>
    </Edit>
  );
}
