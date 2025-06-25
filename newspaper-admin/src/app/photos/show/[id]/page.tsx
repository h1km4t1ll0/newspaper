"use client";

import { EditButton, ImageField, ListButton, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Card, Descriptions, Tag, Row, Col } from "antd";
import MDEditor from "@uiw/react-md-editor";
import { MEDIA_URL } from "@utility/constants";
import styled from "styled-components";
import { useContext } from "react";
import { RoleContext } from "@app/RefineApp";

const { Title } = Typography;

const StyledDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    font-weight: bold !important;
    color: #292D30E0 !important;
  }
`;

const MarkdownContainer = styled.div`
  max-width: 300px;
  max-height: 200px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
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
        photo: {
          populate: "*"
        },
        article: {
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
  const role = useContext(RoleContext);

  return (
    <Show 
    isLoading={isLoading}
    headerButtons={[
      <ListButton key="list" />,
      ...(role === "Authenticated" || role === "Photographer" 
        ? [<EditButton key="edit" type="primary" />] 
        : []
      ),
    ]}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Photo Information" style={{ marginBottom: 16 }}>
            <StyledDescriptions column={1} size="small">
              <Descriptions.Item label="ID">
                <Tag color="blue">{record?.id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                <TextField value={record?.name} />
              </Descriptions.Item>
              <Descriptions.Item label="Width">
                <Tag color="cyan">{record?.width}px</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Height">
                <Tag color="orange">{record?.height}px</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Issue">
                {record?.issue ? (
                  <Tag color="green">{record.issue.name}</Tag>
                ) : (
                  <Tag color="red">Not specified</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Article">
                {record?.article ? (
                  <Tag color="purple">{record.article.name}</Tag>
                ) : (
                  <Tag color="gray">Not specified</Tag>
                )}
              </Descriptions.Item>
            </StyledDescriptions>
          </Card>
          
          <Card title="Photo" style={{ marginBottom: 16 }}>
            {record?.photo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ImageField
                  value={`${MEDIA_URL}${record.photo.url}`}
                  title={record.photo.name}
                  width={300}
                  height={300}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                  {record.photo.name}
                </div>
              </div>
            ) : (
              <Tag color="orange">No photo uploaded</Tag>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Article Content" style={{ marginBottom: 16 }}>
            <MarkdownContainer>
              {record?.article?.text ? (
                <MDEditor.Markdown
                  source={
                    typeof record.article.text === "string"
                      ? record.article.text
                      : JSON.stringify(record.article.text)
                  }
                  style={{
                    backgroundColor: "transparent",
                    padding: "10px",
                  }}
                />
              ) : (
                <Tag color="gray">No article content</Tag>
              )}
            </MarkdownContainer>
          </Card>
        </Col>
      </Row>
    </Show>
  );
}
