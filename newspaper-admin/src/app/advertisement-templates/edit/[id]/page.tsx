"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber } from "antd";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Название шаблона"}
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Введите название шаблона",
            },
          ]}
        >
          <Input placeholder="Например: Баннер 2x3, Квадрат 1x1" />
        </Form.Item>
        <Form.Item
          label={"Ширина (в колонках)"}
          name={["widthInColumns"]}
          rules={[
            {
              required: true,
              message: "Укажите ширину в колонках",
            },
          ]}
        >
          <InputNumber min={1} max={12} placeholder="Количество колонок" />
        </Form.Item>
        <Form.Item
          label={"Высота (в строках)"}
          name={["heightInRows"]}
          rules={[
            {
              required: true,
              message: "Укажите высоту в строках",
            },
          ]}
        >
          <InputNumber min={1} max={20} placeholder="Количество строк" />
        </Form.Item>
      </Form>
    </Edit>
  );
}
