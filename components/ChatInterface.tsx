
import React, { useState, useRef, useEffect } from 'react';
import { Message, ModelType } from '../types';
import { IconCpu, IconZap, IconSearch, IconMessage, IconLoader } from './Icons';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, model: ModelType) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.GENERATOR);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, selectedModel);
    setInput('');
  };

  const getModelLabel = (type: ModelType) => {
    switch (type) {
      case ModelType.GENERATOR: return { name: 'Architect', desc: 'Gemini 3.0 Pro' };
      case ModelType.FAST_ASSIST: return { name: 'Speed', desc: 'Flash Lite' };
      case ModelType.RESEARCHER: return { name: 'Research', desc: 'Search Grounding' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b]">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-1 px-1 uppercase tracking-wider">
              {msg.role === 'user' ? 'YOU' : 'SYSTEM'}
            </span>
            <div 
              className={`max-w-[90%] rounded-lg p-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-vortex-accent text-white rounded-tr-none' 
                  : 'bg-[#27272a] text-gray-200 border border-[#3f3f46] rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 text-vortex-accent p-2 animate-pulse">
            <IconLoader className="animate-spin" size={18} />
            <span className="text-xs font-mono tracking-widest uppercase">Processing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#09090b] border-t border-[#27272a]">
        
        {/* Model Tabs */}
        <div className="flex gap-1 mb-3 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
          {Object.values(ModelType).map((m) => {
             const label = getModelLabel(m);
             return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModel(m)}
                className={`flex-1 flex flex-col items-center py-1.5 rounded transition-all ${
                  selectedModel === m 
                    ? 'bg-[#27272a] text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#27272a]/50'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{label.name}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe your game concept..."
            className="w-full bg-[#18181b] text-gray-200 text-sm rounded-lg border border-[#27272a] p-3 min-h-[80px] pr-12 resize-none focus:outline-none focus:border-[#52525b] placeholder-gray-600 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute bottom-3 right-3 p-1.5 rounded transition-all ${
              !input.trim() || isLoading
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-white bg-vortex-accent hover:bg-opacity-80'
            }`}
          >
             {isLoading ? <IconLoader className="animate-spin" size={16} /> : <IconMessage size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
