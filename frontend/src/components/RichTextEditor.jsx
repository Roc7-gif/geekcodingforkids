import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'code-block'
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style>{`
        .rich-text-editor .ql-toolbar {
          background: #1e293b;
          border-color: #334155 !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-container {
          background: #0f172a;
          border-color: #334155 !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 200px;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
        }
        .rich-text-editor .ql-stroke {
          stroke: #94a3b8;
        }
        .rich-text-editor .ql-fill {
          fill: #94a3b8;
        }
        .rich-text-editor .ql-picker {
          color: #94a3b8;
        }
        .rich-text-editor .ql-active .ql-stroke {
          stroke: #00e5ff;
        }
        .rich-text-editor .ql-active .ql-fill {
          fill: #00e5ff;
        }
        .rich-text-editor .ql-active {
          color: #00e5ff !important;
        }
      `}</style>
    </div>
  );
}
