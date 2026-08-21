import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  Key, 
  Power, 
  Keyboard, 
  Volume2, 
  VolumeX, 
  Radio,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { sound } from '../utils/audio';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';

interface HeaderProps {
  activeTab: 'dashboard' | 'customizer' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'customizer' | 'settings') => void;
  widgetActive: boolean;
  onToggleWidgetActive: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerHotkeyScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  widgetActive,
  onToggleWidgetActive,
  soundEnabled,
  onToggleSound,
  onTriggerHotkeyScan,
}) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const hotkeyLabel = isMac ? '⌘ + Backspace' : 'Ctrl + Shift + ⌫';

  return (
    <nav className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      {/* App Logo & Title */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => {
          if (soundEnabled) sound.playPing();
          onSelectTab('dashboard');
        }}
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:border-cyan-300 transition-all duration-300 bg-slate-950 flex items-center justify-center">
            <img 
              src={sermateLogo} 
              alt="Sermate AI Logo" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-200 transition-colors">
              Sermate<span className="text-cyan-400">AI</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold hidden sm:inline-block">
              Vision HUD
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:block -mt-0.5">
            Multimodal Screen Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Tabs Pill Container */}
      <div className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          id="nav-tab-dashboard"
          onClick={() => {
            if (soundEnabled) sound.playClick();
            onSelectTab('dashboard');
          }}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          id="nav-tab-customizer"
          onClick={() => {
            if (soundEnabled) sound.playClick();
            onSelectTab('customizer');
          }}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'customizer'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Widget HUD</span>
        </button>

        <button
          id="nav-tab-settings"
          onClick={() => {
            if (soundEnabled) sound.playClick();
            onSelectTab('settings');
          }}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API & Engine</span>
        </button>
      </div>

      {/* Right Controls & Status Pill */}
      <div className="flex items-center gap-2.5">
        {/* Audio Sound FX Toggle */}
        <button
          onClick={() => {
            if (!soundEnabled) sound.playPing();
            onToggleSound();
          }}
          className={`p-2 rounded-xl text-xs transition-all border ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:border-cyan-400/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Hotkey Test Trigger Button */}
        <button
          onClick={() => {
            if (soundEnabled) sound.playClick();
            onTriggerHotkeyScan();
          }}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm group"
          title="Simulate pressing the global screen capture hotkey"
        >
          <Keyboard className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11px] text-slate-400">{hotkeyLabel}</span>
        </button>

        {/* Widget Status Badge Button */}
        <button
          id="btn-toggle-widget-status"
          onClick={() => {
            if (soundEnabled) sound.playPing();
            onToggleWidgetActive();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-sm ${
            widgetActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${widgetActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">
            HUD: {widgetActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Mobile Navigation Sub-Bar */}
      <div className="flex md:hidden fixed bottom-0 inset-x-0 z-40 items-center justify-around px-2 py-2 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'dashboard' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onSelectTab('customizer')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'customizer' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Widget HUD</span>
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
            activeTab === 'settings' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-400'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
};
