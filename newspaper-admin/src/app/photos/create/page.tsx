"use client";

import { Create, useForm } from "@refinedev/antd";
import {Form, Input, InputNumber, Space, Typography, Popconfirm, Tooltip, Button} from "antd";
import {useState} from "react";
import UploadImage from "@components/Upload";
import {DeleteOutlined} from "@ant-design/icons";


export default function BlogPostCreate() {
  const { formProps, saveButtonProps, form } = useForm({});
  const [photo, setPhoto] = useState<null>(form?.getFieldValue('photo'));

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
              label={"Width"}
              name={["width"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <InputNumber />
          </Form.Item>
          <Form.Item
              label={"Height"}
              name={["height"]}
              rules={[
                  {
                      required: true,
                  },
              ]}
          >
              <InputNumber />
          </Form.Item>
        <Space direction="vertical">
          <Form.Item
            label={<Typography.Text strong>Agent photo</Typography.Text>}
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
              label={"Photo"}
              name={["photo"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
          <Form.Item
              label={"Article"}
              name={["article"]}
              rules={[
                  {
                      required: false,
                  },
              ]}
          >
              <Input />
          </Form.Item>
      </Form>
    </Create>
  );
}
