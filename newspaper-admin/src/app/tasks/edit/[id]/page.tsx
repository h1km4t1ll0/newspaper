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
          label="Name"
          name={["name"]}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name={["description"]}
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Assignee" name={["assignee", "id"]}>
          <Select {...userSelectProps} />
        </Form.Item>
        <Form.Item label="Status" name={["status"]}>
          <Select>
            <Select.Option value="TO_DO">To do</Select.Option>
            <Select.Option value="IN_PROGRESS">In progress</Select.Option>
            <Select.Option value="DONE">Done</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Issue" name={["issue", "name"]}>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Task type" name={["taskType"]}>
          <Select>
            <Select.Option value="WRITING">Writing</Select.Option>
            <Select.Option value="PHOTOGRAPHY">Photography</Select.Option>
            <Select.Option value="LAYOUT">Layout</Select.Option>
            <Select.Option value="EDITING">Editing</Select.Option>
            <Select.Option value="REVIEW">Review</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Articles"
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
          label="Photos"
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
