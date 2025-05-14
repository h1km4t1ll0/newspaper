import React, { useMemo, useState, useCallback } from 'react';
import { Row, Card, Spin, Button, message, Input, Select, Space, Layout } from 'antd';
import { useList, useUpdate } from "@refinedev/core";
import { KanbanColumn, Task, KanbanTask } from './types';
import { Column } from './Column';
import { TaskModal } from './TaskModal/index';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileTextOutlined,
    PictureOutlined,
    BookOutlined,
    LayoutOutlined,
    AppstoreOutlined,
    FileOutlined,
} from '@ant-design/icons';

const { Search } = Input;
const { Sider, Content } = Layout;

const COLUMNS: KanbanColumn[] = [
    {
        id: 'TO_DO',
        title: 'К выполнению',
        tasks: [],
    },
    {
        id: 'IN_PROGRESS',
        title: 'В процессе',
        tasks: [],
    },
    {
        id: 'DONE',
        title: 'Готово',
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

    const { data, isLoading, refetch } = useList<Task>({
        resource: "tasks",
        pagination: {
            pageSize: 100,
        },
        filters,
        meta: {
            populate: [
                "assignee",
                "articles",
                "photos"
            ]
        }
    });

    const { mutate: updateTask } = useUpdate();

    const tasks = useMemo(() => data?.data || [], [data]);

    const filteredTasks = useMemo(() => {
        return tasks.map((task) => ({
            id: task.id,
            title: task.name,
            description: task.description,
            status: task.status,
            assignee: task.assignee?.data?.attributes?.username || 'Не назначен',
            articles: task.articles.map(article => ({
                id: article.id,
                name: article.name,
                text: article.text,
            })),
            photos: task.photos.map(photo => ({
                id: photo.id,
                name: photo.name,
                url: photo.url,
            })),
        }));
    }, [tasks]);

    const columns = useMemo(() => {
        return COLUMNS.map((column) => ({
            ...column,
            tasks: filteredTasks.filter((task) => task.status === column.id),
        }));
    }, [filteredTasks]);

    const assignees = useMemo(() => {
        const uniqueAssignees = new Set(filteredTasks.map(task => task.assignee));
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

    const handleDrop = useCallback(async (taskId: number, newStatus: string) => {
        try {
            await updateTask({
                resource: "tasks",
                id: taskId,
                values: {
                    status: newStatus,
                },
            });
            message.success('Статус задачи обновлен');
            await refetch();
        } catch (error) {
            message.error('Ошибка при обновлении статуса задачи');
        }
    }, [updateTask, refetch]);

    const handleSearch = useCallback((value: string) => {
        if (value) {
            setFilters([
                {
                    operator: 'or',
                    value: [
                        { field: "name", operator: "contains", value },
                        { field: "description", operator: "contains", value },
                    ]
                }
            ]);
        } else {
            setFilters([]);
        }
    }, []);

    const handleAssigneeFilter = useCallback((value: string | null) => {
        if (value) {
            setFilters(prev => [
                ...prev.filter(f => f.field !== 'assignee'),
                {
                    field: 'assignee.data.attributes.username',
                    operator: 'eq',
                    value,
                }
            ]);
        } else {
            setFilters(prev => prev.filter(f => f.field !== 'assignee'));
        }
    }, []);

    const handleStatusFilter = useCallback((value: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | null) => {
        if (value) {
            setFilters(prev => [
                ...prev.filter(f => f.field !== 'status'),
                {
                    field: 'status',
                    operator: 'eq',
                    value,
                }
            ]);
        } else {
            setFilters(prev => prev.filter(f => f.field !== 'status'));
        }
    }, []);

    const assigneeOptions = useMemo(() => 
        assignees.map(assignee => ({
            label: assignee,
            value: assignee,
        })), [assignees]);

    const statusOptions = useMemo(() => [
        { label: 'К выполнению', value: 'TO_DO' },
        { label: 'В процессе', value: 'IN_PROGRESS' },
        { label: 'Готово', value: 'DONE' },
    ], []);

    const modalProps = useMemo(() => ({
        task: selectedTask,
        visible: isModalVisible,
        onClose: handleModalClose,
        onUpdate: handleTaskUpdate,
        isCreating,
    }), [selectedTask, isModalVisible, handleModalClose, handleTaskUpdate, isCreating]);

    if (isLoading) {
        return <Spin size="large" />;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Card 
                title="Задачи" 
                style={{ margin: '20px' }}
                extra={
                    !createButtonProps?.hidden && (
                        <Button type="primary" onClick={handleCreateTask}>
                            Создать задачу
                        </Button>
                    )
                }
            >
                <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <Search
                        placeholder="Поиск по названию или описанию"
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Space>
                        <Select
                            placeholder="Фильтр по исполнителю"
                            allowClear
                            style={{ width: 200 }}
                            onChange={handleAssigneeFilter}
                            options={assigneeOptions}
                        />
                        <Select
                            placeholder="Фильтр по статусу"
                            allowClear
                            style={{ width: 200 }}
                            onChange={handleStatusFilter}
                            options={statusOptions}
                        />
                    </Space>
                </Space>
                <Row style={{ overflowX: 'auto', padding: '8px 0' }}>
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