import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to get Gemini Client safely
function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = (customApiKey && customApiKey.trim() !== "") ? customApiKey.trim() : process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Map models or fallback to modern valid models
function resolveModelName(requestedModel?: string): string {
  if (!requestedModel) return "gemini-3.1-flash-lite";
  const m = requestedModel.trim().toLowerCase();
  if (m === "gemini-3.1-flash-lite" || m === "flash-lite" || m === "lite") {
    return "gemini-3.1-flash-lite";
  }
  if (m === "gemini-2.5-flash" || m === "2.5-flash") {
    return "gemini-2.5-flash";
  }
  if (m === "gemini-1.5-flash" || m === "gemini-2.0-flash" || m === "gemini-flash" || m === "gemini-3.7-flash") {
    return "gemini-3.7-flash";
  }
  if (m === "gemini-1.5-pro" || m === "gemini-2.0-pro" || m === "gemini-pro" || m === "gemini-3.1-pro-preview") {
    return "gemini-3.1-pro-preview";
  }
  return requestedModel;
}

// Resilient API invocation with exponential backoff & model fallback for 503 high demand
async function generateContentWithRetry(
  client: GoogleGenAI,
  primaryModel: string,
  generateParams: { contents: any; config?: any }
) {
  const resolvedPrimary = resolveModelName(primaryModel);
  const candidateModels = Array.from(
    new Set([
      resolvedPrimary,
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.7-flash",
    ])
  );

  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: generateParams.contents,
          config: generateParams.config,
        });
        return { response, modelUsed: modelName };
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "").toLowerCase();
        const isTransient =
          err?.status === 503 ||
          err?.code === 503 ||
          err?.status === 429 ||
          err?.code === 429 ||
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("unavailable") ||
          msg.includes("resource_exhausted") ||
          msg.includes("quota");

        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

