"use client";
import React, {FC} from 'react';
import MDEditor from '@uiw/react-md-editor';
import { ChangeEvent } from 'react';
import { ContextStore } from '@uiw/react-md-editor';

interface IEditorProps {
  readOnly?: boolean,
  value?: string,
  onChange?: (value?: string, event?: ChangeEvent<HTMLTextAreaElement>, state?: ContextStore) => void,
  disableUndo?: boolean,
  onReady?: () => void
}

const ContentEditor: FC<IEditorProps> = (
  {
    readOnly = false,
    value,
    onChange = () => {},
    disableUndo,
    onReady = () => {},
  },
) => {
  return (
    <div data-color-mode="light">
      {readOnly ? (
        <MDEditor.Markdown 
          source={value} 
          style={{ 
            backgroundColor: 'transparent',
            padding: '10px'
          }}
        />
      ) : (
        <MDEditor
          value={value}
          onChange={onChange}
          preview="edit"
        />
      )}
    </div>
  );
};

export default ContentEditor;
