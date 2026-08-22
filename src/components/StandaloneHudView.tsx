import React, { useEffect } from 'react';
import { WidgetTheme, ChatMessage } from '../types';
import { FloatingPreviewWidget } from './FloatingPreviewWidget';
import { sound } from '../utils/audio';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';
import { Minus, X } from 'lucide-react';

interface StandaloneHudViewProps {
  theme: WidgetTheme;
  messages: ChatMessage[];
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  isAnalyzing: boolean;
  isStreaming: boolean;
  onSelectFollowUp: (query: string) => void;
  onClearChat: () => void;
  isMockMode: boolean;
  modelUsed: string;
}

export const StandaloneHudView: React.FC<StandaloneHudViewProps> = ({
  theme,
  messages,
  prompt,
  onChangePrompt,
  onAnalyze,
  isAnalyzing,
  isStreaming,
  onSelectFollowUp,
  onClearChat,
  isMockMode,
  modelUsed,
}) => {
  // Ensure transparent body class is applied
  useEffect(() => {
    document.documentElement.classList.add('electron-mode');
    document.body.classList.add('electron-mode');
    return () => {
      document.documentElement.classList.remove('electron-mode');
      document.body.classList.remove('electron-mode');
    };
  }, []);

  const handleMinimize = () => {
    if (theme.soundEnabled) sound.playClick();
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('window-minimize');
      }
    } catch (e) {
      console.log('Minimize fallback', e);
    }
  };

  const handleClose = () => {
    if (theme.soundEnabled) sound.playClick();
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('window-close');
      } else {
        window.close();
      }
    } catch (e) {
      window.close();
    }
  };

  return (
    <div 
      className="h-screen w-screen bg-transparent p-1 sm:p-2 flex flex-col justify-end overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Frameless Floating Widget Card with Zero OS Decorations */}
      <div 
        className="w-full h-full flex flex-col rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: `rgba(15, 23, 42, ${theme.opacity / 100})`,
          borderColor: `${theme.accentColor}40`,
          boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.75), 0 0 30px -5px ${theme.accentColor}35`,
        }}
      >
        {/* Sleek Draggable Frameless Header */}
        <div 
          className="drag-region px-3.5 py-2.5 bg-slate-950/85 border-b border-slate-800 flex items-center justify-between cursor-move select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md overflow-hidden border border-cyan-400/40 bg-slate-950 flex-shrink-0">
              <img 
                src={sermateLogo} 
                alt="Sermate AI" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span className="font-extrabold text-xs text-white tracking-tight">
              Sermate <span style={{ color: theme.accentColor }}>AI</span>
            </span>
            <span 
              className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase"
              style={{
                backgroundColor: `${theme.accentColor}20`,
                color: theme.accentColor,
                borderColor: `${theme.accentColor}40`,
                borderWidth: '1px'
              }}
            >
              DESKTOP HUD
            </span>
          </div>

          <div className="no-drag-region flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize Widget"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Floating Widget Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <FloatingPreviewWidget
            theme={theme}
            messages={messages}
            prompt={prompt}
            onChangePrompt={onChangePrompt}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            isStreaming={isStreaming}
            onSelectFollowUp={onSelectFollowUp}
            onClearChat={onClearChat}
            modeBadge={isMockMode ? 'MOCK ENGINE' : `AI: ${modelUsed.replace('gemini-', '')}`}
            isEmbeddedInSandbox={false}
          />
        </div>
      </div>
    </div>
  );
};
