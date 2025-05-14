import React from 'react';
import { Card, Typography } from 'antd';
import { KanbanColumn, KanbanTask } from './types';
import { TaskCard } from './TaskCard';
import { useDrop } from 'react-dnd';

const { Title } = Typography;

interface ColumnProps {
    column: KanbanColumn;
    onTaskClick?: (task: KanbanTask) => void;
    onDrop?: (taskId: number, newStatus: string) => void;
}

export const Column: React.FC<ColumnProps> = ({ column, onTaskClick, onDrop }) => {
    const [{ isOver }, drop] = useDrop<{ id: number }, void, { isOver: boolean }>(() => ({
        accept: 'task',
        drop: (item) => {
            onDrop?.(item.id, column.id);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div ref={drop as unknown as React.RefObject<HTMLDivElement>} style={{ opacity: isOver ? 0.5 : 1 }}>
            <Card
                style={{
                    width: 300,
                    margin: '0 8px',
                    backgroundColor: '#f5f5f5',
                    height: '100%',
                }}
                styles={{
                    body: { padding: '12px', height: '100%' }
                }}
            >
                <Title level={4} style={{ marginBottom: 16 }}>
                    {column.title}
                </Title>
                <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {column.tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
}; 