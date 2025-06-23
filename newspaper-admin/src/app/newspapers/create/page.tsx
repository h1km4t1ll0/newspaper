"use client";

import UploadImage from "@components/Upload";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { useState } from "react";

export default function CreateNewspaperPage() {
  const { form, formProps, saveButtonProps } = useForm({
    onMutationSuccess: (data) => {
      console.log("Newspaper created successfully:", data);
    },
    onMutationError: (error) => {
      console.error("Error creating newspaper:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
    },
  });
  const [cover, setCover] = useState<null | any>(null);

  const { selectProps: layoutSelectProps } = useSelect({
    resource: "layouts",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        form={form}
        onFinish={(values: any) => {
          console.log("Form values before submit:", values);

          // Форматируем данные для отправки (для photo поля отправляем только ID)
          const formattedValues = {
            ...values,
            photo: values.photo?.id || values.photo,
          };

          console.log("Formatted values:", formattedValues);
          formProps.onFinish?.(formattedValues);
        }}
      >
        <Form.Item
          label="Name"
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Please enter the newspaper name!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Cover"
          name={["photo"]}
          rules={[
            {
              required: false,
              message: "Please upload the cover image!",
            },
          ]}
        >
          <UploadImage
            value={cover}
            index={0}
            accepts=".png,.jpg,.jpeg"
            onChange={(value) => {
              console.log("Photo upload changed:", value);
              setCover(value);
              form?.setFieldValue("photo", value);
            }}
          />
        </Form.Item>

        <Form.Item
          label={"Layout"}
          name={["layout", "id"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select {...layoutSelectProps} placeholder="Выберите макет" />
        </Form.Item>
      </Form>
    </Create>
  );
}
