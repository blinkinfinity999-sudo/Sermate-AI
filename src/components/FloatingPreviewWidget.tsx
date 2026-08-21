import React, { useState, useEffect, useRef } from 'react';
import { WidgetTheme, ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import userAvatarImg from '../assets/images/user_avatar_badge_1787307152316.jpg';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';
import { 
  Sparkles, 
  Send, 
  Check, 
  Copy, 
  ShieldCheck, 
  CornerDownLeft, 
  CheckCircle2, 
  Terminal,
  RefreshCw,
  Zap,
  Trash2,
  X
} from 'lucide-react';
import { sound } from '../utils/audio';

interface FloatingPreviewWidgetProps {
  theme: WidgetTheme;
  messages: ChatMessage[];
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  isAnalyzing: boolean;
  isStreaming: boolean;
  onSelectFollowUp: (query: string) => void;
  onClearChat?: () => void;
  modeBadge?: string;
  isEmbeddedInSandbox?: boolean;
}

export const FloatingPreviewWidget: React.FC<FloatingPreviewWidgetProps> = ({
  theme,
  messages,
  prompt,
  onChangePrompt,
  onAnalyze,
  isAnalyzing,
  isStreaming,
  onSelectFollowUp,
  onClearChat,
  modeBadge = 'MOCK MODE',
  isEmbeddedInSandbox = true,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    if (theme.soundEnabled) sound.playPing();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleActionItem = (itemKey: string) => {
    if (theme.soundEnabled) sound.playClick();
    setCompletedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Compute theme styles
  const getContainerStyles = () => {
    const shapeClass = 
      theme.shape === 'pill' ? 'rounded-3xl' :
      theme.shape === 'bar' ? 'rounded-2xl' :
      theme.shape === 'island' ? 'rounded-[2rem]' : 'rounded-xl';

    const bgStyles = 
      theme.bgMode === 'solid' ? { backgroundColor: theme.solidColor } :
      theme.bgMode === 'glass' ? {
        backgroundColor: `rgba(15, 23, 42, ${theme.opacity / 100})`,
        backdropFilter: `blur(${theme.blur}px)`,
        WebkitBackdropFilter: `blur(${theme.blur}px)`,
      } : {
        background: `linear-gradient(135deg, rgba(15, 23, 42, ${theme.opacity / 100}), rgba(30, 41, 59, ${theme.opacity / 100}))`,
        backdropFilter: `blur(${theme.blur}px)`,
        WebkitBackdropFilter: `blur(${theme.blur}px)`,
      };

    return { shapeClass, bgStyles };
  };

  const { shapeClass, bgStyles } = getContainerStyles();

  return (
    <div 
      className={`flex flex-col border border-slate-800/80 shadow-2xl transition-all duration-300 relative overflow-hidden glass ${shapeClass} ${
        isEmbeddedInSandbox ? 'h-full min-h-[500px]' : 'max-w-md w-full'
      }`}
      style={{
        ...bgStyles,
        boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 25px -5px ${theme.accentColor}25`,
        borderColor: `${theme.accentColor}33`,
      }}
    >
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg transition-all overflow-hidden border border-cyan-500/40 bg-slate-950"
            style={{ 
              borderColor: `${theme.accentColor}50`,
            }}
          >
            <img 
              src={sermateLogo} 
              alt="Sermate AI" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm text-white tracking-wide">
                Sermate AI Companion
              </span>
              <span 
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider font-mono"
                style={{ 
                  backgroundColor: `${theme.accentColor}25`,
                  color: theme.accentColor,
                  border: `1px solid ${theme.accentColor}40`
                }}
              >
                HUD
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60 hidden sm:inline-block">
            {modeBadge}
          </span>
          {messages.length > 0 && onClearChat && (
            <button
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                onClearChat();
              }}
              className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
              title="Delete conversation history"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear (✕)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs scrollbar-thin max-h-[500px]">
        {messages.length === 0 ? (
          /* Empty Sandbox State */
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30 text-slate-500 space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-200 text-sm">Sermate AI Screen Companion</div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Talk to Sermate AI, ask coding questions, or inspect screen regions. All conversation history is maintained here until cleared.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {['Hi! Who are you?', 'Find the bug on screen', 'Explain keyboard shortcuts'].map((quick, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (theme.soundEnabled) sound.playClick();
                    onChangePrompt(quick);
                    onAnalyze(quick);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] rounded-lg border border-slate-700 transition-all cursor-pointer"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const result = msg.result;

            if (isUser) {
              return (
                <div key={msg.id || index} className="flex gap-3 justify-end animate-fadeIn">
                  <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl rounded-tr-none border border-slate-700/60 max-w-[85%] text-xs sm:text-sm text-slate-200 shadow-md">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-cyan-500/40 bg-slate-900 shadow-md">
                    <img 
                      src={userAvatarImg} 
                      alt="User" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              );
            }

            // Assistant Response Bubble
            return (
              <div key={msg.id || index} className="flex gap-3 justify-start animate-fadeIn">
                <div 
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden border border-cyan-400/40 bg-slate-950"
                  style={{ borderColor: `${theme.accentColor}50` }}
                >
                  <img 
                    src={sermateLogo} 
                    alt="Sermate AI" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-2.5 max-w-[88%] flex-1">
                  {/* Category & Confidence Ribbon (if analysis result) */}
                  {result && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between px-3 py-1 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
                          <span className="font-semibold text-white">
                            {result.detectedCategory || 'Screen Diagnostic'}
                          </span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60">
                          {Math.round((result.confidence || 0.98) * 100)}% Confidence
                        </span>
                      </div>

                      {result.imageOptimizationStats && result.imageOptimizationStats.ratio > 1 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-300 font-mono">
                          <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>Vision payload: {result.imageOptimizationStats.optimizedKb}KB ({result.imageOptimizationStats.ratio}x optimized)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detailed Text in Polish Cyan/Dark Bubble */}
                  <div 
                    className="px-4 py-3 rounded-2xl rounded-tl-none border text-xs sm:text-sm leading-relaxed overflow-hidden shadow-lg"
                    style={{
                      backgroundColor: `${theme.accentColor}08`,
                      borderColor: `${theme.accentColor}30`,
                    }}
                  >
                    <MarkdownRenderer content={msg.text} />
                  </div>

                  {/* Action Checklist Items */}
                  {result?.actionItems && result.actionItems.length > 0 && (
                    <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Action Plan ({result.actionItems.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {result.actionItems.map((item, itemIdx) => {
                          const itemKey = `${msg.id || index}-${itemIdx}`;
                          const isDone = completedItems[itemKey];
                          return (
                            <div
                              key={itemIdx}
                              onClick={() => toggleActionItem(itemKey)}
                              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                                isDone 
                                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 text-slate-300'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                                isDone 
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                                  : 'border-slate-600 bg-slate-800'
                              }`}>
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`text-[11px] leading-snug ${isDone ? 'line-through opacity-70' : ''}`}>
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Code Snippet */}
                  {result?.codeSnippet && (
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{result.codeSnippet.filename || 'Code Solution'}</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(result.codeSnippet!.code, `code-${index}`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-all border border-slate-700 cursor-pointer"
                        >
                          {copiedCode === `code-${index}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-cyan-200 overflow-x-auto border border-slate-800 scrollbar-thin">
                        <code>{result.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {result?.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.suggestedFollowUps.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => {
                            if (theme.soundEnabled) sound.playClick();
                            onSelectFollowUp(q);
                          }}
                          className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-[10px] rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{q}</span>
                          <CornerDownLeft className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Spinner for pending response */}
        {isAnalyzing && (
          <div className="flex gap-3 items-center animate-fadeIn text-slate-400 text-xs pl-10">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-mono text-[11px]">Sermate AI is thinking & inspecting...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Prompt Footer */}
      <div className="p-3.5 sm:p-4 border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-md">
        <div className="relative">
          <input
            id="input-prompt"
            type="text"
            value={prompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAnalyze();
              }
            }}
            placeholder="Talk with Sermate AI, ask a question, or inspect screen..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-3 pr-12 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
          />

          <button
            id="btn-analyze-screen"
            onClick={() => onAnalyze()}
            disabled={isAnalyzing || !prompt.trim()}
            className="absolute right-2 top-2 p-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-40 cursor-pointer"
            title="Send message"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4 text-slate-950" />
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips Under Input */}
        <div className="flex flex-wrap gap-1.5 pt-2.5">
          {[
            'Fix alignment issue',
            'Find UI bug',
            'Explain code error',
            'Write React component',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                onChangePrompt(suggestion);
                onAnalyze(suggestion);
              }}
              className="px-2 py-0.5 bg-slate-800/80 text-[10px] rounded border border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-slate-600 transition-all cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
