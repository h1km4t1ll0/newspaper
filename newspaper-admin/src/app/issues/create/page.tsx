//newspapers/show/[newspaperId]/create/page.tsx
"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import {useParsed} from "@refinedev/core";
import {useSearchParams} from "next/navigation";

export default function BlogPostCreate() {
    // @ts-ignore
    const searchParams = useSearchParams();
    const newspaperId = searchParams.get("newspaperId"); // Extract newspaperId from query parameters

    const { formProps, saveButtonProps } = useForm({});

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label={"Name"}
                    name={["name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"Status"}
                    name={["status"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"PublishDate"}
                    name={["PublishDate"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <DatePicker />
                </Form.Item>
                {/*Hidden Newspaper Field*/}
                <Form.Item name={["newspaper"]} hidden initialValue={newspaperId}>
                    <Input type={"hidden"}/>
                </Form.Item>

            </Form>
        </Create>
    );
}