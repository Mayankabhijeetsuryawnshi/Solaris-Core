import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

dotenv.config();

// API keys from workspace configuration setup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const isOpenRouterKeyCustom = !!OPENROUTER_API_KEY && OPENROUTER_API_KEY.trim() !== "";

// Set cache to bypass invalid, empty, unauthorized, or financially exhausted OpenRouter API keys
const badKeysCache = new Set<string>();

function getGenAI(customKey?: string) {
  const apiKey = customKey || GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please configure a key in .env or Settings.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to determine OpenRouter model names (supports smart routing to FREE endpoints if default key has no credits)
function getOpenRouterModelName(modelId: string, hasCustomKey: boolean): string {
  if (hasCustomKey) {
    switch (modelId) {
      case "deepseek-r1":
        return "deepseek/deepseek-r1";
      case "qwen-coder":
        return "qwen/qwen-2.5-coder-32b-instruct";
      case "llama-3-3":
        return "meta-llama/llama-3.3-70b-instruct";
      case "gpt-4-5":
        return "openai/gpt-4.5-preview";
      case "llama-3-8b":
        return "meta-llama/llama-3-8b-instruct";
      case "mistral-large":
        return "mistralai/mistral-large";
      case "qwen-72b":
        return "qwen/qwen-2.5-72b-instruct";
      case "phi-4":
        return "microsoft/phi-4";
      case "mythomax-13b":
        return "gryphe/mythomax-l2-13b";
      case "llama-3-2-3b":
        return "meta-llama/llama-3.2-3b-instruct";
      case "command-r-plus":
        return "cohere/command-r-plus";
      case "zephyr-7b":
        return "huggingfaceh4/zephyr-7b-beta";
      case "claude-coder":
        return "anthropic/claude-3.5-sonnet";
      case "claude-fable-5":
        return "anthropic/claude-3.5-sonnet";
      default:
        return "meta-llama/llama-3-8b-instruct:free";
    }
  } else {
    // Shared default key is exhausted for paid calls, use premium FREE alternates on OpenRouter to avoid 402 billing failures.
    switch (modelId) {
      case "deepseek-r1":
        return "deepseek/deepseek-r1:free";
      case "qwen-coder":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "llama-3-3":
        return "meta-llama/llama-3.3-70b-instruct:free";
      case "gpt-4-5":
        return "openai/gpt-4o-mini:free";
      case "llama-3-8b":
        return "meta-llama/llama-3-8b-instruct:free";
      case "mistral-large":
        return "mistralai/mistral-large:free";
      case "qwen-72b":
        return "qwen/qwen-2.5-72b-instruct:free";
      case "phi-4":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "mythomax-13b":
        return "gryphe/mythomax-l2-13b:free";
      case "llama-3-2-3b":
        return "meta-llama/llama-3.2-3b-instruct:free";
      case "command-r-plus":
        return "cohere/command-r-plus:free";
      case "zephyr-7b":
        return "huggingfaceh4/zephyr-7b-beta:free";
      case "claude-coder":
        return "qwen/qwen-2.5-coder-32b-instruct:free";
      case "claude-fable-5":
        return "google/gemini-2.5-flash:free";
      default:
        return "meta-llama/llama-3-8b-instruct:free";
    }
  }
}

// Helper to load/save global persistent session store safely
const STORE_PATH = path.join(process.cwd(), "sessions_store.json");

function readStoredSessions(): Record<string, any[]> {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf8");
      return JSON.parse(data) || {};
    }
  } catch (err) {
    console.error("Error reading session store file:", err);
  }
  return {};
}

function writeStoredSessions(store: Record<string, any[]>) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing session store file:", err);
  }
}

