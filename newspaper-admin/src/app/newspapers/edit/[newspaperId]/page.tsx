"use client";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import {Button, Form, Input, Popconfirm, Select, Space, Tooltip, Typography} from "antd";
import {useMemo, useState} from "react";
import UploadImage from "@components/Upload";
import {DeleteOutlined} from "@ant-design/icons";

export default function BlogPostEdit() {
  const { form, formProps, query, saveButtonProps } = useForm<any>({
    meta: {
      populate: {
        photo: '*',
      },
      fields: '*',
    },
  });

  const initialValues = useMemo(() => {
    const photo = query?.data?.data?.photo;
    return {
      ...query?.data?.data,
      photo: {
        url: photo?.url,
        id: photo?.id,
        fileName: `${photo?.hash}${photo?.ext}`,
        type: photo?.mime?.split('/')[0],
        ext: photo?.ext.replace('.', ''),
      },
    }
  }, [query?.data?.data?.photo]);

  const [photo, setPhoto] = useState<null | any>(initialValues.photo);

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form
              {...formProps}
              layout="vertical"
              form={form}
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
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"Issues"}
                    name={["issues"]}
                    rules={[
                        {
                            required: false,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
              <Space direction="vertical">
                <Form.Item
                  label={<Typography.Text strong>Cover photo</Typography.Text>}
                  rules={[{ required: true, message: 'Upload a photo' }]}
                  style={{ margin: 0 }}
                  name='photo'
                >
                  <UploadImage value={photo} index={0} accepts=".png,.jpg,.jpeg" onChange={(value) => {
                    setPhoto(value);
                    form?.setFieldValue('photo', value);
                  }}/>
                </Form.Item>
                {photo && (<Popconfirm
                  title='Delete the attachment item'
                  description='Are you sure you want to delete this attachment?'
                  onConfirm={() => {
                    form?.setFieldValue('photo', null);
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
        </Edit>
    );
}
