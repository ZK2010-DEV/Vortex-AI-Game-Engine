import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import GamePreview from './components/GamePreview';
import CodeViewer from './components/CodeViewer';
import Profiler from './components/Profiler';
import { Message, ModelType, ConsoleLog } from './types';
import { generateGame, researchTopic, quickAssist } from './services/geminiService';
import { STARTER_TEMPLATES } from './constants';
import { 
  IconCpu, 
  IconLayout, 
  IconPlay, 
  IconCode, 
  IconSettings,
  IconZap,
  IconRefresh
} from './components/Icons';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentGameCode, setCurrentGameCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [showProfiler, setShowProfiler] = useState(false);

  // Initial welcome message
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'assistant',
      content: 'Vortex Engine 3.0 Initialized.\n\nI am ready to architect your next 2D or 3D game. Select a template or describe your vision to begin.',
      timestamp: Date.now()
    }]);
  }, []);

  const handleSendMessage = async (text: string, model: ModelType) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let responseContent = '';

      if (model === ModelType.GENERATOR) {
        // Clear logs on new generation
        setConsoleLogs([]);
        const code = await generateGame(text, currentGameCode);
        setCurrentGameCode(code);
        responseContent = "Compilation successful. Engine updated.";
        setRefreshTrigger(prev => prev + 1);
        setViewMode('preview');
      } else if (model === ModelType.RESEARCHER) {
        const result = await researchTopic(text);
        responseContent = `${result.text}\n\n[Sources Found: ${result.sources.length}]`;
      } else {
        responseContent = await quickAssist(text);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: 'System Critical: Generation failed. Check API connectivity.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsoleLog = (log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev.slice(-99), log]); // Keep last 100 logs
  };

  const loadTemplate = (prompt: string) => {
    handleSendMessage(prompt, ModelType.GENERATOR);
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-gray-100 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR - INTELLIGENCE */}
      <div className="w-[380px] flex-shrink-0 h-full flex flex-col border-r border-[#27272a] bg-[#18181b] z-20">
         <div className="h-12 border-b border-[#27272a] flex items-center px-4 bg-[#09090b]">
            <IconZap size={16} className="text-vortex-accent mr-2" />
            <span className="font-bold text-sm tracking-wide text-gray-200">VORTEX AI</span>
         </div>
         <ChatInterface 
           messages={messages} 
           onSendMessage={handleSendMessage}
           isLoading={isLoading}
         />
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full relative bg-[#0c0c0e]">
        
        {/* TOP TOOLBAR */}
        <div className="h-12 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-4">
             {/* Mode Switcher */}
            <div className="flex bg-[#09090b] rounded p-1 border border-[#27272a]">
              <button 
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <IconPlay size={12} /> SCENE
              </button>
              <button 
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'code' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <IconCode size={12} /> SOURCE
              </button>
            </div>
            <div className="h-4 w-px bg-[#27272a]"></div>
            
            {/* Template Quick Actions */}
            {!currentGameCode && !isLoading && (
              <div className="flex gap-2">
                {STARTER_TEMPLATES.slice(0, 3).map((t, i) => (
                  <button 
                    key={i}
                    onClick={() => loadTemplate(t.prompt)}
                    className="text-[10px] bg-[#27272a] hover:bg-[#3f3f46] px-2 py-1 rounded border border-[#3f3f46] transition-colors text-gray-300 uppercase tracking-wider flex items-center gap-1"
                  >
                    <span className="text-vortex-accent">+</span> {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
             <button 
               className={`p-1.5 rounded transition-colors ${showProfiler ? 'bg-vortex-success/20 text-vortex-success' : 'text-gray-500 hover:bg-[#27272a]'}`}
               onClick={() => setShowProfiler(!showProfiler)}
               title="Toggle Performance Profiler"
             >
               <IconCpu size={16} />
             </button>
             <button 
               className={`p-1.5 rounded transition-colors ${showConsole ? 'bg-vortex-accent/20 text-vortex-accent' : 'text-gray-500 hover:bg-[#27272a]'}`}
               onClick={() => setShowConsole(!showConsole)}
               title="Toggle Debug Console"
             >
               <IconLayout size={16} />
             </button>
             <div className="h-4 w-px bg-[#27272a]"></div>
             <button className="text-gray-500 hover:text-white transition-colors">
               <IconSettings size={16} />
             </button>
          </div>
        </div>

        {/* VIEWPORT AREA */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 relative bg-checkerboard">
            {viewMode === 'preview' ? (
              <>
                <GamePreview 
                  code={currentGameCode} 
                  refreshTrigger={refreshTrigger} 
                  onConsoleLog={handleConsoleLog}
                />
                {currentGameCode && <Profiler active={showProfiler} />}
              </>
            ) : (
              <CodeViewer code={currentGameCode} />
            )}

            {!currentGameCode && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <div className="w-20 h-20 bg-[#18181b] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#27272a] shadow-2xl">
                       <IconCpu size={40} className="text-vortex-accent opacity-50" />
                    </div>
                    <h3 className="text-gray-400 font-medium">No Project Loaded</h3>
                    <p className="text-gray-600 text-xs mt-2">Use the AI terminal to initialize the engine</p>
                 </div>
              </div>
            )}
          </div>

          {/* BOTTOM CONSOLE PANEL */}
          {showConsole && viewMode === 'preview' && (
            <div className="h-48 bg-[#09090b] border-t border-[#27272a] flex flex-col font-mono text-xs z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
              <div className="h-8 bg-[#18181b] border-b border-[#27272a] flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold tracking-wider text-[10px]">DEBUG CONSOLE</span>
                  <span className="bg-[#27272a] text-gray-500 px-1.5 rounded text-[9px]">{consoleLogs.length} EVENTS</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConsoleLogs([])} 
                    className="text-gray-500 hover:text-white px-2 py-0.5 rounded hover:bg-[#27272a] transition-colors"
                  >
                    Clear Output
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-700 italic px-2 py-4 text-center opacity-50">
                    System ready. Application runtime logs will appear here.
                  </div>
                ) : (
                  consoleLogs.map((log) => (
                    <div key={log.id} className={`flex gap-2 px-2 py-1 border-b border-[#27272a]/30 hover:bg-[#27272a]/30 transition-colors ${
                      log.type === 'error' ? 'text-red-400 bg-red-900/10 border-red-900/20' : 
                      log.type === 'warn' ? 'text-yellow-400 bg-yellow-900/10' : 'text-gray-300'
                    }`}>
                      <span className="opacity-30 min-w-[60px] select-none">{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}</span>
                      <span className={`uppercase text-[9px] font-bold min-w-[40px] pt-0.5 ${
                        log.type === 'error' ? 'text-red-500' : 
                        log.type === 'warn' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>{log.type}</span>
                      <span className="break-all opacity-90">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;