// Resilient Stream API invocation with automatic fallback across models
async function generateStreamWithRetry(
  client: GoogleGenAI,
  primaryModel: string,
  generateParams: { contents: any; config?: any }
) {
  const resolvedPrimary = resolveModelName(primaryModel);
  const candidateModels = Array.from(
    new Set([
      resolvedPrimary,
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.7-flash",
    ])
  );

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const responseStream = await client.models.generateContentStream({
        model: modelName,
        contents: generateParams.contents,
        config: generateParams.config,
      });
      return { responseStream, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || "").toLowerCase();
      const isUnavailable =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === 429 ||
        err?.code === 429 ||
        msg.includes("503") ||
        msg.includes("high demand") ||
        msg.includes("unavailable") ||
        msg.includes("resource_exhausted") ||
        msg.includes("quota");

      if (isUnavailable) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasEnvKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Test Connection Endpoint
app.post("/api/test-key", async (req, res) => {
  const startTime = Date.now();
  try {
    const { apiKey, model } = req.body;
    const client = getGeminiClient(apiKey);
    if (!client) {
      return res.status(400).json({
        success: false,
        error: "No API Key provided and no server environment key found.",
      });
    }

    const targetModel = resolveModelName(model);
    const { response, modelUsed } = await generateContentWithRetry(client, targetModel, {
      contents: "Respond with the single word 'CONNECTED' if you receive this message.",
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const latencyMs = Date.now() - startTime;

    return res.json({
      success: true,
      message: `Connection verified via ${modelUsed} in ${latencyMs}ms!`,
      modelUsed,
      latencyMs,
      reply: response.text?.trim() || "CONNECTED",
    });
  } catch (err: any) {
    console.error("Test key error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to verify API Key with Gemini.",
    });
  }
});

// Ultra-Fast Real-Time Streaming Screen Analysis Endpoint (SSE)
app.post("/api/analyze-screen-stream", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, imageBase64, mimeType = "image/jpeg", model, apiKey, systemInstruction, turboMode = true } = req.body;

    const client = getGeminiClient(apiKey);
    if (!client) {
      return res.status(400).json({
        success: false,
        isMockFallbackRequired: true,
        error: "No active Gemini API key configured. Switch to Mock Mode or enter a valid key.",
      });
    }

    const targetModel = resolveModelName(model || (turboMode ? "gemini-3.1-flash-lite" : "gemini-3.7-flash"));

    // Set Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const isImageAttached = Boolean(imageBase64 && imageBase64.trim() !== "");
    const parts: any[] = [];

    if (isImageAttached) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });

      const structuredPrompt = `
You are Sermate AI, an ultra-fast desktop & mobile screen inspection assistant.
User inquiry: "${prompt || "Analyze the current screen state, highlight key components, issues, or actionable elements."}"

Respond in strict JSON:
{
  "summary": "Concise 1-2 sentence overview of screen state",
  "detailedAnswer": "Direct, actionable diagnosis or instructions in markdown format with clear steps",
  "detectedCategory": "Bug/Crash" | "UI/UX Review" | "Code Error" | "Data Extraction" | "General Q&A",
  "confidence": 0.95,
  "actionItems": ["Immediate step 1", "Immediate step 2"],
  "boundingBoxes": [
    {
      "id": "box-1",
      "label": "Brief label of element",
      "type": "error" | "warning" | "interactive" | "info",
      "box2d": [10, 10, 50, 50],
      "description": "Specific finding in this area"
    }
  ],
  "suggestedFollowUps": ["Quick question 1", "Quick question 2"]
}
`;
      parts.push({ text: structuredPrompt });

      const streamConfig: any = {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction || "You are Sermate AI: an ultra-fast, precision screen intelligence overlay assistant. Be concise, direct, and fast.",
        thinkingConfig: { thinkingBudget: 0 },
      };

      let fullText = "";
      let firstTokenTime = 0;

      const { responseStream, modelUsed } = await generateStreamWithRetry(client, targetModel, {
        contents: { parts },
        config: streamConfig,
      });

      for await (const chunk of responseStream) {
        if (!firstTokenTime) {
          firstTokenTime = Date.now() - startTime;
        }
        const chunkText = chunk.text || "";
        fullText += chunkText;

        res.write(`data: ${JSON.stringify({ 
          type: "chunk", 
          text: chunkText, 
          timeToFirstTokenMs: firstTokenTime 
        })}\n\n`);
      }

      const totalLatencyMs = Date.now() - startTime;
      let parsedData;
      try {
        parsedData = JSON.parse(fullText);
      } catch {
        parsedData = {
          summary: "Screen Analysis Complete",
          detailedAnswer: fullText,
          detectedCategory: "General Q&A",
          confidence: 0.95,
          actionItems: ["Review findings"],
          boundingBoxes: [],
          suggestedFollowUps: ["Explain this further", "How do I fix this?"],
        };
      }

      res.write(`data: ${JSON.stringify({ 
        type: "done", 
        data: parsedData, 
        modelUsed: modelUsed || targetModel,
        latencyMs: totalLatencyMs,
        timeToFirstTokenMs: firstTokenTime || totalLatencyMs
      })}\n\n`);

      res.end();
    } else {
      // Fast Text-Only / General Q&A / Greetings Stream (Zero latency, direct markdown stream)
      const userQuery = prompt && prompt.trim() ? prompt : "Hello";
      const textPrompt = `You are Sermate AI, an ultra-fast multimodal screen assistant.
User inquiry: "${userQuery}"

Provide a friendly, direct, concise, and helpful answer in clean Markdown. If they are greeting you, introduce yourself as Sermate AI and explain how you can help inspect screens, diagnose errors, or answer questions. Keep your response crisp and fast.`;

      parts.push({ text: textPrompt });

      const streamConfig: any = {
        systemInstruction: systemInstruction || "You are Sermate AI: a lightning-fast, helpful desktop & mobile screen companion. Be concise, responsive, and sharp.",
        thinkingConfig: { thinkingBudget: 0 },
      };

      let fullText = "";
      let firstTokenTime = 0;

      const { responseStream, modelUsed } = await generateStreamWithRetry(client, targetModel, {
        contents: { parts },
        config: streamConfig,
      });

      for await (const chunk of responseStream) {
        if (!firstTokenTime) {
          firstTokenTime = Date.now() - startTime;
        }
        const chunkText = chunk.text || "";
        fullText += chunkText;

        res.write(`data: ${JSON.stringify({ 
          type: "text_chunk", 
          text: chunkText, 
          timeToFirstTokenMs: firstTokenTime 
        })}\n\n`);
      }

      const totalLatencyMs = Date.now() - startTime;
      const finalResult = {
        summary: fullText.slice(0, 100).replace(/[*#\n]/g, " ") + (fullText.length > 100 ? "..." : ""),
        detailedAnswer: fullText,
        detectedCategory: "General Q&A",
        confidence: 0.98,
        actionItems: ["Ask a follow-up or upload a screen to inspect"],
        boundingBoxes: [],
        suggestedFollowUps: [
          "How do I upload a screenshot?",
          "Explain the keyboard shortcuts",
          "Inspect active screen",
        ],
      };

      res.write(`data: ${JSON.stringify({ 
        type: "done", 
        data: finalResult, 
        modelUsed: modelUsed || targetModel,
        latencyMs: totalLatencyMs,
        timeToFirstTokenMs: firstTokenTime || totalLatencyMs
      })}\n\n`);

      res.end();
    }
  } catch (err: any) {
    console.error("Screen stream error:", err);
    res.write(`data: ${JSON.stringify({ 
      type: "error", 
      error: err.message || "Failed to analyze stream.",
      isMockFallbackRequired: true 
    })}\n\n`);
    res.end();
  }
});

