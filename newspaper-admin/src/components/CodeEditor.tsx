import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const AceEditor = dynamic(() => import('react-ace'), { ssr: false });

interface CodeEditorProps {
  value: any;
  onChange: (val: string) => void;
  height?: string;
  width?: string;
}

const CodeEditor = ({ value, onChange, height = '200px', width = '100%' }: CodeEditorProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('ace-builds/src-noconflict/ace');
      require('ace-builds/src-noconflict/mode-json');
      require('ace-builds/src-noconflict/theme-github');
    }
  }, []);

  // Гарантируем, что value — строка
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);

  return (
    <AceEditor
      mode="json"
      theme="github"
      width={width}
      height={height}
      value={stringValue}
      onChange={onChange}
      setOptions={{ useWorker: false }}
      editorProps={{ $blockScrolling: true }}
    />
  );
};

export default CodeEditor; 