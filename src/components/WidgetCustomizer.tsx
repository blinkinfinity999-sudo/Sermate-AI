import React, { useState } from 'react';
import { WidgetTheme, BackgroundMode, WidgetShape } from '../types';
import { FloatingPreviewWidget } from './FloatingPreviewWidget';
import { 
  Sliders, 
  Palette, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  Check, 
  Layers, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Wand2,
  Copy,
  Download
} from 'lucide-react';
import { sound } from '../utils/audio';
import { DEFAULT_THEME } from '../utils/storage';

interface WidgetCustomizerProps {
  theme: WidgetTheme;
  onChangeTheme: (theme: WidgetTheme) => void;
  onResetTheme: () => void;
  soundEnabled: boolean;
}

const PRESET_ACCENTS = [
  { name: 'Neon Cyan', color: '#00F0FF', hex: '#00F0FF' },
  { name: 'Electric Purple', color: '#A855F7', hex: '#A855F7' },
  { name: 'Sunset Orange', color: '#F97316', hex: '#F97316' },
  { name: 'Lime Green', color: '#84CC16', hex: '#84CC16' },
  { name: 'Hot Rose', color: '#F43F5E', hex: '#F43F5E' },
  { name: 'Cyber Amber', color: '#F59E0B', hex: '#F59E0B' },
];

