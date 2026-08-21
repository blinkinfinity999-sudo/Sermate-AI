import React, { useState, useEffect } from 'react';
import { WidgetTheme, AnalysisResult } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import userAvatarImg from '../assets/images/user_avatar_badge_1787307152316.jpg';
import { 
  Sparkles, 
  Send, 
  Check, 
  Copy, 
  Code2, 
  Layers, 
  ShieldCheck, 
  CornerDownLeft, 
  CheckCircle2, 
  AlertCircle, 
  Terminal,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface FloatingPreviewWidgetProps {
  theme: WidgetTheme;
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  streamingText: string;
  isStreaming: boolean;
  onSelectFollowUp: (query: string) => void;
  modeBadge?: string;
  isEmbeddedInSandbox?: boolean;
}

export const FloatingPreviewWidget: React.FC<FloatingPreviewWidgetProps> = ({
  theme,
  prompt,
  onChangePrompt,
  onAnalyze,
  isAnalyzing,
  result,
  streamingText,
  isStreaming,
  onSelectFollowUp,
  modeBadge = 'MOCK MODE',
  isEmbeddedInSandbox = true,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (theme.soundEnabled) sound.playPing();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const toggleActionItem = (index: number) => {
    if (theme.soundEnabled) sound.playClick();
    setCompletedItems(prev => ({
      ...prev,
      [index]: !prev[index]
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
        isEmbeddedInSandbox ? 'h-full' : 'max-w-md w-full'
      }`}
      style={{
        ...bgStyles,
        boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 25px -5px ${theme.accentColor}25`,
        borderColor: `${theme.accentColor}33`,
      }}
    >
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg transition-all"
            style={{ 
              backgroundColor: `${theme.accentColor}20`,
              border: `1px solid ${theme.accentColor}50`,
              color: theme.accentColor 
            }}
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-white tracking-wide">
                AI Analysis Stream
              </span>
              <span 
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider"
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

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 italic">
            {modeBadge}
          </span>
        </div>
      </div>

      {/* Main Body Content with Stream / Chat Layout */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs scrollbar-thin">
        {/* User Query Block if analysis in progress or completed */}
        {(isStreaming || result) && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-cyan-500/40 bg-slate-900 shadow-md shadow-cyan-950/40">
              <img 
                src={userAvatarImg} 
                alt="User" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700/50 max-w-[88%] text-xs sm:text-sm text-slate-300 shadow-sm">
              <p>{prompt}</p>
            </div>
          </div>
        )}

        {/* Results & Answer Section */}
        {isStreaming || result ? (
          <div className="flex gap-3 animate-fadeIn">
            <div 
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor, border: `1px solid ${theme.accentColor}40` }}
            >
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="space-y-3 max-w-[88%] flex-1">
              {/* Category & Confidence Ribbon */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
                    <span className="font-semibold text-white">
                      {result?.detectedCategory || 'Screen Diagnostic'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                    Confidence: {Math.round((result?.confidence || 0.96) * 100)}%
                  </span>
                </div>

                {result?.imageOptimizationStats && result.imageOptimizationStats.ratio > 1 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-300 font-mono">
                    <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Payload optimized: {result.imageOptimizationStats.originalKb}KB → {result.imageOptimizationStats.optimizedKb}KB ({result.imageOptimizationStats.ratio}x faster upload)</span>
                  </div>
                )}
              </div>

              {/* Detailed Findings in Professional Polish Cyan Box */}
              <div 
                className="px-4 py-3 rounded-2xl rounded-tl-none border text-xs sm:text-sm leading-relaxed overflow-hidden"
                style={{
                  backgroundColor: `${theme.accentColor}08`,
                  borderColor: `${theme.accentColor}30`,
                }}
              >
                <MarkdownRenderer 
                  content={isStreaming ? streamingText : (result?.detailedAnswer || result?.summary || '')} 
                />
              </div>

              {/* Action Items Checklist */}
              {result?.actionItems && result.actionItems.length > 0 && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Action Plan ({result.actionItems.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.actionItems.map((item, idx) => {
                      const isDone = completedItems[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleActionItem(idx)}
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

              {/* Generated Code Snippet Fix */}
              {result?.codeSnippet && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{result.codeSnippet.filename || 'Code Solution'}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(result.codeSnippet!.code)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-all border border-slate-700"
                    >
                      {copiedCode ? (
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

              {/* Follow-Up Quick Prompts Chips */}
              {result?.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.suggestedFollowUps.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (theme.soundEnabled) sound.playClick();
                        onSelectFollowUp(q);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                    >
                      <span>{q}</span>
                      <CornerDownLeft className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty Sandbox State */
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-700 animate-pulse" />
            <div className="font-semibold text-slate-400 text-xs">Ready for Multimodal Screen Analysis</div>
            <p className="text-[11px] text-slate-500 max-w-xs">
              Click <strong className="text-slate-300">"Analyze"</strong> below or press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">⌘ + Backspace</kbd> to inspect the simulated screen region.
            </p>
          </div>
        )}
      </div>

      {/* Input Prompt Footer */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/40">
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
            placeholder="Ask Sermate AI anything about this screen..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
          />

          <button
            id="btn-analyze-screen"
            onClick={() => onAnalyze()}
            disabled={isAnalyzing}
            className="absolute right-2 top-2 p-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            title="Send prompt to Gemini vision"
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
            'Explain stack trace',
            'Copy CSS fix',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                onChangePrompt(suggestion);
                onAnalyze(suggestion);
              }}
              className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
