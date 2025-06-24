//newspapers/show/[newspaperId]/create/page.tsx
"use client";

import UploadImage from "@components/Upload";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function BlogPostCreate() {
  // @ts-ignore
  const searchParams = useSearchParams();
  const router = useRouter();
  const newspaperId = searchParams.get("newspaperId"); // Extract newspaperId from query parameters
  const [cover, setCover] = useState<null | any>(null);

  console.log("newspaperId from URL:", newspaperId); // Для отладки

  const { form, formProps, saveButtonProps } = useForm({
    resource: "issues",
    action: "create",
    redirect: false, // Отключаем автоматический редирект
    onMutationSuccess: (data) => {
      console.log("Issue created successfully:", data);
      // Редиректим обратно к списку issues с newspaperId
      router.push(`/issues?newspaperId=${newspaperId}`);
    },
    onMutationError: (error) => {
      console.error("Error creating issue:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
    },
  });

  console.log("useForm result:", {
    formProps: !!formProps,
    saveButtonProps: !!saveButtonProps,
    onFinish: !!formProps.onFinish,
  });

  const { selectProps: newspaperSelectProps } = useSelect({
    resource: "newspapers",
    optionLabel: "name",
    optionValue: "id",
  });

  if (!newspaperId) {
    return <div>Error: No newspaper ID provided</div>;
  }

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        form={form}
        onFinish={(values: any) => {
          console.log("Form values before submit:", values);

          // Преобразуем значения для отправки в Strapi
          const transformedValues = {
            name: values.name,
            status: values.status,
            PublishDate: values.PublishDate
              ? values.PublishDate.toISOString()
              : null,
            newspaper: values.newspaper?.id || values.newspaper,
            cover: values.cover?.id || null,
          };

          console.log("Transformed values:", transformedValues);

          // Вызываем оригинальный обработчик
          return formProps.onFinish?.(transformedValues);
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
          initialValue="draft"
        >
          <Select placeholder="Select status" defaultValue="draft">
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="in_progress">In Progress</Select.Option>
            <Select.Option value="review">Review</Select.Option>
            <Select.Option value="ready">Ready</Select.Option>
            <Select.Option value="published">Published</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={"Cover"}
          name={["cover"]}
          rules={[
            {
              required: true,
              message: "Please upload a cover image",
            },
          ]}
        >
          <UploadImage
            value={cover}
            index={0}
            accepts=".png,.jpg,.jpeg"
            onChange={(value) => {
              console.log("Cover upload changed:", value);
              setCover(value);
              form?.setFieldValue("cover", value);
            }}
          />
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
          initialValue={newspaperId ? parseInt(newspaperId) : undefined}
        >
          <Select {...newspaperSelectProps} placeholder="Select a newspaper" />
        </Form.Item>
      </Form>
    </Create>
  );
}