const PRESET_THEMES = [
  {
    name: 'Cyberpunk Cyan',
    theme: {
      bgMode: 'glass' as BackgroundMode,
      solidColor: '#090d16',
      gradientChoice: 'from-cyan-500/20 via-slate-900/90 to-blue-600/20',
      accentColor: '#00F0FF',
      shape: 'pill' as WidgetShape,
      opacity: 85,
      blur: 16,
      position: 'bottom-right' as const,
      size: 'standard' as const,
      soundEnabled: true,
    },
  },
  {
    name: 'Obsidian Stealth',
    theme: {
      bgMode: 'solid' as BackgroundMode,
      solidColor: '#090a0f',
      gradientChoice: 'from-slate-900 to-black',
      accentColor: '#F43F5E',
      shape: 'square' as WidgetShape,
      opacity: 95,
      blur: 8,
      position: 'bottom-right' as const,
      size: 'compact' as const,
      soundEnabled: true,
    },
  },
  {
    name: 'Aurora Borealis',
    theme: {
      bgMode: 'gradient' as BackgroundMode,
      solidColor: '#06131f',
      gradientChoice: 'from-emerald-500/20 via-slate-900/90 to-cyan-500/20',
      accentColor: '#84CC16',
      shape: 'bar' as WidgetShape,
      opacity: 80,
      blur: 20,
      position: 'bottom-right' as const,
      size: 'standard' as const,
      soundEnabled: true,
    },
  },
  {
    name: 'Solar Flare',
    theme: {
      bgMode: 'gradient' as BackgroundMode,
      solidColor: '#1a0b06',
      gradientChoice: 'from-orange-500/20 via-slate-900/90 to-rose-600/20',
      accentColor: '#F97316',
      shape: 'pill' as WidgetShape,
      opacity: 88,
      blur: 14,
      position: 'bottom-right' as const,
      size: 'standard' as const,
      soundEnabled: true,
    },
  },
  {
    name: 'Electric Neon Island',
    theme: {
      bgMode: 'glass' as BackgroundMode,
      solidColor: '#110d21',
      gradientChoice: 'from-purple-500/20 via-slate-900/90 to-pink-600/20',
      accentColor: '#A855F7',
      shape: 'island' as WidgetShape,
      opacity: 90,
      blur: 18,
      position: 'bottom-right' as const,
      size: 'expanded' as const,
      soundEnabled: true,
    },
  },
];

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  theme,
  onChangeTheme,
  onResetTheme,
  soundEnabled,
}) => {
  const [copiedToast, setCopiedToast] = useState(false);
  const [demoPrompt, setDemoPrompt] = useState('Analyze this screen for UX bugs & accessibility errors');

  const update = (partial: Partial<WidgetTheme>) => {
    if (soundEnabled) sound.playClick();
    onChangeTheme({ ...theme, ...partial });
  };

  const handleExportTheme = () => {
    const json = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedToast(true);
    if (soundEnabled) sound.playPing();
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 glass rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Widget Theme & Style Customizer
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Real-time Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Tailor your floating HUD overlay. Every styling tweak automatically syncs with your browser <code className="text-cyan-300 font-mono">localStorage</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToast ? 'Theme Copied!' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              onResetTheme();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 text-slate-400 rounded-lg text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Preset Curated Themes Selection Bar */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curated Theme Presets</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESET_THEMES.map((preset) => {
            const isSelected = theme.accentColor === preset.theme.accentColor && theme.bgMode === preset.theme.bgMode;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  if (soundEnabled) sound.playPing();
                  onChangeTheme(preset.theme);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg'
                    : 'glass hover:bg-slate-850/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-md"
                    style={{ backgroundColor: preset.theme.accentColor }}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {preset.theme.bgMode} • {preset.theme.shape}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Controls & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Style Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5 glass p-5 sm:p-6 rounded-2xl border border-slate-800">
          {/* Section 1: Background Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>1. Background Mode</span>
              <span className="text-[11px] text-slate-500 font-mono capitalize">{theme.bgMode}</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'solid', label: 'Solid Color', desc: 'Minimal & High Contrast' },
                { id: 'glass', label: 'Frosted Glass', desc: 'Glassmorphism Blur' },
                { id: 'gradient', label: 'Gradient Glow', desc: 'Vibrant & Modern' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  id={`btn-bg-mode-${mode.id}`}
                  onClick={() => update({ bgMode: mode.id as BackgroundMode })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    theme.bgMode === mode.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/40 shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-semibold">{mode.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Accent Colors */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>2. Accent Color</span>
              <span className="text-[11px] font-mono text-cyan-400">{theme.accentColor}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_ACCENTS.map((item) => {
                const isActive = theme.accentColor.toLowerCase() === item.hex.toLowerCase();
                return (
                  <button
                    key={item.name}
                    onClick={() => update({ accentColor: item.hex })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-slate-800 border-white ring-2 ring-white/20'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full shadow-lg border border-white/20"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="text-[10px] text-slate-300 font-medium text-center leading-none">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Custom Hex:</span>
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-28 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Section 3: Widget Shape */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>3. Widget Shape</span>
              <span className="text-[11px] text-slate-500 font-mono capitalize">{theme.shape}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'pill', label: 'Rounded Pill', shape: 'rounded-3xl' },
                { id: 'bar', label: 'Compact Bar', shape: 'rounded-2xl' },
                { id: 'square', label: 'Glass Square', shape: 'rounded-xl' },
                { id: 'island', label: 'Floating Island', shape: 'rounded-[2rem]' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => update({ shape: s.id as WidgetShape })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    theme.shape === s.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-4 mx-auto mb-1.5 border-2 border-current ${s.shape}`} />
                  <div className="text-xs">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Opacity & Blur Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Opacity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">Opacity</span>
                <span className="font-mono text-cyan-400">{theme.opacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={theme.opacity}
                onChange={(e) => update({ opacity: Number(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>20% (Subtle)</span>
                <span>100% (Solid)</span>
              </div>
            </div>

            {/* Blur Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">Backdrop Blur</span>
                <span className="font-mono text-cyan-400">{theme.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={theme.blur}
                onChange={(e) => update({ blur: Number(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0px (Crisp)</span>
                <span>24px (Heavy Frost)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Preview Box (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Live Preview</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Live Rendering</span>
          </div>

          <div className="p-4 glass-dark rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl min-h-[480px] flex items-center justify-center">
            {/* Background Pattern Behind Widget */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${theme.accentColor} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Live Interactive Widget Component */}
            <div className="w-full relative z-10">
              <FloatingPreviewWidget
                theme={theme}
                messages={[
                  {
                    id: 'preview-user',
                    sender: 'user',
                    text: demoPrompt,
                    timestamp: Date.now() - 5000,
                  },
                  {
                    id: 'preview-assistant',
                    sender: 'assistant',
                    text: 'Widget appearance is updated immediately. All accent tones, blur filters, background opacities, and rounded corners are applied in real time.',
                    timestamp: Date.now(),
                    result: {
                      summary: 'Sermate AI HUD Theme Preview',
                      detailedAnswer: 'Widget appearance is updated immediately. All accent tones, blur filters, background opacities, and rounded corners are applied in real time.',
                      detectedCategory: 'UI/UX Review',
                      confidence: 0.99,
                      actionItems: [
                        'Theme preferences saved to localStorage',
                        'Hotkeys mapped for desktop invocation',
                      ],
                      suggestedFollowUps: ['Test hotkey scan in sandbox', 'Inspect bounding box style'],
                      boundingBoxes: [],
                    }
                  }
                ]}
                prompt={demoPrompt}
                onChangePrompt={setDemoPrompt}
                onAnalyze={() => {
                  if (soundEnabled) sound.playPing();
                }}
                isAnalyzing={false}
                isStreaming={false}
                onSelectFollowUp={() => {}}
                modeBadge="THEME PREVIEW"
                isEmbeddedInSandbox={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
