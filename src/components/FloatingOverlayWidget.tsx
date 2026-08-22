import React, { useState } from 'react';
import { WidgetTheme, ChatMessage } from '../types';
import { FloatingPreviewWidget } from './FloatingPreviewWidget';
import { 
  X, 
  ChevronUp,
  ChevronDown,
  Sparkles,
  Bot,
  MessageSquare
} from 'lucide-react';
import { sound } from '../utils/audio';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';

interface FloatingOverlayWidgetProps {
  theme: WidgetTheme;
  isOpen: boolean;
  onToggleOpen: () => void;
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

export const FloatingOverlayWidget: React.FC<FloatingOverlayWidgetProps> = ({
  theme,
  isOpen,
  onToggleOpen,
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
  const [isMinimized, setIsMinimized] = useState(false);

  // Position styles based on theme
  const getPositionClass = () => {
    switch (theme.position) {
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-20 right-6';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 ${getPositionClass()}`}>
      {!isOpen ? (
        /* Permanent Screen Partner Bubble - Stays glued to screen */
        <button
          id="btn-floating-partner-bubble"
          onClick={() => {
            if (theme.soundEnabled) sound.playPing();
            onToggleOpen();
          }}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border backdrop-blur-xl animate-fadeIn"
          style={{
            backgroundColor: `rgba(15, 23, 42, ${theme.opacity / 100})`,
            borderColor: `${theme.accentColor}60`,
            boxShadow: `0 10px 30px -5px ${theme.accentColor}40, 0 0 15px ${theme.accentColor}30`,
          }}
          title="SerMate AI Permanent Screen Partner (Click to expand)"
        >
          {/* Animated pulsing partner indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.accentColor }}
            />
            <span 
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: theme.accentColor }}
            />
          </span>

          <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400/50 flex items-center justify-center bg-slate-950">
            <img 
              src={sermateLogo} 
              alt="Sermate Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-extrabold text-white tracking-tight">
            Sermate <span style={{ color: theme.accentColor }}>AI</span>
          </span>
          <span 
            className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider"
            style={{ backgroundColor: `${theme.accentColor}25`, color: theme.accentColor }}
          >
            PARTNER
          </span>
        </button>
      ) : (
        /* Expanded Permanent Screen Partner HUD Card */
        <div 
          className="w-[360px] sm:w-[420px] max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden animate-scaleUp"
          style={{
            backgroundColor: `rgba(15, 23, 42, ${theme.opacity / 100})`,
            borderColor: `${theme.accentColor}40`,
            boxShadow: `0 25px 60px -15px rgba(0,0,0,0.7), 0 0 30px -5px ${theme.accentColor}30`,
          }}
        >
          {/* Top Titlebar with collapse & minimize to bubble */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/85 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md overflow-hidden border border-cyan-400/40">
                <img 
                  src={sermateLogo} 
                  alt="Sermate AI" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>SerMate AI</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold">• Permanent Partner</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Collapse/Expand body toggle */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Partner Card' : 'Collapse to Titlebar'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Minimize to permanent floating bubble icon (Does not destroy session or open a window) */}
              <button
                onClick={() => {
                  if (theme.soundEnabled) sound.playClick();
                  onToggleOpen();
                }}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Minimize to Floating Partner Bubble"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-cyan-300 transition-transform" />
              </button>
            </div>
          </div>

          {/* Body when not collapsed */}
          {!isMinimized && (
            <div className="max-h-[600px] overflow-hidden flex flex-col">
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
                modeBadge={isMockMode ? 'MOCK MODE' : `AI: ${modelUsed.replace('gemini-', '')}`}
                isEmbeddedInSandbox={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
