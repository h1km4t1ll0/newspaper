"use client";

import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Row, Col, Tag, Card, Descriptions } from "antd";
import { BannerPreview } from "@components/BannerPreview";
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
      populate: ["category"],
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Template Information" style={{ marginBottom: 16 }}>
            <StyledDescriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Tag color="blue">{record?.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Name of template">
                <TextField value={record?.name} />
              </Descriptions.Item>
              <Descriptions.Item label="Width (in columns)">
                <Tag color="cyan">{record?.widthInColumns} columns</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Height (in rows)">
                <Tag color="orange">{record?.heightInRows} rows</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total size">
                <Tag color="purple">
                  {record?.widthInColumns} × {record?.heightInRows}
                </Tag>
              </Descriptions.Item>
            </StyledDescriptions>
          </Card>
        </Col>
        <Col span={12}>
          <BannerPreview
            name={record?.name}
            widthInColumns={record?.widthInColumns}
            heightInRows={record?.heightInRows}
            title="Banner Preview"
          />
        </Col>
      </Row>
    </Show>
  );
}
