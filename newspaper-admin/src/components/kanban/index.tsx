import { useList, useUpdate } from "@refinedev/core";
import {
  Button,
  Card,
  Input,
  Layout,
  message,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal/index";
import { KanbanColumn, KanbanTask, Task } from "./types";

const { Search } = Input;
const { Sider, Content } = Layout;

const COLUMNS: KanbanColumn[] = [
  {
    id: "TO_DO",
    title: "To do",
    tasks: [],
  },
  {
    id: "IN_PROGRESS",
    title: "In progress",
    tasks: [],
  },
  {
    id: "DONE",
    title: "Done",
    tasks: [],
  },
];

interface KanbanProps {
  createButtonProps?: {
    hidden?: boolean;
  };
}

export const Kanban: React.FC<KanbanProps> = ({ createButtonProps }) => {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedNewspaper, setSelectedNewspaper] = useState<string | null>(
    null
  );

  const { data, isLoading, refetch } = useList<Task>({
    resource: "tasks",
    pagination: {
      pageSize: 100,
    },
    filters,
    meta: {
      populate: ["assignee", "articles", "photos", "issue", "issue.newspaper"],
    },
  });

  // Получаем список газет
  const { data: newspapersData } = useList({
    resource: "newspapers",
    pagination: {
      pageSize: 100,
    },
  });

  // Получаем список выпусков (фильтруем по выбранной газете)
  const { data: issuesData } = useList({
    resource: "issues",
    pagination: {
      pageSize: 100,
    },
    filters: selectedNewspaper
      ? [
          {
            field: "newspaper.name",
            operator: "eq",
            value: selectedNewspaper,
          },
        ]
      : [],
    meta: {
      populate: ["newspaper"],
    },
  });

  // Логируем фильтры для отладки
  useEffect(() => {
    console.log("Kanban - текущие фильтры:", filters);
  }, [filters]);

  const { mutate: updateTask } = useUpdate();

  const tasks = useMemo(() => data?.data || [], [data]);

  const filteredTasks = useMemo(() => {
    console.log("Raw tasks from API:", tasks);

    const result: KanbanTask[] = [];

    tasks.forEach((task) => {
      console.log("Processing task:", task);
      console.log("Task assignee:", task.assignee);
      console.log("Task issue:", task.issue);

      const assigneeUsername = task.assignee?.username;
      const assigneeId = task.assignee?.id;
      const issueName = task.issue?.name;
      const issueId = task.issue?.id;

      console.log("Mapped assignee:", assigneeUsername, "ID:", assigneeId);
      console.log("Mapped issue:", issueName, "ID:", issueId);

      result.push({
        id: task.id,
        title: task.name,
        description: task.description,
        status: task.status,
        taskType: task.taskType,
        assignee: assigneeUsername || "Not specified",
        assigneeId: assigneeId || undefined,
        issueName: issueName || undefined,
        issueId: issueId || undefined,
        issueDate: task.issue?.PublishDate || undefined,
        articles:
          task.articles?.map((article) => ({
            id: article.id,
            name: article.name || "",
            text: article.text || "",
          })) || [],
        photos:
          task.photos?.map((photo) => ({
            id: photo.id,
            name: photo.name || "",
            url: photo.url || "",
          })) || [],
      });
    });

    console.log("Filtered tasks:", result);
    return result;
  }, [tasks]);

  const columns = useMemo(() => {
    const result = COLUMNS.map((column) => ({
      ...column,
      tasks: filteredTasks.filter((task) => task.status === column.id),
    }));
    console.log("Columns with tasks:", result);
    return result;
  }, [filteredTasks]);

  const assignees = useMemo(() => {
    const uniqueAssignees = new Set(filteredTasks.map((task) => task.assignee));
    return Array.from(uniqueAssignees);
  }, [filteredTasks]);

  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
    setIsModalVisible(true);
    setIsCreating(false);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedTask(null);
    setIsCreating(false);
  }, []);

  const handleTaskUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setIsModalVisible(true);
    setIsCreating(true);
  }, []);

  const handleDrop = useCallback(
    async (taskId: number, newStatus: string) => {
      try {
        await updateTask({
          resource: "tasks",
          id: taskId,
          values: {
            status: newStatus,
          },
          meta: {
            populate: ["assignee", "issue", "articles", "photos"],
          },
        });
        message.success("Task status updated");
        await refetch();
      } catch (error) {
        message.error("Error updating task status");
      }
    },
    [updateTask, refetch]
  );

  const handleSearch = useCallback((value: string) => {
    if (value) {
      setFilters((prev) => [
        ...prev.filter((f) => f.operator !== "or"),
        {
          operator: "or",
          value: [
            { field: "name", operator: "contains", value },
            { field: "description", operator: "contains", value },
          ],
        },
      ]);
    } else {
      setFilters((prev) => prev.filter((f) => f.operator !== "or"));
    }
  }, []);

  const handleAssigneeFilter = useCallback((value: string | null) => {
    if (value) {
      setFilters((prev) => [
        ...prev.filter((f) => !f.field?.includes("assignee")),
        {
          field: "assignee.username",
          operator: "eq",
          value,
        },
      ]);
    } else {
      setFilters((prev) => prev.filter((f) => !f.field?.includes("assignee")));
    }
  }, []);

  const handleStatusFilter = useCallback(
    (value: "TO_DO" | "IN_PROGRESS" | "DONE" | null) => {
      if (value) {
        setFilters((prev) => [
          ...prev.filter((f) => f.field !== "status"),
          {
            field: "status",
            operator: "eq",
            value,
          },
        ]);
      } else {
        setFilters((prev) => prev.filter((f) => f.field !== "status"));
      }
    },
    []
  );

  const handleNewspaperFilter = useCallback((value: string | null) => {
    setSelectedNewspaper(value);
    if (value) {
      setFilters((prev) => [
        ...prev.filter((f) => !f.field?.includes("issue.newspaper")),
        {
          field: "issue.newspaper.name",
          operator: "eq",
          value,
        },
      ]);
    } else {
      setFilters((prev) =>
        prev.filter((f) => !f.field?.includes("issue.newspaper"))
      );
    }
  }, []);

  const handleIssueFilter = useCallback((value: string | null) => {
    if (value) {
      setFilters((prev) => [
        ...prev.filter(
          (f) =>
            !f.field?.includes("issue") || f.field?.includes("issue.newspaper")
        ),
        {
          field: "issue.name",
          operator: "eq",
          value,
        },
      ]);
    } else {
      setFilters((prev) =>
        prev.filter(
          (f) =>
            !f.field?.includes("issue") || f.field?.includes("issue.newspaper")
        )
      );
    }
  }, []);

  const assigneeOptions = useMemo(
    () =>
      assignees.map((assignee) => ({
        label: assignee,
        value: assignee,
      })),
    [assignees]
  );

  const statusOptions = useMemo(
    () => [
      { label: "To do", value: "TO_DO" },
      { label: "In progress", value: "IN_PROGRESS" },
      { label: "Done", value: "DONE" },
    ],
    []
  );

  const newspaperOptions = useMemo(
    () =>
      (newspapersData?.data || []).map((newspaper: any) => ({
        label: newspaper.name,
        value: newspaper.name,
      })),
    [newspapersData]
  );

  const issueOptions = useMemo(
    () =>
      (issuesData?.data || []).map((issue: any) => ({
        label: issue.name,
        value: issue.name,
      })),
    [issuesData]
  );

  const modalProps = useMemo(
    () => ({
      task: selectedTask,
      visible: isModalVisible,
      onClose: handleModalClose,
      onUpdate: handleTaskUpdate,
      isCreating,
    }),
    [
      selectedTask,
      isModalVisible,
      handleModalClose,
      handleTaskUpdate,
      isCreating,
    ]
  );

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card
        title="Tasks"
        style={{ margin: "20px" }}
        extra={
          !createButtonProps?.hidden && (
            <Button type="primary" onClick={handleCreateTask}>
              Create a task
            </Button>
          )
        }
      >
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Search
            placeholder="Search by title or description"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Space>
            <Select
              placeholder="Filter by assignee"
              allowClear
              style={{ width: 200 }}
              onChange={handleAssigneeFilter}
              options={assigneeOptions}
            />
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={handleStatusFilter}
              options={statusOptions}
            />
            <Select
              placeholder="Filter by newspaper"
              allowClear
              style={{ width: 200 }}
              onChange={handleNewspaperFilter}
              options={newspaperOptions}
            />
            {selectedNewspaper && (
              <Select
                placeholder="Filter by issue"
                allowClear
                style={{ width: 200 }}
                onChange={handleIssueFilter}
                options={issueOptions}
              />
            )}
          </Space>
        </Space>
        <Row style={{ overflowX: "auto", padding: "8px 0" }}>
          <AnimatePresence>
            {columns.map((column) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Column
                  column={column}
                  onTaskClick={handleTaskClick}
                  onDrop={handleDrop}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Row>
        <TaskModal {...modalProps} />
      </Card>
    </DndProvider>
  );
};