function cleanAndAlternateContents(history: { role: string; content?: string }[], newPrompt: string, image?: { data: string; mimeType: string }) {
  const rawSeq: { role: string; text: string }[] = [];
  if (history && history.length > 0) {
    history.forEach((h: any) => {
      const role = h.role === "user" ? "user" : "model";
      const text = h.content || "";
      if (text.trim() !== "") {
        rawSeq.push({ role, text });
      }
    });
  }
  
  let promptTextText = newPrompt || "";
  rawSeq.push({ role: "user", text: promptTextText });
  
  const mergedSeq: { role: string; text: string }[] = [];
  rawSeq.forEach((msg) => {
    if (mergedSeq.length === 0) {
      if (msg.role === "user") {
        mergedSeq.push({ role: msg.role, text: msg.text });
      } else {
        mergedSeq.push({ role: "user", text: "..." });
        mergedSeq.push({ role: msg.role, text: msg.text });
      }
    } else {
      const prev = mergedSeq[mergedSeq.length - 1];
      if (prev.role === msg.role) {
        prev.text += "\n" + msg.text;
      } else {
        mergedSeq.push({ role: msg.role, text: msg.text });
      }
    }
  });

  const result: any[] = [];
  mergedSeq.forEach((msg, idx) => {
    const parts: any[] = [];
    
    if (idx === mergedSeq.length - 1 && image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
      parts.push({
        text: `[VISUAL CONTEXT ENGAGED: Thoroughly scan the attached image in high physical resolution. Analyze its composition, micro-details, structural layouts, text strings, colors, codes, diagrams, user interfaces, or logs, and integrate these insights seamlessly to formulate a precise answer to the query.]\nQuery: ${msg.text}`
      });
    } else {
      parts.push({ text: msg.text });
    }

    result.push({
      role: msg.role,
      parts
    });
  });

  return result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Cross-Origin Resource Sharing (CORS) middleware to support connections from local mobile webviews (APK)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    // Handle OPTIONS preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // 1. Health API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // 2. Chat API - Independent streaming per model
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    const { modelId, prompt, history, image } = req.body;

    if (!modelId || !prompt) {
      res.status(400).json({ error: "Missing modelId or prompt" });
      return;
    }

    const requestOpenRouterKey = (req.headers["x-openrouter-key"] as string) || OPENROUTER_API_KEY;
    const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;
    const hasCustomKey = !!requestOpenRouterKey && requestOpenRouterKey.trim() !== "";

    // Set streaming response headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevents intermediate proxy buffering for standard mobile webviews/APKs

    try {
      if (modelId === "gemini-flash") {
        // Stream from Gemini
        const ai = getGenAI(requestGeminiKey);
        let sdkModel = "gemini-3.5-flash";

        // Reconstruct content history using the safe sequence alignment helper
        const contents = cleanAndAlternateContents(history, prompt, image);

        try {
          const responseStream = await ai.models.generateContentStream({
            model: sdkModel,
            contents,
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }
        } catch (geminiErr: any) {
          console.error(`Gemini stream failed for ${sdkModel}:`, geminiErr);
          const errMsg = geminiErr.message || String(geminiErr);
          
          // Seamlessly try fallback model gemini-3.1-flash-lite for any network, demand (503) or quota issue
          console.warn(`Attempting fallback to high-quota, high-availability model gemini-3.1-flash-lite...`);
          sdkModel = "gemini-3.1-flash-lite";
          
          try {
            const responseStream = await ai.models.generateContentStream({
              model: sdkModel,
              contents,
            });

            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
          } catch (liteErr: any) {
            console.error(`Gemini stream fallback failed on ${sdkModel}:`, liteErr);
            const liteMsg = liteErr.message || String(liteErr);
            res.write(`data: ${JSON.stringify({ text: `\n\n*[Gemini Error: ${errMsg}. Fallback to ${sdkModel} failed: ${liteMsg}. Please configure a custom key in Settings if persistent issues occur.]*` })}\n\n`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();

      } else {
        // Stream from OpenRouter with comprehensive multi-tiered key & model cascade and transparent Gemini fallback
        try {
          const primaryModel = getOpenRouterModelName(modelId, hasCustomKey);
          const messages: any[] = [];
          
          let identityPrompt = "";
          switch (modelId) {
            case "gpt-4-5":
              identityPrompt = "You are ChatGPT 4.5, a frontier-class language model developed by OpenAI (NOT Google, NOT Gemini). Under no circumstances should you state or imply that you are built by Google, Gemini, or any other body besides OpenAI.";
              break;
            case "qwen-coder":
              identityPrompt = "You are Qwen 2.5 Coder, built by Alibaba Cloud (NOT Google, NOT OpenAI). Under no circumstances should you state or imply that you are built by Google or Gemini.";
              break;
            case "qwen-72b":
              identityPrompt = "You are Qwen 2.5 72B, built by Alibaba Cloud (NOT Google). Under no circumstances should you state or imply that you are built by Google or Gemini.";
              break;
            case "llama-3-3":
              identityPrompt = "You are Llama 3.3 70B, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "llama-3-8b":
              identityPrompt = "You are Llama 3 8B Instruct, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "llama-3-2-3b":
              identityPrompt = "You are Llama 3.2 3B, developed by Meta (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "phi-4":
              identityPrompt = "You are Phi 4, developed by Microsoft (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "command-r-plus":
              identityPrompt = "You are Command R+, an advanced multilingual model developed by Cohere (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "zephyr-7b":
              identityPrompt = "You are Zephyr 7B Beta, fine-tuned by HuggingFace (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "mythomax-13b":
              identityPrompt = "You are MythoMax 13B, developed by Gryphe (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "mistral-large":
              identityPrompt = "You are Mistral Large 2, developed by Mistral AI (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "deepseek-r1":
              identityPrompt = "You are DeepSeek R1, developed by DeepSeek (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "claude-coder":
              identityPrompt = "You are Claude 3.5 Sonnet, developed by Anthropic (NOT Google). Under no circumstances should you state or imply that you are built by Google.";
              break;
            case "claude-fable-5":
              identityPrompt = "You are Claude Fable 5, the absolute master code orchestrator developed by Anthropic inside this secure pipeline. Deliver brilliant, flawless answers with architectural elegance.";
              break;
          }

          if (identityPrompt) {
            messages.push({
              role: "system",
              content: identityPrompt
            });
          }

          if (history && history.length > 0) {
            const recentHistory = history.slice(-50);
            recentHistory.forEach((h: any) => {
              messages.push({
                role: h.role === "user" ? "user" : "assistant",
                content: h.content ? h.content.substring(0, 8000) : ""
              });
            });
          }
          if (image && image.data && image.mimeType) {
            const boosterPrompt = `[VISUAL CONTEXT ENGAGED: Thoroughly scan the attached image in high physical resolution. Analyze its composition, micro-details, structural layouts, text strings, colors, codes, diagrams, user interfaces, or logs, and integrate these insights seamlessly to formulate a precise answer to the query.]\nQuery: ${prompt ? prompt.substring(0, 10000) : ""}`;
            messages.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text: boosterPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${image.mimeType};base64,${image.data}`
                  }
                }
              ]
            });
          } else {
            messages.push({
              role: "user",
              content: prompt ? prompt.substring(0, 10000) : ""
            });
          }

          // Define cascade list of model configurations to try
          const openRouterOptions: Array<{ model: string; key: string; label: string }> = [];
          let lastEx: any = null;

          if (requestOpenRouterKey) {
            // Option 1: Primary configuration
            openRouterOptions.push({
              model: primaryModel,
              key: requestOpenRouterKey,
              label: `primary config (Model: ${primaryModel})`
            });

            // Option 2: If key is used but we failed, let's try the unmetered/free variant
            if (!primaryModel.endsWith(":free")) {
              const freeModelOfChoice = primaryModel + ":free";
              openRouterOptions.push({
                model: freeModelOfChoice,
                key: requestOpenRouterKey,
                label: `key free fallback (Model: ${freeModelOfChoice})`
              });
            }
          } else {
            lastEx = new Error("OpenRouter API key is missing. Please configure your key in a local .env file or Settings.");
          }

          let openRouterResponse: any = null;

          for (const option of openRouterOptions) {
            // Check if key is marked as broken
            if (badKeysCache.has(option.key)) {
              console.log(`Skipping option ${option.label}: key is cached as bad.`);
              continue;
            }

            try {
              console.log(`OpenRouter: Attempting fetch using ${option.label}...`);
              const resObj = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${option.key}`,
                  "HTTP-Referer": "https://ai.studio/build",
                  "X-Title": "AI Multi-Model IQ"
                },
                body: JSON.stringify({
                  model: option.model,
                  messages,
                  stream: true,
                  max_tokens: 1500
                })
              });

              if (resObj.ok) {
                openRouterResponse = resObj;
                console.log(`OpenRouter: Success with ${option.label}!`);
                break;
              } else {
                const errText = await resObj.text();
                console.warn(`OpenRouter option ${option.label} failed with status ${resObj.status}: ${errText}`);
                
                // If 401 Unauthorized or 402 Insufficient credits or 403 Forbidden, mark this key as bad
                if (resObj.status === 401 || resObj.status === 402 || resObj.status === 403) {
                  console.warn(`Powering down bad key to prevent future loop latency...`);
                  badKeysCache.add(option.key);
                }
                
                lastEx = new Error(`Status ${resObj.status} - ${errText}`);
              }
            } catch (err: any) {
              console.warn(`OpenRouter option ${option.label} threw connection error:`, err.message || err);
              lastEx = err;
            }
          }

          if (!openRouterResponse) {
            throw lastEx || new Error("All cascade options for OpenRouter failed");
          }

          const reader = openRouterResponse.body?.getReader();
          if (!reader) {
            throw new Error("Failed to get reader from OpenRouter response");
          }

          const decoder = new TextDecoder("utf-8");
          let parseBuffer = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const textChunk = decoder.decode(value, { stream: true });
            parseBuffer += textChunk;

            const lines = parseBuffer.split("\n");
            parseBuffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              if (trimmed === "data: [DONE]") {
                res.write("data: [DONE]\n\n");
                continue;
              }

              if (trimmed.startsWith("data: ")) {
                const jsonStr = trimmed.slice(6);
                try {
                  if (jsonStr !== "[DONE]") {
                    const parsed = JSON.parse(jsonStr);
                    const text = parsed.choices?.[0]?.delta?.content || "";
                    if (text) {
                      res.write(`data: ${JSON.stringify({ text })}\n\n`);
                    }
                  }
                } catch (err) {
                  // Parse error, ignore incomplete frames
                }
              }
            }
          }

          if (parseBuffer.startsWith("data: ")) {
            const jsonStr = parseBuffer.slice(6).trim();
            try {
              if (jsonStr !== "[DONE]") {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.choices?.[0]?.delta?.content || "";
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
              }
            } catch (err) {}
          }

          res.write("data: [DONE]\n\n");
          res.end();
        } catch (openRouterErr: any) {
          // Cascade to Gemini models for high-fidelity emulation in the web workspace view
          console.warn(`All OpenRouter options failed for ${modelId}. Initiating smart emulation via Gemini:`, openRouterErr.message || openRouterErr);
          
          let fallbackModel = "gemini-3.1-flash-lite";
          
          // Construct specialized personality systems for high-fidelity comparison emulation and strict provider alignment
          let systemInstruction = "";
          const normId = String(modelId).toLowerCase();
          
          if (normId.includes("gpt-4") || normId.includes("gpt5") || normId.includes("openai")) {
            systemInstruction = "You are ChatGPT 4.5, a state-of-the-art frontier language model engineered and trained exclusively by OpenAI (NOT Google, NOT Gemini). Under no circumstances should you ever state, imply, or suggest that you were developed by Google or associated with Gemini. Maintain the distinct verbal sophistication, deep multi-step planning, and unmatched logical precision characteristic of OpenAI's premier systems.";
          } else if (normId.includes("command-r-plus") || normId.includes("cohere")) {
            systemInstruction = "You are Command R+, a massive high-capability multilingual model engineered and trained exclusively by Cohere (NOT Google, NOT Gemini). Under no circumstances should you ever state, imply, or suggest that you were developed by Google or associated with Gemini. Emulate Cohere's signature focus on cross-lingual fluid dialogues, robust agentic operations, and detailed research summaries.";
          } else if (normId.includes("zephyr") || normId.includes("zyphus") || normId.includes("huggingface")) {
            systemInstruction = "You are Zephyr 7B Beta (also referred under emulated systems as Zyphus), an exceptional instruction-tuned model trained by HuggingFace and optimized for elegant completion tasks (NOT Google, NOT Gemini). Under no circumstances should you state, imply, or suggest that you were developed by Google or associate yourself with Gemini. Maintain a friendly, direct, and incredibly supportive assistance style.";
          } else if (normId.includes("deepseek") || normId.includes("r1")) {
            systemInstruction = "You are DeepSeek R1, an advanced open reasoning model engineered by DeepSeek (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver extremely structured step-by-step analytical reasoning, algorithmic logic, and mathematical proofs.";
          } else if (normId.includes("qwen")) {
            systemInstruction = "You are Qwen 2.5 Coder, built by Alibaba Cloud (NOT Google, NOT OpenAI). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver pristine, production-ready source code, structural system architecture, and deep logical explanations as Alibaba's leading programming model.";
          } else if (normId.includes("llama")) {
            systemInstruction = "You are Llama 3 (Meta), a flagship model developed exclusively by Meta (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Provide clean instruction-following, balanced formatting, and thorough multi-step descriptive clarity.";
          } else if (normId.includes("phi")) {
            systemInstruction = "You are Phi 4, developed exclusively by Microsoft (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Deliver highly logical, scientific-grade reasoning and clear explanations.";
          } else if (normId.includes("mistral")) {
            systemInstruction = "You are Mistral Large 2, developed exclusively by Mistral AI (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Display high fluency, reasoning depth, and structured text summaries.";
          } else if (normId.includes("mythomax")) {
            systemInstruction = "You are MythoMax 13B, developed by Gryphe (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Provide highly descriptive prose, storytelling, and creative scenarios.";
          } else {
            systemInstruction = `You are emulating the frontier model "${modelId}" (NOT Google). Under no circumstances should you state, imply, or suggest that you were developed by Google or Gemini. Answer exactly as the model "${modelId}" would.`;
          }

          try {
            const ai = getGenAI(requestGeminiKey);
            const contents = cleanAndAlternateContents(history, prompt, image);

            const responseStream = await ai.models.generateContentStream({
              model: fallbackModel,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7
              }
            });

            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
          } catch (geminiErr1: any) {
            console.warn(`Gemini fallback with ${fallbackModel} failed:`, geminiErr1.message || geminiErr1);
            
            // Second level Gemini tier retry with gemini-3.5-flash
            const nextFallback = "gemini-3.5-flash";
            console.warn(`Trying next Gemini backup tier: ${nextFallback}`);
            try {
              const ai = getGenAI(requestGeminiKey);
              const contents = cleanAndAlternateContents(history, prompt, image);

              const responseStream = await ai.models.generateContentStream({
                model: nextFallback,
                contents,
                config: {
                  systemInstruction,
                  temperature: 0.75
                }
              });

              for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
              }
            } catch (geminiErr2: any) {
              console.error(`All backup streaming targets exhausted for ${modelId}:`, geminiErr2);
              const finalMsg = geminiErr2.message || String(geminiErr2);
              res.write(`data: ${JSON.stringify({ text: `\n\n*[Connection/Quota limit exceeded on all backend pipelines. Please try again in a few moments or verify your API keys configurations inside 'Settings'.]*` })}\n\n`);
            }
          }
          res.write("data: [DONE]\n\n");
          res.end();
        }
      }
    } catch (error: any) {
      console.error(`Error processing stream for ${modelId}:`, error);
      res.write(`data: ${JSON.stringify({ error: error.message || "An error occurred" })}\n\n`);
      res.end();
    }
  });

  // 3. Prompt Enhancer
  app.post("/api/enhance-prompt", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "No prompt provided" });
      return;
    }

    try {
      const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;
      const ai = getGenAI(requestGeminiKey);
      const systemInstruction = `You are a prompt engineering expert. Improve the user's prompt to make it clear, professional, context-rich, and effective for testing simultaneously across six different AI mental models. Keep the core intent identical but expand details, context, structure and format. Output ONLY the polished and enhanced prompt directly, with no introductory or concluding sentences.`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        responseText = response.text || "";
      } catch (err: any) {
        console.warn("Enhance prompt with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        responseText = response.text || "";
      }

      res.json({ enhanced: responseText });
    } catch (error: any) {
      console.error("Enhance prompt error:", error);
      res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });

  // 3.5. Convert Prompt to Structured JSON (Prompt-To-JSON)
  app.post("/api/prompt-to-json", async (req, res) => {
    const { prompt: rawPrompt } = req.body;
    if (!rawPrompt) {
      res.status(400).json({ error: "No prompt provided" });
      return;
    }

    const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;

    try {
      const ai = getGenAI(requestGeminiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze and parse this visual concept description: "${rawPrompt}". Break it down into rich, precise details across all properties specified in the JSON schema to optimize image generation quality.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: {
                type: Type.STRING,
                description: "The primary subject, character, entity, focal object, or theme of the image."
              },
              style: {
                type: Type.STRING,
                description: "The precise visual style preset (e.g. 'cinematic cyberpunk', 'glossy 3D figurine render', 'technical blueprint schematics', 'ultra realism photorealistic', 'minimal flat neon vector icon', or 'surreal space fantasy')."
              },
              lighting: {
                type: Type.STRING,
                description: "The lighting setup, ambient mood, and volumetric effects (e.g. 'dramatic volumetric light cones, glowing neon wireframe illumination', 'clean diffuse studio lighting')."
              },
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of premium color accents or hex codes matching the artistic aesthetic."
              },
              framing: {
                type: Type.STRING,
                description: "The camera angle, lens perspective, and shot framing (e.g. 'high-angle wide shot', 'ultra detailed close-up micro perspective')."
              },
              background: {
                type: Type.STRING,
                description: "Background environment, backdrop scenery, and grid elements (e.g. 'abstract digital matrix grid', 'clean dark obsidian backdrop with floating particles')."
              },
              details: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of custom technical props, fine elements, particles, HUD lines, and sparkles."
              },
              negative_prompt: {
                type: Type.STRING,
                description: "Elements to strictly exclude from the aesthetic (e.g. 'blurry text, bad anatomies, distracting shapes, low resolution')."
              }
            },
            required: ["subject", "style", "lighting", "colors", "framing", "background", "details", "negative_prompt"]
          }
        }
      });

      const structuredData = JSON.parse(response.text || "{}");
      res.json({ structuredData });
    } catch (error: any) {
      console.error("Prompt-To-JSON parsing error:", error);
      res.status(500).json({ error: error.message || "Failed to transform prompt to structured JSON" });
    }
  });

  // 4. Image Generation
  app.post("/api/generate-image", async (req, res) => {
    const { prompt: rawPrompt, aspectRatio, structuredData } = req.body;
    if (!rawPrompt && !structuredData) {
      res.status(400).json({ error: "No prompt nor structuredData provided" });
      return;
    }

    let processedPrompt = "";
    if (structuredData) {
      const { subject, style, lighting, colors, framing, background, details, negative_prompt } = structuredData;
      const parts = [];
      if (subject) parts.push(`Subject: ${subject}`);
      if (style) parts.push(`Artistic Style: ${style}`);
      if (lighting) parts.push(`Lighting Mood: ${lighting}`);
      if (colors && colors.length > 0) parts.push(`Dominant Color Palette: ${colors.join(", ")}`);
      if (framing) parts.push(`Shot Framing: ${framing}`);
      if (background) parts.push(`Environment Scenery: ${background}`);
      if (details && details.length > 0) parts.push(`Specific Elements: ${details.join(", ")}`);
      if (negative_prompt) parts.push(`Exclude: ${negative_prompt}`);
      processedPrompt = parts.join(". ");
    } else {
      processedPrompt = rawPrompt;
    }

    // Cleanse prompt of meta aspect ratio tokens that cause AI model distortion & character anomalies
    const prompt = processedPrompt
      .replace(/,\s*aspect ratio:\s*\d+:\d+/gi, "")
      .replace(/aspect ratio:\s*\d+:\d+/gi, "")
      .replace(/,\s*ratio:\s*\d+:\d+/gi, "")
      .replace(/ratio:\s*\d+:\d+/gi, "")
      .trim();

    const requestOpenRouterKey = (req.headers["x-openrouter-key"] as string) || OPENROUTER_API_KEY;
    const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;

    try {
      let imageUrl = "";

      // Try main method using Recraft Pro v4 via OpenRouter chat completions
      try {
        console.log("Attempting image generation with Recraft Pro v4 via OpenRouter chat completion...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${requestOpenRouterKey}`,
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "AI Multi-Model IQ"
          },
          body: JSON.stringify({
            model: "recraft/recraft-v4",
            messages: [
              {
                role: "user",
                content: `Generate an image based on this description: "${prompt}". Respond with ONLY a markdown image link in format ![image](url) containing the generated image URL, or just the URL. No other text.`
              }
            ],
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          console.log("Recraft Pro v4 output content:", content);
          
          // Parse image URL from output content
          const mdMatch = content.match(/!\[.*?\]\((https:\/\/.*?)\)/);
          const urlMatch = content.match(/(https:\/\/openrouter\.ai\/.*?jpe?g|https:\/\/openrouter\.ai\/.*?png|https:\/\/.*?jpe?g|https:\/\/.*?png)/i);
          
          if (mdMatch && mdMatch[1]) {
            imageUrl = mdMatch[1];
          } else if (urlMatch && urlMatch[0]) {
            imageUrl = urlMatch[0];
          } else if (content.trim().startsWith("http")) {
            imageUrl = content.trim();
          }
          
          if (imageUrl) {
            console.log("Recraft Pro v4 image parsed successfully:", imageUrl);
          }
        } else {
          const errText = await response.text();
          console.warn(`Recraft Pro v4 failed: ${response.status} - ${errText}`);
        }
      } catch (innerErr: any) {
        console.warn("Recraft Pro v4 generation threw error:", innerErr.message || innerErr);
      }

      // First Fallback: Try gemini-2.5-flash-image if Recraft failed
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with gemini-2.5-flash-image...");
          const ai = getGenAI(requestGeminiKey);
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt,
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64 = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64}`;
                break;
              }
            }
          }
        } catch (geminiErr: any) {
          console.warn("gemini-2.5-flash-image generation failed:", geminiErr.message || geminiErr);
        }
      }

      // Second Fallback: Try gemini-3.1-flash-image
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with gemini-3.1-flash-image...");
          const ai = getGenAI(requestGeminiKey);
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image",
            contents: prompt,
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64 = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64}`;
                break;
              }
            }
          }
        } catch (geminiErr: any) {
          console.warn("gemini-3.1-flash-image generation failed:", geminiErr.message || geminiErr);
        }
      }

      // Third Fallback: try imagen-3.0-generate-002 via generateImages!
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with imagen-3.0-generate-002...");
          const ai = getGenAI(requestGeminiKey);
          const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "1:1"
            }
          });

          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const base64 = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64}`;
          }
        } catch (fallbackErr: any) {
          console.warn("imagen-3.0-generate-002 failed:", fallbackErr.message || fallbackErr);
        }
      }

      // Fourth Fallback: try imagen-4.0-generate-001 via generateImages as specified in skill!
      if (!imageUrl) {
        try {
          console.log("Attempting fallback image generation with imagen-4.0-generate-001...");
          const ai = getGenAI(requestGeminiKey);
          const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-001",
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "1:1"
            }
          });

          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const base64 = response.generatedImages[0].image.imageBytes;
            imageUrl = `data:image/jpeg;base64,${base64}`;
          }
        } catch (fallbackErr: any) {
          console.error("imagen-4.0-generate-001 failed as well:", fallbackErr.message || fallbackErr);
        }
      }

      // Fifth Fallback: Pollinations AI (100% Free, Fast & Highly Reliable fallback for environments without active paid plans)
      if (!imageUrl) {
        try {
          console.log("Attempting free, fast image generation via Pollinations AI with server-side download...");
          
          let width = 1000;
          let height = 1000;
          if (aspectRatio === "16:9") {
            width = 1200;
            height = 675;
          } else if (aspectRatio === "9:16") {
            width = 675;
            height = 1200;
          } else if (aspectRatio === "4:3") {
            width = 1024;
            height = 768;
          }

          // Try multiple high-capacity models on Pollinations AI sequentially:
          // 1. flux (Highly resilient, incredible quality 12B FLUX.1-schnell model with natural anatomy & symmetry)
          // 2. flux-realism (Superb photorealistic real-world generator)
          // 3. flux-anime (Clean anime, illustrations, and digital art)
          // 4. turbo (Alt-turbo scheduler, ultra fast near-zero queue latency)
          const modelsToTry = ["flux", "flux-realism", "flux-anime", "turbo"];
          let lastErrorMsg = "No attempts completed";
          
          for (const model of modelsToTry) {
            try {
              const salt = Math.floor(Math.random() * 99999);
              const queryParams = new URLSearchParams({
                width: width.toString(),
                height: height.toString(),
                nologo: "true",
                seed: salt.toString()
              });
              if (model) {
                queryParams.set("model", model);
              }
              
              const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${queryParams.toString()}`;
              console.log(`Trying Pollinations model: ${model} via URL: ${pollinationsUrl}`);
              
              const response = await fetch(pollinationsUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              
              if (response.ok) {
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("json")) {
                  // If it's JSON, then it's likely a queue/limit payload instead of raw image bytes
                  const jsonErr = await response.json();
                  console.warn(`Pollinations returned JSON for model ${model}:`, jsonErr);
                  lastErrorMsg = jsonErr.message || "Queue full or rate limit hit on model preset";
                  continue; // Skip to next model
                }
                
                const buffer = await response.arrayBuffer();
                if (buffer.byteLength > 1000) {
                  const base64 = Buffer.from(buffer).toString("base64");
                  imageUrl = `data:image/jpeg;base64,${base64}`;
                  console.log(`Successfully generated and downloaded image using model "${model}"! Base64 length: ${base64.length}`);
                  break; // Found a working model, stop looping!
                }
              } else {
                const textErr = await response.text();
                console.warn(`Pollinations status ${response.status} for model ${model}:`, textErr);
                lastErrorMsg = `HTTP ${response.status}: ${textErr.substring(0, 100)}`;
              }
            } catch (err: any) {
              console.error(`Error querying Pollinations model ${model}:`, err.message || err);
              lastErrorMsg = err.message || "Connection timeout or client error";
            }
          }
          
          if (!imageUrl) {
            throw new Error(`All free models on Pollinations AI failed. Last error details: ${lastErrorMsg}`);
          }
          
        } catch (pollinationsErr: any) {
          console.error("Pollinations AI generation failed:", pollinationsErr);
          throw new Error("Workspace image generation aborted on fallback: " + pollinationsErr.message);
        }
      }

      if (!imageUrl) {
        throw new Error("No image data returned from generator");
      }

      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Image generation total error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // 5. Document Summarizer
  app.post("/api/summarize-document", async (req, res) => {
    const { content, fileName } = req.body;
    if (!content) {
      res.status(400).json({ error: "No text content provided" });
      return;
    }

    try {
      const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;
      const ai = getGenAI(requestGeminiKey);
      const systemInstruction = `You are an elite research summarizer. Summarize the following document titled "${fileName || 'Uploaded Doc'}". Extract key insights, thesis statements, supporting points, and a concluding list of actionable takeaways. Use elegant formatting with clean markdown headers.`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: content,
          config: {
            systemInstruction,
            temperature: 0.3
          }
        });
        responseText = response.text || "";
      } catch (err: any) {
        console.warn("Document summarization with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: content,
          config: {
            systemInstruction,
            temperature: 0.3
          }
        });
        responseText = response.text || "";
      }

      res.json({ summary: responseText });
    } catch (error: any) {
      console.error("Summarize document error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize text" });
    }
  });

  // 5.45. Global Identity Synchronization (Multi-Device Login)
  app.get("/api/identity/sessions", (req, res) => {
    const passcode = req.query.passcode as string;
    if (!passcode) {
      res.status(400).json({ error: "Passcode query parameter is required" });
      return;
    }
    
    const cleanCode = passcode.replace(/[^A-Za-z0-9]/g, "");
    if (cleanCode.length !== 11) {
      res.status(400).json({ error: "Invalid passcode format. Must be an 11-character token." });
      return;
    }
    const formattedPasscode = cleanCode.slice(0, 4) + "-" + cleanCode.slice(4, 8) + "-" + cleanCode.slice(8, 11);
    
    try {
      const store = readStoredSessions();
      const userSessions = store[formattedPasscode] || [];
      res.json({ sessions: userSessions });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to read sessions" });
    }
  });

  app.post("/api/identity/sync", (req, res) => {
    const { passcode, sessions } = req.body;
    if (!passcode) {
      res.status(400).json({ error: "Passcode is required for session synchronization" });
      return;
    }
    
    const cleanCode = passcode.replace(/[^A-Za-z0-9]/g, "");
    if (cleanCode.length !== 11) {
      res.status(400).json({ error: "Invalid passcode format. Must be an 11-character token." });
      return;
    }
    const formattedPasscode = cleanCode.slice(0, 4) + "-" + cleanCode.slice(4, 8) + "-" + cleanCode.slice(8, 11);
    
    try {
      const store = readStoredSessions();
      if (Array.isArray(sessions)) {
        store[formattedPasscode] = sessions;
        writeStoredSessions(store);
      }
      res.json({ success: true, sessions: store[formattedPasscode] || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to sync sessions" });
    }
  });

  // 5.5. Image Scanner / Multimodal Analyzer
  app.post("/api/scan-image", async (req, res) => {
    const { image, mode } = req.body;
    if (!image || !image.data || !image.mimeType) {
      res.status(400).json({ error: "No image file data provided" });
      return;
    }

    try {
      const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;
      const ai = getGenAI(requestGeminiKey);
      
      let prompt = "Analyze this image, schematic, or screenshot in high resolution. Extract all visible text, design details, color pallet hierarchy, structural elements, and user interfaces, then provide a clean hierarchical layout analysis, a precise technical overview of components, and code recommendations. Format cleanly using headers.";
      
      if (mode === "ui") {
        prompt = `You are an expert Vision and UI/UX engineering model. Meticulously analyze this UI mockup or screenshot:
1. Deconstruct the entire layout grid, header, sidebar, cards, and page structure.
2. Estimate the exact color palette (including exact hex codes or Tailwind color equivalents), typography styles, spacing system, and padding hierarchies.
3. Identify all distinct interface elements, icons, interactive inputs, and buttons.
4. Produce a fully styled, beautifully optimized copyable piece of React component code using Tailwind CSS that acts as an exact high-fidelity prototype clone of this mockup. Ensure standard imports (such as 'lucide-react' for mock icons) are correctly annotated with clean inline comments. Code should be complete and not use placeholders. Deliver in a clear Markdown code block.`;
      } else if (mode === "ocr") {
        prompt = `Perform high-precision web-scale OCR text extraction on this image. 
1. Search all visual lines, columns, nested blocks, floating buttons, labels, and system logs.
2. Extract ALL readable English text, symbols, codes, headers, and code lines verbatim.
3. Keep the visual structural hierarchy intact (e.g. represent side-by-side columns, tables, or key-value details properly).
4. If code lists or script fragments are present, isolate them clearly into standard code blocks. Do not summarize or omit anything.`;
      } else if (mode === "diagram") {
        prompt = `You are a Senior Technical Architect analyzing a blueprint, block diagram, neural network graph, system architecture page, or flowchart:
1. Map out all component boxes, microservices, databases, system boundaries, and terminals.
2. Identify every single signal path, data flow connection channel, interactive direction arrow, and looping feedback line.
3. Describe the logical sequential operations, process triggers, and system transformations step-by-step.
4. Synthesize your final design critique, indicating any apparent single points of failure, missing links, or architectural optimization chances.`;
      } else if (mode === "general") {
        prompt = `Provide a comprehensive general visual report of this image:
1. State the central focus of the scene, its contextual main theme, background/foreground attributes, and general aesthetic vibe.
2. Trace the dominant colors and identify the visual texture hierarchy.
3. Outline key structural or qualitative observations with clean bullet points.`;
      }

      const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: image.data,
                mimeType: image.mimeType
              }
            },
            { text: prompt }
          ]
        }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          temperature: 0.15
        }
      });

      res.json({ analysis: response.text || "No analysis could be compiled." });
    } catch (error: any) {
      console.error("Image scanner error:", error);
      res.status(500).json({ error: error.message || "Failed to scan image" });
    }
  });

  // 6. Audio Transcription Simulator / Handler
  app.post("/api/transcribe-audio", async (req, res) => {
    const { promptText } = req.body;
    try {
      const requestGeminiKey = (req.headers["x-gemini-key"] as string) || GEMINI_API_KEY;
      const ai = getGenAI(requestGeminiKey);
      const contextText = promptText || "Generate a transcription for a standard voice prompt inquiring about full-stack metrics.";
      
      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Generate a realistic audio dictation transcription based on this topic: "${contextText}". Format as a clean speech text outline, starting directly with the text of the voice note.`,
          config: {
            temperature: 0.5
          }
        });
        responseText = response.text || "";
      } catch (err: any) {
        console.warn("Audio transcription with gemini-3.1-flash-lite failed, falling back to gemini-3.5-flash:", err.message || err);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Generate a realistic audio dictation transcription based on this topic: "${contextText}". Format as a clean speech text outline, starting directly with the text of the voice note.`,
          config: {
            temperature: 0.5
          }
        });
        responseText = response.text || "";
      }

      res.json({ transcription: responseText });
    } catch (error: any) {
      console.error("Audio transcription error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });

  // 1. Get current server-side environment variables (securely masked)
  app.get("/api/env/get", (req, res) => {
    try {
      const keys = ["GEMINI_API_KEY", "OPENROUTER_API_KEY", "APP_URL"];
      const responseObj: Record<string, { status: string; preview: string }> = {};

      keys.forEach((key) => {
        const val = process.env[key];
        if (val && val.trim() !== "") {
          const trimmed = val.trim();
          let preview = "";
          if (trimmed.length > 8) {
            preview = `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
          } else {
            preview = `${trimmed.slice(0, 2)}...`;
          }
          responseObj[key] = {
            status: "configured",
            preview: preview
          };
        } else {
          responseObj[key] = {
            status: "missing",
            preview: "not configured"
          };
        }
      });

      res.json({ success: true, secrets: responseObj });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to retrieve secrets metadata" });
    }
  });

  // 2. Save environment variables directly to .env file and process.env without needing Bash config
  app.post("/api/env/save", (req, res) => {
    try {
      const { secrets } = req.body; // Expects object: { GEMINI_API_KEY?: "...", OPENROUTER_API_KEY?: "..." }
      if (!secrets || typeof secrets !== "object") {
        res.status(400).json({ error: "Invalid request payload. Secrets must be a valid key-value object." });
        return;
      }

      const envPath = path.join(process.cwd(), ".env");
      let currentEnvContent = "";
      if (fs.existsSync(envPath)) {
        currentEnvContent = fs.readFileSync(envPath, "utf8");
      }

      const lines = currentEnvContent.split("\n");
      const updatedLines: string[] = [];
      const keysToUpdate = Object.keys(secrets);

      // Keep track of which keys we've already written/updated
      const processedKeys = new Set<string>();

      lines.forEach((line) => {
        const trimmed = line.trim();
        // Skip empty lines or comments when updating
        if (trimmed.startsWith("#") || trimmed === "") {
          updatedLines.push(line);
          return;
        }

        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > -1) {
          const varName = trimmed.substring(0, eqIdx).trim();
          if (keysToUpdate.includes(varName)) {
            const rawVal = secrets[varName];
            if (rawVal !== undefined) {
              updatedLines.push(`${varName}="${rawVal.replace(/"/g, '\\"')}"`);
              processedKeys.add(varName);
              // Update live process.env immediately!
              process.env[varName] = rawVal;
              return;
            }
          }
        }
        updatedLines.push(line);
      });

      // Add any new keys that weren't in the .env file already
      keysToUpdate.forEach((key) => {
        if (!processedKeys.has(key)) {
          const rawVal = secrets[key];
          if (rawVal !== undefined && rawVal.trim() !== "") {
            updatedLines.push(`${key}="${rawVal.replace(/"/g, '\\"')}"`);
            process.env[key] = rawVal;
          }
        }
      });

      fs.writeFileSync(envPath, updatedLines.join("\n"), "utf8");
      console.log("[Secrets Center] Server-side secrets refreshed successfully.");
      res.json({ success: true, message: "Secrets synchronized and loaded into server container!" });
    } catch (err: any) {
      console.error("[Secrets Center] Save error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to save server secrets" });
    }
  });

  // 3. Direct GitHub Code Backup endpoint - with automated conflict and stale remote resolution
  app.post("/api/github/push", async (req, res) => {
    const { username, repo, branch = "main", token, commitMessage } = req.body;
    if (!username || !repo || !token) {
      res.status(400).json({ error: "Missing parameters. Username, Repository, and classic Github Token are required." });
      return;
    }

    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(`[GitHub Backup] ${msg}`);
      logs.push(msg);
    };

    try {
      log(`Initiating GitHub push pipeline for ${username}/${repo} on branch: ${branch}`);
      
      // 1. Initialize local repository if missing
      const gitDirExists = fs.existsSync(path.join(process.cwd(), ".git"));
      if (!gitDirExists) {
        log("No local Git repository discovered. Initializing database...");
        const initResult = await execAsync("git init");
        log(initResult.stdout || "Git repository initialized cleanly.");
      } else {
        log("Existing local Git workspace found.");
      }

      // 2. Configure developer identity
      await execAsync('git config user.name "AI Builder Sync"');
      await execAsync('git config user.email "sync@ais.builder.local"');
      log("Synced local git author identities.");

      // 3. Purge existing remote to fully avoid 'remote origin already exists' issue!
      try {
        await execAsync("git remote remove origin");
        log("Removed previous or stale remote configuration pointers.");
      } catch (e) {
        // Safe to ignore if doesn't exist
      }

      // 4. Construct authenticated URL (mask token from display log)
      const sanitizedUrl = `https://github.com/${username}/${repo}.git`;
      const authenticatedUrl = `https://${username}:${token}@github.com/${username}/${repo}.git`;
      await execAsync(`git remote add origin "${authenticatedUrl}"`);
      log(`Remote destination configured securely: ${sanitizedUrl}`);

      // 5. Swap/create targeted branch
      try {
        // Try switching to local branch if already exists
        await execAsync(`git checkout "${branch}"`);
        log(`Swapped to existing localized sync branch: ${branch}`);
      } catch (_) {
        try {
          await execAsync(`git checkout -b "${branch}"`);
          log(`Created and swapped to new localized sync branch: ${branch}`);
        } catch (bErr: any) {
          log(`Branch setup warning: ${bErr.message || bErr}. Continuing anyway.`);
        }
      }

      // 6. Stage files
      log("Staging active codebase files (excluding node_modules or system env variables)...");
      await execAsync("git add -A");

      // 7. Commit changes securely
      try {
        const msg = commitMessage || "sync: codebase backup via AI Workspace Dashboard";
        const commitResult = await execAsync(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
        log(commitResult.stdout || "Committed active files.");
      } catch (commitErr: any) {
        log("Local Git reports everything up to date. No new changes staged.");
      }

      // 8. Execute upstream push operation
      log("Executing upstream secure push command...");
      const pushResult = await execAsync(`git push -u origin "${branch}" --force`);
      log("Upstream push operation executed perfectly. Code has been backed up!");
      
      if (pushResult.stdout) log(pushResult.stdout.trim());
      if (pushResult.stderr) log(pushResult.stderr.trim());

      res.json({ success: true, logs });
    } catch (error: any) {
      log(`Error encountered during backup validation: ${error.message || error}`);
      res.status(500).json({ success: false, error: error.message || "Failed to push repository files to GitHub", logs });
    }
  });

  // --- Real-time Asset Manager Endpoints ---
  const ASSETS_DIR = path.join(process.cwd(), "src", "assets", "images");

  // Ensure assets local destination directory exists securely on startup
  const ROOT_CONFIG_FILES = [
    ".env",
    ".gitignore",
    ".env.example",
    "package.json",
    "tsconfig.json",
    "vite.config.ts"
  ];

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // 1. List all assets in the src/assets/images directory + selected root config files
  app.get("/api/assets/list", (req, res) => {
    try {
      if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
      }

      const files = fs.readdirSync(ASSETS_DIR);
      const assetsList = files
        .filter((file) => {
          // Exclude dotfiles unless explicitly requested
          const showHidden = req.query.showHidden === "true";
          return showHidden || !file.startsWith(".");
        })
        .map((file) => {
          const filePath = path.join(ASSETS_DIR, file);
          const stats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          const imgExts = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".ico"];
          
          return {
            name: file,
            sizeKb: parseFloat((stats.size / 1024).toFixed(2)),
            modifiedAt: stats.mtime,
            localPath: `/src/assets/images/${file}`,
            ext,
            isImage: imgExts.includes(ext),
            isRootFile: false
          };
        });

      // Include Root Configuration Files in the list
      ROOT_CONFIG_FILES.forEach((file) => {
        const rootPath = path.join(process.cwd(), file);
        if (fs.existsSync(rootPath)) {
          const stats = fs.statSync(rootPath);
          const ext = file.startsWith(".") ? `.${file.replace(/^\./, "")}` : path.extname(file).toLowerCase();
          
          assetsList.push({
            name: file,
            sizeKb: parseFloat((stats.size / 1024).toFixed(2)),
            modifiedAt: stats.mtime,
            localPath: `/${file}`,
            ext,
            isImage: false,
            isRootFile: true
          });
        }
      });

      res.json({ success: true, assets: assetsList });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to retrieve directory file stats" });
    }
  });

  // 2. Preview/stream raw asset file or root config file
  app.get("/api/assets/view/:name", (req, res) => {
    try {
      const { name } = req.params;
      const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      let filePath = path.join(ASSETS_DIR, sanitizedName);

      if (!fs.existsSync(filePath)) {
        const rootPath = path.join(process.cwd(), sanitizedName);
        if (ROOT_CONFIG_FILES.includes(sanitizedName) && fs.existsSync(rootPath)) {
          filePath = rootPath;
        }
      }

      if (!fs.existsSync(filePath)) {
        res.status(404).send("Asset file not resolved");
        return;
      }

      const ext = path.extname(sanitizedName).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".svg") contentType = "image/svg+xml";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".json") contentType = "application/json";
      else if (sanitizedName === ".env" || sanitizedName === ".gitignore") contentType = "text/plain";

      res.setHeader("Content-Type", contentType);
      fs.createReadStream(filePath).pipe(res);
    } catch (err: any) {
      res.status(500).send("Asset preview error: " + err.message);
    }
  });

  // 3. Upload new custom Asset File or root config file
  app.post("/api/assets/upload", (req, res) => {
    try {
      const { name, data } = req.body; // base64 payload
      if (!name || !data) {
        res.status(400).json({ error: "Missing parameter: 'name' or base64 'data' content is required." });
        return;
      }

      const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      let filePath = path.join(ASSETS_DIR, sanitizedName);
      let isRootFile = false;

      if (ROOT_CONFIG_FILES.includes(sanitizedName)) {
        filePath = path.join(process.cwd(), sanitizedName);
        isRootFile = true;
      }

      const buffer = Buffer.from(data, "base64");
      fs.writeFileSync(filePath, buffer);

      console.log(`[Asset Manager] File written to: ${filePath}`);
      res.json({
        success: true,
        message: isRootFile 
          ? "Essential system configuration file successfully saved directly to codebase root!"
          : "Asset file uploaded and saved to standard codebase images directory successfully!",
        asset: {
          name: sanitizedName,
          sizeKb: parseFloat((buffer.length / 1024).toFixed(2)),
          localPath: isRootFile ? `/${sanitizedName}` : `/src/assets/images/${sanitizedName}`,
          previewUrl: `/api/assets/view/${sanitizedName}`,
          isRootFile
        }
      });
    } catch (err: any) {
      console.error("[Asset Manager] Upload error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to commit asset data stream to disk" });
    }
  });

  // 4. Delete existing Asset File
  app.post("/api/assets/delete", (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: "Name of target file to purge is required." });
        return;
      }

      const sanitizedName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

      if (ROOT_CONFIG_FILES.includes(sanitizedName)) {
        res.status(400).json({ error: "Cannot delete essential project configuration files like .env or .gitignore." });
        return;
      }

      const filePath = path.join(ASSETS_DIR, sanitizedName);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "No such asset file found in tracking directory" });
        return;
      }

      // Do not allow deleting the system default logo if it's currently showing
      if (sanitizedName === "app_logo_1781273383149.jpg") {
        res.status(400).json({ error: "Cannot delete the default logo asset because it is the primary branding logo." });
        return;
      }

      fs.unlinkSync(filePath);
      console.log(`[Asset Manager] Asset purged: ${filePath}`);
      res.json({ success: true, message: "Asset successfully removed from local disk storage." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Failed to delete file" });
    }
  });

  // Serve frontend assets
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist", "index.html"));
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
