import { useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { KanbanTask } from "../types";

interface TaskFormProps {
  formProps: any;
  task: KanbanTask | null;
  onValuesChange: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  formProps,
  task,
  onValuesChange,
}) => {
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);

  const { selectProps: userSelectProps } = useSelect({
    resource: "users",
    optionLabel: "username",
    optionValue: "id",
    queryOptions: {
      // Отключаем кэширование для избежания конфликтов между формами
      staleTime: 0,
      cacheTime: 0,
    },
  });

  const { selectProps: issueSelectProps } = useSelect({
    resource: "issues",
    optionLabel: "name",
    optionValue: "id",
    queryOptions: {
      // Отключаем кэширование для избежания конфликтов между формами
      staleTime: 0,
      cacheTime: 0,
    },
  });

  // Селект для статей
  const { selectProps: articleSelectProps } = useSelect({
    resource: "articles",
    optionLabel: "name",
    optionValue: "id",
    queryOptions: {
      enabled: selectedTaskType === "WRITING" || selectedTaskType === "EDITING",
      staleTime: 0,
      cacheTime: 0,
    },
  });

  // Селект для фото
  const { selectProps: photoSelectProps } = useSelect({
    resource: "photos",
    optionLabel: "name",
    optionValue: "id",
    queryOptions: {
      enabled:
        selectedTaskType === "PHOTOGRAPHY" || selectedTaskType === "WRITING",
      staleTime: 0,
      cacheTime: 0,
    },
  });

  // Обработчик изменения типа задачи
  const handleTaskTypeChange = (value: string) => {
    setSelectedTaskType(value);
    // Очищаем выбранные статьи/фото при смене типа
    if (formProps.form) {
      formProps.form.setFieldValue(["articles"], undefined);
      formProps.form.setFieldValue(["photos"], undefined);
    }
  };

  // Логируем данные формы для отладки
  useEffect(() => {
    if (formProps.form) {
      const currentValues = formProps.form.getFieldsValue();
      console.log("TaskForm - текущие значения формы:", currentValues);
      console.log("TaskForm - task prop:", task);
    }
  }, [formProps.form, task]);

  // Устанавливаем начальные значения при загрузке задачи
  useEffect(() => {
    if (task) {
      setSelectedTaskType(task.taskType || null);
    } else {
      setSelectedTaskType(null);
    }
  }, [task]);

  return (
    <Form {...formProps} layout="vertical" onValuesChange={onValuesChange}>
      <Form.Item
        name="name"
        label="Название"
        rules={[
          { required: true, message: "Пожалуйста, введите название задачи" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Описание">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name={["assignee", "id"]} label="Исполнитель">
        <Select
          {...userSelectProps}
          allowClear
          placeholder="Выберите исполнителя"
          // Принудительно очищаем значение при смене задачи
          key={`assignee-${task?.id || "new"}`}
        />
      </Form.Item>
      <Form.Item name="status" label="Статус">
        <Select>
          <Select.Option value="TO_DO">К выполнению</Select.Option>
          <Select.Option value="IN_PROGRESS">В процессе</Select.Option>
          <Select.Option value="DONE">Готово</Select.Option>
        </Select>
      </Form.Item>
      {task ? (
        // При редактировании показываем readonly поле
        <Form.Item name={["issue", "name"]} label="Выпуск">
          <Input disabled />
        </Form.Item>
      ) : (
        // При создании показываем селект
        <Form.Item
          name={["issue", "id"]}
          label="Выпуск"
          rules={[{ required: true }]}
        >
          <Select
            {...issueSelectProps}
            placeholder="Выберите выпуск"
            key={`issue-new`}
          />
        </Form.Item>
      )}
      <Form.Item name="taskType" label="Тип задачи">
        <Select
          placeholder="Выберите тип задачи"
          onChange={handleTaskTypeChange}
        >
          <Select.Option value="WRITING">Написание</Select.Option>
          <Select.Option value="PHOTOGRAPHY">Фотография</Select.Option>
          <Select.Option value="LAYOUT">Верстка</Select.Option>
          <Select.Option value="EDITING">Редактирование</Select.Option>
          <Select.Option value="REVIEW">Проверка</Select.Option>
        </Select>
      </Form.Item>

      {/* Поля для выбора существующих статей/фото */}
      {(selectedTaskType === "WRITING" || selectedTaskType === "EDITING") && (
        <Form.Item
          name={["articles"]}
          label="Выберите существующую статью (необязательно, если уже существует)"
          getValueProps={(value) => {
            if (value && typeof value === "object" && value.id) {
              return { value: value.id };
            }
            return { value: value };
          }}
        >
          <Select
            {...articleSelectProps}
            allowClear
            placeholder="Выберите статью или оставьте пустым для создания новой"
            key={`articles-${task?.id || "new"}`}
          />
        </Form.Item>
      )}

      {selectedTaskType === "PHOTOGRAPHY" && (
        <Form.Item
          name={["photos"]}
          label="Выберите существующее фото (необязательно, если уже существует)"
          getValueProps={(value) => {
            if (value && typeof value === "object" && value.id) {
              return { value: value.id };
            }
            return { value: value };
          }}
        >
          <Select
            {...photoSelectProps}
            allowClear
            placeholder="Выберите фото или оставьте пустым для создания нового"
            key={`photos-${task?.id || "new"}`}
          />
        </Form.Item>
      )}
    </Form>
  );
};
