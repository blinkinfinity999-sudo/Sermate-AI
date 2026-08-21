import { WidgetTheme, SettingsState, HistoryEntry } from '../types';

export const DEFAULT_THEME: WidgetTheme = {
  bgMode: 'glass',
  solidColor: '#0f172a',
  gradientChoice: 'from-cyan-500/20 via-slate-900/90 to-blue-600/20',
  accentColor: '#00F0FF',
  shape: 'pill',
  opacity: 85,
  blur: 16,
  position: 'bottom-right',
  size: 'standard',
  soundEnabled: true,
};

export const DEFAULT_SETTINGS: SettingsState = {
  geminiApiKey: '',
  model: 'gemini-3.1-flash-lite',
  isMockMode: false,
  systemInstruction: 'You are Sermate AI: an ultra-fast, precision screen intelligence overlay assistant. Keep answers direct, concise, and actionable.',
  soundEnabled: true,
  autoHighlightBoxes: true,
  turboMode: true,
};

const THEME_KEY = 'screensense_theme_v1';
const SETTINGS_KEY = 'screensense_settings_v1';
const WIDGET_ACTIVE_KEY = 'screensense_widget_active_v1';
const HISTORY_KEY = 'screensense_history_v1';

export function loadStoredTheme(): WidgetTheme {
  try {
    const item = localStorage.getItem(THEME_KEY);
    if (!item) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...JSON.parse(item) };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveStoredTheme(theme: WidgetTheme): void {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (err) {
    console.error('Error saving theme to localStorage', err);
  }
}

export function loadStoredSettings(): SettingsState {
  try {
    const item = localStorage.getItem(SETTINGS_KEY);
    if (!item) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}

export function loadWidgetActive(): boolean {
  try {
    const item = localStorage.getItem(WIDGET_ACTIVE_KEY);
    if (item === null) return true;
    return item === 'true';
  } catch {
    return true;
  }
}

export function saveWidgetActive(active: boolean): void {
  try {
    localStorage.setItem(WIDGET_ACTIVE_KEY, active ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving widget active status', err);
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const item = localStorage.getItem(HISTORY_KEY);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 30)));
  } catch (err) {
    console.error('Error saving history', err);
  }
}
