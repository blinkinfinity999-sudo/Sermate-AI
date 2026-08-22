import React, { useState } from 'react';
import { WidgetTheme, ChatMessage, AnalysisResult } from '../types';
import { FloatingPreviewWidget } from './FloatingPreviewWidget';
import { sound } from '../utils/audio';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';
import { Power, Sparkles, X, RefreshCw } from 'lucide-react';

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
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Standalone Header */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg overflow-hidden border border-cyan-400/40 bg-slate-950">
            <img 
              src={sermateLogo} 
              alt="Sermate AI" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <span className="font-extrabold text-xs text-white tracking-tight">
            Sermate <span className="text-cyan-400">AI</span>
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
            Desktop HUD
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
            ● Always On
          </span>
          <button
            onClick={() => window.close()}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Close Standalone Window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main HUD Body */}
      <div className="flex-1 overflow-hidden p-2 flex flex-col">
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
  );
};
