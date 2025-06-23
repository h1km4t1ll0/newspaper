import { Create, useForm, useSelect } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Form, Input, Select } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TaskCreate = () => {
  const { formProps, saveButtonProps, form } = useForm();
  const searchParams = useSearchParams();
  const issueId = searchParams.get("issueId");

  const [selectedTaskType, setSelectedTaskType] = useState<string>("");

  const { selectProps: userSelectProps } = useSelect({
    resource: "users",
    optionLabel: "username",
    optionValue: "id",
  });

  const { data: articlesData } = useList({
    resource: "articles",
    meta: {
      populate: ["photos"],
    },
  });

  const { data: photosData } = useList({
    resource: "photos",
    meta: {
      populate: ["article"],
    },
  });

  const { selectProps: issueSelectProps } = useSelect({
    resource: "issues",
    optionLabel: "name",
    optionValue: "id",
  });

  // Автозаполнение выпуска если передан issueId
  useEffect(() => {
    if (issueId) {
      form?.setFieldsValue({
        issue: parseInt(issueId),
      });
    }
  }, [issueId, form]);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Название" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Описание"
          name="description"
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Исполнитель" name="assignee">
          <Select {...userSelectProps} />
        </Form.Item>
        <Form.Item label="Статус" name="status" initialValue="TO_DO">
          <Select>
            <Select.Option value="TO_DO">К выполнению</Select.Option>
            <Select.Option value="IN_PROGRESS">В процессе</Select.Option>
            <Select.Option value="DONE">Готово</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Выпуск" name="issue" rules={[{ required: true }]}>
          <Select {...issueSelectProps} />
        </Form.Item>
        <Form.Item
          label="Тип задачи"
          name="taskType"
          rules={[{ required: true }]}
        >
          <Select
            onChange={(value) => {
              setSelectedTaskType(value);
              // Очищаем поля статей и фото при смене типа задачи
              form?.setFieldsValue({
                articles: undefined,
                photos: undefined,
              });
            }}
          >
            <Select.Option value="WRITING">Написание</Select.Option>
            <Select.Option value="PHOTOGRAPHY">Фотография</Select.Option>
            <Select.Option value="LAYOUT">Верстка</Select.Option>
            <Select.Option value="EDITING">Редактирование</Select.Option>
            <Select.Option value="REVIEW">Проверка</Select.Option>
          </Select>
        </Form.Item>

        {selectedTaskType === "WRITING" && (
          <Form.Item
            label="Статья (необязательно)"
            name="articles"
            extra="Если не выбрана, будет создана новая статья и фото автоматически"
          >
            <Select
              allowClear
              placeholder="Выберите статью или оставьте пустым для создания новой"
            >
              {articlesData?.data.map((article: any) => (
                <Select.Option key={article.id} value={article.id}>
                  {article.attributes.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedTaskType === "PHOTOGRAPHY" && (
          <Form.Item
            label="Фотография (необязательно)"
            name="photos"
            extra="Если не выбрана, будет создана новая статья и фото автоматически"
          >
            <Select
              allowClear
              placeholder="Выберите фото или оставьте пустым для создания нового"
            >
              {photosData?.data.map((photo: any) => (
                <Select.Option key={photo.id} value={photo.id}>
                  {photo.attributes.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedTaskType &&
          !["WRITING", "PHOTOGRAPHY"].includes(selectedTaskType) && (
            <>
              <Form.Item label="Статьи" name="articles">
                <Select mode="multiple" allowClear>
                  {articlesData?.data.map((article: any) => (
                    <Select.Option key={article.id} value={article.id}>
                      {article.attributes.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Фотографии" name="photos">
                <Select mode="multiple" allowClear>
                  {photosData?.data.map((photo: any) => (
                    <Select.Option key={photo.id} value={photo.id}>
                      {photo.attributes.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
      </Form>
    </Create>
  );
};

export default TaskCreate;