// Analyze Screen Endpoint (Fast REST)
app.post("/api/analyze-screen", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, imageBase64, mimeType = "image/jpeg", model, apiKey, systemInstruction, turboMode = true } = req.body;

    const client = getGeminiClient(apiKey);
    if (!client) {
      return res.status(400).json({
        success: false,
        isMockFallbackRequired: true,
        error: "No active Gemini API key configured. Switch to Mock Mode or enter a valid key.",
      });
    }

    const targetModel = resolveModelName(model || (turboMode ? "gemini-3.1-flash-lite" : "gemini-3.7-flash"));
    const isImageAttached = Boolean(imageBase64 && imageBase64.trim() !== "");
    const parts: any[] = [];

    if (isImageAttached) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });

      const structuredPrompt = `
You are Sermate AI, an ultra-fast desktop & mobile screen inspection assistant.
User inquiry: "${prompt || "Analyze the current screen state, highlight key components, issues, or actionable elements."}"

Please output your analysis formatted in strict JSON:
{
  "summary": "Concise overview of what is seen on screen",
  "detailedAnswer": "Direct, helpful contextual answer with step-by-step guidance in markdown format",
  "detectedCategory": "Bug/Crash" | "UI/UX Review" | "Code Error" | "Data Extraction" | "General Q&A",
  "confidence": 0.95,
  "actionItems": ["Actionable step 1", "Actionable step 2"],
  "boundingBoxes": [
    {
      "id": "box-1",
      "label": "Brief label of element",
      "type": "error" | "warning" | "interactive" | "info",
      "box2d": [10, 10, 50, 50],
      "description": "Specific finding in this area"
    }
  ],
  "suggestedFollowUps": ["Suggested quick query 1", "Suggested quick query 2"]
}
`;
      parts.push({ text: structuredPrompt });

      const callConfig: any = {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction || "You are Sermate AI: an ultra-fast, precision screen intelligence overlay assistant.",
        thinkingConfig: { thinkingBudget: 0 },
      };

      const { response, modelUsed } = await generateContentWithRetry(client, targetModel, {
        contents: { parts },
        config: callConfig,
      });

      const latencyMs = Date.now() - startTime;
      const text = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch {
        parsedData = {
          summary: "Screen Analysis Complete",
          detailedAnswer: text,
          detectedCategory: "General Q&A",
          confidence: 0.95,
          actionItems: ["Review findings"],
          boundingBoxes: [],
          suggestedFollowUps: ["Explain this further", "How do I fix this?"],
        };
      }

      return res.json({
        success: true,
        data: parsedData,
        modelUsed,
        latencyMs,
      });
    } else {
      // Fast Text-Only Question
      const userQuery = prompt && prompt.trim() ? prompt : "Hello";
      const textPrompt = `You are Sermate AI, an ultra-fast multimodal screen assistant.
User inquiry: "${userQuery}"

Provide a friendly, direct, concise, and helpful answer in clean Markdown.`;

      parts.push({ text: textPrompt });

      const callConfig: any = {
        systemInstruction: systemInstruction || "You are Sermate AI: a lightning-fast, helpful desktop & mobile screen companion.",
        thinkingConfig: { thinkingBudget: 0 },
      };

      const { response, modelUsed } = await generateContentWithRetry(client, targetModel, {
        contents: { parts },
        config: callConfig,
      });

      const latencyMs = Date.now() - startTime;
      const text = response.text || "";
      const finalResult = {
        summary: text.slice(0, 100).replace(/[*#\n]/g, " ") + (text.length > 100 ? "..." : ""),
        detailedAnswer: text,
        detectedCategory: "General Q&A",
        confidence: 0.98,
        actionItems: ["Ask a follow-up or upload a screen to inspect"],
        boundingBoxes: [],
        suggestedFollowUps: [
          "How do I upload a screenshot?",
          "Explain the keyboard shortcuts",
          "Inspect active screen",
        ],
      };

      return res.json({
        success: true,
        data: finalResult,
        modelUsed,
        latencyMs,
      });
    }
  } catch (err: any) {
    console.error("Screen analysis error:", err);
    return res.status(500).json({
      success: false,
      isMockFallbackRequired: true,
      error: err.message || "Failed to analyze screen with Gemini Vision.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sermate AI server running on port ${PORT}`);
  });
}

startServer();
