import React from 'react';
import { WidgetTheme, AnalysisResult, ChatMessage } from '../types';
import { FloatingPreviewWidget } from './FloatingPreviewWidget';
import { 
  Keyboard, 
  Sparkles, 
  Cpu, 
  Zap, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Flame,
  Power,
  Download,
  ExternalLink,
  PictureInPicture2,
  Minimize2,
  Camera,
  Layers,
  Radio,
  Upload
} from 'lucide-react';
import { sound } from '../utils/audio';

interface DashboardSandboxProps {
  theme: WidgetTheme;
  customImageBase64: string | null;
  onUploadCustomImage: (base64: string) => void;
  onRemoveCustomImage?: () => void;
  messages: ChatMessage[];
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onAnalyze: (customPrompt?: string) => void;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  streamingText: string;
  isStreaming: boolean;
  onSelectFollowUp: (query: string) => void;
  onClearChat: () => void;
  modelUsed: string;
  isMockMode: boolean;
  soundEnabled: boolean;
  hotkeyFlashed: boolean;
  widgetActive: boolean;
  onToggleWidgetActive: () => void;
  onTriggerDirectInstall: () => Promise<void>;
  isAppInstalled: boolean;
  isPipActive?: boolean;
  onTogglePip?: () => void;
  onCaptureScreen?: () => void;
}

export const DashboardSandbox: React.FC<DashboardSandboxProps> = ({
  theme,
  customImageBase64,
  onUploadCustomImage,
  onRemoveCustomImage,
  messages,
  prompt,
  onChangePrompt,
  onAnalyze,
  isAnalyzing,
  result,
  streamingText,
  isStreaming,
  onSelectFollowUp,
  onClearChat,
  modelUsed,
  isMockMode,
  soundEnabled,
  hotkeyFlashed,
  widgetActive,
  onToggleWidgetActive,
  onTriggerDirectInstall,
  isAppInstalled,
  isPipActive = false,
  onTogglePip,
  onCaptureScreen,
}) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const hotkeyText = isMac ? 'Cmd + Backspace' : 'Ctrl + Shift + Backspace';

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Banner: Hotkeys & Quick Intro */}
      <div 
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-4 sm:p-5 glass shadow-xl ${
          hotkeyFlashed 
            ? 'border-cyan-400 ring-4 ring-cyan-400/30 scale-[1.008]' 
            : 'border-slate-800'
        }`}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                SerMate AI Assistant
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                Online
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Inspect screens, debug coding errors, or ask any question. Trigger intelligence via hotkey or pop out the floating overlay over your desktop apps.
            </p>
          </div>

          {/* Hotkey Interactive Display */}
          <div className="flex items-center gap-2.5 glass-dark p-2.5 rounded-xl border border-slate-800 shrink-0">
            <Keyboard className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Trigger Hotkey
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {hotkeyText.split(' + ').map((key, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-600 text-xs">+</span>}
                    <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded-md text-xs font-mono font-bold shadow-sm">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (soundEnabled) sound.playPing();
                onAnalyze();
              }}
              className="ml-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Test Hotkey</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* HUD Companion Quick Controls & PiP Pop Out Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary HUD Toggle Button */}
            <button
              id="btn-banner-toggle-hud"
              onClick={() => {
                if (soundEnabled) sound.playPing();
                onToggleWidgetActive();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold shadow-sm ${
                widgetActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-emerald-500/10'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
              }`}
              title="Toggle AI Screen Partner on screen"
            >
              <Power className={`w-3.5 h-3.5 ${widgetActive ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className="font-mono uppercase font-bold text-[11px]">
                SCREEN PARTNER: {widgetActive ? 'ACTIVE' : 'OFF'}
              </span>
              <span className="text-[10px] opacity-75 hidden sm:inline">
                {widgetActive ? '(Companion active on screen)' : '(Click to start)'}
              </span>
            </button>

            {/* Document Picture-in-Picture Pop Out Button */}
            {onTogglePip && (
              <button
                id="btn-banner-pip-popout"
                onClick={() => {
                  if (soundEnabled) sound.playPing();
                  onTogglePip();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold shadow-sm ${
                  isPipActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 shadow-amber-500/10'
                    : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 shadow-cyan-500/10'
                }`}
                title="Pop out widget into floating Picture-in-Picture window over all software"
              >
                {isPipActive ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-mono uppercase font-bold text-[11px]">
                      DOCK WIDGET IN TAB
                    </span>
                  </>
                ) : (
                  <>
                    <PictureInPicture2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono uppercase font-bold text-[11px]">
                      POP OUT WIDGET (PiP)
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {!isAppInstalled && (
            <div className="flex items-center gap-2">
              {/* Direct Browser App Install Trigger */}
              <button
                id="btn-banner-install-app"
                onClick={async () => {
                  if (soundEnabled) sound.playClick();
                  await onTriggerDirectInstall();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                title="Install SerMate AI as a desktop or mobile application"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install SerMate App</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Centered SerMate AI Workspace */}
      <div className="w-full">
        {isPipActive ? (
          /* PiP Active Placeholder Card */
          <div className="w-full min-h-[520px] rounded-2xl border border-cyan-500/40 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-slate-950/40 pointer-events-none" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
                <PictureInPicture2 className="w-8 h-8 text-cyan-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
              </span>
            </div>

            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Floating Overlay Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Widget is Floating Over Your Desktop
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                SerMate AI is currently running in a Picture-in-Picture floating window over your code editors, browsers, and desktop software.
              </p>
            </div>

            {/* Status information pills */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Real-time sync</span>
                </span>
                <span className="text-cyan-300 font-mono font-bold text-[11px]">Connected</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Messages in thread</span>
                <span className="text-slate-200 font-mono font-bold text-[11px]">{messages.length}</span>
              </div>
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Streaming response into floating overlay...</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-md">
              {onTogglePip && (
                <button
                  onClick={() => {
                    if (soundEnabled) sound.playClick();
                    onTogglePip();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Return Widget to Tab</span>
                </button>
              )}

              {onCaptureScreen && (
                <button
                  onClick={() => {
                    if (soundEnabled) sound.playClick();
                    onCaptureScreen();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  title="Capture active screen or window"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Capture Screen</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Regular Embedded Full-Featured Floating Preview Widget */
          <div className="w-full min-h-[580px]">
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
              isEmbeddedInSandbox={true}
              isPipActive={false}
              onTogglePip={onTogglePip}
              onCaptureScreen={onCaptureScreen}
              customImageBase64={customImageBase64}
              onUploadCustomImage={onUploadCustomImage}
              onRemoveCustomImage={onRemoveCustomImage}
            />
          </div>
        )}
      </div>

      {/* Capabilities Highlights Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Multimodal Vision Inspection</div>
            <div className="text-[11px] text-slate-400">Capture active screens or drop screenshots</div>
          </div>
        </div>

        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <PictureInPicture2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Picture-in-Picture HUD</div>
            <div className="text-[11px] text-slate-400">Floats on top of all desktop apps</div>
          </div>
        </div>

        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Instant Streaming & Fixes</div>
            <div className="text-[11px] text-slate-400">Actionable checklist & 1-click code patches</div>
          </div>
        </div>
      </div>
    </div>
  );
};
