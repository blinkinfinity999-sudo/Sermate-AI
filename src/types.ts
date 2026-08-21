export type BackgroundMode = 'solid' | 'glass' | 'gradient';
export type WidgetShape = 'pill' | 'bar' | 'square' | 'island';
export type WidgetPosition = 'bottom-right' | 'bottom-center' | 'top-right' | 'center';
export type WidgetSize = 'compact' | 'standard' | 'expanded';

export interface WidgetTheme {
  bgMode: BackgroundMode;
  solidColor: string;
  gradientChoice: string;
  accentColor: string;
  shape: WidgetShape;
  opacity: number; // 20 - 100
  blur: number; // 0 - 24
  position: WidgetPosition;
  size: WidgetSize;
  soundEnabled: boolean;
}

export type BoundingBoxType = 'error' | 'warning' | 'interactive' | 'info';

export interface BoundingBox {
  id: string;
  label: string;
  type: BoundingBoxType;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in percentages (0-100)
  description: string;
}

export interface AnalysisResult {
  summary: string;
  detailedAnswer: string;
  detectedCategory: string;
  confidence: number;
  actionItems: string[];
  boundingBoxes: BoundingBox[];
  suggestedFollowUps: string[];
  codeSnippet?: {
    language: string;
    code: string;
    filename?: string;
  };
  timestamp?: number;
  latencyMs?: number;
  timeToFirstTokenMs?: number;
  imageOptimizationStats?: {
    originalKb: number;
    optimizedKb: number;
    ratio: number;
  };
}

export interface ScreenScenario {
  id: string;
  title: string;
  category: 'Bug/Crash' | 'UI/UX Review' | 'Code Error' | 'Data Extraction';
  description: string;
  defaultPrompt: string;
  screenType: 'svg-app' | 'svg-code' | 'svg-chart' | 'svg-mobile';
  mockResult: AnalysisResult;
}

export interface SettingsState {
  geminiApiKey: string;
  model: string;
  isMockMode: boolean;
  systemInstruction: string;
  soundEnabled: boolean;
  autoHighlightBoxes: boolean;
  turboMode: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  scenarioTitle: string;
  result: AnalysisResult;
  modelUsed: string;
}
