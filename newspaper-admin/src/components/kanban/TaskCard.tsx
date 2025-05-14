import React from 'react';
import { Card, Tag, Typography } from 'antd';
import { KanbanTask } from './types';
import { useDrag } from 'react-dnd';

const { Text, Title } = Typography;

interface TaskCardProps {
    task: KanbanTask;
    onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const [{ isDragging }, drag] = useDrag<{ id: number }, void, { isDragging: boolean }>(() => ({
        type: 'task',
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div ref={drag as unknown as React.RefObject<HTMLDivElement>} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Card
                hoverable
                size="small"
                style={{ marginBottom: 8, cursor: 'pointer' }}
                onClick={onClick}
            >
                <Title level={5} style={{ marginBottom: 8 }}>
                    {task.title}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    {task.description}
                </Text>
                <Tag color="blue">{task.assignee}</Tag>
            </Card>
        </div>
    );
}; 