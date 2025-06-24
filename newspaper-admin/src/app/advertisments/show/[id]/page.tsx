"use client";

import { DateField, ImageField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Divider, Space, Typography } from "antd";
import { MEDIA_URL } from "../../../../utility/constants";

const { Title } = Typography;

export default function BlogPostShow() {
  const { queryResult } = useShow({
    meta: {
      populate: ["ad_template", "photo"],
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={5}>{"ID"}</Title>
          <TextField value={record?.id} />
        </div>

        <div>
          <Title level={5}>{"Name of AD"}</Title>
          <TextField value={record?.Header} />
        </div>

        <div>
          <Title level={5}>{"Photo"}</Title>
          {record?.photo && (
            <ImageField
              value={`${MEDIA_URL}${record.photo.url}`}
              title={record.photo.name}
              width={200}
            />
          )}
        </div>

        <div>
          <Title level={5}>{"AD Template"}</Title>
          {record?.ad_template ? (
            <div>
              <TextField value={record.ad_template.name} />
              <br />
              <small>
                Размер: {record.ad_template.widthInColumns} ×{" "}
                {record.ad_template.heightInRows}
              </small>
            </div>
          ) : (
            <TextField value="Not specified" />
          )}
        </div>

        <Divider />

        <div>
          <Title level={5}>{"Duration"}</Title>
          <div>
            <strong>С:</strong> <DateField value={record?.DateFrom} />
          </div>
          <div>
            <strong>По:</strong> <DateField value={record?.DateTo} />
          </div>
        </div>
      </Space>
    </Show>
  );
}
