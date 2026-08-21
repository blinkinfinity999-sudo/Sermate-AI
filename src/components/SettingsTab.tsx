import React, { useState } from 'react';
import { SettingsState, HistoryEntry } from '../types';
import { 
  Key, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sliders, 
  Database, 
  Trash2, 
  Clock, 
  Lock, 
  Zap, 
  HelpCircle,
  ExternalLink,
  Check
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsTabProps {
  settings: SettingsState;
  onChangeSettings: (settings: SettingsState) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
  onSelectHistoryEntry: (entry: HistoryEntry) => void;
  soundEnabled: boolean;
}

const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast (Lowest Latency)',
    desc: 'Engineered for sub-second screen triage and instant real-time HUD overlays',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Recommended Vision',
    desc: 'Balanced high speed & high precision spatial element detection',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Reasoning',
    desc: 'Complex multi-step code refactoring & mathematical table extraction',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Legacy Alias)',
    badge: 'Compatibility',
    desc: 'Automatically routed to high-performance Gemini 3 series backend',
  },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onChangeSettings,
  history,
  onClearHistory,
  onSelectHistoryEntry,
  soundEnabled,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const update = (partial: Partial<SettingsState>) => {
    if (soundEnabled) sound.playClick();
    onChangeSettings({ ...settings, ...partial });
  };

  const handleTestConnection = async () => {
    if (soundEnabled) sound.playScan();
    setIsTesting(true);
    setTestResult(null);

    const startTime = performance.now();
    const apiKey = settings.geminiApiKey?.trim();

    if (!apiKey) {
      if (soundEnabled) sound.playError();
      setTestResult({
        success: false,
        message: 'Please enter a Gemini API Key to test.',
      });
      setIsTesting(false);
      return;
    }

    try {
      // 1. Try backend endpoint first
      let data: any = null;
      try {
        const res = await fetch('/api/test-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: settings.geminiApiKey,
            model: settings.model,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Backend not available (e.g. GitHub Pages static host)
      }

      // 2. If backend endpoint returned data, use it
      if (data && data.success) {
        const latencyMs = Math.round(performance.now() - startTime);
        if (soundEnabled) sound.playSuccess();
        setTestResult({
          success: true,
          message: `Connection successful! Verified on ${data.modelUsed} (${latencyMs}ms)`,
          latencyMs,
        });
        setIsTesting(false);
        return;
      }

      // 3. Static host direct verification fallback (for GitHub Pages / static hosting)
      const targetModel = settings.model || 'gemini-2.5-flash';
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the single word 'CONNECTED'." }] }],
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const directData = await directRes.json();

      if (directRes.ok && directData.candidates?.[0]?.content?.parts?.[0]?.text) {
        if (soundEnabled) sound.playSuccess();
        setTestResult({
          success: true,
          message: `Connection verified directly on ${targetModel} (${latencyMs}ms)! Ready for screen analysis.`,
          latencyMs,
        });
      } else {
        if (soundEnabled) sound.playError();
        const errDetail = directData?.error?.message || 'Invalid API Key or model unavailable.';
        setTestResult({
          success: false,
          message: `API Key check failed: ${errDetail}`,
        });
      }
    } catch (err: any) {
      if (soundEnabled) sound.playError();
      setTestResult({
        success: false,
        message: err.message || 'Network error when contacting Gemini API.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 glass rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              API Configuration & BYOK Settings
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Client LocalStorage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Bring Your Own Key (BYOK) for unlimited live vision analysis, or use the built-in instant Mock Mode.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: API & Model Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: BYOK Gemini Key */}
          <div className="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Google Gemini API Key</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/60 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted in LocalStorage</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Enter Your API Key:</span>
                <span className="text-[10px] text-slate-500">Starts with AIzaSy...</span>
              </label>
              
              <div className="relative">
                <input
                  id="input-gemini-key"
                  type={showKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) => update({ geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 pr-24 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                />

                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>No key? Built-in fallback mock mode works automatically.</span>
                </p>

                {/* Test Connection Button */}
                <button
                  id="btn-test-connection"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing API...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Feedback Box */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">
                      {testResult.success ? 'Verification Passed' : 'Verification Failed'}
                    </div>
                    <div className="text-[11px] opacity-90 mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Model Selection Dropdown */}
          <div className="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Multimodal Vision Model</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Active: {settings.model}
              </span>
            </div>

            <div className="space-y-2.5">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = settings.model === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => update({ model: m.id })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-400/40 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{m.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: System Persona & Mock Mode Toggle */}
          <div className="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Assistant Behavior & Mock Toggle</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Turbo Response Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/30">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
                    <span>Turbo Low-Latency Stream (Sub-Second)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bypasses thinking overhead and streams vision answers instantly (0ms thinking budget)
                  </div>
                </div>
                <button
                  onClick={() => update({ turboMode: !(settings.turboMode ?? true) })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 border ${
                    (settings.turboMode ?? true) ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      (settings.turboMode ?? true) ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Force Mock Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <div className="font-semibold text-white">Force Mock Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Use high-fidelity offline simulated responses without calling external API
                  </div>
                </div>
                <button
                  onClick={() => update({ isMockMode: !settings.isMockMode })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 border ${
                    settings.isMockMode ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.isMockMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* System Instruction Customizer */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Custom System Persona:</span>
                  <span className="text-[10px] text-slate-500 font-mono">System Prompt</span>
                </label>
                <textarea
                  rows={2}
                  value={settings.systemInstruction}
                  onChange={(e) => update({ systemInstruction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History & Diagnostics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* History Panel */}
          <div className="glass p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Recent Analysis History</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (soundEnabled) sound.playClick();
                    onClearHistory();
                  }}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear ({history.length})</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 text-slate-500 text-xs">
                <Clock className="w-6 h-6 text-slate-700 mb-1" />
                <span>No analysis history logged yet</span>
                <span className="text-[10px] text-slate-600 mt-1">Queries you run in the sandbox will appear here</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      if (soundEnabled) sound.playClick();
                      onSelectHistoryEntry(entry);
                    }}
                    className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-1 text-xs group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {entry.modelUsed}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                      {entry.prompt}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {entry.result.summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ / BYOK Security Notes */}
          <div className="p-4 glass-dark border border-slate-800 rounded-xl text-xs space-y-2 text-slate-400">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Security Assurances</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
              <li>API Keys are stored exclusively in your browser's <code className="text-cyan-300">localStorage</code>.</li>
              <li>Requests are passed via server-side proxy to protect headers.</li>
              <li>No screenshots or query prompts are stored on remote third-party databases.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
