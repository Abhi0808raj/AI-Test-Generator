import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ 
  title, 
  value, 
  onChange, 
  language = 'javascript', 
  readOnly = false,
  height = "300px" 
}) => {
  return (
    <div className="editor-section">
      <div className="editor-header">
        <h3>{title}</h3>
      </div>
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readOnly
        }}
      />
    </div>
  );
};

export default CodeEditor;
