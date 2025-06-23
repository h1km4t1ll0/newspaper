"use client";

import CustomSelect from "@components/custom/custom-select";
import { Edit, useForm } from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import { Form, Input } from "antd";
import { useEffect, useState } from "react";

export default function BlogPostEdit() {
  const { formProps, saveButtonProps, form, queryResult } = useForm({
    meta: {
      populate: ["photos"],
    },
  });
  const [text, setText] = useState("");

  // Отслеживаем загрузку данных и обновляем текст ТОЛЬКО при изменении данных
  useEffect(() => {
    if (queryResult?.data?.data) {
      const articleData = queryResult.data.data;
      const initialText = articleData.text || "";
      setText(initialText);
      // Также устанавливаем значение в форму
      form.setFieldValue("text", initialText);
    }
  }, [queryResult?.data]); // Убираем form из зависимостей

  // Упрощенная функция сохранения
  const handleSave = () => {
    // Просто сохраняем текущий текст
    form.setFieldValue("text", text);

    // Вызываем оригинальное сохранение
    setTimeout(() => {
      if (saveButtonProps.onClick) {
        saveButtonProps.onClick();
      }
    }, 50);
  };

  // Переопределяем сохранение формы
  const customSaveButtonProps = {
    ...saveButtonProps,
    onClick: handleSave,
  };

  return (
    <Edit saveButtonProps={customSaveButtonProps}>
      <Form {...formProps} layout="vertical">
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
          label={"Photos"}
          name={["photos"]}
          rules={[
            {
              required: false,
            },
          ]}
          getValueProps={(value) => {
            // Преобразуем данные из Strapi в формат для селекта
            if (Array.isArray(value)) {
              return { value: value.map((photo) => photo.id || photo) };
            }
            return { value: value };
          }}
        >
          <CustomSelect
            resource="photos"
            mode="multiple"
            optionLabel="name"
            optionValue="id"
            placeholder="Select photos"
          />
        </Form.Item>
        <Form.Item
          label={"Text"}
          name={["text"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div data-color-mode="light">
            <MDEditor
              preview="live"
              value={text}
              onChange={(value) => {
                setText(value || "");
                form.setFieldValue("text", value || "");
              }}
              data-color-mode="light"
            />
          </div>
        </Form.Item>
      </Form>
    </Edit>
  );
}
