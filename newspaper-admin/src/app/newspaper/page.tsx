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
        <ContentEditor/>
    </div>
  );
}
