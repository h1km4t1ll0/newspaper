import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Form, Input, Select } from "antd";

const TaskEdit = () => {
  const { formProps, saveButtonProps } = useForm({
    meta: {
      populate: ["articles", "photos", "assignee", "issue"],
    },
  });

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
        <Form.Item label="Исполнитель" name={["assignee", "id"]}>
          <Select {...userSelectProps} />
        </Form.Item>
        <Form.Item label="Статус" name={["status"]}>
          <Select>
            <Select.Option value="TO_DO">К выполнению</Select.Option>
            <Select.Option value="IN_PROGRESS">В процессе</Select.Option>
            <Select.Option value="DONE">Готово</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Выпуск" name={["issue", "name"]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Тип задачи" name={["taskType"]}>
          <Select>
            <Select.Option value="WRITING">Написание</Select.Option>
            <Select.Option value="PHOTOGRAPHY">Фотография</Select.Option>
            <Select.Option value="LAYOUT">Верстка</Select.Option>
            <Select.Option value="EDITING">Редактирование</Select.Option>
            <Select.Option value="REVIEW">Проверка</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Статьи"
          name={["articles"]}
          getValueProps={(value) => {
            if (Array.isArray(value)) {
              return { value: value.map((article) => article.id || article) };
            }
            return { value: value };
          }}
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
          getValueProps={(value) => {
            if (Array.isArray(value)) {
              return { value: value.map((photo) => photo.id || photo) };
            }
            return { value: value };
          }}
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
