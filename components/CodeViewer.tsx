import React from 'react';
import { IconCode, IconDownload } from './Icons';

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-vortex-900 border border-vortex-700 rounded-lg overflow-hidden">
      <div className="h-10 bg-vortex-800 border-b border-vortex-700 flex items-center justify-between px-4">
        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
          <IconCode size={14} />
          GENERATED SOURCE
        </span>
        <button
          onClick={downloadCode}
          className="flex items-center gap-1.5 px-2 py-1 bg-vortex-700 hover:bg-vortex-600 rounded text-xs text-white transition-colors"
        >
          <IconDownload size={12} />
          Download HTML
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
        <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">
          {code || "// No code generated yet. Use the AI chat to build a game."}
        </pre>
      </div>
    </div>
  );
};

export default CodeViewer;