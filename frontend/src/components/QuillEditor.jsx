import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = () => {
  const [value, setValue] = useState('');

  const handleChange = (content, delta, source, editor) => {
    setValue(content);
  };

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder="Compose an epic..."
      />
    </div>
  );
};

export default QuillEditor;
