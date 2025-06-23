import { Card, Tag, Typography } from "antd";
import React from "react";
import { useDrag } from "react-dnd";
import { KanbanTask } from "./types";

const { Text, Title } = Typography;

const getTaskTypeLabel = (taskType: string) => {
  const taskTypeLabels = {
    WRITING: "Написание",
    PHOTOGRAPHY: "Фотография",
    LAYOUT: "Верстка",
    EDITING: "Редактирование",
    REVIEW: "Проверка",
  };
  return taskTypeLabels[taskType as keyof typeof taskTypeLabels] || taskType;
};

interface TaskCardProps {
  task: KanbanTask;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const [{ isDragging }, drag] = useDrag<
    { id: number },
    void,
    { isDragging: boolean }
  >(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card
        hoverable
        size="small"
        style={{ marginBottom: 8, cursor: "pointer" }}
        onClick={onClick}
      >
        <Title level={5} style={{ marginBottom: 8 }}>
          {task.title}
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          {task.description}
        </Text>
        {task.issueName && (
          <Tag color="green" style={{ marginBottom: 4 }}>
            {task.issueName}
          </Tag>
        )}
        {task.taskType && (
          <Tag color="orange" style={{ marginBottom: 4 }}>
            {getTaskTypeLabel(task.taskType)}
          </Tag>
        )}
        <Tag color="blue">{task.assignee}</Tag>
      </Card>
    </div>
  );
};
