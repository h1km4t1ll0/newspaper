"use client";

import { Show, TextField, ImageField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Descriptions, Tag, Row, Col } from "antd";
import MDEditor from "@uiw/react-md-editor";
import { MEDIA_URL } from "../../../../utility/constants";
import styled from "styled-components";

const { Title } = Typography;

const StyledDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    font-weight: bold !important;
    color: #292D30E0 !important;
  }
`;

const MarkdownContainer = styled.div`
  max-width: 300px;
  .w-md-editor {
    background-color: transparent !important;
    border: none !important;
  }
  .w-md-editor-content {
    background-color: transparent !important;
  }
`;

export default function BlogPostShow() {
  const { queryResult } = useShow({
    meta: {
      populate: {
        photos: {
          populate: "*"
        },
        issue: {
          populate: "*"
        }
      },
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Article Information" style={{ marginBottom: 16 }}>
            <StyledDescriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Tag color="blue">{record?.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                <TextField value={record?.name} />
              </Descriptions.Item>
              <Descriptions.Item label="Issue">
                {record?.issue ? (
                  <Tag color="green">{record.issue.name}</Tag>
                ) : (
                  <Tag color="red">Not specified</Tag>
                )}
              </Descriptions.Item>
            </StyledDescriptions>
          </Card>
          
          <Card title="Photos" style={{ marginBottom: 16 }}>
            {record?.photos && record.photos.length > 0 ? (
              <div>
                {record.photos.map((photo: any, index: number) => (
                  <div key={photo.id} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <ImageField
                      value={`${MEDIA_URL}${photo.photo.url}`}
                      title={photo.name}
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Tag color="orange">No photos</Tag>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Article Content" style={{ marginBottom: 16 }}>
            <MarkdownContainer>
              {record?.text ? (
                <MDEditor.Markdown
                  source={
                    typeof record.text === "string"
                      ? record.text
                      : JSON.stringify(record.text)
                  }
                  style={{
                    backgroundColor: "transparent",
                    padding: "10px",
                  }}
                />
              ) : (
                <Tag color="gray">No content</Tag>
              )}
            </MarkdownContainer>
          </Card>
        </Col>
      </Row>
    </Show>
  );
}
