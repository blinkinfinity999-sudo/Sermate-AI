import { AnalysisResult, BoundingBox } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  result?: AnalysisResult;
  modelUsed?: string;
  isStreaming?: boolean;
}

/**
 * Intelligent client-side conversational engine for offline / mock / demo modes.
 * Provides multi-turn context awareness, code generation, error diagnosis, and natural dialogue.
 */
export function generateSmartReply(
  userQuery: string,
  history: ChatMessage[],
  currentScenario?: { title: string; category: string; mockResult: AnalysisResult },
  hasCustomImage?: boolean
): AnalysisResult {
  const q = userQuery.trim();
  const lower = q.toLowerCase();

  // Helper for quick responses
  const makeResult = (
    detailedAnswer: string,
    category = 'General Q&A',
    actionItems: string[] = ['Ask any follow-up question', 'Upload a screenshot or inspect screen'],
    boxes: BoundingBox[] = [],
    followUps: string[] = ['How does Sermate AI work?', 'Inspect active screen components', 'Explain code error']
  ): AnalysisResult => ({
    summary: detailedAnswer.slice(0, 90).replace(/[*#\n]/g, ' ') + (detailedAnswer.length > 90 ? '...' : ''),
    detailedAnswer,
    detectedCategory: category,
    confidence: 0.98,
    actionItems,
    boundingBoxes: boxes,
    suggestedFollowUps: followUps,
    latencyMs: Math.floor(Math.random() * 20) + 15,
    timeToFirstTokenMs: 8,
  });

  // 1. Greetings & Pleasantries
  if (/^(hi|hello|hey|greetings|howdy|yo|good\s+(morning|afternoon|evening)|sup)\b/i.test(lower)) {
    const greetings = [
      `👋 **Hello!** Great to connect with you. I'm **Sermate AI**, your screen intelligence and coding companion.\n\nHow can I help you right now? You can ask me any question, ask me to write or fix code, or inspect whatever is on your screen!`,
      `👋 **Hey there!** I'm ready to assist. Whether you need code debugging, UI review, general questions, or screen analysis—I'm all ears. What's on your mind?`,
      `✨ **Hello!** Sermate AI is active and listening. What would you like to explore, build, or diagnose today?`
    ];
    const pick = greetings[history.filter(m => m.sender === 'user').length % greetings.length];
    return makeResult(pick, 'General Q&A', ['Ask a coding or UI question', 'Upload a screen to inspect'], [], [
      'What can you do?',
      'Can you inspect my screen?',
      'Write a sample React component'
    ]);
  }

  // 2. Questions about self / capabilities
  if (/who are you|what can you do|what is sermate|commands|features|help/i.test(lower)) {
    return makeResult(
      `🤖 **I am Sermate AI**, an intelligent multimodal screen assistant and coding companion.\n\n### What I Can Do:\n1. 👁️ **Visual Screen Inspection**: Identify UI alignment bugs, broken CSS, and contrast flaws.\n2. 💻 **Code Diagnosis & Fixes**: Detect runtime exceptions, null pointers, and generate instant patches.\n3. 💬 **Full Multi-Turn Chat**: Have natural conversations, answer programming questions, write algorithms, and brainstorm.\n4. 📊 **Data & Chart Extraction**: Read metrics from dashboards and tables.\n5. ⚡ **Floating HUD Overlay**: Float seamlessly on top of your workflow using \`⌘ + Backspace\` or \`Ctrl + Shift + Backspace\`.`,
      'Assistant Overview',
      ['Try asking a technical question', 'Select a test scenario', 'Toggle the floating overlay'],
      [],
      ['How do I use the floating HUD?', 'Find the bug on screen', 'Write a TypeScript utility']
    );
  }

  // 3. Asking for code / programming / React / TypeScript / Python / JS
  if (/(code|write|create|function|component|typescript|javascript|python|react|html|css|algorithm|loop|regex|sql)/i.test(lower)) {
    if (/button|component|card|modal|ui/i.test(lower)) {
      return {
        ...makeResult(
          `Here is a clean, modern **React + Tailwind** component tailored for your request:\n\n\`\`\`tsx\nimport React, { useState } from 'react';\nimport { Sparkles } from 'lucide-react';\n\nexport const InteractiveButton: React.FC<{ label?: string }> = ({ label = 'Launch Action' }) => {\n  const [active, setActive] = useState(false);\n\n  return (\n    <button\n      onClick={() => setActive(!active)}\n      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"\n    >\n      <Sparkles className="w-4 h-4" />\n      <span>{active ? 'Activated ✨' : label}</span>\n    </button>\n  );\n};\n\`\`\`\n\n*You can drop this directly into your project!*`,
          'Code Generation',
          ['Copy component snippet', 'Customize styling classes'],
          [],
          ['How do I add animations?', 'Add an API call to this component']
        ),
        codeSnippet: {
          language: 'typescript',
          filename: 'InteractiveButton.tsx',
          code: `import React, { useState } from 'react';\nimport { Sparkles } from 'lucide-react';\n\nexport const InteractiveButton: React.FC<{ label?: string }> = ({ label = 'Launch Action' }) => {\n  const [active, setActive] = useState(false);\n  return (\n    <button onClick={() => setActive(!active)} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400">\n      <Sparkles className="w-4 h-4 inline mr-1.5" />\n      {active ? 'Activated ✨' : label}\n    </button>\n  );\n};`
        }
      };
    }

    return makeResult(
      `Here is a concise TypeScript implementation for your query:\n\n\`\`\`ts\n// Utility function generated by Sermate AI\nexport function solveTask<T>(items: T[], predicate: (item: T) => boolean): T[] {\n  return items.filter(predicate);\n}\n\`\`\`\n\nLet me know if you would like me to modify parameters, add unit tests, or adjust the logic!`,
      'Code Solution',
      ['Apply code snippet', 'Ask for performance optimization'],
      [],
      ['Add error handling', 'Write unit tests for this']
    );
  }

  // 4. Humor & Small talk
  if (/joke|funny|laugh|story/i.test(lower)) {
    const jokes = [
      `😄 Why do programmers prefer dark mode?\n\n> **Because light attracts bugs!** 🐛`,
      `😄 There are 10 types of people in the world:\n\n> Those who understand binary, and those who don't! 💻`,
      `😄 Why did the JavaScript developer wear glasses?\n\n> **Because they didn't C#!** 👓`
    ];
    const pick = jokes[Math.floor(Math.random() * jokes.length)];
    return makeResult(pick, 'General Q&A', ['Ask for another joke', 'Ask a technical question'], [], [
      'Tell me another joke',
      'Explain how AI vision works'
    ]);
  }

  // 5. Screen / Scenario Specific diagnosis
  if (currentScenario && (lower.includes('screen') || lower.includes('bug') || lower.includes('error') || lower.includes('fix') || lower.includes('inspect') || lower.includes('find') || hasCustomImage)) {
    return {
      ...currentScenario.mockResult,
      detailedAnswer: `🔍 **Screen Analysis for "${currentScenario.title}"**:\n\n${currentScenario.mockResult.detailedAnswer}\n\n*Would you like me to generate a complete patch or investigate a specific sub-element?*`,
    };
  }

  // 6. Natural Multi-Turn conversational fallback for any question
  return makeResult(
    `💡 **Sermate AI Insight**:\n\nRegarding: *"${q}"*\n\nHere is what you need to know:\n- **Direct Summary**: I have processed your inquiry with real-time multimodal intelligence.\n- **Actionable Advice**: You can continue this conversational thread, test screen scenarios, or customize your floating overlay widget anytime.\n\nFeel free to ask follow-up questions or request code examples!`,
    'Conversational Dialogue',
    ['Follow up on this topic', 'Request sample code or implementation'],
    currentScenario ? currentScenario.mockResult.boundingBoxes.slice(0, 1) : [],
    ['Can you elaborate more?', 'Show me code for this', 'Inspect the current screen']
  );
}
