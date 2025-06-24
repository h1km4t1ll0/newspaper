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
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Assignee" name="assignee">
          <Select {...userSelectProps} />
        </Form.Item>
        <Form.Item label="Status" name="status" initialValue="TO_DO">
          <Select>
            <Select.Option value="TO_DO">To do</Select.Option>
            <Select.Option value="IN_PROGRESS">In progress</Select.Option>
            <Select.Option value="DONE">Done</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Issue" name="issue" rules={[{ required: true }]}>
          <Select {...issueSelectProps} />
        </Form.Item>
        <Form.Item
          label="Task type"
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
            <Select.Option value="WRITING">Writing</Select.Option>
            <Select.Option value="PHOTOGRAPHY">Photography</Select.Option>
            <Select.Option value="LAYOUT">Layout</Select.Option>
            <Select.Option value="EDITING">Editing</Select.Option>
            <Select.Option value="REVIEW">Review</Select.Option>
          </Select>
        </Form.Item>

        {selectedTaskType === "WRITING" && (
          <Form.Item
            label="Issue (optional)"
            name="articles"
            extra="If not selected, a new article and photo will be created automatically."
          >
            <Select
              allowClear
              placeholder="Select an article or leave blank to create a new one"
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
            label="Photo (optional)"
            name="photos"
            extra="If not selected, a new article and photo will be created automatically."
          >
            <Select
              allowClear
              placeholder="Select a photo or leave blank to create a new one"
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
              <Form.Item label="Articles" name="articles">
                <Select mode="multiple" allowClear>
                  {articlesData?.data.map((article: any) => (
                    <Select.Option key={article.id} value={article.id}>
                      {article.attributes.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Photos" name="photos">
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
