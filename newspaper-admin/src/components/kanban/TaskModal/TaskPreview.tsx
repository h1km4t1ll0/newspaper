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
    WRITING: "Writing",
    PHOTOGRAPHY: "Photography",
    LAYOUT: "Layout",
    EDITING: "Editing",
    REVIEW: "Review",
  };

  const statusLabels = {
    TO_DO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done",
  };

  const items = useMemo(
    () => [
      {
        key: "1",
        label: "Main information",
        children: (
          <div>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              <strong>Assignee:</strong> {task.assignee}
            </p>
            <p>
              <strong>Status:</strong> {statusLabels[task.status] || task.status}
            </p>
            {task.taskType && (
              <p>
                <strong>Task type:</strong>{" "}
                {taskTypeLabels[task.taskType] || task.taskType}
              </p>
            )}
            {task.issueName && (
              <p>
                <strong>Issue:</strong> {task.issueName}
              </p>
            )}
            {task.issueDate && (
              <p>
                <strong>Issue date:</strong>{" "}
                {new Date(task.issueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "2",
        label: "Articles",
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
        label: "Photos",
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
    [task, taskTypeLabels, statusLabels]
  );

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
};
