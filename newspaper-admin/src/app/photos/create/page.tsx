"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import {Form, Input, Select, InputNumber, Space, Typography, Popconfirm, Tooltip, Button} from "antd";

import React, {
  FC,
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
  memo,
} from 'react';
import { Upload, UploadFile, Image } from 'antd';

import nookies from 'nookies';
import { TOKEN_KEY } from '@utility/constants';

import { UploadChangeParam } from 'antd/es/upload';
import {
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';

export function getUploadUrl() {
  return `http://127.0.0.1:1338/api/upload`;
}

interface IProps {
  value?: any;
  onChange?: (value: any) => any;
  index: number;
  setIndex?: React.Dispatch<React.SetStateAction<number>>;
  accepts?: string;
}

export interface FileResult {
  ext: string;
  hash: string;
  type: string;
  url: string;
  id: string;
}

export type UploadInfo = UploadChangeParam<UploadFile<FileResult[]>>;

const UPLOAD_URL = getUploadUrl();

const UploadImage: FC<IProps> = memo(({ value, onChange, setIndex, index, accepts }) => {
  const [fileImage, setFileImage] = useState<UploadInfo['file'] | null>(null);
  const [imageName, setImageName] = useState<string | null>(value?.url);
  useEffect(() => setImageName(value?.url), [value?.url]);

  const uploadRef = useRef<typeof Upload>(null);

  const [token] = useState(() => {
    const cookies = nookies.get();

    return cookies[TOKEN_KEY];
  });

  const handleChange = useCallback(
    (info: UploadInfo) => {
      setFileImage(info.file);

      if (info.file.status !== 'done') {
        onChange?.(null);
        return;
      }

      const response = info.file.response?.[0];

      if (!response) {
        onChange?.(null);
        return;
      }

      const newImageName = `${response.hash}${response.ext}`;

      if (newImageName && onChange) {
        onChange({
          url: response.url,
          id: response.id,
          fileName: newImageName,
          type: info.file?.type?.split('/')[0],
        });
        setImageName(response.url);
      }
    },
    [setFileImage, onChange]
  );

  const headers = useMemo(
    () => ({
      authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const handleUploadClick = () => {
    if ((uploadRef.current as any)?.upload?.uploader?.fileInput) {
      (uploadRef.current as any).upload.uploader.fileInput.disabled = false;
      (uploadRef.current as any).upload.uploader.fileInput.click();
      (uploadRef.current as any).upload.uploader.fileInput.disabled = true;
    }
  };

  const uploadContent = useMemo(() => {
    if (fileImage?.status === 'uploading') {
      return (
        <div
          style={{
            padding: 0,
            borderRadius: 10,
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed black',
            cursor: 'pointer',
          }}
        >
          <LoadingOutlined />
        </div>
      );
    }

    if (fileImage?.status === 'error') {
      return (
        <div
          style={{
            padding: 0,
            borderRadius: 10,
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed black',
            cursor: 'pointer',
          }}
        >
          <WarningOutlined />
        </div>
      );
    }

    if (!imageName) {
      return (
        <div
          style={{
            padding: 0,
            borderRadius: 10,
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed black',
            cursor: 'pointer',
          }}
          onClick={handleUploadClick}
        >
          <PlusOutlined style={{ color: 'black' }} />
        </div>
      );
    }

    if (value?.type !== 'image' && fileImage?.type?.split('/')[0] !== 'image') {
      const ext = (value?.ext ||
        fileImage?.response?.[0]?.ext?.replace(
          '.',
          ''
        )) as DefaultExtensionType;

      const style = defaultStyles[ext]
        ? defaultStyles[ext]
        : defaultStyles['xlr'];

      return (
        <div
          style={{
            padding: 0,
            borderRadius: 10,
            width: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (setIndex) setIndex(index);
          }}
        >
          <FileIcon extension={ext} {...style} />
        </div>
      );
    }

    console.log(imageName, 'imageName')
    return (
      <Image
        src={'http://127.0.0.1:1338' + imageName}
        style={{ objectFit: 'cover', borderRadius: 10, cursor: 'pointer' }}
        width={120}
        height={120}
        preview={false}
        alt={imageName}
        onClick={() => {
          if (setIndex) setIndex(index);
        }}
      />
    );
  }, [fileImage, value, imageName, setIndex, index]);

  return (
    <Upload
      name='files'
      ref={uploadRef}
      accept={accepts ?? '*'}
      action={UPLOAD_URL}
      headers={headers}
      onChange={handleChange}
      showUploadList={false}
      disabled={true}
      maxCount={1}
      style={{
        padding: 0,
        borderRadius: 10,
        width: 120,
        height: 120,
        cursor: 'pointer',
      }}
    >
      {uploadContent}
    </Upload>
  );
});


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
