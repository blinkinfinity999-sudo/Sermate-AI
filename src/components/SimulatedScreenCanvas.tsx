import React, { useRef, useState } from 'react';
import { ScreenScenario, BoundingBox } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Upload, 
  Monitor, 
  Maximize2, 
  Sparkles, 
  Layers, 
  Eye, 
  EyeOff,
  RefreshCw,
  Camera
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SimulatedScreenCanvasProps {
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
  isScanning: boolean;
  soundEnabled: boolean;
}

export const SimulatedScreenCanvas: React.FC<SimulatedScreenCanvasProps> = ({
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
  isScanning,
  soundEnabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (soundEnabled) sound.playPing();
          onUploadCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureRealScreen = async () => {
    try {
      if (soundEnabled) sound.playClick();
      setIsScreenSharing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        onUploadCustomImage(base64);
        if (soundEnabled) sound.playSuccess();
      }
      track.stop();
      setIsScreenSharing(false);
    } catch (err) {
      console.warn('Screen capture cancelled or unavailable:', err);
      setIsScreenSharing(false);
    }
  };

  const getBoxColor = (type: BoundingBox['type']) => {
    switch (type) {
      case 'error':
        return {
          border: 'border-rose-500/80',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        };
      case 'warning':
        return {
          border: 'border-amber-400/80',
          bg: 'bg-amber-400/10',
          text: 'text-amber-300',
          badge: 'bg-amber-500 text-slate-950',
          glow: 'shadow-[0_0_20px_rgba(251,191,36,0.35)]',
        };
      case 'interactive':
        return {
          border: 'border-cyan-400/80',
          bg: 'bg-cyan-400/10',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500 text-slate-950',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
        };
      case 'info':
      default:
        return {
          border: 'border-indigo-400/80',
          bg: 'bg-indigo-400/10',
          text: 'text-indigo-300',
          badge: 'bg-indigo-500 text-white',
          glow: 'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
        };
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-slate-900/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-widest text-[10px] text-slate-400 font-bold">Target Environment</span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">•</span>
          <span className="text-xs text-cyan-300 truncate max-w-[180px] sm:max-w-xs font-mono">
            {customImageBase64 ? 'Custom Screen Input' : scenario.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bounding Box Overlay Toggle */}
          <button
            id="btn-toggle-boxes"
            onClick={() => {
              if (soundEnabled) sound.playClick();
              onToggleShowBoxes();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              showBoxes 
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
            title="Toggle AI bounding box detection overlays"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Boxes ({boundingBoxes.length})</span>
          </button>

          {/* Screen Capture / Live Window */}
          <button
            id="btn-live-capture"
            onClick={handleCaptureRealScreen}
            disabled={isScreenSharing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
            title="Capture real browser window / screen via ScreenShare API"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          {/* Upload Custom Screenshot */}
          <button
            id="btn-upload-screenshot"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
            title="Upload custom image to analyze"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Scenario Presets Selector Tabs */}
      <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0 mr-1">
          Presets:
        </span>
        {allScenarios.map((sc) => {
          const isActive = !customImageBase64 && scenario.id === sc.id;
          return (
            <button
              key={sc.id}
              id={`tab-scenario-${sc.id}`}
              onClick={() => {
                if (soundEnabled) sound.playClick();
                onSelectScenario(sc);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-slate-950' :
                sc.category === 'Bug/Crash' ? 'bg-rose-400' :
                sc.category === 'UI/UX Review' ? 'bg-amber-400' :
                sc.category === 'Code Error' ? 'bg-purple-400' : 'bg-cyan-400'
              }`} />
              {sc.title}
            </button>
          );
        })}
        {customImageBase64 && (
          <button
            onClick={() => onSelectScenario(allScenarios[0])}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition-all flex items-center gap-1 shrink-0 ml-auto"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Presets</span>
          </button>
        )}
      </div>

      {/* Main Simulated Screen Viewport */}
      <div className="relative flex-1 min-h-[380px] lg:min-h-[460px] bg-slate-950 p-4 flex items-center justify-center overflow-hidden select-none">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Scanning Laser Animation Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00F0FF] animate-[pulse_1s_ease-in-out_infinite]" 
                 style={{ top: '35%' }} />
            <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[1px] animate-pulse" />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-cyan-500/50 rounded-xl text-xs font-mono text-cyan-300 shadow-xl shadow-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>MULTIMODAL VISION SCAN IN PROGRESS...</span>
            </div>
          </div>
        )}

        {/* The Simulated Screen Box Container */}
        <div className="relative w-full h-full max-h-[520px] rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
          {/* Simulated Window Title Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-500 text-[11px] font-mono ml-2">
                localhost:3000 — {scenario.category}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800/80 text-cyan-400 border border-slate-700">
              1920x1080
            </span>
          </div>

          {/* Screen Content Render */}
          <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col justify-center">
            {customImageBase64 ? (
              /* User Uploaded Custom Screen */
              <div className="relative w-full h-full flex items-center justify-center p-2 bg-slate-950">
                <img
                  src={customImageBase64}
                  alt="Custom Analysis Subject"
                  className="max-h-full max-w-full object-contain rounded-lg border border-slate-800 shadow-lg"
                />
              </div>
            ) : scenario.screenType === 'svg-code' ? (
              /* Scenario 1: React Runtime Crash Screen */
              <div className="w-full h-full p-4 sm:p-6 font-mono text-xs text-slate-300 flex flex-col justify-between bg-slate-950">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 p-3 rounded-lg border border-rose-900/60">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                    <div>
                      <div className="font-bold text-sm text-rose-300">
                        Unhandled Runtime Error: TypeError
                      </div>
                      <div className="text-[11px] text-rose-400/90">
                        Cannot read properties of undefined (reading 'map')
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1 text-slate-400 text-[11px]">
                    <div className="text-slate-500">// Source: src/components/ShoppingCartDrawer.tsx:42:18</div>
                    <div className="text-slate-300">40 |   return (</div>
                    <div className="text-slate-300">41 |     &lt;div className="cart-container"&gt;</div>
                    <div className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-semibold">
                      42 |       {'{'}cartData.items.map((item) =&gt; (&lt;CartRow ... /&gt;)){'}'}
                    </div>
                    <div className="text-slate-300">43 |     &lt;/div&gt;</div>
                    <div className="text-slate-300">44 |   );</div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Hydration mismatch: server rendered 0 items, client state was null.
                  </span>
                  <span className="text-cyan-400 font-semibold cursor-pointer hover:underline">
                    Inspect Stack &gt;
                  </span>
                </div>
              </div>
            ) : scenario.screenType === 'svg-mobile' ? (
              /* Scenario 2: Mobile UI & Contrast Defect */
              <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950">
                <div className="w-full max-w-xs h-[92%] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                      <span className="font-bold text-white">Your Cart (3 items)</span>
                      <span className="text-cyan-400 font-semibold">$148.00</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-slate-850 rounded-lg border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-slate-200 font-medium">Mechanical Keyboard</div>
                          <div className="text-[10px] text-slate-500">Qty: 1 • Switches: Tactile</div>
                        </div>
                        <span className="text-slate-300 font-mono">$120.00</span>
                      </div>

                      <div className="p-2 bg-slate-850 rounded-lg border border-slate-800 flex justify-between">
                        <div>
                          <div className="text-slate-200 font-medium">Custom Keycap Set</div>
                          <div className="text-[10px] text-slate-500">Qty: 1 • Cyberpunk Theme</div>
                        </div>
                        <span className="text-slate-300 font-mono">$28.00</span>
                      </div>

                      {/* Low Contrast Coupon Element */}
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-600 font-mono">CODE: SUMMER2026 (-$0.00)</span>
                        <button className="text-[10px] text-zinc-600 border border-zinc-700 px-1 py-0.5 rounded">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Bottom CTA */}
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Total Amount:</span>
                      <span className="text-white font-bold">$148.00 USD</span>
                    </div>
                    <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            ) : scenario.screenType === 'svg-chart' ? (
              /* Scenario 3: SaaS Revenue Analytics & Anomaly */
              <div className="w-full h-full p-4 sm:p-6 bg-slate-950 flex flex-col justify-between text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Enterprise ARR & Cohort Retention</h3>
                    <p className="text-slate-400 text-[11px]">Quarterly Financial Analytics (Q1 - Q3 2026)</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
                      ARR: $4.20M (+24%)
                    </span>
                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/30">
                      Churn Alert: 5.2%
                    </span>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="grid grid-cols-4 gap-3 items-end h-36 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-400">$2.8M</span>
                    <div className="w-full bg-cyan-600/40 hover:bg-cyan-500 rounded-t h-[55%] transition-all" />
                    <span className="text-[10px] text-slate-500">Q4-25</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-400">$3.1M</span>
                    <div className="w-full bg-cyan-600/60 hover:bg-cyan-500 rounded-t h-[68%] transition-all" />
                    <span className="text-[10px] text-slate-500">Q1-26</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-400">$3.4M</span>
                    <div className="w-full bg-cyan-600/80 hover:bg-cyan-500 rounded-t h-[78%] transition-all" />
                    <span className="text-[10px] text-slate-500">Q2-26</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-cyan-300 font-bold">$4.2M ⭐</span>
                    <div className="w-full bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-t h-[95%] shadow-lg shadow-cyan-500/20 animate-pulse" />
                    <span className="text-[10px] text-cyan-300 font-semibold">Q3-26</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Net Retention</div>
                    <div className="text-white font-bold text-xs mt-0.5">124.0%</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400">CAC Payback</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">9.4 Months</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-rose-900/60 bg-rose-950/20">
                    <div className="text-rose-300">Enterprise Churn</div>
                    <div className="text-rose-400 font-bold text-xs mt-0.5">5.2% (Spike)</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Gross Margin</div>
                    <div className="text-white font-bold text-xs mt-0.5">82.4%</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Scenario 4: DB Deadlock / Server Metrics */
              <div className="w-full h-full p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 flex flex-col justify-between">
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">Postgres Production Cluster (Node-01)</span>
                  </div>
                  <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-500/20">
                    DEADLOCK_DETECTED
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="text-rose-400 font-bold">ERROR: deadlock detected (SQLSTATE: 40P01)</div>
                  <div className="text-slate-400">Detail: Process 9841 waits for ExclusiveLock on tuple (14, 2) of relation 16384 ("orders"); blocked by process 9845.</div>
                  <div className="text-slate-400">Process 9845 waits for ShareLock on transaction 821948; blocked by process 9841.</div>
                  <div className="text-slate-500 mt-2">Hint: See server log for query details.</div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                  <span className="text-slate-400">P99 Query Latency: <strong className="text-rose-400">14,200ms</strong></span>
                  <span className="text-slate-400">Active Pool Connections: <strong className="text-amber-400">98/100</strong></span>
                </div>
              </div>
            )}

            {/* Bounding Box Visual Overlay Layer */}
            {showBoxes && boundingBoxes.map((box) => {
              const [ymin, xmin, ymax, xmax] = box.box2d;
              const top = `${ymin}%`;
              const left = `${xmin}%`;
              const width = `${Math.max(xmax - xmin, 8)}%`;
              const height = `${Math.max(ymax - ymin, 8)}%`;
              const styles = getBoxColor(box.type);
              const isSelected = selectedBoxId === box.id;

              return (
                <div
                  key={box.id}
                  id={`bbox-${box.id}`}
                  onClick={() => {
                    if (soundEnabled) sound.playClick();
                    onSelectBox(isSelected ? null : box.id);
                  }}
                  className={`absolute transition-all cursor-pointer z-20 border-2 rounded-lg flex flex-col justify-end p-1 ${styles.border} ${styles.bg} ${
                    isSelected ? `${styles.glow} ring-2 ring-white scale-[1.01]` : 'hover:scale-[1.005]'
                  }`}
                  style={{ top, left, width, height }}
                >
                  {/* Bounding Box Label Tag */}
                  <span className={`text-[8px] text-white px-1 self-start rounded font-mono font-bold tracking-tight shadow-md flex items-center gap-1 ${styles.badge}`}>
                    {box.label}
                  </span>

                  {/* Tooltip on active selection */}
                  {isSelected && (
                    <div className="absolute top-full left-0 mt-1 z-30 w-56 p-2 bg-slate-900/95 border border-slate-700 text-slate-200 rounded-lg shadow-xl text-[11px] backdrop-blur-md">
                      <div className="font-semibold text-white mb-0.5">{box.label}</div>
                      <div className="text-slate-300 leading-snug">{box.description}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Scenario Info Footer */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{scenario.description}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
            Spatial 100% Normalized
          </span>
        </div>
      </div>
    </div>
  );
};
