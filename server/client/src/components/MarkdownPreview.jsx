import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../markdown/markdownComponents.jsx";

export function MarkdownPreview({ content }) {
  return (
    <div className="prose prose-slate max-w-none min-w-0 prose-headings:scroll-mt-4 prose-pre:bg-slate-900 prose-pre:text-slate-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
