"use client";

import ContentEditor from "@components/editor-js/ContentEditor";
import {Col, Row} from "antd";
import {useState} from "react";
import {OutputData} from "@editorjs/editorjs";

export default function BlogPostList() {
  const [val, setVal] = useState<OutputData>();
  console.log(val)
  return (
    <div style={{width: '100%'}}>
      <Row gutter={16} style={{width: '100%'}}>
        <Col md={8} xs={24}>
          <ContentEditor value={val} onChange={(value) => setVal(value)}/>
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
