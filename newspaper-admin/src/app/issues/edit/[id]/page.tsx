"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import {useMemo} from "react";
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(advancedFormat);



export default function BlogPostEdit() {
    const { formProps, saveButtonProps, query } = useForm({});
    const initialValues = useMemo(() => {
        if (!query?.data?.data) {
            return formProps.initialValues;
        }
        const publishDate = query.data.data?.PublishDate
            ? dayjs(query.data.data.PublishDate)
            : undefined;
        return {
            ...formProps.initialValues,
            PublishDate: publishDate,
        };
    }, [query, formProps.initialValues]);
    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps}
                  layout="vertical"
                  initialValues={initialValues}>
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
            </Form>
        </Edit>
    );
}
