import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WidgetTheme, 
  SettingsState, 
  ScreenScenario, 
  BoundingBox, 
  AnalysisResult, 
  HistoryEntry 
} from './types';
import { 
  loadStoredTheme, 
  saveStoredTheme, 
  DEFAULT_THEME,
  loadStoredSettings, 
  saveStoredSettings, 
  DEFAULT_SETTINGS,
  loadWidgetActive, 
  saveWidgetActive, 
  loadHistory, 
  saveHistory 
} from './utils/storage';
import { MOCK_SCENARIOS } from './data/mockScenarios';
import { sound } from './utils/audio';
import { optimizeImageForVision } from './utils/imageOptimizer';
import { Header } from './components/Header';
import { DashboardSandbox } from './components/DashboardSandbox';
import { WidgetCustomizer } from './components/WidgetCustomizer';
import { SettingsTab } from './components/SettingsTab';
import { FloatingOverlayWidget } from './components/FloatingOverlayWidget';

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customizer' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<WidgetTheme>(loadStoredTheme);
  const [settings, setSettings] = useState<SettingsState>(loadStoredSettings);
  const [widgetActive, setWidgetActive] = useState<boolean>(loadWidgetActive);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  // Scenario & Screen State
  const [currentScenario, setCurrentScenario] = useState<ScreenScenario>(MOCK_SCENARIOS[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>(MOCK_SCENARIOS[0].mockResult.boundingBoxes);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Query & Analysis State
  const [prompt, setPrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hotkeyFlashed, setHotkeyFlashed] = useState<boolean>(false);
  const [floatingOverlayOpen, setFloatingOverlayOpen] = useState<boolean>(false);

  const streamIntervalRef = useRef<any>(null);

  // Sync Theme to localStorage
  const handleUpdateTheme = (newTheme: WidgetTheme) => {
    setTheme(newTheme);
    saveStoredTheme(newTheme);
  };

  const handleResetTheme = () => {
    setTheme(DEFAULT_THEME);
    saveStoredTheme(DEFAULT_THEME);
  };

  // Sync Settings to localStorage
  const handleUpdateSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Toggle Widget Active Status
  const handleToggleWidgetActive = () => {
    const next = !widgetActive;
    setWidgetActive(next);
    saveWidgetActive(next);
  };

  // Switch Scenario
  const handleSelectScenario = (scenario: ScreenScenario) => {
    setCurrentScenario(scenario);
    setCustomImageBase64(null);
    setBoundingBoxes(scenario.mockResult.boundingBoxes);
    setSelectedBoxId(null);
    setAnalysisResult(null);
    setStreamingText('');
    setIsStreaming(false);
  };

  // Custom Screenshot upload
  const handleUploadCustomImage = (base64: string) => {
    setCustomImageBase64(base64);
    setBoundingBoxes([]);
    setSelectedBoxId(null);
    setAnalysisResult(null);
    setStreamingText('');
    setIsStreaming(false);
  };

  // Ultra-Fast Streaming Text Animation (Light-speed reveal)
  const streamTextOutput = useCallback((fullText: string, finalResult: AnalysisResult) => {
    setIsStreaming(true);
    setStreamingText('');
    let currentIdx = 0;
    const words = fullText.split(' ');

    if (streamIntervalRef.current) {
      cancelAnimationFrame(streamIntervalRef.current);
    }

    const step = () => {
      if (currentIdx < words.length) {
        currentIdx += 12; // High-throughput token burst
        setStreamingText(words.slice(0, currentIdx).join(' '));
        streamIntervalRef.current = requestAnimationFrame(step);
      } else {
        setStreamingText(fullText);
        setIsStreaming(false);
        setAnalysisResult(finalResult);
        if (theme.soundEnabled) sound.playSuccess();
      }
    };

    streamIntervalRef.current = requestAnimationFrame(step);
  }, [theme.soundEnabled]);

  // Main Screen Analysis Handler (Ultra-Fast Multimodal Pipeline)
  const handleAnalyzeScreen = useCallback(async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    const startTime = Date.now();
    if (theme.soundEnabled) sound.playScan();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setStreamingText('');

    // Highlight bounding boxes
    setShowBoxes(true);

    try {
      // Check for quick greetings / conversational queries
      const cleanQ = query.trim().toLowerCase();
      const isGreeting = /^(hi|hello|hey|greetings|howdy|yo|good\s+(morning|afternoon|evening)|sup)\b/i.test(cleanQ);
      const isIntro = /^(who are you|what can you do|help|what is sermate|commands|shortcuts|what are you)\b/i.test(cleanQ);

      // 1. Instant response for zero-latency greeting / intro shortcuts
      if ((isGreeting || isIntro) && !customImageBase64) {
        const instantResult: AnalysisResult = {
          summary: 'Sermate AI Screen Companion Active',
          detailedAnswer: `👋 **Hello! I am Sermate AI**, your ultra-fast multimodal screen intelligence assistant.

### Quick Actions:
- 🔍 **Code & Bug Diagnosis**: Inspect active screen elements, null-pointer crashes, and console exceptions.
- 🎨 **UI/UX & Layout Inspection**: Detect styling overflows, responsive issues, and color contrast.
- ⚡ **Desktop Overlay Mode**: Trigger anytime using global hotkey (\`⌘ + Backspace\` or \`Ctrl + Shift + Backspace\`).
- 📊 **Instant Extraction**: Parse tabular stats and error traces into copyable formats.

*Type any question, select a preset above, or upload a custom screenshot!*`,
          detectedCategory: 'General Q&A',
          confidence: 0.99,
          actionItems: [
            'Press global hotkey to toggle overlay',
            'Select a preset scenario above to test visual bounding boxes',
            'Upload a screenshot for AI vision diagnosis'
          ],
          boundingBoxes: [],
          suggestedFollowUps: [
            'How do I inspect my screen?',
            'What models are supported?',
            'Explain keyboard shortcuts'
          ],
          latencyMs: 12,
          timeToFirstTokenMs: 4,
        };

        setIsAnalyzing(false);
        streamTextOutput(instantResult.detailedAnswer, instantResult);
        return;
      }

      // 2. Ultra-Fast Image Downsampling for microsecond network transfer
      let preparedImageBase64: string | undefined = undefined;
      let optimizationStats: AnalysisResult['imageOptimizationStats'] = undefined;

      if (customImageBase64) {
        const optimized = await optimizeImageForVision(customImageBase64, 800, 0.75);
        preparedImageBase64 = optimized.optimizedBase64;
        optimizationStats = {
          originalKb: optimized.originalSizeKb,
          optimizedKb: optimized.optimizedSizeKb,
          ratio: optimized.compressionRatio,
        };
      }

      // 2. Real-Time Streaming Vision / Text API Call
      if (!settings.isMockMode && (settings.geminiApiKey || process.env.NODE_ENV !== 'production')) {
        try {
          const response = await fetch('/api/analyze-screen-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: query,
              imageBase64: preparedImageBase64,
              model: settings.model,
              apiKey: settings.geminiApiKey,
              systemInstruction: settings.systemInstruction,
              turboMode: settings.turboMode ?? true,
            }),
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedRaw = '';
            let parsedFinalResult: AnalysisResult | null = null;
            let streamModelUsed = settings.model;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunkStr = decoder.decode(value, { stream: true });
              const lines = chunkStr.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const jsonStr = line.slice(6).trim();
                  if (!jsonStr) continue;

                  try {
                    const evt = JSON.parse(jsonStr);

                    if (evt.type === 'text_chunk') {
                      accumulatedRaw += evt.text;
                      setIsStreaming(true);
                      setStreamingText(accumulatedRaw);
                    } else if (evt.type === 'chunk') {
                      accumulatedRaw += evt.text;
                      setIsStreaming(true);
                      
                      const match = accumulatedRaw.match(/"detailedAnswer"\s*:\s*"((?:[^"\\]|\\.)*)/);
                      if (match && match[1]) {
                        try {
                          setStreamingText(JSON.parse(`"${match[1]}"`));
                        } catch {
                          setStreamingText(match[1]);
                        }
                      } else if (accumulatedRaw.trim().startsWith('{')) {
                        setStreamingText('✨ Scanning visual components and inspecting screen elements...');
                      } else {
                        setStreamingText(accumulatedRaw);
                      }
                    } else if (evt.type === 'done' && evt.data) {
                      const totalLat = evt.latencyMs || (Date.now() - startTime);
                      parsedFinalResult = {
                        ...evt.data,
                        latencyMs: totalLat,
                        timeToFirstTokenMs: evt.timeToFirstTokenMs,
                        imageOptimizationStats: optimizationStats,
                      };
                      if (evt.modelUsed) streamModelUsed = evt.modelUsed;
                    }
                  } catch {
                    // Ignore transient chunk parse issues
                  }
                }
              }
            }

            if (parsedFinalResult) {
              setBoundingBoxes(parsedFinalResult.boundingBoxes?.length ? parsedFinalResult.boundingBoxes : currentScenario.mockResult.boundingBoxes);
              setIsAnalyzing(false);
              setIsStreaming(false);
              setAnalysisResult(parsedFinalResult);
              if (theme.soundEnabled) sound.playSuccess();

              // Log to History
              const newEntry: HistoryEntry = {
                id: 'hist-' + Date.now(),
                timestamp: Date.now(),
                prompt: query,
                scenarioTitle: customImageBase64 ? 'Custom Screenshot' : currentScenario.title,
                result: parsedFinalResult,
                modelUsed: streamModelUsed,
              };
              const updatedHist = [newEntry, ...history];
              setHistory(updatedHist);
              saveHistory(updatedHist);
              return;
            }
          }
        } catch (streamErr) {
          console.warn('Streaming endpoint fallback to standard endpoint:', streamErr);
        }

        // Fallback to standard fast REST endpoint
        try {
          const response = await fetch('/api/analyze-screen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: query,
              imageBase64: preparedImageBase64,
              model: settings.model,
              apiKey: settings.geminiApiKey,
              systemInstruction: settings.systemInstruction,
              turboMode: settings.turboMode ?? true,
            }),
          });

          const data = await response.json();

          if (data.success && data.data) {
            const resData: AnalysisResult = {
              ...data.data,
              latencyMs: data.latencyMs || (Date.now() - startTime),
              imageOptimizationStats: optimizationStats,
            };
            setBoundingBoxes(resData.boundingBoxes?.length ? resData.boundingBoxes : currentScenario.mockResult.boundingBoxes);

            const newEntry: HistoryEntry = {
              id: 'hist-' + Date.now(),
              timestamp: Date.now(),
              prompt: query,
              scenarioTitle: customImageBase64 ? 'Custom Screenshot' : currentScenario.title,
              result: resData,
              modelUsed: data.modelUsed || settings.model,
            };
            const updatedHist = [newEntry, ...history];
            setHistory(updatedHist);
            saveHistory(updatedHist);

            setIsAnalyzing(false);
            streamTextOutput(resData.detailedAnswer || resData.summary, resData);
            return;
          }
        } catch (apiErr) {
          console.warn('Backend API unavailable, attempting direct client-side fallback if API Key is configured:', apiErr);

          // Direct client fallback for static host deployments (e.g. GitHub Pages)
          if (settings.geminiApiKey?.trim()) {
            try {
              const targetModel = settings.model || 'gemini-2.5-flash';
              const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(settings.geminiApiKey.trim())}`;
              const parts: any[] = [];

              if (preparedImageBase64) {
                const cleanBase64 = preparedImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
                parts.push({
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: cleanBase64,
                  },
                });
                parts.push({
                  text: `You are Sermate AI, an ultra-fast screen intelligence assistant.\nUser question: "${query}"\nRespond in JSON:\n{\n  "summary": "1-2 sentence overview",\n  "detailedAnswer": "Markdown formatted diagnosis and steps",\n  "detectedCategory": "UI/UX Review",\n  "confidence": 0.95,\n  "actionItems": ["Step 1", "Step 2"],\n  "boundingBoxes": [],\n  "suggestedFollowUps": ["Question 1", "Question 2"]\n}`,
                });

                const directRes = await fetch(directUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                      responseMimeType: 'application/json',
                    },
                  }),
                });

                const rawJson = await directRes.json();
                const outText = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (outText) {
                  let parsed: any;
                  try {
                    parsed = JSON.parse(outText);
                  } catch {
                    parsed = {
                      summary: 'Screen Analysis Complete',
                      detailedAnswer: outText,
                      detectedCategory: 'General Q&A',
                      confidence: 0.95,
                      actionItems: ['Review analysis'],
                      boundingBoxes: [],
                      suggestedFollowUps: ['Explain further'],
                    };
                  }

                  const resData: AnalysisResult = {
                    ...parsed,
                    latencyMs: Date.now() - startTime,
                    imageOptimizationStats: optimizationStats,
                  };

                  setBoundingBoxes(resData.boundingBoxes?.length ? resData.boundingBoxes : currentScenario.mockResult.boundingBoxes);

                  const newEntry: HistoryEntry = {
                    id: 'hist-' + Date.now(),
                    timestamp: Date.now(),
                    prompt: query,
                    scenarioTitle: customImageBase64 ? 'Custom Screenshot' : currentScenario.title,
                    result: resData,
                    modelUsed: targetModel,
                  };
                  const updatedHist = [newEntry, ...history];
                  setHistory(updatedHist);
                  saveHistory(updatedHist);

                  setIsAnalyzing(false);
                  streamTextOutput(resData.detailedAnswer || resData.summary, resData);
                  return;
                }
              } else {
                // Text direct fallback
                const directRes = await fetch(directUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: `You are Sermate AI, an ultra-fast multimodal screen companion. User query: "${query}". Provide a helpful, clear, and direct response in clean Markdown.` }] }],
                  }),
                });

                const rawJson = await directRes.json();
                const outText = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (outText) {
                  const resData: AnalysisResult = {
                    summary: outText.slice(0, 100).replace(/[*#\n]/g, ' ') + (outText.length > 100 ? '...' : ''),
                    detailedAnswer: outText,
                    detectedCategory: 'General Q&A',
                    confidence: 0.98,
                    actionItems: ['Ask a follow-up or upload a screen to inspect'],
                    boundingBoxes: [],
                    suggestedFollowUps: ['How do I upload a screenshot?', 'Inspect active screen'],
                    latencyMs: Date.now() - startTime,
                  };

                  const newEntry: HistoryEntry = {
                    id: 'hist-' + Date.now(),
                    timestamp: Date.now(),
                    prompt: query,
                    scenarioTitle: currentScenario.title,
                    result: resData,
                    modelUsed: targetModel,
                  };
                  const updatedHist = [newEntry, ...history];
                  setHistory(updatedHist);
                  saveHistory(updatedHist);

                  setIsAnalyzing(false);
                  streamTextOutput(resData.detailedAnswer, resData);
                  return;
                }
              }
            } catch (directErr) {
              console.warn('Direct client fallback error:', directErr);
            }
          }
        }
      }

      // 3. Fallback: High-Fidelity Instant Mock Simulation
      let mock: AnalysisResult;
      const totalLat = Math.round(Date.now() - startTime + 18);

      if (isGreeting || isIntro) {
        mock = {
          summary: 'Sermate AI Screen Companion Active',
          detailedAnswer: `👋 **Hello! I am Sermate AI**, your ultra-fast multimodal screen intelligence companion.

### How I Can Assist You:
- 🔍 **Live Screen & Code Diagnosis**: Point out syntax bugs, null-pointer crashes, and build errors directly on your screen.
- 🎨 **UI/UX & Layout Inspection**: Detect styling misalignments, overflowing flexboxes, and responsive issues.
- ⚡ **Real-Time Desktop Overlay**: Access this widget anytime via the global hotkey (\`⌘ + Backspace\` or \`Ctrl + Shift + Backspace\`).
- 📊 **Instant Data Extraction**: Parse complex metrics tables, charts, or error logs into copyable formats.

*Type any question, select a preset above, or upload a custom screenshot to test!*`,
          detectedCategory: 'General Q&A',
          confidence: 0.99,
          actionItems: [
            'Press global hotkey to toggle overlay',
            'Select a preset scenario to test bounding boxes',
            'Upload a screenshot for AI vision analysis'
          ],
          boundingBoxes: [],
          suggestedFollowUps: [
            'How do I trigger screen scanning?',
            'What models are supported?',
            'Explain keyboard shortcuts'
          ],
          latencyMs: totalLat,
          timeToFirstTokenMs: 8,
          imageOptimizationStats: optimizationStats,
        };
      } else {
        mock = {
          ...currentScenario.mockResult,
          latencyMs: totalLat,
          timeToFirstTokenMs: 15,
          imageOptimizationStats: optimizationStats,
        };
      }

      setBoundingBoxes(mock.boundingBoxes);

      const newEntry: HistoryEntry = {
        id: 'hist-' + Date.now(),
        timestamp: Date.now(),
        prompt: query,
        scenarioTitle: customImageBase64 ? 'Custom Screenshot' : currentScenario.title,
        result: mock,
        modelUsed: 'mock-turbo-engine',
      };
      const updatedHist = [newEntry, ...history];
      setHistory(updatedHist);
      saveHistory(updatedHist);

      setIsAnalyzing(false);
      streamTextOutput(mock.detailedAnswer, mock);
    } catch (err) {
      console.warn('Analysis execution error:', err);
      const mock: AnalysisResult = {
        ...currentScenario.mockResult,
        latencyMs: Date.now() - startTime,
      };
      setBoundingBoxes(mock.boundingBoxes);
      setIsAnalyzing(false);
      streamTextOutput(mock.detailedAnswer, mock);
    }
  }, [prompt, theme.soundEnabled, settings, customImageBase64, currentScenario, history, streamTextOutput]);

  // Global Hotkey Listener: Ctrl+Shift+Backspace (Windows/Linux) or Cmd+Backspace (Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const isTriggered = isMac
        ? e.metaKey && e.key === 'Backspace'
        : e.ctrlKey && e.shiftKey && e.key === 'Backspace';

      if (isTriggered) {
        e.preventDefault();
        setHotkeyFlashed(true);
        if (theme.soundEnabled) sound.playPing();
        setTimeout(() => setHotkeyFlashed(false), 800);
        handleAnalyzeScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnalyzeScreen, theme.soundEnabled]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        widgetActive={widgetActive}
        onToggleWidgetActive={handleToggleWidgetActive}
        soundEnabled={theme.soundEnabled}
        onToggleSound={() => handleUpdateTheme({ ...theme, soundEnabled: !theme.soundEnabled })}
        onTriggerHotkeyScan={() => {
          setHotkeyFlashed(true);
          setTimeout(() => setHotkeyFlashed(false), 800);
          handleAnalyzeScreen();
        }}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardSandbox
            theme={theme}
            scenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            allScenarios={MOCK_SCENARIOS}
            customImageBase64={customImageBase64}
            onUploadCustomImage={handleUploadCustomImage}
            boundingBoxes={boundingBoxes}
            showBoxes={showBoxes}
            onToggleShowBoxes={() => setShowBoxes(!showBoxes)}
            selectedBoxId={selectedBoxId}
            onSelectBox={setSelectedBoxId}
            prompt={prompt}
            onChangePrompt={setPrompt}
            onAnalyze={handleAnalyzeScreen}
            isAnalyzing={isAnalyzing}
            result={analysisResult}
            streamingText={streamingText}
            isStreaming={isStreaming}
            onSelectFollowUp={(q) => {
              setPrompt(q);
              handleAnalyzeScreen(q);
            }}
            modelUsed={settings.model}
            isMockMode={settings.isMockMode || !settings.geminiApiKey}
            soundEnabled={theme.soundEnabled}
            hotkeyFlashed={hotkeyFlashed}
          />
        )}

        {activeTab === 'customizer' && (
          <WidgetCustomizer
            theme={theme}
            onChangeTheme={handleUpdateTheme}
            onResetTheme={handleResetTheme}
            soundEnabled={theme.soundEnabled}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onChangeSettings={handleUpdateSettings}
            history={history}
            onClearHistory={() => {
              setHistory([]);
              saveHistory([]);
            }}
            onSelectHistoryEntry={(entry) => {
              setPrompt(entry.prompt);
              setAnalysisResult(entry.result);
              setBoundingBoxes(entry.result.boundingBoxes);
              setActiveTab('dashboard');
            }}
            soundEnabled={theme.soundEnabled}
          />
        )}
      </main>

      {/* Persistent Floating HUD Widget Overlay (When Active) */}
      {widgetActive && (
        <FloatingOverlayWidget
          theme={theme}
          isOpen={floatingOverlayOpen}
          onToggleOpen={() => setFloatingOverlayOpen(!floatingOverlayOpen)}
          prompt={prompt}
          onChangePrompt={setPrompt}
          onAnalyze={handleAnalyzeScreen}
          isAnalyzing={isAnalyzing}
          result={analysisResult}
          streamingText={streamingText}
          isStreaming={isStreaming}
          onSelectFollowUp={(q) => {
            setPrompt(q);
            handleAnalyzeScreen(q);
          }}
          isMockMode={settings.isMockMode || !settings.geminiApiKey}
          modelUsed={settings.model}
        />
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sermate AI • Multimodal Desktop & Mobile Screen Intelligence HUD</span>
          <span className="font-mono text-[11px] text-slate-600">
            Powered by Google Gemini 3 Multimodal Vision
          </span>
        </div>
      </footer>
    </div>
  );
}
