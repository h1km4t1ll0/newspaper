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
  DatePicker,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(advancedFormat);

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

  const { selectProps: newspaperSelectProps } = useSelect({
    resource: "newspapers",
    optionLabel: "name",
    optionValue: "id",
  });

  const [photo, setPhoto] = useState<null | any>(null);

  const initialValues = useMemo(() => {
    if (!issueData?.data) {
      return formProps.initialValues;
    }

    const issue = issueData.data;
    const photoData = issue.cover;
    const publishDate = issue.PublishDate;
    const newspaper = issue.newspaper;

    console.log("Issue record:", issue);

    const publishDateValue = publishDate ? dayjs(publishDate) : undefined;

    // Подготавливаем данные для фото
    const photoValue = photoData
      ? {
          url: photoData.url,
          id: photoData.id,
          fileName: `${photoData.hash}${photoData.ext}`,
          type: photoData.mime?.split("/")[0],
          ext: photoData.ext?.replace(".", ""),
        }
      : null;

    console.log("Photo data:", photoValue);

    // Подготавливаем данные для газеты
    const newspaperId = newspaper?.id || null;
    console.log("Newspaper ID:", newspaperId);

    const values = {
      ...formProps.initialValues,
      name: issue.name,
      status: issue.status,
      PublishDate: publishDateValue,
      newspaper: {
        id: newspaperId,
      },
      cover: photoValue,
    };

    console.log("Initial values:", values);

    return values;
  }, [issueData, formProps.initialValues]);

  // Инициализация данных после загрузки
  useEffect(() => {
    if (issueData?.data && form) {
      const issue = issueData.data;
      const photoData = issue.cover;

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
        initialValues={initialValues}
        onFinish={(values: any) => {
          console.log("Form values before submit:", values);

          // Форматируем данные для отправки
          const formattedValues = {
            ...values,
            newspaper: values.newspaper?.id || values.newspaper,
            PublishDate: values.PublishDate
              ? values.PublishDate.toISOString()
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
          <Select placeholder="Select status">
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
          <DatePicker
            placeholder="Select date"
            style={{ width: '100%' }}
          />
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
          <Select {...newspaperSelectProps} placeholder="Select a newspaper" />
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
