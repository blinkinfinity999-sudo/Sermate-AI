import React from 'react';
import { ScreenScenario, WidgetTheme, BoundingBox, AnalysisResult, ChatMessage } from '../types';
import { SimulatedScreenCanvas } from './SimulatedScreenCanvas';
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
  Monitor
} from 'lucide-react';
import { sound } from '../utils/audio';

interface DashboardSandboxProps {
  theme: WidgetTheme;
  scenario: ScreenScenario;
  onSelectScenario: (scenario: ScreenScenario) => void;
  allScenarios: ScreenScenario[];
  customImageBase64: string | null;
  onUploadCustomImage: (base64: string) => void;
  boundingBoxes: BoundingBox[];
  showBoxes: boolean;
  onToggleShowBoxes: () => void;
  selectedBoxId: string | null;
  onSelectBox: (boxId: string | null) => void;
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
}

export const DashboardSandbox: React.FC<DashboardSandboxProps> = ({
  theme,
  scenario,
  onSelectScenario,
  allScenarios,
  customImageBase64,
  onUploadCustomImage,
  boundingBoxes,
  showBoxes,
  onToggleShowBoxes,
  selectedBoxId,
  onSelectBox,
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
}) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const hotkeyText = isMac ? 'Cmd + Backspace' : 'Ctrl + Shift + Backspace';

  return (
    <div className="space-y-6">
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
                Live Interactive Sandbox
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Inspect simulated code crashes, mobile UI bugs, or database deadlocks. Trigger screen intelligence with one click or press your global hotkey.
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

        {/* HUD Companion Quick Controls & Install Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary HUD Toggle Button requested by user */}
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
          </div>

          {!isAppInstalled && (
            <div className="flex items-center gap-2">
              {/* Direct Browser App Install Trigger (disappears when downloaded) */}
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

      {/* Main 2-Column Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Simulated Screen (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <SimulatedScreenCanvas
            scenario={scenario}
            onSelectScenario={onSelectScenario}
            allScenarios={allScenarios}
            customImageBase64={customImageBase64}
            onUploadCustomImage={onUploadCustomImage}
            boundingBoxes={boundingBoxes}
            showBoxes={showBoxes}
            onToggleShowBoxes={onToggleShowBoxes}
            selectedBoxId={selectedBoxId}
            onSelectBox={onSelectBox}
            isScanning={isAnalyzing}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Right Column: Floating Preview Widget (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
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
          />
        </div>
      </div>

      {/* Sandbox Quick Capabilities Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Visual Bug Detection</div>
            <div className="text-[11px] text-slate-400">Zeroes in on stack traces & exceptions</div>
          </div>
        </div>

        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Bounding Box Coordinates</div>
            <div className="text-[11px] text-slate-400">Spatial element normalization [0-100%]</div>
          </div>
        </div>

        <div className="p-3.5 glass border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Instant Streaming & Solutions</div>
            <div className="text-[11px] text-slate-400">Actionable checklist & 1-click code patches</div>
          </div>
        </div>
      </div>
    </div>
  );
};
