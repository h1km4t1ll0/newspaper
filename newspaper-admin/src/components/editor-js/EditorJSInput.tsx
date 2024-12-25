"use client";

import { OutputData } from '@editorjs/editorjs';
import { Card } from 'antd';
import {FC} from "react";
import ContentEditor from "@components/editor-js/ContentEditor";

interface IProps {
  value?: OutputData,
  onChange?: (value: OutputData) => void,
}

const EditorJSInput: FC<IProps> = (
  {
    value,
    onChange,
  },
) => (
  <Card>
    <ContentEditor
      value={value}
      onChange={onChange}
      disableUndo
    />
  </Card>
);


export default EditorJSInput;