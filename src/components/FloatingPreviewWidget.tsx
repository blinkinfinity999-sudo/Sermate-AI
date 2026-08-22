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
  X,
  PictureInPicture2,
  Minimize2,
  Camera,
  Upload,
  Image as ImageIcon
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
  isPipActive?: boolean;
  onTogglePip?: () => void;
  onCaptureScreen?: () => void;
  customImageBase64?: string | null;
  onUploadCustomImage?: (base64: string) => void;
  onRemoveCustomImage?: () => void;
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
  isPipActive = false,
  onTogglePip,
  onCaptureScreen,
  customImageBase64,
  onUploadCustomImage,
  onRemoveCustomImage,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadCustomImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (theme.soundEnabled) sound.playPing();
          onUploadCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onUploadCustomImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (theme.soundEnabled) sound.playPing();
          onUploadCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col border border-slate-800/80 shadow-2xl transition-all duration-300 relative overflow-hidden glass ${shapeClass} ${
        isEmbeddedInSandbox ? 'h-full min-h-[580px] w-full' : 'w-full h-full'
      } ${isDraggingOver ? 'ring-4 ring-cyan-400/50 border-cyan-400' : ''}`}
      style={{
        ...bgStyles,
        boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), 0 0 25px -5px ${theme.accentColor}25`,
        borderColor: isDraggingOver ? '#22d3ee' : `${theme.accentColor}33`,
      }}
    >
      {/* Hidden File Input for Image Upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/60 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg transition-all overflow-hidden border border-cyan-500/40 bg-slate-950 flex-shrink-0"
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
                Sermate AI
              </span>
              <span 
                className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider font-mono"
                style={{ 
                  backgroundColor: `${theme.accentColor}25`,
                  color: theme.accentColor,
                  border: `1px solid ${theme.accentColor}40`
                }}
              >
                {isPipActive ? 'PiP HUD' : 'HUD'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60 hidden sm:inline-block">
            {modeBadge}
          </span>

          {/* Pop Out / Picture-in-Picture Button */}
          {onTogglePip && (
            <button
              id="btn-popout-widget"
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                onTogglePip();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                isPipActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 hover:bg-cyan-500/25 hover:border-cyan-400'
              }`}
              title={isPipActive ? 'Dock widget back into main window' : 'Pop out widget into floating Picture-in-Picture window over desktop apps'}
            >
              {isPipActive ? (
                <>
                  <Minimize2 className="w-3 h-3 text-amber-400" />
                  <span>Dock In Tab</span>
                </>
              ) : (
                <>
                  <PictureInPicture2 className="w-3 h-3 text-cyan-400" />
                  <span>Pop Out Widget</span>
                </>
              )}
            </button>
          )}

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
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty Sandbox State */
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30 text-slate-500 space-y-3 animate-fadeIn my-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-200 text-sm">Sermate AI Screen Companion</div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Ask questions, capture your screen, or upload screenshots for real-time vision analysis, bug fixes, and 1-click code patches.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {['Hi! How can you help me?', 'Explain keyboard shortcuts', 'Capture active screen', 'Fix alignment bug'].map((quick, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (theme.soundEnabled) sound.playClick();
                    if (quick === 'Capture active screen' && onCaptureScreen) {
                      onCaptureScreen();
                    } else {
                      onChangePrompt(quick);
                      onAnalyze(quick);
                    }
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
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div 
                      className="px-4 py-2.5 rounded-2xl text-slate-100 shadow-md font-medium text-xs sm:text-sm"
                      style={{ 
                        backgroundColor: `${theme.accentColor}25`,
                        borderColor: `${theme.accentColor}40`,
                        borderWidth: '1px'
                      }}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-700 shrink-0 mt-0.5">
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

            return (
              <div key={msg.id || index} className="flex gap-3 animate-fadeIn">
                <div 
                  className="w-6 h-6 rounded-lg overflow-hidden border border-cyan-400/50 shrink-0 mt-0.5 shadow-sm bg-slate-950 flex items-center justify-center"
                  style={{ borderColor: `${theme.accentColor}60` }}
                >
                  <img 
                    src={sermateLogo} 
                    alt="Sermate AI" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 space-y-2 max-w-[90%]">
                  {/* Summary / Text bubble */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md">
                    <div className="prose prose-invert prose-xs max-w-none">
                      <MarkdownRenderer content={msg.text} />
                    </div>

                    {msg.modelUsed && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-cyan-400/80">
                          <Zap className="w-3 3 text-cyan-400" />
                          <span>{msg.modelUsed}</span>
                        </span>
                        {result?.latencyMs && (
                          <span>{result.latencyMs}ms</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checklist Items */}
                  {result?.actionItems && result.actionItems.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>Action Checklist</span>
                      </div>
                      <div className="space-y-1.5">
                        {result.actionItems.map((item, itemIdx) => {
                          const itemKey = `${msg.id}-item-${itemIdx}`;
                          const isDone = Boolean(completedItems[itemKey]);
                          return (
                            <div 
                              key={itemIdx}
                              onClick={() => toggleActionItem(itemKey)}
                              className={`flex items-start gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isDone 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through opacity-70' 
                                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center ${
                                isDone ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600 bg-slate-800'
                              }`}>
                                {isDone && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                              </div>
                              <span className="text-[11px] leading-tight flex-1">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Code Snippet Patch */}
                  {result?.codeSnippet && (
                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-lg">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                          <Terminal className="w-3 h-3 text-cyan-400" />
                          <span>{result.codeSnippet.language}</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(result.codeSnippet!.code, msg.id || 'code')}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedCode === (msg.id || 'code') ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto bg-slate-950/90 leading-relaxed">
                        <code>{result.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Suggested Follow-up chips */}
                  {result?.suggestedFollowUps && result.suggestedFollowUps.length > 0 && !msg.isStreaming && (
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
      <div className="p-3.5 sm:p-4 border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-md flex-shrink-0 space-y-2">
        {/* Attached Screenshot / Image Preview Strip */}
        {customImageBase64 && (
          <div className="flex items-center gap-2 p-2 bg-slate-950/80 border border-cyan-500/40 rounded-xl animate-fadeIn">
            <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-700 relative shrink-0 bg-slate-900">
              <img 
                src={customImageBase64} 
                alt="Attached Screenshot" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-cyan-400" />
                <span>Screenshot Attached</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Ready for Gemini Vision inspection
              </div>
            </div>
            {onRemoveCustomImage && (
              <button
                onClick={() => {
                  if (theme.soundEnabled) sound.playClick();
                  onRemoveCustomImage();
                }}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Remove attached image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="relative flex items-center gap-1.5">
          {/* Screenshot Upload Button */}
          {onUploadCustomImage && (
            <button
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                fileInputRef.current?.click();
              }}
              className="p-2.5 bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded-xl transition-all cursor-pointer flex-shrink-0"
              title="Upload custom screenshot or image for analysis"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Real Screen Capture Button */}
          {onCaptureScreen && (
            <button
              onClick={() => {
                if (theme.soundEnabled) sound.playClick();
                onCaptureScreen();
              }}
              className="p-2.5 bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded-xl transition-all cursor-pointer flex-shrink-0"
              title="Capture real screen or active app window for instant Gemini analysis"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <div className="relative flex-1">
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
              placeholder={customImageBase64 ? "Ask anything about this screenshot..." : "Talk with Sermate AI, ask a question, or inspect screen..."}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-12 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
            />

            <button
              id="btn-analyze-screen"
              onClick={() => onAnalyze()}
              disabled={isAnalyzing || (!prompt.trim() && !customImageBase64)}
              className="absolute right-1.5 top-1.5 p-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-40 cursor-pointer"
              title="Send message"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Send className="w-4 h-4 text-slate-950" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips Under Input */}
        <div className="flex flex-wrap gap-1.5 pt-1">
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
