import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Form, Button } from 'antd';
import { useForm } from "@refinedev/antd";
import { KanbanTask } from '../types';
import { TaskForm } from './TaskForm';
import { TaskPreview } from './TaskPreview';

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
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(isCreating);
    const [activeTab, setActiveTab] = useState('1');
    const [hasChanges, setHasChanges] = useState(false);

    const { formProps, saveButtonProps } = useForm({
        resource: "tasks",
        id: task?.id,
        action: "edit",
        onMutationSuccess: () => {
            onUpdate();
            setIsEditing(false);
            onClose();
        },
    });

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const values = await form.validateFields();
            // TODO: Implement save logic
            setIsEditing(false);
            setHasChanges(false);
            onUpdate();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }, [form, onUpdate]);

    const handleModalClose = useCallback(() => {
        if (isEditing && hasChanges) {
            Modal.confirm({
                title: 'Есть несохраненные изменения',
                content: 'Вы уверены, что хотите закрыть окно? Все несохраненные изменения будут потеряны.',
                okText: 'Да, закрыть',
                cancelText: 'Нет, остаться',
                onOk: () => {
                    if (isCreating) {
                        onClose();
                    } else {
                        setIsEditing(false);
                        form.resetFields();
                        setHasChanges(false);
                    }
                },
            });
        } else {
            if (isCreating) {
                onClose();
            } else {
                setIsEditing(false);
                form.resetFields();
                onClose();
            }
        }
    }, [isEditing, hasChanges, isCreating, onClose, form]);

    const handleFormChange = useCallback(() => {
        setHasChanges(true);
    }, []);

    const modalTitle = useMemo(() => 
        isCreating ? "Создание задачи" : (isEditing ? "Редактирование задачи" : "Просмотр задачи"),
        [isCreating, isEditing]
    );

    const modalFooter = useMemo(() => [
        <Button key="back" onClick={handleModalClose}>
            {isCreating ? "Отмена" : (isEditing ? "Отмена" : "Закрыть")}
        </Button>,
        !isCreating && !isEditing && (
            <Button key="edit" type="primary" onClick={handleEdit}>
                Редактировать
            </Button>
        ),
        isEditing && (
            <Button key="submit" type="primary" onClick={handleSave}>
                Сохранить
            </Button>
        ),
    ], [isCreating, isEditing, handleModalClose, handleEdit, handleSave]);

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
            {isEditing ? (
                <TaskForm
                    form={form}
                    task={task}
                    onValuesChange={handleFormChange}
                />
            ) : task && (
                <TaskPreview
                    task={task}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            )}
        </Modal>
    );
}; 