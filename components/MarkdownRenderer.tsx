import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split by newlines to handle paragraphs and lists
  const lines = content.split('\n');

  return (
    <div className="text-sm md:text-base leading-relaxed space-y-2">
      {lines.map((line, index) => {
        // Handle Empty Lines
        if (!line.trim()) return <div key={index} className="h-2" />;

        // Handle Bullet Points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const listItemContent = line.trim().substring(2);
          return (
            <div key={index} className="flex items-start ml-4">
              <span className="mr-2 text-indigo-500">•</span>
              <span>{parseBold(listItemContent)}</span>
            </div>
          );
        }

        // Handle Numbered Lists (Simple 1. detection)
        if (/^\d+\.\s/.test(line.trim())) {
           return (
            <div key={index} className="flex items-start ml-4">
               <span className="mr-2 text-indigo-500 font-bold">{line.trim().split('.')[0]}.</span>
               <span>{parseBold(line.trim().substring(line.indexOf('.') + 1))}</span>
            </div>
           )
        }

        // Default Paragraph
        return (
          <p key={index} className="text-gray-800 dark:text-gray-200">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to parse **bold** text
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default MarkdownRenderer;