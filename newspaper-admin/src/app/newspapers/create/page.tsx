"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Upload, Button, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function CreateNewspaperPage() {
    const { formProps, saveButtonProps } = useForm({});

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name={["name"]}
                    rules={[
                        {
                            required: true,
                            message: "Please enter the newspaper name!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Cover"
                    name={["cover"]}
                    rules={[
                        {
                            required: false,
                            message: "Please upload the cover image!",
                        },
                    ]}
                >
                    <Upload
                        name="cover"
                        listType="picture"
                        beforeUpload={() => false} // Prevent automatic upload
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Upload Cover</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label="Column Count"
                    name={["columnCount"]}
                    rules={[
                        {
                            required: true,
                            message: "Please enter the number of columns!",
                        },
                    ]}
                >
                    <InputNumber min={1} max={10} />
                </Form.Item>

                <Form.Item
                    label="Font Family"
                    name={["fontFamily"]}
                    rules={[
                        {
                            required: true,
                            message: "Please enter the font family!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Height"
                    name={["height"]}
                    rules={[
                        {
                            required: true,
                            message: "Please enter the height of the newspaper!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Issues"
                    name={["issues"]}
                    rules={[
                        {
                            required: false,
                            message: "Please enter the issues of the newspaper!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

            </Form>
        </Create>
    );
}
