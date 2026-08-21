import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WidgetTheme, 
  SettingsState, 
  ScreenScenario, 
  BoundingBox, 
  AnalysisResult, 
  HistoryEntry,
  ChatMessage
} from './types';
import { 
  loadStoredTheme, 
  saveStoredTheme, 
  DEFAULT_THEME,
  loadStoredSettings, 
  saveStoredSettings, 
  loadWidgetActive, 
  saveWidgetActive, 
  loadHistory, 
  saveHistory 
} from './utils/storage';
import { MOCK_SCENARIOS } from './data/mockScenarios';
import { sound } from './utils/audio';
import { optimizeImageForVision } from './utils/imageOptimizer';
import { generateSmartReply } from './utils/conversationEngine';
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

  // Active Multi-Turn Chat Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `👋 **Hello! I am Sermate AI**, your screen intelligence assistant and coding companion.\n\nAsk me anything, chat with me, or inspect any screen component!`,
      timestamp: Date.now(),
      modelUsed: 'sermate-turbo',
    }
  ]);

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
  };

  // Custom Screenshot upload
  const handleUploadCustomImage = (base64: string) => {
    setCustomImageBase64(base64);
    setBoundingBoxes([]);
    setSelectedBoxId(null);
  };

  // Clear / Delete Conversation History (Triggered on 'X' mark)
  const handleClearChat = useCallback(() => {
    if (theme.soundEnabled) sound.playClick();
    setMessages([]);
    setAnalysisResult(null);
    setStreamingText('');
    setIsStreaming(false);
    setPrompt('');
  }, [theme.soundEnabled]);

  // Stream simulation helper for mock/client fallback
  const streamSimulatedOutput = useCallback((fullText: string, finalResult: AnalysisResult, assistantMsgId: string) => {
    setIsStreaming(true);
    let currentIdx = 0;
    const words = fullText.split(' ');

    if (streamIntervalRef.current) {
      cancelAnimationFrame(streamIntervalRef.current);
    }

    const step = () => {
      if (currentIdx < words.length) {
        currentIdx += 10;
        const currentText = words.slice(0, currentIdx).join(' ');
        setStreamingText(currentText);
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, text: currentText, isStreaming: true } : m));
        streamIntervalRef.current = requestAnimationFrame(step);
      } else {
        setStreamingText(fullText);
        setIsStreaming(false);
        setAnalysisResult(finalResult);
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { 
          ...m, 
          text: fullText, 
          result: finalResult,
          isStreaming: false 
        } : m));
        if (theme.soundEnabled) sound.playSuccess();
      }
    };

    streamIntervalRef.current = requestAnimationFrame(step);
  }, [theme.soundEnabled]);

  // Main Multi-Turn Conversational Screen Analysis Handler
  const handleAnalyzeScreen = useCallback(async (customPrompt?: string) => {
    const query = (customPrompt || prompt).trim();
    if (!query) return;

    const startTime = Date.now();
    if (theme.soundEnabled) sound.playScan();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setStreamingText('');
    setPrompt('');

    // Append User Message to Thread
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const assistantMsgId = 'assistant-' + Date.now();
    const pendingAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '...',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedThread = [...messages, userMsg];
    setMessages([...updatedThread, pendingAssistantMsg]);

    // Highlight bounding boxes if visual check
    setShowBoxes(true);

    try {
      // 1. Optimize screenshot if custom image attached
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

      // 2. Real-Time Streaming Vision / Multi-turn API Call (if server or key available)
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

                    if (evt.type === 'text_chunk' || evt.type === 'chunk') {
                      accumulatedRaw += evt.text;
                      setIsStreaming(true);
                      setStreamingText(accumulatedRaw);
                      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, text: accumulatedRaw, isStreaming: true } : m));
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
                    // Ignore transient SSE chunk parse
                  }
                }
              }
            }

            if (parsedFinalResult) {
              setBoundingBoxes(parsedFinalResult.boundingBoxes?.length ? parsedFinalResult.boundingBoxes : currentScenario.mockResult.boundingBoxes);
              setIsAnalyzing(false);
              setIsStreaming(false);
              setAnalysisResult(parsedFinalResult);
              setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                ...m,
                text: parsedFinalResult!.detailedAnswer || parsedFinalResult!.summary,
                result: parsedFinalResult!,
                modelUsed: streamModelUsed,
                isStreaming: false
              } : m));

              if (theme.soundEnabled) sound.playSuccess();

              // Save to global history
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
          console.warn('Streaming endpoint fallback to client-side direct request:', streamErr);
        }

        // Direct Client Fallback (e.g. for GitHub Pages with user-entered API Key)
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
            }

            parts.push({
              text: `You are Sermate AI, an intelligent screen and coding assistant. User inquiry: "${query}". Respond clearly with actionable explanations in clean Markdown.`
            });

            const directRes = await fetch(directUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
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
                actionItems: ['Review suggestions', 'Ask follow-up question'],
                boundingBoxes: [],
                suggestedFollowUps: ['Can you give code for this?', 'Inspect screen element'],
                latencyMs: Date.now() - startTime,
              };

              setIsAnalyzing(false);
              setAnalysisResult(resData);
              setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                ...m,
                text: outText,
                result: resData,
                modelUsed: targetModel,
                isStreaming: false
              } : m));

              if (theme.soundEnabled) sound.playSuccess();
              return;
            }
          } catch (directErr) {
            console.warn('Direct client fallback failed:', directErr);
          }
        }
      }

      // 3. Dynamic Generative Offline / Mock Conversational Engine
      const smartResult = generateSmartReply(query, updatedThread, currentScenario, Boolean(customImageBase64));
      smartResult.latencyMs = Math.max(12, Date.now() - startTime);

      if (smartResult.boundingBoxes?.length) {
        setBoundingBoxes(smartResult.boundingBoxes);
      }

      setIsAnalyzing(false);
      streamSimulatedOutput(smartResult.detailedAnswer, smartResult, assistantMsgId);

      // Log to history
      const newEntry: HistoryEntry = {
        id: 'hist-' + Date.now(),
        timestamp: Date.now(),
        prompt: query,
        scenarioTitle: customImageBase64 ? 'Custom Screenshot' : currentScenario.title,
        result: smartResult,
        modelUsed: 'sermate-turbo',
      };
      const updatedHist = [newEntry, ...history];
      setHistory(updatedHist);
      saveHistory(updatedHist);
    } catch (err) {
      console.warn('Analysis execution error:', err);
      const fallbackResult = generateSmartReply(query, updatedThread, currentScenario, false);
      setIsAnalyzing(false);
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        text: fallbackResult.detailedAnswer,
        result: fallbackResult,
        isStreaming: false
      } : m));
    }
  }, [prompt, theme.soundEnabled, settings, customImageBase64, currentScenario, messages, history, streamSimulatedOutput]);

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
        handleAnalyzeScreen('Inspect active screen and find issues');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnalyzeScreen, theme.soundEnabled]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) cancelAnimationFrame(streamIntervalRef.current);
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
          handleAnalyzeScreen('Inspect current screen');
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
            messages={messages}
            prompt={prompt}
            onChangePrompt={setPrompt}
            onAnalyze={handleAnalyzeScreen}
            isAnalyzing={isAnalyzing}
            result={analysisResult}
            streamingText={streamingText}
            isStreaming={isStreaming}
            onSelectFollowUp={(q) => {
              handleAnalyzeScreen(q);
            }}
            onClearChat={handleClearChat}
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
              handleClearChat();
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
          messages={messages}
          prompt={prompt}
          onChangePrompt={setPrompt}
          onAnalyze={handleAnalyzeScreen}
          isAnalyzing={isAnalyzing}
          isStreaming={isStreaming}
          onSelectFollowUp={(q) => {
            handleAnalyzeScreen(q);
          }}
          onClearChat={handleClearChat}
          isMockMode={settings.isMockMode || !settings.geminiApiKey}
          modelUsed={settings.model}
        />
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sermate AI • Multimodal Screen Intelligence HUD & Conversational Assistant</span>
          <span className="font-mono text-[11px] text-slate-600">
            Powered by Google Gemini Multimodal Vision
          </span>
        </div>
      </footer>
    </div>
  );
}
