import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { isArabicText } from '../utils/textUtils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  defaultDir?: 'auto' | 'rtl' | 'ltr';
}

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-md dir-ltr text-left">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 text-xs text-slate-400">
        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-300">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  defaultDir = 'auto',
}) => {
  if (!content) return null;

  return (
    <div className={`markdown-content prose max-w-none text-slate-700 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <h1
                dir={isAr ? 'rtl' : 'auto'}
                className={`text-2xl sm:text-3xl font-black text-slate-900 mt-8 mb-4 tracking-tight leading-tight ${isAr ? 'font-tajawal' : 'font-display'}`}
                {...props}
              >
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <h2
                dir={isAr ? 'rtl' : 'auto'}
                className={`text-xl sm:text-2xl font-black text-slate-900 mt-6 mb-3 tracking-tight border-b border-slate-100 pb-2 ${isAr ? 'font-tajawal' : 'font-display'}`}
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <h3
                dir={isAr ? 'rtl' : 'auto'}
                className={`text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5 ${isAr ? 'font-tajawal' : 'font-sans'}`}
                {...props}
              >
                {children}
              </h3>
            );
          },
          h4: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <h4
                dir={isAr ? 'rtl' : 'auto'}
                className={`text-base sm:text-lg font-bold text-slate-800 mt-4 mb-2 ${isAr ? 'font-tajawal' : 'font-sans'}`}
                {...props}
              >
                {children}
              </h4>
            );
          },
          p: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <p
                dir={isAr ? 'rtl' : 'auto'}
                className={`text-sm sm:text-base leading-relaxed text-slate-700 my-3.5 ${isAr ? 'font-tajawal text-right' : 'text-left'}`}
                {...props}
              >
                {children}
              </p>
            );
          },
          ul: ({ children, ...props }) => {
            return (
              <ul
                dir={defaultDir}
                className="my-4 space-y-2 ps-6 list-disc list-outside text-slate-700 text-sm sm:text-base"
                {...props}
              >
                {children}
              </ul>
            );
          },
          ol: ({ children, ...props }) => {
            return (
              <ol
                dir={defaultDir}
                className="my-4 space-y-2 ps-6 list-decimal list-outside text-slate-700 text-sm sm:text-base"
                {...props}
              >
                {children}
              </ol>
            );
          },
          li: ({ children, ...props }) => {
            const text = String(children);
            const isAr = isArabicText(text);
            return (
              <li
                dir={isAr ? 'rtl' : 'auto'}
                className={`leading-relaxed ${isAr ? 'font-tajawal text-right' : 'text-left'}`}
                {...props}
              >
                {children}
              </li>
            );
          },
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-slate-900" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-slate-800" {...props}>
              {children}
            </em>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              dir="auto"
              className="my-4 rounded-xl border-s-4 border-[#e21833] bg-slate-50 p-4 italic text-slate-700 shadow-xs"
              {...props}
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-t border-slate-200" />,
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#e21833] hover:underline"
              {...props}
            >
              <span>{children}</span>
              <ExternalLink className="h-3 w-3 inline opacity-70" />
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <CodeBlock className={className} {...props}>
                  {children}
                </CodeBlock>
              );
            }
            return (
              <code
                dir="ltr"
                className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs sm:text-[13px] font-semibold text-rose-600 border border-slate-200 inline-block align-middle my-0.5"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-slate-100 bg-white" {...props}>
              {children}
            </tbody>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 font-bold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
