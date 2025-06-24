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
        label="Name"
        rules={[
          { required: true, message: "Please enter the task name" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name={["assignee", "id"]} label="Assignee">
        <Select
          {...userSelectProps}
          allowClear
          placeholder="Select an assignee"
          // Принудительно очищаем значение при смене задачи
          key={`assignee-${task?.id || "new"}`}
        />
      </Form.Item>
      <Form.Item name="status" label="Status">
        <Select>
          <Select.Option value="TO_DO">To do</Select.Option>
          <Select.Option value="IN_PROGRESS">In progress</Select.Option>
          <Select.Option value="DONE">Done</Select.Option>
        </Select>
      </Form.Item>
      {task ? (
        // При редактировании показываем readonly поле
        <Form.Item name={["issue", "name"]} label="Issue">
          <Input disabled />
        </Form.Item>
      ) : (
        // При создании показываем селект
        <Form.Item
          name={["issue", "id"]}
          label="Issue"
          rules={[{ required: true }]}
        >
          <Select
            {...issueSelectProps}
            placeholder="Select an issue"
            key={`issue-new`}
          />
        </Form.Item>
      )}
      <Form.Item name="taskType" label="Task type">
        <Select
          placeholder="Select task type"
          onChange={handleTaskTypeChange}
        >
          <Select.Option value="WRITING">Writing</Select.Option>
          <Select.Option value="PHOTOGRAPHY">Photography</Select.Option>
          <Select.Option value="LAYOUT">Layout</Select.Option>
          <Select.Option value="EDITING">Editing</Select.Option>
          <Select.Option value="REVIEW">Review</Select.Option>
        </Select>
      </Form.Item>

      {/* Поля для выбора существующих статей/фото */}
      {(selectedTaskType === "WRITING" || selectedTaskType === "EDITING") && (
        <Form.Item
          name={["articles"]}
          label="Select an existing article (optional if already exists)"
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
            placeholder="Select an article or leave blank to create a new one"
            key={`articles-${task?.id || "new"}`}
          />
        </Form.Item>
      )}

      {selectedTaskType === "PHOTOGRAPHY" && (
        <Form.Item
          name={["photos"]}
          label="Select an existing photo (optional if already exists)"
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
            placeholder="Select a photo or leave blank to create a new one"
            key={`photos-${task?.id || "new"}`}
          />
        </Form.Item>
      )}
    </Form>
  );
};
