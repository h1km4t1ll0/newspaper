import { Image, Upload, UploadFile } from "antd";
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MEDIA_URL, TOKEN_KEY } from "@utility/constants";
import nookies from "nookies";

import {
  LoadingOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { UploadChangeParam } from "antd/es/upload";
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon";

export function getUploadUrl() {
  return `${MEDIA_URL}/api/upload`;
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

const UploadImage: FC<IProps> = memo(
  ({ value, onChange, setIndex, index, accepts }) => {
    const [fileImage, setFileImage] = useState<UploadInfo["file"] | null>(null);
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

        if (info.file.status !== "done") {
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
            type: info.file?.type?.split("/")[0],
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
      if (fileImage?.status === "uploading") {
        return (
          <div
            style={{
              padding: 0,
              borderRadius: 10,
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed black",
              cursor: "pointer",
            }}
          >
            <LoadingOutlined />
          </div>
        );
      }

      if (fileImage?.status === "error") {
        return (
          <div
            style={{
              padding: 0,
              borderRadius: 10,
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed black",
              cursor: "pointer",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed black",
              cursor: "pointer",
            }}
            onClick={handleUploadClick}
          >
            <PlusOutlined style={{ color: "black" }} />
          </div>
        );
      }

      if (
        value?.type !== "image" &&
        fileImage?.type?.split("/")[0] !== "image"
      ) {
        const ext = (value?.ext ||
          fileImage?.response?.[0]?.ext?.replace(
            ".",
            ""
          )) as DefaultExtensionType;

        const style = defaultStyles[ext]
          ? defaultStyles[ext]
          : defaultStyles["xlr"];

        return (
          <div
            style={{
              padding: 0,
              borderRadius: 10,
              width: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              if (setIndex) setIndex(index);
            }}
          >
            <FileIcon extension={ext} {...style} />
          </div>
        );
      }

      return (
        <Image
          src={`${MEDIA_URL}${imageName}`}
          style={{ objectFit: "cover", borderRadius: 10, cursor: "pointer" }}
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
        name="files"
        ref={uploadRef}
        accept={accepts ?? "*"}
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
          cursor: "pointer",
        }}
      >
        {uploadContent}
      </Upload>
    );
  }
);

UploadImage.displayName = "UploadImage";

export default UploadImage;
