"use client";

import MDEditor from '@uiw/react-md-editor';
import { Card } from 'antd';
import {FC} from "react";
import { ChangeEvent } from 'react';
import { ContextStore } from '@uiw/react-md-editor';

interface IProps {
  value?: string,
  onChange?: (value?: string, event?: ChangeEvent<HTMLTextAreaElement>, state?: ContextStore) => void,
}

const EditorJSInput: FC<IProps> = (
  {
    value,
    onChange,
  },
) => (
  <Card>
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        preview="edit"
      />
    </div>
  </Card>
);

export default EditorJSInput;