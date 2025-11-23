import React, { useEffect, useRef, useState } from 'react';
import { IconRefresh, IconMaximize } from './Icons';
import { ConsoleLog } from '../types';

interface GamePreviewProps {
  code: string;
  refreshTrigger: number;
  onConsoleLog?: (log: ConsoleLog) => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({ code, refreshTrigger, onConsoleLog }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  // Re-render iframe when code or trigger changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [code, refreshTrigger]);

  // Listen for messages from the iframe (Console logs)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'VORTEX_LOG' && onConsoleLog) {
        onConsoleLog(event.data.log);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  // Inject the console interceptor script into the generated code
  const getBridgedCode = (source: string) => {
    if (!source) return '';
    
    const interceptorScript = `
      <script>
        (function() {
          function sendLog(type, msg) {
            try {
              window.parent.postMessage({
                type: 'VORTEX_LOG',
                log: {
                  id: Math.random().toString(36).substr(2, 9),
                  type: type,
                  message: String(msg),
                  timestamp: Date.now()
                }
              }, '*');
            } catch (e) {}
          }

          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalInfo = console.info;

          console.log = function(...args) { 
            originalLog.apply(console, args); 
            sendLog('log', args.join(' ')); 
          };
          
          console.warn = function(...args) { 
            originalWarn.apply(console, args); 
            sendLog('warn', args.join(' ')); 
          };
          
          console.error = function(...args) { 
            originalError.apply(console, args); 
            sendLog('error', args.join(' ')); 
          };

          console.info = function(...args) { 
            originalInfo.apply(console, args); 
            sendLog('info', args.join(' ')); 
          };

          window.onerror = function(msg, url, line) {
            sendLog('error', msg + ' (Line: ' + line + ')');
            return false;
          };
        })();
      </script>
    `;

    // Inject right after head or body, or prepend if neither exists
    if (source.includes('<head>')) {
      return source.replace('<head>', '<head>' + interceptorScript);
    } else if (source.includes('<html>')) {
      return source.replace('<html>', '<html>' + interceptorScript);
    } else {
      return interceptorScript + source;
    }
  };

  return (
    <div className="flex flex-col h-full bg-vortex-900 border border-vortex-700 rounded-lg overflow-hidden shadow-2xl relative">
      {/* Preview Toolbar */}
      <div className="h-10 bg-vortex-800 border-b border-vortex-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs font-mono text-gray-400 uppercase tracking-wider">Runtime Environment</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleReload}
            className="p-1 hover:bg-vortex-700 rounded text-gray-400 hover:text-white transition-colors"
            title="Reload Game"
          >
            <IconRefresh size={16} />
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-1 hover:bg-vortex-700 rounded text-gray-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            <IconMaximize size={16} />
          </button>
        </div>
      </div>
      
      {/* Iframe Container */}
      <div className="flex-1 relative bg-black">
        {code ? (
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={getBridgedCode(code)}
            title="Game Preview"
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-forms allow-modals"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-vortex-700 flex-col gap-4 bg-[#0c0c0e]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-vortex-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-vortex-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-mono text-sm text-gray-500">Awaiting Engine Output...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePreview;