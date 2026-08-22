import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  Smartphone, 
  AppWindow, 
  Terminal, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Power,
  ShieldCheck,
  Zap,
  ArrowRight,
  Laptop
} from 'lucide-react';
import { sound } from '../utils/audio';
import { openStandaloneFloatingHUD } from '../utils/pipCompanion';
import sermateLogo from '../assets/images/sermate_ai_logo_1787137401771.jpg';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetActive: boolean;
  onToggleWidgetActive: () => void;
  soundEnabled: boolean;
  deferredPrompt: any;
  isAppInstalled: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  widgetActive,
  onToggleWidgetActive,
  soundEnabled,
  deferredPrompt,
  isAppInstalled,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'floating' | 'electron' | 'mobile'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    if (soundEnabled) sound.playClick();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallStatus('App installed successfully! Check your desktop or home screen.');
          if (soundEnabled) sound.playSuccess();
        } else {
          setInstallStatus('Installation cancelled. You can install anytime.');
        }
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else {
      // Guide instructions for browsers without prompt event
      setInstallStatus('Use your browser’s "Install" button or 3-dots menu > "Install Sermate AI" / "Add to Home Screen".');
    }
  };

  const handleLaunchFloatingWindow = async () => {
    if (soundEnabled) sound.playPing();
    if (!widgetActive) {
      onToggleWidgetActive();
    }
    await openStandaloneFloatingHUD();
    onClose();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    if (soundEnabled) sound.playPing();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadWindowsScript = () => {
    const scriptContent = `@echo off
echo ==============================================
echo   Launching Sermate AI System-Wide Desktop HUD
echo ==============================================
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Starting Sermate AI Overlay...
npx electron .
pause`;
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'launch-sermate-hud.bat';
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) sound.playSuccess();
  };

  const handleDownloadMacScript = () => {
    const scriptContent = `#!/bin/bash
echo "=============================================="
echo "  Launching Sermate AI System-Wide Desktop HUD"
echo "=============================================="
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "Starting Sermate AI Overlay..."
npx electron .`;
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'launch-sermate-hud.sh';
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) sound.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 240, 255, 0.2), 0 0 40px -10px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 bg-slate-950 flex items-center justify-center">
              <img 
                src={sermateLogo} 
                alt="Sermate AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Download & Install <span className="text-cyan-400">Sermate AI</span>
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                  Desktop & Mobile
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Keep the AI Screen HUD floating across your desktop or mobile anytime.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global HUD Status Switch Banner inside Modal */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${widgetActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-semibold text-slate-200">
              HUD Overlay Companion: <span className={widgetActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{widgetActive ? 'ACTIVE (Will stay with you)' : 'OFF'}</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playPing();
              onToggleWidgetActive();
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer ${
              widgetActive
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/10'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{widgetActive ? 'Turn HUD OFF' : 'Turn HUD ON'}</span>
          </button>
        </div>

        {/* Platform Tabs Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              setActiveTab('pwa');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AppWindow className="w-4 h-4" />
            <span>1-Click App Install</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              setActiveTab('floating');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'floating'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Always-On-Top Window</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              setActiveTab('electron');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'electron'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Desktop Native (Electron)</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              setActiveTab('mobile');
            }}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Home Screen</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* TAB 1: 1-Click PWA App Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Instant Progressive Web App (PWA)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Install Sermate AI as a standalone desktop or mobile app. It opens in its own window without browser address bars, launches from your dock/taskbar, and remembers your HUD preference even when closed.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handlePwaInstall}
                    className="w-full sm:w-auto px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>{isAppInstalled ? 'App Already Installed — Re-Install' : 'Install Sermate AI to Desktop / Device'}</span>
                  </button>
                </div>

                {installStatus && (
                  <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs text-cyan-200 font-mono">
                    {installStatus}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2 text-xs text-slate-400">
                <div className="font-bold text-slate-200">How installation works:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Chrome / Edge (PC & Mac):</strong> Click the button above or click the install icon in your browser's address bar.</li>
                  <li><strong>Safari (macOS):</strong> Click <em>File &gt; Add to Dock</em> to run Sermate AI as a native Mac app.</li>
                  <li><strong>Mobile (iOS / Android):</strong> Open the browser share menu and tap <em>"Add to Home Screen"</em>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Always-On-Top System Floating Window */}
          {activeTab === 'floating' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Detached Floating Desktop HUD</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Open Sermate AI in an independent floating mini-window (Picture-in-Picture / Standalone Popup). It stays anchored on your screen over your code editor, videos, or full-screen apps even when you leave or minimize this tab!
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleLaunchFloatingWindow}
                    className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-950" />
                    <span>Launch System Floating HUD Window</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">📌 Stays With You</div>
                  <p className="text-slate-400">Floats outside your browser so you can code, write, or browse while talking to Sermate AI.</p>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-slate-200">⚡ Always On</div>
                  <p className="text-slate-400">Remains running until you manually toggle "HUD: OFF" or click the "X" button.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Desktop Native (Electron) */}
          {activeTab === 'electron' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>Native System-Wide Overlay (Electron Engine)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Run Sermate AI as a native background desktop overlay with transparent glass mode, always-on-top level (<code className="text-cyan-300">screen-saver</code>), and global hotkeys (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-300">Cmd+Backspace</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-300">Ctrl+Shift+Backspace</kbd>).
                </p>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={handleDownloadWindowsScript}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Windows Launcher (.bat)</span>
                  </button>

                  <button
                    onClick={handleDownloadMacScript}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Mac/Linux Launcher (.sh)</span>
                  </button>
                </div>
              </div>

              {/* Terminal Quick Commands */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Terminal Quick Launch Command</span>
                  </div>
                  <button
                    onClick={() => handleCopy('git clone https://github.com/blinkinfinity999-sudo/Sermate-AI.git && cd Sermate-AI && npm install && npx electron .', 'cmd-electron')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 cursor-pointer"
                  >
                    {copiedCode === 'cmd-electron' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'cmd-electron' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900/90 rounded-lg text-xs font-mono text-cyan-200 overflow-x-auto border border-slate-800 scrollbar-thin">
                  <code>git clone https://github.com/blinkinfinity999-sudo/Sermate-AI.git &#38;&#38; cd Sermate-AI &#38;&#38; npm install &#38;&#38; npx electron .</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Mobile Home Screen */}
          {activeTab === 'mobile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Mobile Screen Intelligence Widget</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Add Sermate AI directly to your iPhone, iPad, or Android home screen for one-tap mobile screen diagnosis and chat companion access.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>🍎 iPhone & iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                    <li>Open Sermate AI in Safari.</li>
                    <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top right.</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>🤖 Android (Chrome / Samsung)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                    <li>Open Sermate AI in Chrome.</li>
                    <li>Tap the <strong>three dots (⋮)</strong> menu in the top right.</li>
                    <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                    <li>Confirm by tapping <strong>Install</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Zero install permissions required. Runs securely.</span>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) sound.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
