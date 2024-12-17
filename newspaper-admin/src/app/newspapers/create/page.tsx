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

                <Form.Item
                    label={"Layout"}
                    name={["layout"]}
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

            </Form>
        </Create>
    );
}
