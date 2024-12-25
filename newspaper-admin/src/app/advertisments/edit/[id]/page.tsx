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
        const dateFrom = query.data.data?.DateFrom
            ? dayjs(query.data.data.DateFrom)
            : undefined;
        const dateTo = query.data.data?.DateTo
            ? dayjs(query.data.data.DateTo)
            : undefined;
        return {
            ...formProps.initialValues,
            DateFrom: dateFrom,
            DateTo: dateTo,
        };
    }, [query, formProps.initialValues]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={"Date From"}
          name={["DateFrom"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label={"DateTo"}
          name={["DateTo"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <DatePicker />
        </Form.Item>
          <Form.Item
              label={"Header"}
              name={["Header"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"AD Template"}
              name={["ad_template"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
      </Form>
    </Edit>
  );
}
