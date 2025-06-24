import { DeleteOutlined } from "@ant-design/icons";
import { useForm } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import { Button, Modal, Popconfirm } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KanbanTask } from "../types";
import { TaskForm } from "./TaskForm";
import { TaskPreview } from "./TaskPreview";

interface TaskModalProps {
  task: KanbanTask | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isCreating?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  visible,
  onClose,
  onUpdate,
  isCreating = false,
}) => {
  const [isEditing, setIsEditing] = useState(isCreating);
  const [activeTab, setActiveTab] = useState("1");
  const [hasChanges, setHasChanges] = useState(false);

  const { formProps, saveButtonProps } = useForm({
    resource: "tasks",
    id: task?.id,
    action: isCreating ? "create" : "edit",
    meta: {
      populate: ["assignee", "issue", "articles", "photos"],
    },
    onMutationSuccess: async (data) => {
      console.log("TaskModal - saved successfully:", data);
      await onUpdate();
      setIsEditing(false);
      onClose();
    },
    onMutationError: (error) => {
      console.error("TaskModal - saving error:", error);
    },
  });

  const { mutate: deleteTask } = useDelete();

  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (visible) {
      setIsEditing(isCreating);
      setHasChanges(false);
      setActiveTab("1");

      // Очищаем форму только при создании новой задачи
      if (formProps.form && isCreating) {
        setTimeout(() => {
          if (formProps.form) {
            console.log("TaskModal - clearing the form to create a new task");
            formProps.form.resetFields();
          }
        }, 10);
      }
    }
  }, [visible, isCreating, task?.id, formProps.form]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await formProps.form?.validateFields();
      const values = formProps.form?.getFieldsValue() || {};
      console.log("TaskModal - source form data:", values);

      // Преобразуем данные для отправки в Strapi
      const processedValues = {
        ...values,
        assignee: (values as any).assignee?.id || null,
        issue: (values as any).issue?.id || null,
        // Обрабатываем одиночные значения статей и фото
        articles: (values as any).articles || null,
        photos: (values as any).photos || null,
      };

      console.log(
        "TaskModal - обработанные данные для сохранения:",
        processedValues
      );
      await formProps.onFinish?.(processedValues);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  }, [formProps]);

  const handleModalClose = useCallback(() => {
    if (isEditing && hasChanges) {
      Modal.confirm({
        title: "There are unsaved changes",
        content:
          "Are you sure you want to close this window? All unsaved changes will be lost.",
        okText: "Yes, close",
        cancelText: "No, cancel",
        onOk: () => {
          setIsEditing(false);
          setHasChanges(false);
          onClose();
        },
      });
    } else {
      setIsEditing(false);
      setHasChanges(false);
      onClose();
    }
  }, [isEditing, hasChanges, onClose]);

  const handleFormChange = useCallback(() => {
    setHasChanges(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (task?.id) {
      deleteTask(
        {
          resource: "tasks",
          id: task.id,
        },
        {
          onSuccess: async () => {
            console.log("TaskModal - задача успешно удалена");
            await onUpdate();
            onClose();
          },
          onError: (error: any) => {
            console.error("TaskModal - ошибка удаления:", error);
          },
        }
      );
    }
  }, [deleteTask, task?.id, onUpdate, onClose]);

  const modalTitle = useMemo(
    () =>
      isCreating
        ? "Create a task"
        : isEditing
        ? "Editing a task"
        : "View a task",
    [isCreating, isEditing]
  );

  const modalFooter = useMemo(
    () => [
      <Button key="back" onClick={handleModalClose}>
        {isCreating ? "Cancel" : isEditing ? "Cancel" : "Close"}
      </Button>,
      !isCreating && !isEditing && (
        <Button key="edit" type="primary" onClick={handleEdit}>
           Edit
        </Button>
      ),
      !isCreating && task?.id && (
        <Popconfirm
          key="delete"
          title="Deleting a task"
          description="Are you sure you want to delete this task?"
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
      (isEditing || isCreating) && (
        <Button key="submit" type="primary" onClick={handleSave}>
          Save
        </Button>
      ),
    ],
    [
      isCreating,
      isEditing,
      handleModalClose,
      handleEdit,
      handleSave,
      handleDelete,
      task?.id,
    ]
  );

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleModalClose}
      footer={modalFooter}
      width={800}
      maskClosable={true}
      destroyOnClose
    >
      {isEditing || isCreating ? (
        <TaskForm
          key={`task-form-${task?.id || "new"}-${
            isCreating ? "create" : "edit"
          }-${visible}`}
          formProps={formProps}
          task={task}
          onValuesChange={handleFormChange}
        />
      ) : (
        task && (
          <TaskPreview
            task={task}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )
      )}
    </Modal>
  );
};
