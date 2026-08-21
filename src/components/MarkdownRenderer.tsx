import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content leading-relaxed font-sans text-slate-200 ${className}`}>
      <Markdown
        components={{
          strong: ({ children }) => (
            <strong className="font-bold text-white tracking-wide">
              {children}
            </strong>
          ),
          b: ({ children }) => (
            <b className="font-bold text-white tracking-wide">
              {children}
            </b>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-200">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 my-2.5 space-y-1.5 marker:text-cyan-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 my-2.5 space-y-1.5 marker:text-cyan-400 marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5 text-slate-200">
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-white mt-3.5 mb-1.5 flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-cyan-200 mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = codeClass && codeClass.includes('language-');
            if (isBlock) {
              return (
                <code className="block font-mono text-[11px] text-cyan-300">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-slate-900/90 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px] font-medium inline-block my-0.5">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 my-2 overflow-x-auto text-[11px] font-mono text-slate-300">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-cyan-400 pl-3 py-1 my-2 text-slate-300 italic bg-cyan-950/20 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-slate-800/80 my-3" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
