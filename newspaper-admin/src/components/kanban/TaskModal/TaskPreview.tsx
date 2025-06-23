import MDEditor from "@uiw/react-md-editor";
import { Card, Image, Tabs } from "antd";
import React, { useMemo } from "react";
import { KanbanTask } from "../types";

interface TaskPreviewProps {
  task: KanbanTask;
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({
  task,
  activeTab,
  onTabChange,
}) => {
  console.log("TaskPreview - task data:", task);

  const taskTypeLabels = {
    WRITING: "Написание",
    PHOTOGRAPHY: "Фотография",
    LAYOUT: "Верстка",
    EDITING: "Редактирование",
    REVIEW: "Проверка",
  };

  const items = useMemo(
    () => [
      {
        key: "1",
        label: "Основная информация",
        children: (
          <div>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              <strong>Исполнитель:</strong> {task.assignee}
            </p>
            <p>
              <strong>Статус:</strong> {task.status}
            </p>
            {task.taskType && (
              <p>
                <strong>Тип задачи:</strong>{" "}
                {taskTypeLabels[task.taskType] || task.taskType}
              </p>
            )}
            {task.issueName && (
              <p>
                <strong>Выпуск:</strong> {task.issueName}
              </p>
            )}
            {task.issueDate && (
              <p>
                <strong>Дата выпуска:</strong>{" "}
                {new Date(task.issueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "2",
        label: "Статьи",
        children: (
          <div>
            {task.articles?.map((article) => (
              <Card key={article.id} style={{ marginBottom: 16 }}>
                <h4>{article.name}</h4>
                <MDEditor.Markdown source={article.text} />
              </Card>
            ))}
          </div>
        ),
      },
      {
        key: "3",
        label: "Фотографии",
        children: (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {task.photos?.map((photo) => (
              <Card
                key={photo.id}
                cover={<Image src={photo.url} alt={photo.name} />}
              >
                <Card.Meta title={photo.name} />
              </Card>
            ))}
          </div>
        ),
      },
    ],
    [task, taskTypeLabels]
  );

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
};
