"use client";

import ContentEditor from "@components/editor-js/ContentEditor";
import {Col, Row} from "antd";

export default function BlogPostList() {
  return (
    <div style={{width: '100%'}}>
      <Row gutter={16} style={{width: '100%'}}>
        <Col md={8} xs={24}>
          <ContentEditor/>
        </Col>
        <Col md={8} xs={24}>
          <ContentEditor/>
        </Col>
        <Col md={8} xs={24}>
          <ContentEditor/>
        </Col>
      </Row>
    </div>
  );
}
