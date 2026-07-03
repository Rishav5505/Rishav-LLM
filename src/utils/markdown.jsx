import React from 'react';

/**
 * Parses a subset of Markdown containing bold, inline code, lists, and code blocks.
 * Returns React elements.
 */
export const renderMarkdown = (text) => {
  if (!text) return null;

  // Split by code blocks
  const parts = text.split(/```/g);
  
  return parts.map((part, index) => {
    // Odd indexes are code blocks
    if (index % 2 === 1) {
      const lines = part.split('\n');
      const firstLine = lines[0].trim();
      // Detect language identifier if present
      const language = /^[a-zA-Z0-9+#-]+$/.test(firstLine) ? firstLine : '';
      const codeContent = language ? lines.slice(1).join('\n') : part;

      return (
        <div key={`code-block-${index}`} className="my-4 font-mono text-sm border rounded-lg bg-[#0f1322] border-dark-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-dark-sidebar border-b border-dark-border text-xs text-gray-400 select-none">
            <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeContent.trim());
                // Simple state visual indicator could be added here, but direct copy is clean
              }}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Copy code"
            >
              Copy Code
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-gray-200">
            <code>{codeContent.trim()}</code>
          </pre>
        </div>
      );
    }

    // Process inline text and lines (even indexes)
    const lines = part.split('\n');
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        return <div key={`empty-${index}-${lineIndex}`} className="h-3" />;
      }
      
      // Bullets list
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = trimmedLine.substring(2);
        return (
          <ul key={`ul-${index}-${lineIndex}`} className="list-disc pl-6 my-1">
            <li className="text-gray-300 leading-relaxed">
              {formatInlineText(content)}
            </li>
          </ul>
        );
      }
      
      // Numbered lists
      const numberMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
      if (numberMatch) {
        const number = numberMatch[1];
        const content = numberMatch[2];
        return (
          <ol key={`ol-${index}-${lineIndex}`} className="list-decimal pl-6 my-1" start={number}>
            <li className="text-gray-300 leading-relaxed">
              {formatInlineText(content)}
            </li>
          </ol>
        );
      }

      // Standard text paragraphs
      return (
        <p key={`p-${index}-${lineIndex}`} className="my-2 text-gray-300 leading-relaxed">
          {formatInlineText(line)}
        </p>
      );
    });
  });
};

const formatInlineText = (text) => {
  if (!text) return '';
  
  // Split on bold, inline code, or markdown image patterns
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|!\[.*?\]\(.*?\))/g);

  return tokens.map((token, idx) => {
    // Image matches
    if (token.startsWith('![') && token.endsWith(')')) {
      const match = token.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const url = match[2];
        return (
          <div key={`img-${idx}`} className="my-4 relative rounded-2xl overflow-hidden border border-dark-border bg-[#0f1322]/80 max-w-lg group shadow-lg">
            <img
              src={url}
              alt={alt}
              loading="lazy"
              className="w-full object-contain max-h-[380px] transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {alt && (
              <div className="px-4 py-2.5 bg-dark-sidebar border-t border-dark-border text-xs text-gray-400 select-none font-medium">
                {alt}
              </div>
            )}
          </div>
        );
      }
    }
    // Bold matches
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={`bold-${idx}`} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Inline code matches
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={`icode-${idx}`}
          className="bg-dark-surface px-1.5 py-0.5 rounded text-purple-300 font-mono text-sm border border-dark-border"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
};
