"use client";

import { DeleteOutlined } from "@ant-design/icons";
import UploadImage from "@components/Upload";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useEffect, useMemo, useState } from "react";
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(advancedFormat);

export default function BlogPostEdit() {
  const { formProps, saveButtonProps, query, form } = useForm({
    meta: {
      populate: ["photo", "ad_template"],
    },
    onMutationSuccess: (data) => {
      console.log("Advertisement updated successfully:", data);
    },
  });
  const [photo, setPhoto] = useState<any>(null);

  const { selectProps: templateSelectProps } = useSelect({
    resource: "advertisement-templates",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      mode: "off",
    },
  });

  // Инициализация данных после загрузки
  useEffect(() => {
    if (query?.data?.data && form) {
      const record = query.data.data;

      // Устанавливаем значения полей формы
      form.setFieldsValue({
        Header: record.Header,
        ad_template: record.ad_template?.id,
        DateFrom: record.DateFrom ? dayjs(record.DateFrom) : null,
        DateTo: record.DateTo ? dayjs(record.DateTo) : null,
      });

      // Устанавливаем фото только если оно есть в записи
      if (record.photo) {
        const photoData = {
          id: record.photo.id,
          url: record.photo.url,
          fileName: record.photo.name || `photo_${record.photo.id}`,
          type: "image",
        };
        setPhoto(photoData);
        form.setFieldValue("photo", photoData);
      } else {
        // Если фото нет в записи, очищаем состояние
        setPhoto(null);
        form.setFieldValue("photo", null);
      }
    }
  }, [query?.data?.data, form]);

  const initialValues = useMemo(() => {
    if (!query?.data?.data) {
      return formProps.initialValues;
    }

    const record = query.data.data;
    console.log("Advertisement record:", record); // Отладочная информация

    const dateFrom = record?.DateFrom ? dayjs(record.DateFrom) : undefined;
    const dateTo = record?.DateTo ? dayjs(record.DateTo) : undefined;

    // Подготавливаем данные для фото
    const photoData = record?.photo
      ? {
          id: record.photo.id,
          url: record.photo.url,
          fileName: record.photo.name || `photo_${record.photo.id}`,
          type: "image",
        }
      : null;

    console.log("Photo data:", photoData); // Отладочная информация

    // Подготавливаем данные для шаблона
    const templateId = record?.ad_template?.id || null;
    console.log("Template ID:", templateId); // Отладочная информация

    const values = {
      ...formProps.initialValues,
      Header: record?.Header,
      DateFrom: dateFrom,
      DateTo: dateTo,
      photo: photoData,
      ad_template: templateId,
    };

    console.log("Initial values:", values); // Отладочная информация

    return values;
  }, [query, formProps.initialValues]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label={"Название рекламы"}
          name={["Header"]}
          rules={[
            {
              required: true,
              message: "Введите название рекламы",
            },
          ]}
        >
          <Input placeholder="Название рекламного блока" />
        </Form.Item>

        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Фотография рекламы</Typography.Text>}
            rules={[{ required: true, message: "Загрузите фотографию" }]}
            style={{ margin: 0 }}
            name="photo"
          >
            <UploadImage
              value={photo}
              index={0}
              accepts=".png,.jpg,.jpeg"
              onChange={(value) => {
                setPhoto(value);
                form?.setFieldValue("photo", value);
              }}
            />
          </Form.Item>

          {photo && (
            <Popconfirm
              title="Удалить фотографию"
              description="Вы уверены, что хотите удалить эту фотографию?"
              onConfirm={() => {
                // Сначала очищаем состояние
                setPhoto(null);
                // Затем очищаем поле формы
                form?.setFieldValue("photo", null);
                // Принудительно обновляем форму
                form?.validateFields(["photo"]);
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Tooltip placement="top" title={"Удалить"}>
                <Button
                  style={{ width: 120 }}
                  size="small"
                  block
                  danger
                  icon={<DeleteOutlined />}
                >
                  Удалить
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
        </Space>

        <Form.Item
          label={"Шаблон рекламы"}
          name={["ad_template"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select
            placeholder="Выберите шаблон размера"
            allowClear
            {...templateSelectProps}
          />
        </Form.Item>

        <Form.Item
          label={"Дата начала показа"}
          name={["DateFrom"]}
          rules={[
            {
              required: true,
              message: "Выберите дату начала",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Дата начала показа"
          />
        </Form.Item>
        <Form.Item
          label={"Дата окончания показа"}
          name={["DateTo"]}
          rules={[
            {
              required: true,
              message: "Выберите дату окончания",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Дата окончания показа"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
}
