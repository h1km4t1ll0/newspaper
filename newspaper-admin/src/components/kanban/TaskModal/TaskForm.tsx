import React from 'react';
import { Form, Input, Select } from 'antd';
import { useSelect } from "@refinedev/antd";
import { KanbanTask } from '../types';

interface TaskFormProps {
    form: any;
    task: KanbanTask | null;
    onValuesChange: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ form, task, onValuesChange }) => {
    const { selectProps: userSelectProps } = useSelect({
        resource: "users",
        optionLabel: "username",
        optionValue: "id",
    });

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={task || {}}
            onValuesChange={onValuesChange}
        >
            <Form.Item
                name="title"
                label="Название"
                rules={[{ required: true, message: 'Пожалуйста, введите название задачи' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="description"
                label="Описание"
            >
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
                name="assignee"
                label="Исполнитель"
            >
                <Select {...userSelectProps} />
            </Form.Item>
            <Form.Item
                name="status"
                label="Статус"
            >
                <Select>
                    <Select.Option value="TO_DO">К выполнению</Select.Option>
                    <Select.Option value="IN_PROGRESS">В процессе</Select.Option>
                    <Select.Option value="DONE">Готово</Select.Option>
                </Select>
            </Form.Item>
        </Form>
    );
}; 