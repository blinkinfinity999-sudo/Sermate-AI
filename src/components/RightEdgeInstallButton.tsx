import React, { useState } from 'react';
import { Download, Sparkles, Check, Info } from 'lucide-react';
import { sound } from '../utils/audio';

interface RightEdgeInstallButtonProps {
  onTriggerDirectInstall: () => Promise<void>;
  soundEnabled: boolean;
  isAppInstalled: boolean;
}

export const RightEdgeInstallButton: React.FC<RightEdgeInstallButtonProps> = ({
  onTriggerDirectInstall,
  soundEnabled,
  isAppInstalled,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // If the app is already installed or opened in standalone mode, disappear completely as requested
  if (isAppInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (soundEnabled) sound.playPing();
    await onTriggerDirectInstall();
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
      {/* Popover guide tooltip if native prompt is deferred */}
      {showTooltip && (
        <div className="mr-2 p-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-xl text-xs text-slate-200 max-w-xs animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
            <Info className="w-3.5 h-3.5" />
            <span>Install Sermate AI</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Click to trigger browser installation. You can also use your browser menu &rarr; &quot;Install Sermate AI&quot; / &quot;Add to Home Screen&quot;.
          </p>
        </div>
      )}

      <button
        id="btn-right-edge-install"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex items-center gap-2 pl-3 pr-2.5 py-3 bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white border-l border-y border-cyan-500/50 hover:border-cyan-400 rounded-l-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 hover:pl-4 hover:shadow-cyan-500/25 cursor-pointer"
        style={{
          boxShadow: '-5px 0 25px -5px rgba(0, 240, 255, 0.35), 0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
        title="Click to install SerMate AI as a standalone app"
      >
        {/* Pulsing Glowing Indicator Dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>

        {/* Icon & Label */}
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
          <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform animate-bounce" />
        </div>

        {/* Text Label */}
        <div className="flex flex-col items-start pr-1">
          <span className="text-[11px] font-extrabold tracking-tight text-white flex items-center gap-1">
            <span>Install</span>
            <span className="text-cyan-400 font-mono">App</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
            1-Click
          </span>
        </div>
      </button>
    </div>
  );
};
