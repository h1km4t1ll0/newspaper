"use client";

import {Edit, useForm} from "@refinedev/antd";
import {Button, Form, Input, Popconfirm, Space, Tooltip, Typography} from "antd";
import {useMemo, useState} from "react";
import UploadImage from "@components/Upload";
import {DeleteOutlined} from "@ant-design/icons";

export default function BlogPostEdit() {
  const {form, formProps, query, saveButtonProps} = useForm<any>({
    resource: "issues",
    meta: {
      populate: {
        cover: '*',
      },
      fields: '*',
      // fields: ['cover', 'name', 'status', 'newspaper', 'PublishDate'],
    },
  });

  const initialValues = useMemo(() => {
    const photo = query?.data?.data?.cover;
    return {
      ...query?.data?.data,
      cover: {
        url: photo?.url,
        id: photo?.id,
        fileName: `${photo?.hash}${photo?.ext}`,
        type: photo?.mime?.split('/')[0],
        ext: photo?.ext.replace('.', ''),
      },
    }
  }, [query?.data?.data?.cover]);

  const [photo, setPhoto] = useState<null | any>(initialValues.cover);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          label={"Name"}
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input/>
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
          <Input/>
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
          <Input/>
        </Form.Item>
        <Form.Item
          label={"Newspaper"}
          name={["newspaper"]}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input/>
        </Form.Item>
        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Issue cover</Typography.Text>}
            rules={[{ required: true, message: 'Upload a photo' }]}
            style={{ margin: 0 }}
            name='cover'
          >
            <UploadImage value={photo} index={0} accepts=".png,.jpg,.jpeg" onChange={(value) => {
              setPhoto(value);
              form?.setFieldValue('cover', value);
            }}/>
          </Form.Item>
          {photo && (<Popconfirm
            title='Delete the attachment item'
            description='Are you sure you want to delete this attachment?'
            onConfirm={() => {
              form?.setFieldValue('cover', null);
              setPhoto(null);
            }}
            okText='Yes'
            cancelText='No'
          >
            <Tooltip placement='top' title={'Delete'}>
              <Button
                style={{width: 120,}}
                size='small'
                block
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Tooltip>
          </Popconfirm>)}
        </Space>
      </Form>
    </Edit>
  );
}
