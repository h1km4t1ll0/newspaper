import React from 'react';
import { useForm } from "@refinedev/antd";
import { Edit, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { useList } from "@refinedev/core";

const TaskEdit = () => {
    const { formProps, saveButtonProps } = useForm();

    const { selectProps: userSelectProps } = useSelect({
        resource: "users",
        optionLabel: "username",
        optionValue: "id",
    });

    const { data: articlesData } = useList({
        resource: "articles",
    });

    const { data: photosData } = useList({
        resource: "photos",
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Название"
                    name={["name"]}
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Описание"
                    name={["description"]}
                    rules={[{ required: true }]}
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Исполнитель"
                    name={["assignee", "id"]}
                >
                    <Select {...userSelectProps} />
                </Form.Item>
                <Form.Item
                    label="Статус"
                    name={["status"]}
                >
                    <Select>
                        <Select.Option value="To Do">К выполнению</Select.Option>
                        <Select.Option value="In Progress">В процессе</Select.Option>
                        <Select.Option value="Done">Готово</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Статьи"
                    name={["articles"]}
                >
                    <Select mode="multiple">
                        {articlesData?.data.map((article: any) => (
                            <Select.Option key={article.id} value={article.id}>
                                {article.attributes.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Фотографии"
                    name={["photos"]}
                >
                    <Select mode="multiple">
                        {photosData?.data.map((photo: any) => (
                            <Select.Option key={photo.id} value={photo.id}>
                                {photo.attributes.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Edit>
    );
};

export default TaskEdit; 