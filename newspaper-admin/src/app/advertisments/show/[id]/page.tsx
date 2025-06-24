"use client";

import { DateField, ImageField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Divider, Space, Typography, Card, Descriptions, Tag, Row, Col } from "antd";
import { MEDIA_URL } from "../../../../utility/constants";
import styled from "styled-components";

const { Title } = Typography;

const StyledDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    font-weight: bold !important;
    color: #292D30E0 !important;
  }
`;

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
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Advertisement Information" style={{ marginBottom: 16 }}>
            <StyledDescriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Tag color="blue">{record?.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Name of AD">
                <TextField value={record?.Header} />
              </Descriptions.Item>
              <Descriptions.Item label="AD Template">
                {record?.ad_template ? (
                  <div>
                    <Tag color="green">{record.ad_template.name}</Tag>

                    <Tag color="purple" style={{ marginTop: '4px' }}>
                      {record.ad_template.widthInColumns} × {record.ad_template.heightInRows}
                    </Tag>
                  </div>
                ) : (
                  <Tag color="red">Not specified</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Date From">
                <DateField value={record?.DateFrom} />
              </Descriptions.Item>
              <Descriptions.Item label="Date To">
                <DateField value={record?.DateTo} />
              </Descriptions.Item>
            </StyledDescriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Photo" style={{ marginBottom: 16 }}>
            {record?.photo ? (
              <ImageField
                value={`${MEDIA_URL}${record.photo.url}`}
                title={record.photo.name}
                width={300}
              />
            ) : (
              <Tag color="orange">No photo uploaded</Tag>
            )}
          </Card>
        </Col>
      </Row>
    </Show>
  );
}
