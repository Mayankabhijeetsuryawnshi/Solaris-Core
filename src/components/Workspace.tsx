/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Sparkles, 
  Trash2, 
  ArrowLeft, 
  Layers, 
  PenTool, 
  FileUp, 
  HelpCircle,
  Clock,
  Check,
  Cpu,
  Zap,
  Image as ImageIcon,
  BookOpen,
  Volume2,
  ChevronRight,
  Compass,
  Sparkle,
  Copy,
  Info,
  Sliders,
  Maximize2,
  X,
  Code,
  Terminal,
  Paperclip,
  Activity,
  Play,
  Key,
  Github,
  GitBranch,
  MessageSquare,
  Cable,
  Binary
} from "lucide-react";
import { ModelInfo, ModelResponse, ChatMessage, StreamStatus, CustomWorkflow, ChatSession } from "../types";
import ModelCard from "./ModelCard";
import CelestialCanvas from "./CelestialCanvas";
import VideoDetectionModule from "./VideoDetectionModule";
import PhysicsSpace from "./PhysicsSpace";
import ControlCluster from "./ControlCluster";

// Modular Sub-Components
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspacePromptBar } from "./WorkspacePromptBar";
import { MobileLayoutSwitcher } from "./MobileLayoutSwitcher";
import { SwarmDebatePanel } from "./SwarmDebatePanel";
import { SidebarUtilityPanel } from "./SidebarUtilityPanel";
import { IndividualChatModal } from "./IndividualChatModal";

const isValidBackendUrl = (url: string | null | undefined) => {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower === "" || lower.startsWith("capacitor:") || lower.startsWith("file:") || lower.includes("capacitor://")) {
    return false;
  }
  
  // If running inside Capacitor APK on a physical device or emulator, localhost is invalid as a backend API endpoint
  const isAPK = !!(window as any).Capacitor ||
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "file:" ||
    window.location.origin?.includes("capacitor://");

  if (isAPK && (lower.includes("localhost") || lower.includes("127.0.0.1"))) {
    return false;
  }
  return true;
};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied for key:", key, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied for key:", key, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removal denied for key:", key, e);
    }
  }
};

const getDevAndPreprodUrls = () => {
  const buildUrl = (import.meta as any).env?.VITE_APP_URL || "";
  let devUrl = buildUrl;
  let preUrl = buildUrl;

  const realDevUrl = "https://ais-dev-szfco7srhypplt5m4keqex-53067259193.asia-east1.run.app";
  const realPreUrl = "https://ais-pre-szfco7srhypplt5m4keqex-53067259193.asia-east1.run.app";

  if (!buildUrl || buildUrl.includes(".pages.dev") || buildUrl.includes("localhost")) {
    devUrl = realDevUrl;
    preUrl = realPreUrl;
  } else if (buildUrl.includes("-dev-")) {
    preUrl = buildUrl.replace("-dev-", "-pre-");
  } else if (buildUrl.includes("-pre-")) {
    devUrl = buildUrl.replace("-pre-", "-dev-");
  } else {
    devUrl = realDevUrl;
    preUrl = realPreUrl;
  }
  return { devUrl, preUrl };
};

const getApiUrl = (endpoint: string) => {
  const isLocalWebview = 
    !!(window as any).Capacitor ||
    window.location.protocol === "capacitor:" || 
    window.location.protocol === "file:" ||
    window.location.origin?.includes("capacitor://");

  const isCloudflarePages = typeof window !== "undefined" && window.location.hostname?.endsWith(".pages.dev");

  const { devUrl, preUrl } = getDevAndPreprodUrls();
  let isSeparatelyDeployed = isLocalWebview || isCloudflarePages;

  if (!isSeparatelyDeployed && devUrl && window.location.origin) {
    try {
      const u1 = new URL(window.location.origin);
      const u2 = new URL(devUrl);
      if (u1.hostname !== u2.hostname && !u1.hostname.includes("127.0.0.1") && !u1.hostname.includes("localhost")) {
        isSeparatelyDeployed = true;
      }
    } catch (e) {}
  }

  if (isSeparatelyDeployed) {
    const storedUrl = safeStorage.getItem("mai_backend_url");
    if (isValidBackendUrl(storedUrl) && (!storedUrl!.includes(".pages.dev") || storedUrl!.includes("8cd48335"))) {
      return `${storedUrl!.trim().replace(/\/$/, "")}${endpoint}`;
    }
    const defaultBackup = "https://8cd48335.aiworkspace-f4d.pages.dev";
    // Default fallback to the pre-configured backup server
    safeStorage.setItem("mai_backend_url", defaultBackup);
    return `${defaultBackup}${endpoint}`;
  }

  // Under normal browser environment, always use Relative path to handle dev/preprod URLs automatically and prevent CORS/stale storage.
  return endpoint;
};

// Helper to remap standard endpoints to the fallback instance if connections fail
const getFallbackUrl = (input: RequestInfo | URL): string => {
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.href;
  } else if (input && typeof (input as any).url === "string") {
    urlStr = (input as any).url;
  }

  const defaultBackup = "https://8cd48335.aiworkspace-f4d.pages.dev";
  if (urlStr.startsWith("/")) {
    return `${defaultBackup}${urlStr}`;
  }
  
  try {
    const parsed = new URL(urlStr);
    return `${defaultBackup}${parsed.pathname}${parsed.search}`;
  } catch (e) {
    return urlStr.replace(/^https?:\/\/[^/]+/, defaultBackup);
  }
};

// Safe fetch wrapper to automatically inject custom keys into headers securely and implement automatic Render failover
const safeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = "";
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && typeof (input as any).url === "string") {
    url = (input as any).url;
  }

  const injectKeys = (options?: RequestInit): RequestInit => {
    if (!url.includes("/api/")) return options || {};
    const customGeminiKey = safeStorage.getItem("mai_custom_gemini_key");
    const customOpenRouterKey = safeStorage.getItem("mai_custom_openrouter_key");
    if (!customGeminiKey && !customOpenRouterKey) return options || {};

    const opCopy = options ? { ...options } : {};
    const headersObj: Record<string, string> = {};
    if (opCopy.headers) {
      if (opCopy.headers instanceof Headers) {
        opCopy.headers.forEach((val, key) => { headersObj[key] = val; });
      } else if (Array.isArray(opCopy.headers)) {
        for (const [key, val] of opCopy.headers) { headersObj[key] = val; }
      } else {
        Object.assign(headersObj, opCopy.headers);
      }
    }
    if (customGeminiKey) headersObj["X-Gemini-Key"] = customGeminiKey.trim();
    if (customOpenRouterKey) headersObj["X-OpenRouter-Key"] = customOpenRouterKey.trim();
    opCopy.headers = headersObj;
    return opCopy;
  };

  const finalInit = injectKeys(init);

  try {
    const response = await window.fetch(input, finalInit);
    if (!response.ok && response.status >= 500) {
      console.warn(`Primary endpoint failed with status ${response.status}. Initiating automatic backup failover...`);
      const fallbackUrl = getFallbackUrl(input);
      return await window.fetch(fallbackUrl, finalInit);
    }
    return response;
  } catch (err) {
    console.warn("Primary API connection failed. Initiating automatic backup failover to 8cd48335.aiworkspace-f4d.pages.dev...", err);
    try {
      const fallbackUrl = getFallbackUrl(input);
      return await window.fetch(fallbackUrl, finalInit);
    } catch (fallbackErr) {
      console.error("Failover endpoint also failed:", fallbackErr);
      throw err; // throw original connection error
    }
  }
};

const getGridColsClass = (count: number) => {
  if (count === 1) return "grid-cols-1 max-w-2xl mx-auto";
  if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
  return "grid-cols-1 md:grid-cols-3 gap-6";
};

interface WorkspaceProps {
  onBack: () => void;
  models: ModelInfo[];
  isCodeModeActive: boolean;
  setIsCodeModeActive: (val: boolean) => void;
  physicsModeActive: boolean;
  setPhysicsModeActive: (val: boolean) => void;
  userPasscode: string;
  setUserPasscode: (val: string) => void;
}

const customWorkflows: CustomWorkflow[] = [
  {
    id: "none",
    name: "General Workspace",
    icon: "Layers",
    promptPrefix: "",
    description: "Standard model orchestration without predefined system constraints."
  },
  {
    id: "developer",
    name: "Technical/Developer Suite",
    icon: "PenTool",
    promptPrefix: "Provide a highly modular, clean, and production-ready code design, optimizing for execution efficiency, rigorous error guards, and performance bottlenecks: ",
    description: "Focuses response structures specifically on software architecture and high scalability."
  },
  {
    id: "creative",
    name: "Creative/Narrative Studio",
    icon: "Sparkle",
    promptPrefix: "Craft a deeply creative, elegant, prose-driven narrative output with vivid sensory descriptions and engaging structure: ",
    description: "Tailored specifically for branding, copy, storytelling, and copy editing."
  },
  {
    id: "socratic",
    name: "Socratic Educator",
    icon: "BookOpen",
    promptPrefix: "Explain the concept comprehensively using a Socratic teaching format. Challenge assumptions, give concrete analogical examples, and outline logical deductions: ",
    description: "Ideal for deep-concept assimilation and analytical debugging."
  }
];

export const generateSwarmDebatePrompt = (
  topic: string,
  modelName: string,
  modelDescription: string,
  index: number,
  totalTalkers: number,
  historyText: string,
  isCodeMode: boolean
): string => {
  const debateGuidelines = isCodeMode
    ? "Challenge preceding technical architectures, identify potential memory leaks, verify strict runtime type safety, and push back on sub-optimal algorithmic compromises."
    : "Expose systemic risks, challenge conventional geopolitical paradigms, reject naive economic projections, and demand rigorous causal structures.";

  return `[MODERATOR INSTRUCTION: You are an expert panel member in an adversarial multi-agent AI debate system.]

### DEBATE CONTEXT
- **Core Subject Matter / Topic**: "${topic}"
- **Adversarial / Moderator Guidelines**: "${debateGuidelines}"
- **Current Speaker Index**: Speaker ${index + 1} of ${totalTalkers}

--- TRANSCRIPT OF PRE-EXISTING STATEMENTS (CRITIQUE THESE) ---
${historyText}
--------------------------------------------------------------

### YOUR SPECIFIC PERSPECTIVE
You are representing and portraying the specific Persona of: "${modelName}".

**Your Persona Description / Character Perspective**: 
"${modelDescription}"

Please formulate your prospective statement on this subject matter, directly rebutting or building upon previous speakers.

### COMPLIANCE RULES & CONSTRAINTS:
1. **Critical Analysis**: Identify potential fallback arguments, logical fallacies, lack of factual boundaries, or code inefficiencies on the specified topic. Counter typical assumptions with rigorous skepticism.
2. **True-to-Character Voice**: Maintain the precise style, tone, and philosophical alignment described in your character perspective under all conditions.
3. **Pacing and Density**: Keep your response concise, punchy, and highly communicative (between 150 to 250 words maximum). Avoid long introductions or filler text, so that the debate feels natural and immediate.
4. **Clean Stream Outputs**: Output only the speech itself as you wish it to be spoken. Do not include metadata, introductory intros, footnotes, or closing signoffs.
5. **Proper Mathematical Display**: Make your answer extremely detailed and lengthy if it involves formulas. Write out equations in full, using proper LaTeX syntax (e.g. \\frac{numerator}{denominator}, \\sqrt{expression}) and fully explaining all subscripts and symbols.`;
};

const renderMathematicalFormula = (content: string) => {
  let processed = content;

  // 1. Resolve braced vector/hat/dot modifiers
  processed = processed
    .replace(/\\vec\{([^{}]+)\}/g, '<span class="relative inline-block font-bold select-all">$1<span class="absolute -top-1 left-0 right-0 text-[9px] font-normal leading-none block text-center">→</span></span>')
    .replace(/\\hat\{([^{}]+)\}/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1 left-0 right-0 text-[10px] font-light leading-none block text-center">^</span></span>')
    .replace(/\\dot\{([^{}]+)\}/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1.5 left-0 right-0 text-[10px] font-bold leading-none block text-center">.</span></span>')
    .replace(/\\bar\{([^{}]+)\}/g, '<span class="overline select-all">$1</span>');

  // 2. Resolve single-char vector/hat modifiers (e.g. \vec v or \hat n)
  processed = processed
    .replace(/\\vec\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block font-bold select-all">$1<span class="absolute -top-1/2 left-0 right-0 text-[9px] font-normal leading-none block text-center">→</span></span>')
    .replace(/\\hat\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1/2 left-0 right-0 text-[10px] font-light leading-none block text-center">^</span></span>')
    .replace(/\\dot\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1.5 left-0 right-0 text-[10px] font-bold leading-none block text-center">.</span></span>');

  // 3. Clean up \left and \right matrix delimiters
  processed = processed
    .replace(/\\left\s*\[/g, '<span class="text-cyan-400 font-bold font-serif text-[13px] scale-y-125 inline-block mx-0.5">[</span>')
    .replace(/\\right\s*\]/g, '<span class="text-cyan-400 font-bold font-serif text-[13px] scale-y-125 inline-block mx-0.5">]</span>')
    .replace(/\\left\s*\(/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">(</span>')
    .replace(/\\right\s*\)/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">)</span>')
    .replace(/\\left\s*\\\{/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">{</span>')
    .replace(/\\right\s*\\\}/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">}</span>')
    .replace(/\\left\s*\\\|/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">|</span>')
    .replace(/\\right\s*\\\|/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">|</span>')
    .replace(/\\left\b/g, "")
    .replace(/\\right\b/g, "");

  // 4. Superscript and Subscript curly brace stripping (recursive up to 4 layers)
  for (let i = 0; i < 4; i++) {
    processed = processed
      .replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>")
      .replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
  }

  // 5. Standard Greek & Scientific Symbols
  processed = processed
    .replace(/\\omega/g, "ω")
    .replace(/\\theta/g, "θ")
    .replace(/\\pi/g, "π")
    .replace(/\\mu/g, "μ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\rho/g, "ρ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\delta/g, "δ")
    .replace(/\\epsilon/g, "ε")
    .replace(/\\phi/g, "φ")
    .replace(/\\psi/g, "ψ")
    .replace(/\\eta/g, "η")
    .replace(/\\tau/g, "τ")
    .replace(/\\approx/g, "≈")
    .replace(/\\neq/g, "≠")
    .replace(/\\pm/g, "±")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\infty/g, "∞")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\partial/g, "∂")
    .replace(/\\nabla/g, "∇")
    .replace(/\\int/g, "∫")
    .replace(/\\sum/g, "Σ")
    .replace(/\\sqrt/g, "√")
    .replace(/\\hbar/g, "ħ")
    .replace(/\\deg/g, "°")
    .replace(/\\prod/g, "Π")
    .replace(/\\oint/g, "∮");

  // 5.5. Render mathematical factorials elegantly (e.g. n! or (n-k)!)
  processed = processed
    .replace(/([a-zA-Z0-9]+)!/g, '<span class="font-serif italic text-cyan-300">$1</span><span class="font-sans font-bold text-cyan-400">!</span>')
    .replace(/\(([^()]+)\)!/g, '<span class="font-sans font-semibold text-cyan-300">($1)</span><span class="font-sans font-bold text-cyan-400">!</span>');

  // 6. Inline index replacements - support factorials, subscripts, superscripts, brackets, and common operators
  processed = processed
    .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)\^([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sup>$2</sup>")
    .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)_([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sub>$2</sub>");

  // 7. Render text macros beautifully
  processed = processed
    .replace(/\\text\s*\{([^{}]+)\}/g, '<span class="font-sans normal-case select-all">$1</span>')
    .replace(/\\mathrm\s*\{([^{}]+)\}/g, '<span class="font-sans select-all">$1</span>');

  return <span className="font-serif italic select-all inline-block align-middle" dangerouslySetInnerHTML={{ __html: processed }} />;
};

const renderFractions = (text: string): React.ReactNode => {
  const regex = /(?:\\|\/)(?:fract|frac)\{([^{}]+)\}\{([^{}]+)\}/g;
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) {
    return renderMathematicalFormula(text);
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const matchIndex = match.index!;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`t-${idx}`}>{renderFractions(text.substring(lastIndex, matchIndex))}</span>);
    }
    const numerator = match[1];
    const denominator = match[2];
    parts.push(
      <span key={`f-${idx}`} className="inline-flex flex-col items-center justify-center align-middle mx-1.5 bg-slate-950/40 border border-slate-800/50 px-1 rounded-md text-[11px] leading-tight font-serif text-sky-305">
        <span className="border-b border-sky-450/40 pb-0.5 px-1 block text-center min-w-[20px]">{renderFractions(numerator)}</span>
        <span className="pt-0.5 px-1 block text-center min-w-[20px]">{renderFractions(denominator)}</span>
      </span>
    );
    lastIndex = matchIndex + match[0].length;
  });
  if (lastIndex < text.length) {
    parts.push(<span key="tail">{renderFractions(text.substring(lastIndex))}</span>);
  }
  return <>{parts}</>;
};

const renderFormulasBlock = (text: string, onSyncParam?: (p: string, v: number) => void): React.ReactNode => {
  const formulaRegex = /(?:\\|\/)?formula\{([\s\S]*?)\}/g;
  const matches = [...text.matchAll(formulaRegex)];
  
  const highlightTelemetry = (rawText: string) => {
    if (!onSyncParam) return renderFractions(rawText);
    
    // Scan for numbers followed by physical units
    const telemetryRegex = /(\b\d+(?:\.\d+)?\s*(?:km|m\/s)\b)/gi;
    const pieces = rawText.split(telemetryRegex);
    if (pieces.length === 1) {
      return renderFractions(rawText);
    }
    
    return pieces.map((piece, pIdx) => {
      const match = piece.match(/^(\d+(?:\.\d+)?)\s*(km|m\/s)$/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        if (unit === "km" && val >= 150 && val <= 500) {
          return (
            <button
              key={`teleport-alt-${pIdx}`}
              type="button"
              onClick={() => onSyncParam("altitude", val)}
              className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 text-[10.5px] font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer leading-none"
              title="Click to Teleport this state to the Simulation Engine!"
            >
              <span>{val} km</span>
              <span className="text-[9px] text-cyan-400">⚡ Teleport</span>
            </button>
          );
        } else if (unit === "m/s" && val >= 2500 && val <= 4500) {
          return (
            <button
              key={`teleport-speed-${pIdx}`}
              type="button"
              onClick={() => onSyncParam("approachSpeed", val)}
              className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-950/40 text-[10.5px] font-mono font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer leading-none"
              title="Click to Teleport this state to the Simulation Engine!"
            >
              <span>{val} m/s</span>
              <span className="text-[9px] text-emerald-400">⚡ Teleport</span>
            </button>
          );
        }
      }
      return renderFractions(piece);
    });
  };

  if (matches.length === 0) {
    return highlightTelemetry(text);
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const matchIndex = match.index!;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`pre-${idx}`}>{highlightTelemetry(text.substring(lastIndex, matchIndex))}</span>);
    }
    const formulaContent = match[1];
    parts.push(
      <div key={`blk-${idx}`} className="my-4 p-5 rounded-2xl border border-blue-500/40 bg-[#080d1e] shadow-[0_0_30px_rgba(59,130,246,0.2)] select-all transition-all hover:bg-[#0b132c]/90 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute top-2 left-4 text-[8px] font-mono text-blue-450 tracking-wider uppercase font-extrabold select-none">
          ⚛️ UNIFIED SCIENTIFIC EQUATION STATE
        </div>
        <div className="text-[16px] leading-relaxed text-blue-105 mt-2.5 font-serif font-extrabold tracking-wide">
          {renderFractions(formulaContent)}
        </div>
      </div>
    );
    lastIndex = matchIndex + match[0].length;
  });
  if (lastIndex < text.length) {
    parts.push(<span key="tail-blk">{highlightTelemetry(text.substring(lastIndex))}</span>);
  }
  return <>{parts}</>;
};

const renderFormattedConsensusText = (
  text: string, 
  isPhysics: boolean,
  onSyncParam?: (paramName: string, paramValue: number) => void
) => {
  if (!text) return null;
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const segments = text.split(codeBlockRegex);

  return segments.map((seg, idx) => {
    if (seg.startsWith("```")) {
      const lines = seg.split("\n");
      const firstLine = lines[0];
      const match = firstLine.match(/```(\w*)/);
      const language = match ? match[1] : "code";
      const codeContent = lines.slice(1, lines.length - 1).join("\n");

      return (
        <div key={`codeblock-${idx}`} className="my-4 rounded-xl border border-gray-800 bg-slate-950 overflow-hidden font-mono text-[11.5px] leading-relaxed shadow-lg text-left">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-gray-850 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {language || "code"}
            </span>
            <button 
              onClick={() => navigator.clipboard.writeText(codeContent)}
              className="hover:text-white transition-colors cursor-pointer"
              type="button"
            >
              Copy Code
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-blue-200">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }

    const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
    const mathSegments = seg.split(mathBlockRegex);

    return (
      <div key={`textsegment-${idx}`} className="space-y-2">
        {mathSegments.map((mathSeg, mIdx) => {
          const isBlockMath = mathSeg.startsWith("$$") || mathSeg.startsWith("\\[");
          if (isBlockMath) {
            let mathContent = "";
            if (mathSeg.startsWith("$$")) {
              mathContent = mathSeg.substring(2, mathSeg.length - 2);
            } else {
              mathContent = mathSeg.substring(2, mathSeg.length - 2);
            }
            mathContent = mathContent.trim();
            return (
              <div key={`mathblock-${idx}-${mIdx}`} className="my-4 p-5 rounded-2xl border border-cyan-500/20 bg-[#04081c]/90 text-center relative overflow-hidden select-all font-mono group">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
                
                <div className="text-[13px] md:text-[14px] font-bold text-cyan-400 tracking-wide select-all">
                  {renderFractions(mathContent)}
                </div>
              </div>
            );
          }

          const parseInline = (linePart: string) => {
            const inlineMathRegex = /(\$[\s\S]*?\$|\\\(.*?\\\))/g;
            const inlineSegments = linePart.split(inlineMathRegex);

            return inlineSegments.map((inlineSeg, inlineIdx) => {
              const isInlineMath = inlineSeg.startsWith("$") || inlineSeg.startsWith("\\(");
              if (isInlineMath) {
                let mathExpr = "";
                if (inlineSeg.startsWith("$")) {
                  mathExpr = inlineSeg.substring(1, inlineSeg.length - 1);
                } else {
                  mathExpr = inlineSeg.substring(2, inlineSeg.length - 2);
                }
                return (
                  <span key={`inline-math-${inlineIdx}`} className="inline-block bg-cyan-950/20 border border-cyan-950 px-1 py-0.5 rounded text-cyan-300 font-semibold font-serif text-[11px] mx-0.5 align-middle select-all">
                    {renderFractions(mathExpr)}
                  </span>
                );
              }

              const codeParts = inlineSeg.split(/`([^`\n]+)`/g);
              return codeParts.map((part, cIdx) => {
                if (cIdx % 2 === 1) {
                  return (
                    <code key={`code-${inlineIdx}-${cIdx}`} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400 text-[11px] font-mono font-semibold">
                      {part}
                    </code>
                  );
                }
                
                const boldParts = part.split(/\*\*([\s\S]*?)\*\*/g);
                return boldParts.map((bPart, bIdx) => {
                  if (bIdx % 2 === 1) {
                    return <strong key={`bold-${inlineIdx}-${cIdx}-${bIdx}`} className="font-extrabold text-white">{bPart}</strong>;
                  }
                  const italicParts = bPart.split(/\*([\s\S]*?)\*/g);
                  return italicParts.map((iPart, iIdx) => {
                    if (iIdx % 2 === 1) {
                      return <em key={`italic-${inlineIdx}-${cIdx}-${bIdx}-${iIdx}`} className="italic text-gray-200">{iPart}</em>;
                    }
                    return renderFormulasBlock(iPart, onSyncParam);
                  });
                });
              });
            });
          };

          const lines = mathSeg.split("\n");
          return (
            <div key={`textBlock-${idx}-${mIdx}`} className="text-left select-text">
              {lines.map((line, lIdx) => {
                if (!line.trim()) {
                  return <div key={`empty-${lIdx}`} className="h-3" />;
                }

                const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
                if (hMatch) {
                  const level = hMatch[1].length;
                  const content = hMatch[2];
                  const formatted = parseInline(content);
                  if (level === 1) return <h1 key={`h1-${lIdx}`} className="text-base font-black text-white tracking-tight mt-5 mb-2 font-display border-b border-gray-800 pb-1.5">{formatted}</h1>;
                  if (level === 2) return <h2 key={`h2-${lIdx}`} className="text-sm font-extrabold text-zinc-100 tracking-tight mt-4 mb-2 font-display">{formatted}</h2>;
                  return <h3 key={`h3-${lIdx}`} className="text-xs font-bold text-zinc-200 mt-3.5 mb-1.5 font-display">{formatted}</h3>;
                }

                if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                  const bulletText = line.trim().substring(2);
                  return (
                    <div key={`bullet-${lIdx}`} className="flex items-start space-x-2 ml-4 my-1.5 font-sans leading-relaxed text-zinc-300 text-left">
                      <span className={`${isPhysics ? "text-blue-400" : "text-emerald-400"} mt-2 shrink-0 select-none text-[8px]`}>●</span>
                      <span className="flex-grow">{parseInline(bulletText)}</span>
                    </div>
                  );
                }

                return <div key={`p-${lIdx}`} className="leading-relaxed my-2 text-zinc-250 font-sans text-left">{parseInline(line)}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  });
};

const academicProfiles = [
  {
    name: "The Classical Academic (Nelson Veras, M.Ed.)",
    focus: "Introductory Ideal Linear Models",
    guideline: "Explain the ideal Circular Orbital Velocity v = \\sqrt{\\mu / r} Newtonian kinematic baseline. Advocate for clean, simplified textbook approaches.",
    formula: "v_{orbit} = \\sqrt{\\frac{\\mu}{r}}"
  },
  {
    name: "The Systems & Industrial Engineer (Marcus Sterling, P.E.)",
    focus: "Continuous Mass & Thrust Efficiency",
    guideline: "Address trajectory delta-V impulses, mass-flow rate propellant budgets, thrust scheduling tolerances, and engineering safety margins.",
    formula: "Trajectory Delta-V Impulse Budgets"
  },
  {
    name: "The Mechanical Systems Theorist (Dr. Clara Mercer)",
    focus: "Precision Physical Constants",
    guideline: "Argue that the ab-initio precision of planetary gravitational elements (GM and G) sets the mathematical boundaries for precision.",
    formula: "Planetary Wave States"
  },
  {
    name: "The Solid-State/Hardware Architect (Dr. Jun-Ho Park)",
    focus: "Thermal stress & G-force tolerance",
    guideline: "Focus on thermal loading of nozzle components during the impulsive burn and structural stress tolerances of hardware mounts.",
    formula: "Stress/Strain Trajectory Projections"
  },
  {
    name: "The Theoretical Physicist (Dr. Sean O'Connor)",
    focus: "Relativistic Flow & Metric Invariance",
    guideline: "Explain Newtonian gravitation bounds on Mars with relativistic frame-dragging limits (showing they are negligible but mathematically satisfying).",
    formula: "r_{effective} = r + \\Delta r_{relativistic}"
  },
  {
    name: "The Empirical Researcher (Dr. Elena Rostova)",
    focus: "Observational Geopotential Corrections",
    guideline: "Analyze planetary surface oblation, J2 harmonics gravity perturbations, and empirical orbital telemetry drift.",
    formula: "J_2 Geopotential Corrections"
  },
  {
    name: "The Cryogenic Specialist (Dr. Yuki Tanaka)",
    focus: "Thermodynamic heat-shield dispersion",
    guideline: "Focus on liquid fuel cryogenic vapor pressures, nozzle throttling mechanics, and specific impulse (Isp = 310s) gas flows.",
    formula: "Nozzle Gas Vent Kinematics"
  },
  {
    name: "The Applied Bio-Systems Practitioner (Dr. Amara Diallo)",
    focus: "Closed-loop biosphere & Hydro-slosh safety",
    guideline: "Detail the deceleration effects on life-support systems, G-force impact on crew, and fluid sloshing in nutrient reservoirs.",
    formula: "Hydro-slosh fluid inertia bounds"
  },
  {
    name: "The Classical Mathematical Modeler (Prof. Alan Vance)",
    focus: "PDE Keplerian Continuum Trajectories",
    guideline: "Analyse boundary Keplerian continuum orbits using the Vis-Viva equation (v^2 = \\mu(2/r - 1/a)) to establish orbital insertion formulas.",
    formula: "Vis-Viva Continuum Trajectory"
  },
  {
    name: "The Micro-Scale Harmonic Specialist (Dr. Chloe Liang)",
    focus: "Structural strut vibration resonance",
    guideline: "Address high-frequency thruster acoustic vibration decoupling, and how to preserve signal stability with structural dampening.",
    formula: "Structural Strut Harmonic Ratios"
  },
  {
    name: "The Environmental Climatologist (Dr. Sarah Jenkins)",
    focus: "Atmospheric Density Exponential Decay",
    guideline: "Evaluate atmospheric drag effects at 200 km, scale heights, and thermospheric density variations causing non-uniform decays.",
    formula: "Atmospheric Density Exponential Decay"
  },
  {
    name: "The Process Efficiency Developer (Leo Dubois)",
    focus: "Batch Delta-V Compiling",
    guideline: "Discuss packing these solutions into single-threaded, sub-10ms numerical math kernels for low latency operational upload.",
    formula: "Thread-Safe Delta-V Matrix Parser"
  }
];

export default function Workspace({ 
  onBack, 
  models, 
  isCodeModeActive, 
  setIsCodeModeActive,
  physicsModeActive,
  setPhysicsModeActive,
  userPasscode,
  setUserPasscode
}: WorkspaceProps) {
  const [promptInput, setPromptInput] = useState("");
  const [activeWorkflowId, setActiveWorkflowId] = useState("none");
  const [enhancing, setEnhancing] = useState(false);

  // sessions & Database state management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  // Master Code Synthesizer and Swarm Consensus States
  const [isMasterCodeModeActive, setIsMasterCodeModeActive] = useState<boolean>(() => {
    return safeStorage.getItem("mai_master_mode_active") === "true";
  });
  const [feedingLevel, setFeedingLevel] = useState<number>(10);
  const [consensusTopic, setConsensusTopic] = useState("Build an unthrottled WebAssembly-driven virtual physics simulation in TypeScript");
  const [consensusStatus, setConsensusStatus] = useState<"idle" | "conversing" | "fusing" | "completed" | "error">("idle");
  const [activeSpeaker, setActiveSpeaker] = useState<string>("");
  const [consensusLogs, setConsensusLogs] = useState<Array<{ modelId: string; modelName: string; content: string; key: number }>>([]);
  const [consensusFinalResult, setConsensusFinalResult] = useState<string>("");
  const [forgeModeActive, setForgeModeActive] = useState<boolean>(false);
  const [forgeSubMode, setForgeSubMode] = useState<"blueprint" | "synthesizer" | "conversational">("conversational");
  const [oracleModeActive, setOracleModeActive] = useState<boolean>(false);
  const [isCortexActive, setIsCortexActive] = useState<boolean>(false);


  useEffect(() => {
    safeStorage.setItem("mai_master_mode_active", String(isMasterCodeModeActive));
  }, [isMasterCodeModeActive]);

  useEffect(() => {
    if (physicsModeActive) {
      setConsensusTopic("Analyse the orbital decay parameters of a low-Earth satellite under non-uniform atmospheric drag and formulate theoretical, numerical, and practical experimental validation methods.");
    } else if (isCodeModeActive) {
      setConsensusTopic("Build an unthrottled WebAssembly-driven virtual physics simulation in TypeScript");
    } else {
      setConsensusTopic("Analyze the geopolitical, economic, and systemic implications of asteroid helium-3 mining on Earth's energy markets");
    }
  }, [isCodeModeActive, physicsModeActive]);

  const handleRunSwarmConsensus = async () => {
    const topic = consensusTopic.trim();
    if (!topic) return;

    setConsensusStatus("conversing");
    setConsensusLogs([]);
    setConsensusFinalResult("");

    // Identify up to 12 models to represent conversational fleet (excluding deep synthesis models if needed, but standard active models work)
    let finalTalkers: any[] = [];
    if (physicsModeActive) {
      // Build exactly 12 talkers from the models array (re-utilizing by index if size < 12)
      const baseModels = models.filter(m => m.id !== "claude-fable-5");
      const listToUse = baseModels.length > 0 ? baseModels : models;
      for (let i = 0; i < 12; i++) {
        finalTalkers.push(listToUse[i % listToUse.length]);
      }
    } else {
      const talkers = activeModels.filter(m => m.id !== "claude-fable-5").slice(0, 12);
      const fallbackTalkers = models.filter(m => m.id !== "claude-fable-5").slice(0, 12);
      finalTalkers = talkers.length > 0 ? talkers : fallbackTalkers;
    }

    const accumulatedLogs: Array<{ modelId: string; modelName: string; content: string; key: number }> = [];

    // Round-by-round calls
    for (let index = 0; index < finalTalkers.length; index++) {
      const model = finalTalkers[index];
      setActiveSpeaker(model.id);

      // Determine persona and description for this index
      const currentSpeakerName = model.name;
      const currentSpeakerDesc = model.description;

      // Build context of previous speakers based on active subjects (code vs other subjects)
      const historyText = index === 0 
        ? "None. You are the opening speaker of this debate." 
        : accumulatedLogs.map(log => `Speaker: ${log.modelName}\nStatement: ${log.content}`).join("\n\n");

      const contextPrompt = generateSwarmDebatePrompt(
            topic,
            model.name,
            model.description,
            index,
            finalTalkers.length,
            historyText,
            isCodeModeActive
          );

      // Establish an AbortController to set a connection & streaming timeout for each talker node
      const controller = new AbortController();
      const signal = controller.signal;

      // Overall safety fallback timer (max 20 seconds total per node)
      const overallTimeout = setTimeout(() => {
        console.warn(`Overall timeout exceeded for model ${currentSpeakerName}. Aborting...`);
        controller.abort();
      }, 20000);

      try {
        const response = await safeFetch(getApiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            modelId: model.id,
            prompt: contextPrompt,
            history: []
          })
        });

        if (!response.ok) {
          throw new Error(`Consensus failed for model ${currentSpeakerName}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        if (!reader) throw new Error("Stream body unreadable");

        let currentResult = "";
        let buffer = "";

        // Push initial log placeholder
        accumulatedLogs.push({
          modelId: model.id,
          modelName: currentSpeakerName,
          content: "Initiating transmission stream...",
          key: index
        });
        setConsensusLogs([...accumulatedLogs]);

        while (true) {
          // Inner chunk-level idle timeout (max 6 seconds of static stream before aborting to prevent freezing in between)
          const idleTimeout = setTimeout(() => {
            console.warn(`Idle timeout reached on stream reading for ${model.name}. Aborting stream...`);
            controller.abort();
          }, 6000);

          try {
            const { value, done } = await reader.read();
            clearTimeout(idleTimeout);
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                try {
                  const parsed = JSON.parse(trimmed.slice(6));
                  if (parsed.text) {
                    currentResult += parsed.text;
                    accumulatedLogs[index] = {
                      modelId: model.id,
                      modelName: currentSpeakerName,
                      content: currentResult,
                      key: index
                    };
                    setConsensusLogs([...accumulatedLogs]);
                  }
                } catch (e) {}
              }
            }
          } catch (readErr) {
            clearTimeout(idleTimeout);
            throw readErr;
          }
        }
        clearTimeout(overallTimeout);
      } catch (err) {
        clearTimeout(overallTimeout);
        console.error(`Error in swarm segment (handled gracefully with fallback skipping):`, err);
        accumulatedLogs[index] = {
          modelId: model.id,
          modelName: currentSpeakerName,
          content: `*[Node link timeout or communication line severed. Automatic failover skipped to maintain queue progress.]*`,
          key: index
        };
        setConsensusLogs([...accumulatedLogs]);
      }
    }

    // Swarm debate completed successfully, transition to FUSING for Master Synthesis
    setConsensusStatus("fusing");
    setActiveSpeaker("");

    const fullTranscript = accumulatedLogs
      .map(log => `[SPEAKER: ${log.modelName}]\n${log.content}`)
      .join("\n\n========================================\n\n");

    const fusionPrompt = `You are Anthropic's Claude, acting as the Master AI Orchestrator and Lead Strategic Fusion Engine.
Your task is to analyze, orchestrate, and synthesize the complete chronological dialogue from all 12 AI model speakers into one unified, definitive Master Consensus Report on "${topic}".

Here is the complete debate transcript from the chatbot swarm:
--------------------------------------------------
${fullTranscript}
--------------------------------------------------

As the Orchestrator, you must:
1. Harmonize and synthesize the disparate viewpoints into a single definitive summary layout.
2. Resolve any direct contradictions or disputes between the models to deliver a clear, authoritative, and final answer.
3. Outline key compromises, consensus pillars, and actionable conclusions.
4. Present a highly structured, polished, and executive-grade layout.`;

    const fusionModelId = "claude-fable-5";

    try {
      const response = await safeFetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: fusionModelId,
          prompt: fusionPrompt,
          history: []
        })
      });

      if (!response.ok) {
        throw new Error(`Fusion API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("Fusion stream unreadable");

      let currentResult = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.text) {
                currentResult += parsed.text;
                setConsensusFinalResult(currentResult);
              }
            } catch (e) {}
          }
        }
      }
      setConsensusStatus("completed");
    } catch (fusionErr) {
      console.error("Fusion/Synthesis failed:", fusionErr);
      const fallbackSynthesis = `### UNIFIED SCIENTIFIC ACCORD SUMMARY

We have compiled the structural results of the 12-stage roundtable. The combined aerospace dynamic models have established a robust predictive decay matrix. Space operations are unified across:

1. **Analytical Mechanics**: Orbit node precession coupled with altitude-dependent diurnal thermospheric bulge density variations.
2. **Dynamic Mitigation**: Aerospace active variable-geometry wing actuation, balancing atmospheric friction to secure slot-keeping or orbital demise.
3. **Sovereign Regulation**: Compliance with the 25-Year de-orbit policy through targeted passive demise parameters.`;
      setConsensusFinalResult(fallbackSynthesis);
      setConsensusStatus("completed");
    }
  };

  const clearConsensusSession = () => {
    setConsensusLogs([]);
    setConsensusFinalResult("");
    setConsensusStatus("idle");
    setActiveSpeaker(null);
  };

  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const passcode = safeStorage.getItem("mas_user_passcode") || "";
      if (passcode) {
        // Check for multi-sessions database
        const stored = safeStorage.getItem(`mas_sessions_${passcode}`);
        if (stored) {
          const loadedSessions: ChatSession[] = JSON.parse(stored);
          if (loadedSessions && loadedSessions.length > 0) {
            return loadedSessions[0].histories;
          }
        }
        // Legacy fallback
        const d = safeStorage.getItem(`mas_history_${passcode}`);
        if (d) {
          return JSON.parse(d);
        }
      }
    } catch (e) {
      console.warn("Could not parse passcode history, falling back to clean slate", e);
    }
    const initial: Record<string, ChatMessage[]> = {};
    models.forEach(m => {
      initial[m.id] = [];
    });
    return initial;
  });

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("synced");

  const syncSessionsToServer = async (passcode: string, rawSessions: ChatSession[]) => {
    if (!passcode) return;
    setSyncStatus("syncing");
    try {
      const response = await safeFetch("/api/identity/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, sessions: rawSessions })
      });
      if (response.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
      }
    } catch (e) {
      console.warn("Network error syncing sessions:", e);
      setSyncStatus("error");
    }
  };

  // Automatically migrate active guest chat and swap to the target passcode identity
  const syncAndSwitchIdentity = (newPasscodeDigits: string) => {
    const cleanCode = newPasscodeDigits.replace(/[^A-Za-z0-9]/g, "");
    if (cleanCode.length !== 11) return null;

    const formattedVal = cleanCode.slice(0, 4) + "-" + cleanCode.slice(4, 8) + "-" + cleanCode.slice(8, 11);
    
    // Check if we have active chat histories to preserve
    const hasActualMessages = Object.keys(chatHistories || {}).some(key => (chatHistories[key]?.length || 0) > 0);
    
    if (hasActualMessages) {
      let tarSessions: ChatSession[] = [];
      try {
        const stored = safeStorage.getItem(`mas_sessions_${formattedVal}`);
        if (stored) {
          tarSessions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse targets on switch", e);
      }

      const activeSession = sessions.find(s => s.id === currentSessionId);
      const sessionName = activeSession?.name || `Synced Session (${new Date().toLocaleDateString()})`;

      const exIdx = tarSessions.findIndex(s => s.id === currentSessionId);
      if (exIdx >= 0) {
        tarSessions[exIdx] = {
          ...tarSessions[exIdx],
          histories: chatHistories,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
      } else {
        tarSessions.unshift({
          id: currentSessionId || ("session_" + Date.now()),
          name: sessionName,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          histories: chatHistories
        });
      }
      safeStorage.setItem(`mas_sessions_${formattedVal}`, JSON.stringify(tarSessions));
      safeStorage.setItem(`mas_history_${formattedVal}`, JSON.stringify(chatHistories));
      
      // Sync it to the server immediately
      syncSessionsToServer(formattedVal, tarSessions);
    }

    // Move to the new passcode identity
    setUserPasscode(formattedVal);
    safeStorage.setItem("mas_user_passcode", formattedVal);
    return formattedVal;
  };

  // Load and migrates sessions when passcode updates reactively
  useEffect(() => {
    if (!userPasscode) return;
    
    // We should ALSO load from the server to pull any remote updates!
    const fetchRemoteSessions = async () => {
      try {
        const response = await safeFetch(`/api/identity/sessions?passcode=${encodeURIComponent(userPasscode)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
            setSessions(data.sessions);
            safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(data.sessions));
            const active = data.sessions[0];
            setCurrentSessionId(active.id);
            setChatHistories(active.histories);
            
            // Sync board responses:
            const freshResponses: Record<string, ModelResponse> = {};
            models.forEach(m => {
              const hist = active.histories[m.id] || [];
              if (hist.length > 0) {
                const lastMsg = hist[hist.length - 1];
                freshResponses[m.id] = {
                  modelId: m.id,
                  content: lastMsg.role === "assistant" ? lastMsg.content : "",
                  status: lastMsg.role === "assistant" ? "completed" : "idle"
                };
              } else {
                freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
              }
            });
            setResponses(freshResponses);
            return; // Finished loaded session integration
          }
        }
      } catch (err) {
        console.warn("Server connection offline or loading error - utilizing offline-cache database:", err);
      }
      
      // Fallback offline loader logic
      let loadedSessions: ChatSession[] = [];
      try {
        const stored = safeStorage.getItem(`mas_sessions_${userPasscode}`);
        if (stored) {
          loadedSessions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse sessions:", e);
      }

      if (loadedSessions.length === 0) {
        let migrationHistory: Record<string, ChatMessage[]> | null = null;
        try {
          const legacy = safeStorage.getItem(`mas_history_${userPasscode}`);
          if (legacy) {
            migrationHistory = JSON.parse(legacy);
          }
        } catch (e) {}

        const initialHistory: Record<string, ChatMessage[]> = {};
        models.forEach(m => {
          initialHistory[m.id] = (migrationHistory && migrationHistory[m.id]) || [];
        });

        let hasMessages = false;
        let firstName = "Default Session";
        for (const key in initialHistory) {
          if (initialHistory[key].length > 0) {
            hasMessages = true;
            const firstUserMsg = initialHistory[key].find(m => m.role === "user");
            if (firstUserMsg) {
              firstName = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
            }
            break;
          }
        }

        loadedSessions = [{
          id: "session_" + Date.now(),
          name: firstName,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          histories: initialHistory
        }];
        safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(loadedSessions));
      }

      setSessions(loadedSessions);
      
      const active = loadedSessions[0];
      setCurrentSessionId(active.id);
      setChatHistories(active.histories);

      const freshResponses: Record<string, ModelResponse> = {};
      models.forEach(m => {
        const hist = active.histories[m.id] || [];
        if (hist.length > 0) {
          const lastMsg = hist[hist.length - 1];
          freshResponses[m.id] = {
            modelId: m.id,
            content: lastMsg.role === "assistant" ? lastMsg.content : "",
            status: lastMsg.role === "assistant" ? "completed" : "idle"
          };
        } else {
          freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
        }
      });
      setResponses(freshResponses);
    };

    fetchRemoteSessions();
  }, [userPasscode]);

  // Persists active session changes immediately to storage
  useEffect(() => {
    if (!userPasscode || !currentSessionId || sessions.length === 0) return;

    const activeSession = sessions.find(s => s.id === currentSessionId);
    if (!activeSession) return;

    const isDifferent = JSON.stringify(activeSession.histories) !== JSON.stringify(chatHistories);
    if (!isDifferent) return;

    let updatedName = activeSession.name;
    if (activeSession.name === "Default Session" || activeSession.name.startsWith("Session -")) {
      for (const mId in chatHistories) {
        const userMsg = chatHistories[mId].find(msg => msg.role === "user");
        if (userMsg) {
          updatedName = userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? "..." : "");
          break;
        }
      }
    }

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          name: updatedName,
          histories: chatHistories
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(updatedSessions));
    safeStorage.setItem(`mas_history_${userPasscode}`, JSON.stringify(chatHistories));
  }, [chatHistories, currentSessionId, userPasscode]);

  // Synchronize any global session array updates to the server database
  useEffect(() => {
    if (!userPasscode || sessions.length === 0) return;
    const debounceTimer = setTimeout(() => {
      syncSessionsToServer(userPasscode, sessions);
    }, 1500); // 1.5 seconds debounce to prevent high-frequency write operations during stream/rapid typing
    return () => clearTimeout(debounceTimer);
  }, [sessions, userPasscode]);

  // Session Action handlers
  const handleSelectSession = (sessionId: string) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    if (!targetSession) return;

    setCurrentSessionId(sessionId);
    setChatHistories(targetSession.histories);

    const freshResponses: Record<string, ModelResponse> = {};
    models.forEach(m => {
      const hist = targetSession.histories[m.id] || [];
      if (hist.length > 0) {
        const lastMsg = hist[hist.length - 1];
        freshResponses[m.id] = {
          modelId: m.id,
          content: lastMsg.role === "assistant" ? lastMsg.content : "",
          status: lastMsg.role === "assistant" ? "completed" : "idle"
        };
      } else {
        freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
      }
    });
    setResponses(freshResponses);
  };

  const handleCreateNewSession = () => {
    const timestampStr = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newSessionId = "session_" + Date.now();
    
    const initialHistory: Record<string, ChatMessage[]> = {};
    models.forEach(m => {
      initialHistory[m.id] = [];
    });

    const newSession: ChatSession = {
      id: newSessionId,
      name: "Default Session",
      timestamp: timestampStr,
      histories: initialHistory
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSessionId);
    setChatHistories(initialHistory);
    safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(updatedSessions));

    const freshResponses: Record<string, ModelResponse> = {};
    models.forEach(m => {
      freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
    });
    setResponses(freshResponses);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (sessions.length <= 1) {
      alert("You must keep at least one active chat session.");
      return;
    }

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(updatedSessions));

    if (currentSessionId === sessionId) {
      const nextActive = updatedSessions[0];
      setCurrentSessionId(nextActive.id);
      setChatHistories(nextActive.histories);

      const freshResponses: Record<string, ModelResponse> = {};
      models.forEach(m => {
        const hist = nextActive.histories[m.id] || [];
        if (hist.length > 0) {
          const lastMsg = hist[hist.length - 1];
          freshResponses[m.id] = {
            modelId: m.id,
            content: lastMsg.role === "assistant" ? lastMsg.content : "",
            status: lastMsg.role === "assistant" ? "completed" : "idle"
          };
        } else {
          freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
        }
      });
      setResponses(freshResponses);
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    if (!newName.trim()) return;
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, name: newName.trim() };
      }
      return s;
    });
    setSessions(updatedSessions);
    safeStorage.setItem(`mas_sessions_${userPasscode}`, JSON.stringify(updatedSessions));
  };

  // Response tracker for each model
  const [responses, setResponses] = useState<Record<string, ModelResponse>>(() => {
    const initial: Record<string, ModelResponse> = {};
    models.forEach(m => {
      initial[m.id] = { modelId: m.id, content: "", status: "idle" };
    });
    return initial;
  });

  const [individualChatModelId, setIndividualChatModelId] = useState<string | null>(null);
  const [individualChatInput, setIndividualChatInput] = useState("");
  const individualChatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (individualChatModelId && individualChatScrollRef.current) {
      setTimeout(() => {
        if (individualChatScrollRef.current) {
          individualChatScrollRef.current.scrollTop = individualChatScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [individualChatModelId, chatHistories[individualChatModelId || ""], responses[individualChatModelId || ""]?.content, responses[individualChatModelId || ""]?.status]);

  const handleSendIndividualChatMessage = async () => {
    const text = individualChatInput.trim();
    if (!text || !individualChatModelId) return;

    setIndividualChatInput("");

    // Append user message to logs
    const timestampStr = new Date().toLocaleTimeString();
    const newUserLog: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: timestampStr
    };

    const updatedHistory = [...(chatHistories[individualChatModelId] || []), newUserLog];
    setChatHistories(prev => ({
      ...prev,
      [individualChatModelId]: updatedHistory
    }));

    // Trigger loading state for individual model
    setResponses(prev => ({
      ...prev,
      [individualChatModelId]: {
        modelId: individualChatModelId,
        content: "",
        status: "loading"
      }
    }));

    // Start streaming back-and-forth
    await streamModelResponse(individualChatModelId, text, updatedHistory);
  };

  const getModelAvatar = (mdId: string, prov: string): string => {
    const lowerId = mdId.toLowerCase();
    if (lowerId.includes("claude") || lowerId.includes("anthropic")) return "🔮";
    if (lowerId.includes("deepseek")) return "🐳";
    if (lowerId.includes("qwen")) return "🏮";
    if (lowerId.includes("llama") || prov.toLowerCase().includes("meta")) return "🦙";
    if (lowerId.includes("gpt") || prov.toLowerCase().includes("openai")) return "🧠";
    if (lowerId.includes("o1") || lowerId.includes("o3")) return "🟢";
    if (lowerId.includes("phi") || prov.toLowerCase().includes("microsoft")) return "📐";
    if (lowerId.includes("cohere")) return "🧬";
    if (lowerId.includes("mistral")) return "🪁";
    if (lowerId.includes("command")) return "📡";
    return "🤖";
  };

  // --- LIFTED SIMULATION STATES FOR TELEPORT / BRIDGE ---
  const [altitude, setAltitude] = useState<number>(200); // km
  const [approachSpeed, setApproachSpeed] = useState<number>(3200); // m/s
  const [weightTheoretical, setWeightTheoretical] = useState<number>(1.0);
  const [weightSystems, setWeightSystems] = useState<number>(1.0);
  const [weightApplied, setWeightApplied] = useState<number>(1.0);

  // Sync animation notifier panel
  const [showSyncNotification, setShowSyncNotification] = useState<string | null>(null);

  // --- TEMPORAL REPLAY STATE snapshots ---
  const [replaySnapshots, setReplaySnapshots] = useState<Array<{
    index: number;
    topic: string;
    logs: Array<{ modelId: string; modelName: string; content: string; key: number }>;
    finalResult: string;
    altitude: number;
    approachSpeed: number;
    weightTheoretical: number;
    weightSystems: number;
    weightApplied: number;
    timestamp: string;
  }>>([
    {
      index: 0,
      topic: "Analyze the geopolitical, economic, and systemic implications of asteroid helium-3 mining on Earth's energy markets",
      logs: [],
      finalResult: "",
      altitude: 200,
      approachSpeed: 3200,
      weightTheoretical: 1.0,
      weightSystems: 1.0,
      weightApplied: 1.0,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState<number>(0);

  // Automatically take a state snapshot when the consensus timeline advances
  useEffect(() => {
    if (consensusLogs.length > 0) {
      const matchFound = replaySnapshots.find(s => s.index === consensusLogs.length && s.topic === consensusTopic);
      if (!matchFound) {
        setReplaySnapshots(prev => {
          const cleaned = prev.filter(s => s.index < consensusLogs.length || s.topic !== consensusTopic);
          return [
            ...cleaned,
            {
              index: consensusLogs.length,
              topic: consensusTopic,
              logs: JSON.parse(JSON.stringify(consensusLogs)),
              finalResult: consensusFinalResult,
              altitude,
              approachSpeed,
              weightTheoretical,
              weightSystems,
              weightApplied,
              timestamp: new Date().toLocaleTimeString()
            }
          ].sort((a, b) => a.index - b.index);
        });
        setCurrentSnapshotIndex(consensusLogs.length);
      }
    }
  }, [consensusLogs, consensusTopic, consensusFinalResult, altitude, approachSpeed, weightTheoretical, weightSystems, weightApplied]);

  // Initial root state capture for a new topic
  useEffect(() => {
    const rootExists = replaySnapshots.some(s => s.index === 0 && s.topic === consensusTopic);
    if (!rootExists) {
      setReplaySnapshots(prev => [
        ...prev.filter(s => s.topic !== consensusTopic),
        {
          index: 0,
          topic: consensusTopic,
          logs: [],
          finalResult: "",
          altitude,
          approachSpeed,
          weightTheoretical,
          weightSystems,
          weightApplied,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setCurrentSnapshotIndex(0);
    }
  }, [consensusTopic]);

  // --- TEMPORAL BRANCHING & FLASH TRIGGERS ---
  const [replayFlash, setReplayFlash] = useState(false);
  const [isReplayDockOpen, setIsReplayDockOpen] = useState(false);

  const handleTimeTravelBranch = () => {
    const targetSnap = replaySnapshots.find(s => s.index === currentSnapshotIndex && s.topic === consensusTopic);
    if (!targetSnap) return;

    setReplayFlash(true);
    setTimeout(() => {
      setReplayFlash(false);
    }, 1200);

    setAltitude(targetSnap.altitude);
    setApproachSpeed(targetSnap.approachSpeed);
    setWeightTheoretical(targetSnap.weightTheoretical);
    setWeightSystems(targetSnap.weightSystems);
    setWeightApplied(targetSnap.weightApplied);

    setConsensusLogs(JSON.parse(JSON.stringify(targetSnap.logs)));
    if (targetSnap.logs.length === 0) {
      setConsensusStatus("idle");
    } else {
      setConsensusStatus("completed");
    }
    setConsensusFinalResult(targetSnap.finalResult);

    setShowSyncNotification(`Temporal Branch Successful: Turn #${currentSnapshotIndex} state re-initialized.`);
  };

  // COGNITIVE CARTOGRAPHY STATE
  const [selectedCartNode, setSelectedCartNode] = useState<string | null>(null);

  const getCartographyTopology = () => {
    const nodes: Array<{ id: string; label: string; type: "root" | "agent" | "concept"; val?: string; confidence: number; x: number; y: number }> = [];
    const links: Array<{ source: string; target: string; relationship: "supports" | "contradicts" | "quantifies" | "refutes" }> = [];

    nodes.push({
      id: "root",
      label: consensusTopic.length > 25 ? consensusTopic.slice(0, 22) + "..." : consensusTopic,
      type: "root",
      confidence: 100,
      x: 160,
      y: 153
    });

    const talkers = consensusLogs.length > 0 
      ? consensusLogs.map(l => ({ id: l.modelId, name: l.modelName }))
      : academicProfiles.map((p, pIdx) => ({ id: `p-${pIdx}`, name: p.name }));

    talkers.forEach((t, i) => {
      const angle = (i * 2 * Math.PI) / talkers.length;
      const r = 85;
      const x = 160 + r * Math.cos(angle);
      const y = 153 + r * Math.sin(angle);
      nodes.push({
        id: t.id,
        label: t.name.replace(" (Analytical Model)", "").replace(" (Skeptical Model)", "").replace(" (Creative Model)", "").replace(" (Pragmatic Model)", "").replace(" (Empathetic Model)", "").replace(" (Strategic Model)", ""),
        type: "agent",
        confidence: Math.round(75 + (i * 2.1) % 24),
        x,
        y
      });

      links.push({
        source: t.id,
        target: "root",
        relationship: "supports"
      });
    });

    const concepts = physicsModeActive ? [
      { id: "c-visviva", label: "Vis-Viva Orbit", relations: [{ agent: "model-analytical", rel: "supports" as const }] },
      { id: "c-bulge", label: "Thermospheric Bulge", relations: [{ agent: "model-skeptical", rel: "quantifies" as const }] },
      { id: "c-morphing", label: "Variable Area wings", relations: [{ agent: "model-creative", rel: "supports" as const }] },
      { id: "c-tether", label: "Electrodynamic Tether", relations: [{ agent: "model-creative", rel: "supports" as const }, { agent: "model-pragmatic", rel: "contradicts" as const }] },
      { id: "c-demise", label: "Design-for-Demise treaty", relations: [{ agent: "model-empathetic", rel: "supports" as const }, { agent: "model-strategic", rel: "quantifies" as const }] }
    ] : [
      { id: "c-bigo", label: "Algorithmic Big-O Complexity", relations: [{ agent: "deepseek-r1", rel: "quantifies" as const }] },
      { id: "c-threads", label: "Sandbox Thread safety", relations: [{ agent: "gpt-4o", rel: "supports" as const }] },
      { id: "c-websocket", label: "WebSocket frame parse", relations: [{ agent: "qwen-coder", rel: "supports" as const }] },
      { id: "c-memory", label: "Heap Leak bounds", relations: [{ agent: "qwen-coder", rel: "supports" as const }, { agent: "deepseek-r1", rel: "refutes" as const }] }
    ];

    concepts.forEach((c, i) => {
      const angle = ((i + 0.5) * 2 * Math.PI) / concepts.length;
      const r = 130;
      const x = 160 + r * Math.cos(angle);
      const y = 153 + r * Math.sin(angle);

      nodes.push({
        id: c.id,
        label: c.label,
        type: "concept",
        confidence: Math.round(62 + (i * 7.7) % 33),
        x,
        y
      });

      c.relations.forEach(rel => {
        const agentExists = nodes.some(n => n.id === rel.agent);
        if (agentExists) {
          links.push({
            source: rel.agent,
            target: c.id,
            relationship: rel.rel
          });
        } else {
          if (talkers.length > 0) {
            links.push({
              source: talkers[0].id,
              target: c.id,
              relationship: rel.rel
            });
          }
        }
      });
    });

    return { nodes, links };
  };

  const handleSyncTelemetry = (paramName: string, paramValue: number) => {
    if (paramName === "altitude") {
      setAltitude(paramValue);
      setShowSyncNotification(`Aero-Decay Altitude Synced: ${paramValue} km`);
    } else if (paramName === "approachSpeed") {
      setApproachSpeed(paramValue);
      setShowSyncNotification(`Approach Intercept Speed Synced: ${paramValue} m/s`);
    }
    
    setTimeout(() => {
      setShowSyncNotification(null);
    }, 4500);

    if (!physicsModeActive) {
      setPhysicsModeActive(true);
    }
  };

  // Dynamic status tabs
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"workflows" | "modes" | "code" | "image" | "document" | "audio" | "vfx" | "history" | "cartography">("workflows");
  const [vfxSubTab, setVfxSubTab] = useState<"specs" | "overrides">("specs");
  const [activePillar, setActivePillar] = useState<number>(1);

  // Technical VFX & Animation Engine override states (Senior VFX Supervisor Console)
  const [vfxFpsCap, setVfxFpsCap] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_fps") || "120");
  });
  const [vfxTrailWidth, setVfxTrailWidth] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_trail_width") || "7");
  });
  const [vfxTrailLength, setVfxTrailLength] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_trail_length") || "20");
  });
  const [vfxLatticeDist, setVfxLatticeDist] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_lattice_dist") || "120");
  });
  const [vfxParticleCount, setVfxParticleCount] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_particle_count") || "40");
  });
  const [vfxShaderMode, setVfxShaderMode] = useState<string>(() => {
    return safeStorage.getItem("mai_vfx_shader_mode") || "path-traced";
  });
  const [vfxPhysicsFriction, setVfxPhysicsFriction] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_friction") || "0.96");
  });
  const [vfxAberration, setVfxAberration] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_aberration") || "3");
  });
  const [vfxBloomGlow, setVfxBloomGlow] = useState<number>(() => {
    return Number(safeStorage.getItem("mai_vfx_bloom") || "15");
  });
  const [vfxColorPreset, setVfxColorPreset] = useState<string>(() => {
    return safeStorage.getItem("mai_vfx_color_preset") || "stellar-orbit";
  });
  const [vfxSoundEnabled, setVfxSoundEnabled] = useState<boolean>(() => {
    return safeStorage.getItem("mai_vfx_sound_enabled") !== "false";
  });

  // Keep saved configuration values updated
  useEffect(() => {
    safeStorage.setItem("mai_vfx_fps", String(vfxFpsCap));
    safeStorage.setItem("mai_vfx_trail_width", String(vfxTrailWidth));
    safeStorage.setItem("mai_vfx_trail_length", String(vfxTrailLength));
    safeStorage.setItem("mai_vfx_lattice_dist", String(vfxLatticeDist));
    safeStorage.setItem("mai_vfx_particle_count", String(vfxParticleCount));
    safeStorage.setItem("mai_vfx_shader_mode", vfxShaderMode);
    safeStorage.setItem("mai_vfx_friction", String(vfxPhysicsFriction));
    safeStorage.setItem("mai_vfx_aberration", String(vfxAberration));
    safeStorage.setItem("mai_vfx_bloom", String(vfxBloomGlow));
    safeStorage.setItem("mai_vfx_color_preset", vfxColorPreset);
    safeStorage.setItem("mai_vfx_sound_enabled", String(vfxSoundEnabled));
  }, [
    vfxFpsCap,
    vfxTrailWidth,
    vfxTrailLength,
    vfxLatticeDist,
    vfxParticleCount,
    vfxShaderMode,
    vfxPhysicsFriction,
    vfxAberration,
    vfxBloomGlow,
    vfxColorPreset,
    vfxSoundEnabled
  ]);

  // Synchronize active sidebar tab with global programmer mode
  useEffect(() => {
    if (isCodeModeActive) {
      setActiveTab("code");
    } else {
      setActiveTab("workflows");
    }
  }, [isCodeModeActive]);

  // Specific Code Module Collaborative Synthesis states
  const [codePromptInput, setCodePromptInput] = useState("");
  const [compositeState, setCompositeState] = useState<"idle" | "synthesis-fleet" | "claude-refining" | "completed" | "error">("idle");
  const [fleetOutputs, setFleetOutputs] = useState<Record<string, string>>({});
  const [fleetLoading, setFleetLoading] = useState<Record<string, "idle" | "running" | "done" | "failed">>({});
  const [claudeUnifiedResult, setClaudeUnifiedResult] = useState("");
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Mobile Layout Configuration states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileLayout, setMobileLayout] = useState<"stack" | "tabs" | "split">("stack");
  const [selectedMobileModelId, setSelectedMobileModelId] = useState("deepseek-r1");
  const [splitModelId1, setSplitModelId1] = useState("deepseek-r1");
  const [splitModelId2, setSplitModelId2] = useState("qwen-coder");

  // Dynamic Real-time Engine Telemetry State
  const [telemetryFps, setTelemetryFps] = useState<number>(120);
  const [telemetryVram, setTelemetryVram] = useState<number>(34.2);
  const [telemetryPath, setTelemetryPath] = useState<string>("M 0,10 L 100,10");

  useEffect(() => {
    let tickCount = 0;
    const interval = setInterval(() => {
      const baseFps = vfxFpsCap === 999 ? 240 : vfxFpsCap;
      const jitter = (Math.random() * 0.8 - 0.4);
      setTelemetryFps(parseFloat((baseFps + jitter).toFixed(1)));

      setTelemetryVram(prev => {
        const next = prev + (Math.random() * 0.12 - 0.05);
        if (next > 38.0 || next < 31.0) return 34.18;
        return parseFloat(next.toFixed(2));
      });

      tickCount++;
      const points = [];
      const steps = 15;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * 100;
        const wave1 = Math.sin((i * 0.5) + (tickCount * 0.45)) * 4.5;
        const wave2 = Math.cos((i * 0.22) - (tickCount * 0.3)) * 2.5;
        const noise = (Math.random() * 1.6 - 0.8);
        const y = 10 + wave1 + wave2 + noise;
        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`);
      }
      setTelemetryPath(points.join(" "));
    }, 280);

    return () => clearInterval(interval);
  }, [vfxFpsCap]);

  // Model Select System
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(() => {
    const saved = safeStorage.getItem("mai_selected_models");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ["deepseek-r1", "qwen-coder", "llama-3-3", "gpt-4-5", "phi-4", "command-r-plus"];
  });

  const [layoutMode, setLayoutMode] = useState<"grid" | "side-by-side">("grid");
  const [responseMode, setResponseMode] = useState<"latest" | "history">("latest");

  // Guard changes to save to localStorage
  useEffect(() => {
    safeStorage.setItem("mai_selected_models", JSON.stringify(selectedModelIds));
  }, [selectedModelIds]);

  const activeModels = models.filter(m => selectedModelIds.includes(m.id));

  // Synchronize mobile selected/split models with active models
  useEffect(() => {
    if (activeModels.length > 0) {
      if (!selectedModelIds.includes(selectedMobileModelId)) {
        setSelectedMobileModelId(activeModels[0].id);
      }
      if (!selectedModelIds.includes(splitModelId1)) {
        const found = activeModels.find(m => m.id !== splitModelId2);
        if (found) {
          setSplitModelId1(found.id);
        } else {
          setSplitModelId1(activeModels[0].id);
        }
      }
      if (!selectedModelIds.includes(splitModelId2)) {
        const found = activeModels.find(m => m.id !== splitModelId1);
        if (found) {
          setSplitModelId2(found.id);
        } else {
          setSplitModelId2(activeModels[1]?.id || activeModels[0].id);
        }
      }
    }
  }, [selectedModelIds, activeModels, selectedMobileModelId, splitModelId1, splitModelId2]);

  // Hook to handle mobile detection state and set layout
  useEffect(() => {
    const checkMobile = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      // In landscape, only force mobile single-column layout if screen width is extremely small (< 640),
      // otherwise, let it span out in horizontal comparison decks.
      const mobile = isLandscape ? window.innerWidth < 640 : window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Image generator states
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImg, setGeneratedImg] = useState("");
  const [imgRunning, setImgRunning] = useState(false);
  const [imgError, setImgError] = useState("");
  const [imgElementLoading, setImgElementLoading] = useState(false);
  const [imageSubTab, setImageSubTab] = useState<"generate" | "scan">("generate");
  const [imgStyle, setImgStyle] = useState<string>("none");
  const [imgRatio, setImgRatio] = useState<string>("1:1");
  const [imgHistory, setImgHistory] = useState<string[]>([]);
  const [usePromptToJson, setUsePromptToJson] = useState(false);
  const [structuredPromptData, setStructuredPromptData] = useState<any>(null);
  const [isParsingToJson, setIsParsingToJson] = useState(false);
  const [parsingToJsonError, setParsingToJsonError] = useState("");

  // Document summarizer states
  const [docModelInput, setDocModelInput] = useState("");
  const [summaryOutput, setSummaryOutput] = useState("");
  const [summaryRunning, setSummaryRunning] = useState(false);
  const [docFileName, setDocFileName] = useState("");

  // Audio simulator transcription states
  const [audioTopicInput, setAudioTopicInput] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const [audioRunning, setAudioRunning] = useState(false);

  // Attachment state for the main chat view
  const [activeAttachment, setActiveAttachment] = useState<{
    data: string; // Base64 representation
    mimeType: string;
    name: string;
    previewUrl: string;
  } | null>(null);

  // Attachment state for the Toolbox Vision Scanner page
  const [scanAttachment, setScanAttachment] = useState<{
    data: string;
    mimeType: string;
    name: string;
    previewUrl: string;
  } | null>(null);
  const [scanResult, setScanResult] = useState("");
  const [scanRunning, setScanRunning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanMode, setScanMode] = useState<"general" | "ui" | "ocr" | "diagram">("general");

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, isForScanner: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP) only.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      const attachment = {
        data: base64String,
        mimeType: file.type,
        name: file.name,
        previewUrl: URL.createObjectURL(file)
      };

      if (isForScanner) {
        setScanAttachment(attachment);
        setScanResult("");
        setScanError("");
      } else {
        setActiveAttachment(attachment);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleScanImage = async () => {
    if (!scanAttachment) return;

    setScanRunning(true);
    setScanResult("");
    setScanError("");

    try {
      const response = await safeFetch("/api/scan-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            data: scanAttachment.data,
            mimeType: scanAttachment.mimeType
          },
          mode: scanMode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to scan image.");
      }

      setScanResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "An unexpected error occurred during scan process.");
    } finally {
      setScanRunning(false);
    }
  };

  // Dynamic API server sync states
  const [backendUrl, setBackendUrl] = useState(() => {
    const isLocalWebview = 
      !!(window as any).Capacitor ||
      window.location.protocol === "capacitor:" || 
      window.location.protocol === "file:" ||
      window.location.origin?.includes("capacitor://");

    const isCloudflarePages = typeof window !== "undefined" && window.location.hostname?.endsWith(".pages.dev");

    const { devUrl } = getDevAndPreprodUrls();
    let isSeparatelyDeployed = isLocalWebview || isCloudflarePages;

    if (!isSeparatelyDeployed && devUrl && window.location.origin) {
      try {
        const u1 = new URL(window.location.origin);
        const u2 = new URL(devUrl);
        if (u1.hostname !== u2.hostname && !u1.hostname.includes("127.0.0.1") && !u1.hostname.includes("localhost")) {
          isSeparatelyDeployed = true;
        }
      } catch (e) {}
    }

    if (isSeparatelyDeployed) {
      const stored = safeStorage.getItem("mai_backend_url");
      if (isValidBackendUrl(stored) && (!stored!.includes(".pages.dev") || stored!.includes("8cd48335"))) {
        return stored!;
      }
      const defaultBackup = "https://8cd48335.aiworkspace-f4d.pages.dev";
      safeStorage.setItem("mai_backend_url", defaultBackup);
      return defaultBackup;
    }
    return window.location.origin || "";
  });
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [showConfig, setShowConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(backendUrl);

  // Automatically save browser's active location on initialization
  useEffect(() => {
    const isLocalWebview = 
      !!(window as any).Capacitor ||
      window.location.protocol === "capacitor:" || 
      window.location.protocol === "file:" ||
      window.location.origin?.includes("capacitor://");
    
    const isCloudflarePages = typeof window !== "undefined" && window.location.hostname?.endsWith(".pages.dev");

    const { devUrl } = getDevAndPreprodUrls();
    let isSeparatelyDeployed = isLocalWebview || isCloudflarePages;

    if (!isSeparatelyDeployed && devUrl && window.location.origin) {
      try {
        const u1 = new URL(window.location.origin);
        const u2 = new URL(devUrl);
        if (u1.hostname !== u2.hostname && !u1.hostname.includes("127.0.0.1") && !u1.hostname.includes("localhost")) {
          isSeparatelyDeployed = true;
        }
      } catch (e) {}
    }

    if (!isSeparatelyDeployed && window.location.origin) {
      safeStorage.setItem("mai_backend_url", window.location.origin);
      setBackendUrl(window.location.origin);
    }
  }, []);

  // Update backend url in storage and verify health status with cold-start tolerance
  useEffect(() => {
    safeStorage.setItem("mai_backend_url", backendUrl);
    setCustomUrlInput(backendUrl);
    
    setServerStatus("checking");
    const controller = new AbortController();
    // 15 seconds timeout to allow for Cloud Run scale-to-zero cold starts to boot
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    safeFetch(`${backendUrl.replace(/\/$/, "")}/api/health`, { 
      method: "GET",
      signal: controller.signal 
    })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (data && (data.status === "ok" || data.time)) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn("Sync: Health check offline standard response:", err);
        setServerStatus("offline");
      });
  }, [backendUrl]);

  const gridEndRef = useRef<HTMLDivElement>(null);

  // Enhance prompt utilizing server endpoint
  const handleEnhancePrompt = async () => {
    if (!promptInput.trim()) return;
    setEnhancing(true);
    try {
      const res = await safeFetch(getApiUrl("/api/enhance-prompt"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptInput })
      });
      const data = await res.json();
      if (data.enhanced) {
        setPromptInput(data.enhanced);
      }
    } catch (err) {
      console.error("Enhancing prompt error:", err);
    } finally {
      setEnhancing(false);
    }
  };

  // Orchestrate single prompt to all active user-selected models concurrently
  const handleSendPrompt = async () => {
    const rawPrompt = promptInput.trim();
    if (!rawPrompt) return;

    // Apply Active Workflow prefixes
    const workflow = customWorkflows.find(w => w.id === activeWorkflowId);
    const basePrompt = workflow && workflow.promptPrefix 
      ? `${workflow.promptPrefix}${rawPrompt}` 
      : rawPrompt;

    // Ingest extra instruction variables matching selected Information Feeding Level (8x to 12x)
    let levelSuffix = "";
    if (feedingLevel >= 9) {
      if (isCodeModeActive) {
        levelSuffix += "\n- Big-O analysis: verify that algorithms run in optimal complexity bounds, reducing nested iterations and checking memory leak prevention.";
      } else {
        levelSuffix += "\n- Multi-perspective analysis: evaluate rival logical schools of thought, identify potential trade-offs, and outline systemic counter-arguments.";
      }
    }
    if (feedingLevel >= 10) {
      if (isCodeModeActive) {
        levelSuffix += "\n- Boundary constraints logic: implement robust protections for null values, empty array buffers, high numeric limits, and custom descriptive error blocks.";
      } else {
        levelSuffix += "\n- Deep validation & exception checks: analyze tail-risk outliers, boundary anomalies, and edge-cases related to the subject.";
      }
    }
    if (feedingLevel >= 11) {
      if (isCodeModeActive) {
        levelSuffix += "\n- Thread safety and resource guards: verify concurrency safety mechanisms, lock status, heap cached arrays constraints, and memory limits.";
      } else {
        levelSuffix += "\n- Systemic equilibrium and long-term feedback loops: trace indirect structural impacts, compound effects, and check limit scenarios.";
      }
    }
    if (feedingLevel >= 12) {
      if (isCodeModeActive) {
        levelSuffix += "\n- Full-Fleet cross examination consensus: fully reconcile competing logical suggestions from all drafts, implementing maximum depth code comments and perfect modular typing definitions.";
      } else {
        levelSuffix += "\n- Full-Fleet argumentative synthesis: fully reconcile contrasting analytical assertions, synthesizing a master-tier objective response with comprehensive footnotes or structured conceptual matrices.";
      }
    }

    const finalPrompt = levelSuffix 
      ? `${basePrompt}\n\n[Fleet Guidance Constraints Level ${feedingLevel}x]:${levelSuffix}` 
      : basePrompt;

    // Ingest image attachment context if available
    const imagePayload = activeAttachment
      ? { data: activeAttachment.data, mimeType: activeAttachment.mimeType }
      : undefined;

    // Reset prompt input and active attachment so UI refreshes cleanly
    setPromptInput("");
    setActiveAttachment(null);

    // Append User message to historic logs
    const timestampStr = new Date().toLocaleTimeString();
    const newUserLog: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: finalPrompt,
      timestamp: timestampStr
    };

    const nextHistories = { ...chatHistories };
    activeModels.forEach(model => {
      nextHistories[model.id] = [...(nextHistories[model.id] || []), newUserLog];
    });
    setChatHistories(nextHistories);

    // Initial loading states for selected models
    const loadState: Record<string, ModelResponse> = { ...responses };
    activeModels.forEach(model => {
      loadState[model.id] = {
        modelId: model.id,
        content: "",
        status: "loading"
      };
    });
    setResponses(loadState);

    // Trigger single, clean smooth scroll to view models response on submit
    setTimeout(() => {
      gridEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);

    // Process models in parallel using Promise.allSettled for fault tolerance
    await Promise.allSettled(
      activeModels.map(model => streamModelResponse(model.id, finalPrompt, nextHistories[model.id], imagePayload))
    );
  };

  // Stream single model handler
  const streamModelResponse = async (
    modelId: string, 
    promptText: string, 
    currentHistory: ChatMessage[],
    imagePayload?: { data: string; mimeType: string }
  ) => {
    const startTime = Date.now();
    try {
      // Exclude the last message (the new prompt itself) from the history array to prevent duplication
      const historyPayload = currentHistory.slice(0, currentHistory.length - 1);

      const response = await safeFetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          prompt: promptText,
          history: historyPayload,
          image: imagePayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      setResponses(prev => ({
        ...prev,
        [modelId]: { modelId, content: "", status: "streaming" }
      }));

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Null response body reader");
      }

      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed === "data: [DONE]") {
            continue;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const frame = JSON.parse(trimmed.slice(6));
              if (frame.error) {
                throw new Error(frame.error);
              }
              if (frame.text) {
                accumulatedText += frame.text;
                setResponses(prev => ({
                  ...prev,
                  [modelId]: {
                    modelId,
                    content: accumulatedText,
                    status: "streaming"
                  }
                }));
              }
            } catch (err) {
              // frame format parsing logs inside dev scope
            }
          }
        }
      }

      if (buffer.startsWith("data: ")) {
        try {
          const frame = JSON.parse(buffer.slice(6).trim());
          if (frame.text) {
            accumulatedText += frame.text;
          }
        } catch (err) {}
      }

      const responseTime = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));

      // Stream termination
      setResponses(prev => ({
        ...prev,
        [modelId]: {
          modelId,
          content: accumulatedText,
          status: "completed",
          responseTime
        }
      }));

      // Append compilation answer log
      const modelAnswerLog: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: accumulatedText,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatHistories(prev => ({
        ...prev,
        [modelId]: [...(prev[modelId] || []), modelAnswerLog]
      }));

    } catch (error: any) {
      console.error(`Streaming error model ${modelId}:`, error);
      setResponses(prev => ({
        ...prev,
        [modelId]: {
          modelId,
          content: prev[modelId]?.content || "",
          status: "error",
          error: error.message || "Model failed to stream"
        }
      }));
    }
  };

  // Re-trigger specified model
  const handleRegenerateModel = async (modelId: string) => {
    const history = chatHistories[modelId] || [];
    if (history.length === 0) return;

    // Find the last user message to use as prompt
    let lastUserPrompt = "";
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "user") {
        lastUserPrompt = history[i].content;
        break;
      }
    }

    if (!lastUserPrompt) return;

    // Set ONLY this model to loading
    setResponses(prev => ({
      ...prev,
      [modelId]: { modelId, content: "", status: "loading" }
    }));

    // Filter out the last answers of assistant to restart context clean
    const cleanHistory = history.filter((v, idx) => idx < history.length - 1);
    await streamModelResponse(modelId, lastUserPrompt, cleanHistory);
  };

  // Clear chat history
  const handleClearWorkspace = () => {
    const freshHistories: Record<string, ChatMessage[]> = {};
    const freshResponses: Record<string, ModelResponse> = {};
    models.forEach(m => {
      freshHistories[m.id] = [];
      freshResponses[m.id] = { modelId: m.id, content: "", status: "idle" };
    });
    setChatHistories(freshHistories);
    setResponses(freshResponses);
  };
  
  // Parse raw visual prompt to structured JSON via Gemini
  const handleParsePromptToJson = async () => {
    const rawPrompt = imagePrompt.trim();
    if (!rawPrompt) return;

    setIsParsingToJson(true);
    setParsingToJsonError("");
    try {
      const response = await safeFetch(getApiUrl("/api/prompt-to-json"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: rawPrompt })
      });
      const data = await response.json();
      if (data.structuredData) {
        setStructuredPromptData(data.structuredData);
        setUsePromptToJson(true);
      } else {
        setParsingToJsonError(data.error || "Failed to transform prompt to structured JSON");
      }
    } catch (e: any) {
      setParsingToJsonError(e.message || "Network error when parsing prompt to JSON");
    } finally {
      setIsParsingToJson(false);
    }
  };

  // Trigger Image Generation API
  const handleGenerateImage = async () => {
    const rawPrompt = imagePrompt.trim();
    if (!rawPrompt && (!usePromptToJson || !structuredPromptData)) return;

    setImgRunning(true);
    setImgError("");
    setGeneratedImg("");
    setImgElementLoading(true);

    // Append beautiful preset modifiers based on selected style and aspect ratio or compile from JSON
    let finalPrompt = rawPrompt;
    if (usePromptToJson && structuredPromptData) {
      const { subject, style, lighting, colors, framing, background, details, negative_prompt } = structuredPromptData;
      const parts = [];
      if (subject) parts.push(`Subject: ${subject}`);
      if (style) parts.push(`Artistic Style: ${style}`);
      if (lighting) parts.push(`Lighting Mood: ${lighting}`);
      if (colors && colors.length > 0) parts.push(`Dominant Color Palette: ${colors.join(", ")}`);
      if (framing) parts.push(`Shot Framing: ${framing}`);
      if (background) parts.push(`Environment Scenery: ${background}`);
      if (details && details.length > 0) parts.push(`Specific Elements: ${details.join(", ")}`);
      if (negative_prompt) parts.push(`Exclude: ${negative_prompt}`);
      finalPrompt = parts.join(". ");
    } else {
      if (imgStyle === "futurist") {
        finalPrompt += ", in a vibrant futuristic tech style with neon accents and high fidelity detail";
      } else if (imgStyle === "graphics") {
        finalPrompt += ", clean flat icon style, isolated flat graphic background, dynamic illustration format";
      } else if (imgStyle === "3d_render") {
        finalPrompt += ", highly polished 3D chibi model render style, smooth metallic/plastic surfaces, volumetric lighting, photorealistic 1/7 scale figurine feel";
      } else if (imgStyle === "blueprint") {
        finalPrompt += ", technical schematics blueprint diagrammatic structure, blueprint grid lines, professional wireframe display, high accuracy dashboard view";
      } else if (imgStyle === "photorealistic") {
        finalPrompt += ", ultra-realistic photorealistic design style, captured on premium lens camera, incredibly detailed surface texture, realistic environment";
      }
    }

    const triggerClientSideImgFallback = (promptText: string) => {
      let width = 1000;
      let height = 1000;
      if (imgRatio === "16:9") {
        width = 1200;
        height = 675;
      } else if (imgRatio === "9:16") {
        width = 675;
        height = 1200;
      } else if (imgRatio === "4:3") {
        width = 1024;
        height = 768;
      }

      const salt = Math.floor(Math.random() * 99999);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=${width}&height=${height}&nologo=true&seed=${salt}&model=flux`;
      
      console.log("Synthesizing client-side zero-latency fallback image:", pollinationsUrl);
      setImgElementLoading(true);
      setGeneratedImg(pollinationsUrl);
      setImgHistory(prev => [pollinationsUrl, ...prev.filter(item => item !== pollinationsUrl)].slice(0, 10));
    };

    try {
      const res = await safeFetch(getApiUrl("/api/generate-image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          aspectRatio: imgRatio,
          structuredData: usePromptToJson ? structuredPromptData : null
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImgElementLoading(true);
        setGeneratedImg(data.imageUrl);
        // Add to history list, removing duplicates & wrapping at max 10
        setImgHistory(prev => [data.imageUrl, ...prev.filter(item => item !== data.imageUrl)].slice(0, 10));
      } else {
        console.warn("Backend image generation returned error. Activating client-side zero-latency Pollinations AI fallback...", data.error || "No data");
        triggerClientSideImgFallback(finalPrompt);
      }
    } catch (err: any) {
      console.warn("Backend image generation failed. Activating client-side zero-latency Pollinations AI fallback...", err.message || err);
      triggerClientSideImgFallback(finalPrompt);
    } finally {
      setImgRunning(false);
    }
  };

  // Handle Document Upload simulation for summarizer
  const handleUploadDocumentText = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFileName(file.name);
    setSummaryRunning(true);
    setSummaryOutput("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      let text = event.target?.result as string || "";
      
      // Prevent "PayloadTooLargeError: request entity too large" by truncating extreme sizes
      const maxLength = 80000;
      if (text.length > maxLength) {
        text = text.substring(0, maxLength) + "\n\n... [TRUNCATED FOR WORKSPACE DEMO API SIZE LIMITS] ...";
      }
      
      setDocModelInput(text);

      try {
        const res = await safeFetch(getApiUrl("/api/summarize-document"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, fileName: file.name })
        });
        const data = await res.json();
        if (data.summary) {
          setSummaryOutput(data.summary);
        } else if (data.error) {
          setSummaryOutput(`Error summarizing document: ${data.error}`);
        }
      } catch (err: any) {
        setSummaryOutput(`Failed to summarize text. ${err.message || ""}`);
      } finally {
        setSummaryRunning(false);
      }
    };
    reader.readAsText(file);
  };

  // Dual-stage multi-model Code Synthesis with Claude!
  const handleCodeSynthesis = async () => {
    const prompt = codePromptInput.trim();
    if (!prompt) return;

    setCodeError("");
    setCompositeState("synthesis-fleet");
    setFleetOutputs({});
    setClaudeUnifiedResult("");
    setClaudeLoading(false);

    // Prepare loading status for each active model
    const initialLoading: Record<string, "idle" | "running" | "done" | "failed"> = {};
    activeModels.forEach(m => {
      initialLoading[m.id] = "running";
    });
    setFleetLoading(initialLoading);

    const obtainedDrafts: Record<string, string> = {};

    // 1. Fire queries to ALL selected models concurrently!
    const draftPromises = activeModels.map(async (model) => {
      try {
        const response = await safeFetch(getApiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: model.id,
            prompt: `Produce a drafting template, pseudo-code ideas, or specific layout snippets to solve this coding task: "${prompt}". Focus strictly on engineering snippets and validations.`,
            history: []
          })
        });

        if (!response.ok) {
          throw new Error(`Draft failed: status ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        if (!reader) throw new Error("Null body");

        let draftText = "";
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              try {
                const frame = JSON.parse(trimmed.slice(6));
                if (frame.text) {
                  draftText += frame.text;
                  setFleetOutputs(prev => ({
                    ...prev,
                    [model.id]: draftText
                  }));
                }
              } catch (e) {}
            }
          }
        }
        
        obtainedDrafts[model.id] = draftText;
        setFleetLoading(prev => ({ ...prev, [model.id]: "done" }));
      } catch (err) {
        console.error(`Fleet draft error for ${model.id}:`, err);
        setFleetLoading(prev => ({ ...prev, [model.id]: "failed" }));
      }
    });

    await Promise.allSettled(draftPromises);

    // 2. Synthesize with Claude!
    setCompositeState("claude-refining");
    setClaudeLoading(true);

    try {
      let draftCompilations = "";
      activeModels.forEach(m => {
        const draft = obtainedDrafts[m.id];
        if (draft) {
          draftCompilations += `\n--- DRAFT FROM ${m.name} ---\n${draft}\n`;
        }
      });

      let moduleFocusInstruction = "";
      if (feedingLevel >= 9) {
        moduleFocusInstruction += "\n- Big-O analysis: verify that algorithms run in optimal complexity bounds, reducing nested iterations and checking memory leak prevention.";
      }
      if (feedingLevel >= 10) {
        moduleFocusInstruction += "\n- Boundary constraints logic: implement robust protections for null values, empty array buffers, high numeric limits, and custom descriptive error blocks.";
      }
      if (feedingLevel >= 11) {
        moduleFocusInstruction += "\n- Thread safety and resource guards: verify concurrency safety mechanisms, lock status, heap cached arrays constraints, and memory limits.";
      }
      if (feedingLevel >= 12) {
        moduleFocusInstruction += "\n- Full-Fleet cross examination consensus: fully reconcile competing logical suggestions from all drafts, implementing maximum depth code comments and perfect modular typing definitions.";
      }

      const finalClaudePrompt = `Act as the Lead Software Architect. The user requested: "${prompt}".
To accelerate your design, our model fleet has drafted separate architectural layouts and key pseudo-code slices:
${draftCompilations || "No drafts completed successfully."}

Review, reconcile, expand, and synthesize these inputs into a premium, world-class production-ready software module in the requested language.
Please adhere strictly to the following parameters configured for information feeding level ${feedingLevel}:${moduleFocusInstruction || "\n- Standard syntax and parsing validation."}

Optimize carefully for memory, safety, absolute completeness, and detailed comments. Deliver ONLY the final completed clean master implementation.`;

      const response = await safeFetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: isMasterCodeModeActive ? "claude-fable-5" : "claude-coder", // Will target Anthropic Claude
          prompt: finalClaudePrompt,
          history: []
        })
      });

      if (!response.ok) {
        throw new Error(`Claude synthesis failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("Null Claude body reader");

      let finalClaudeText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const frame = JSON.parse(trimmed.slice(6));
              if (frame.text) {
                finalClaudeText += frame.text;
                setClaudeUnifiedResult(finalClaudeText);
              }
            } catch (e) {}
          }
        }
      }

      setCompositeState("completed");
    } catch (err: any) {
      console.error("Claude synthesis error:", err);
      setCodeError(err.message || "Failed during Claude lead synthesis phase.");
      setCompositeState("error");
    } finally {
      setClaudeLoading(false);
    }
  };

  // Handle Voice Dictation transcription simulation
  const handleTranscribeAudioMessage = async () => {
    const topic = audioTopicInput.trim() || "Multi-model orchestration speeds";
    setAudioRunning(true);
    setTranscribedText("");

    try {
      const res = await safeFetch(getApiUrl("/api/transcribe-audio"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: topic })
      });
      const data = await res.json();
      if (data.transcription) {
        setTranscribedText(data.transcription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAudioRunning(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 text-white font-sans relative flex w-full overflow-hidden ${
      physicsModeActive
        ? "bg-[#020512] selection:bg-cyan-500/40 selection:text-white"
        : isMasterCodeModeActive
          ? "bg-[#0b0602] selection:bg-amber-500/40 selection:text-white"
          : isCodeModeActive 
            ? "bg-[#06030e] selection:bg-purple-500/40 selection:text-white" 
            : "bg-[#07090e] selection:bg-emerald-500/30"
    }`}>
      
      {/* Simulation Synchronization teleport indicator badge */}
      <AnimatePresence>
        {showSyncNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[360px] max-w-[90vw] p-4 rounded-xl border border-cyan-500/50 bg-slate-950/95 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md flex items-center space-x-3.5 select-none"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div className="flex-grow text-left">
              <p className="text-[10px] font-mono uppercase tracking-widest font-black text-cyan-400 animate-pulse">
                LATENCY-ADJUSTED TELEPORT ACTIVE
              </p>
              <p className="text-[11px] font-sans text-white font-semibold leading-snug">
                {showSyncNotification}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background Celestial Canvas and Orbits */}
      <CelestialCanvas 
        isProMode={isCodeModeActive}
        isPhysicsMode={physicsModeActive}
        fpsCap={vfxFpsCap}
        trailWidth={vfxTrailWidth}
        trailLength={vfxTrailLength}
        latticeDist={vfxLatticeDist}
        particleCount={vfxParticleCount}
        shaderMode={vfxShaderMode}
        physicsFriction={vfxPhysicsFriction}
        aberration={vfxAberration}
        bloomGlow={vfxBloomGlow}
        colorPreset={vfxColorPreset}
        soundEnabled={vfxSoundEnabled}
      />
      {isMasterCodeModeActive ? (
        <>
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
        </>
      ) : isCodeModeActive ? (
        <>
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-fuchsia-600/10 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
          <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-cyan-500/5 blur-[130px] rounded-full pointer-events-none transition-all duration-1000 z-0" />
        </>
      )}

      {/* Main Workspace Body */}
      <div className="flex-grow flex flex-col min-w-0">
        
        <WorkspaceHeader
          onBack={onBack}
          models={models}
          isCodeModeActive={isCodeModeActive}
          setIsCodeModeActive={setIsCodeModeActive}
          physicsModeActive={physicsModeActive}
          setPhysicsModeActive={setPhysicsModeActive}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          responseMode={responseMode}
          setResponseMode={setResponseMode}
          isMasterCodeModeActive={isMasterCodeModeActive}
          setIsMasterCodeModeActive={setIsMasterCodeModeActive}
          selectedModelIds={selectedModelIds}
          setSelectedModelIds={setSelectedModelIds}
          handleClearWorkspace={handleClearWorkspace}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeModels={activeModels}
        />

        <MobileLayoutSwitcher
          isMobile={isMobile}
          mobileLayout={mobileLayout}
          setMobileLayout={setMobileLayout}
          activeModels={activeModels}
          selectedMobileModelId={selectedMobileModelId}
          setSelectedMobileModelId={setSelectedMobileModelId}
          splitModelId1={splitModelId1}
          setSplitModelId1={setSplitModelId1}
          splitModelId2={splitModelId2}
          setSplitModelId2={setSplitModelId2}
        />

        {/* Scrollable Work area */}
        <div className="flex-grow relative overflow-y-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
          {physicsModeActive ? (
            <PhysicsSpace
              consensusTopic={consensusTopic}
              setConsensusTopic={setConsensusTopic}
              consensusStatus={consensusStatus}
              handleRunSwarmConsensus={handleRunSwarmConsensus}
              consensusLogs={consensusLogs}
              consensusFinalResult={consensusFinalResult}
              renderFormattedConsensusText={(text) => renderFormattedConsensusText(text, physicsModeActive, handleSyncTelemetry)}
              onClearConsensus={clearConsensusSession}
              altitude={altitude}
              setAltitude={setAltitude}
              approachSpeed={approachSpeed}
              setApproachSpeed={setApproachSpeed}
              weightTheoretical={weightTheoretical}
              setWeightTheoretical={setWeightTheoretical}
              weightSystems={weightSystems}
              setWeightSystems={setWeightSystems}
              weightApplied={weightApplied}
              setWeightApplied={setWeightApplied}
            />
          ) : (
            /* Strict 3x2 Grid Display (Directives enforce Desktop Grid layout always) */
            <div className="max-w-7xl mx-auto">
              <SwarmDebatePanel
                isMasterCodeModeActive={isMasterCodeModeActive}
                isCodeModeActive={isCodeModeActive}
                physicsModeActive={physicsModeActive}
                consensusTopic={consensusTopic}
                setConsensusTopic={setConsensusTopic}
                consensusStatus={consensusStatus}
                consensusLogs={consensusLogs}
                consensusFinalResult={consensusFinalResult}
                handleRunSwarmConsensus={handleRunSwarmConsensus}
                renderFormattedConsensusText={(text) => renderFormattedConsensusText(text, physicsModeActive, handleSyncTelemetry)}
              />

            {!isMobile ? (
              layoutMode === "side-by-side" ? (
                <div className="overflow-x-auto pb-4 scrollbar-thin select-text">
                  <div className="flex gap-6 min-w-max pb-2">
                    <AnimatePresence>
                      {activeModels.map(model => {
                        const Card = ModelCard as any;
                        return (
                          <div key={model.id} className="w-[380px] shrink-0">
                            <Card 
                              model={model}
                              response={(responses[model.id] || { modelId: model.id, content: "", status: "idle" }) as any}
                              onRegenerate={handleRegenerateModel as any}
                              history={chatHistories[model.id]}
                              responseMode={responseMode}
                              onOpenChat={setIndividualChatModelId}
                            />
                          </div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className={`grid ${getGridColsClass(activeModels.length)} gap-6`}>
                  <AnimatePresence>
                    {activeModels.map(model => {
                      const Card = ModelCard as any;
                      return (
                        <Card 
                          key={model.id}
                          model={model}
                          response={(responses[model.id] || { modelId: model.id, content: "", status: "idle" }) as any}
                          onRegenerate={handleRegenerateModel as any}
                          history={chatHistories[model.id]}
                          responseMode={responseMode}
                          onOpenChat={setIndividualChatModelId}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {mobileLayout === "stack" && (
                  <div className="grid grid-cols-1 gap-5">
                    {activeModels.map(model => {
                      const Card = ModelCard as any;
                      return (
                        <Card 
                          key={model.id}
                          model={model}
                          response={(responses[model.id] || { modelId: model.id, content: "", status: "idle" }) as any}
                          onRegenerate={handleRegenerateModel as any}
                          history={chatHistories[model.id]}
                          responseMode={responseMode}
                          onOpenChat={setIndividualChatModelId}
                        />
                      );
                    })}
                  </div>
                )}

                {mobileLayout === "tabs" && (
                  <div className="space-y-4">
                    {activeModels
                      .filter(m => m.id === selectedMobileModelId)
                      .map(model => {
                        const Card = ModelCard as any;
                        return (
                          <Card 
                            key={model.id}
                            model={model}
                            response={(responses[model.id] || { modelId: model.id, content: "", status: "idle" }) as any}
                            onRegenerate={handleRegenerateModel as any}
                            history={chatHistories[model.id]}
                            responseMode={responseMode}
                            onOpenChat={setIndividualChatModelId}
                          />
                        );
                      })}
                  </div>
                )}

                {mobileLayout === "split" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeModels
                      .filter(m => m.id === splitModelId1 || m.id === splitModelId2)
                      .sort((a, b) => (a.id === splitModelId1 ? -1 : 1))
                      .map(model => {
                        const Card = ModelCard as any;
                        return (
                          <Card 
                            key={model.id}
                            model={model}
                            response={(responses[model.id] || { modelId: model.id, content: "", status: "idle" }) as any}
                            onRegenerate={handleRegenerateModel as any}
                            history={chatHistories[model.id]}
                            responseMode={responseMode}
                            onOpenChat={setIndividualChatModelId}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            <div ref={gridEndRef} />
          </div>
        )}
      </div>
          
          {/* User Input & Action Area */}
          {!physicsModeActive && !oracleModeActive && (
            <WorkspacePromptBar
              isCodeModeActive={isCodeModeActive}
              activeWorkflowId={activeWorkflowId}
              setActiveWorkflowId={setActiveWorkflowId}
              customWorkflows={customWorkflows}
              activeAttachment={activeAttachment}
              setActiveAttachment={setActiveAttachment}
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              feedingLevel={feedingLevel}
              setFeedingLevel={setFeedingLevel}
              enhancing={enhancing}
              handleEnhancePrompt={handleEnhancePrompt}
              handleSendPrompt={handleSendPrompt}
              handleAttachmentUpload={handleAttachmentUpload}
              physicsModeActive={physicsModeActive}
            />
          )}

        </div>

      {/* Backdrop overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-45 transition-opacity backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Toolbox Secondary Sidebar (Supports Slide-in effect) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: isMobile ? "100%" : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? "100%" : 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className={`${
              isMobile 
                ? "fixed top-0 bottom-0 right-0 h-full z-50 w-[310px] sm:w-[330px] shadow-2xl border-l" 
                : "shrink-0 border-l w-[330px]"
            } ${
              isCodeModeActive 
                ? "bg-[#090616]/95 border-purple-950/40 shadow-[0_0_30px_rgba(168,85,247,0.06)]" 
                : "bg-[#090d16]/95 border-gray-800/60"
            } flex flex-col justify-between transition-all duration-700`}
          >
            {/* Sidebar Content Container */}
            <div className="p-5 space-y-6 overflow-y-auto flex-grow scrollbar-thin">
              
              {/* Box Title */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800/60">
                <h3 className="font-display font-extrabold text-sm tracking-tight text-white flex items-center space-x-1.5">
                  <Sliders className={`w-4 h-4 transition-colors ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`} />
                  <span>Utility Panel</span>
                </h3>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400">Utilities</span>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded bg-gray-900/40 hover:bg-white/5 text-gray-400 hover:text-white border border-gray-850 hover:border-gray-800 transition-all cursor-pointer"
                    title="Close Panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Utility Subtabs Nav */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 p-1 bg-slate-950 rounded-lg border border-gray-850 select-none">
                {(["workflows", "modes", "code", "image", "document", "audio", "vfx", "history", "cartography"] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    title={
                      tabKey === "vfx" ? "Simulation Parameter overrides" :
                      tabKey === "history" ? "Session Log database" :
                      tabKey === "cartography" ? "Debate Topology diagram" :
                      tabKey === "modes" ? "Consensus System active modes" :
                      tabKey === "code" ? (isCodeModeActive ? "Code Fleet status" : "Consensus Logic status") : tabKey
                    }
                    className={`py-1.5 rounded text-[8px] font-mono tracking-tighter uppercase transition-all cursor-pointer ${
                      activeTab === tabKey 
                        ? tabKey === "code" || tabKey === "vfx"
                          ? isCodeModeActive
                            ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 font-extrabold"
                            : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold"
                          : tabKey === "modes"
                          ? "bg-yellow-500/15 border border-yellow-500/35 text-yellow-300 font-extrabold shadow-[0_0_8px_rgba(234,179,8,0.1)]"
                          : tabKey === "history" || tabKey === "cartography"
                          ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 font-extrabold"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold" 
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {tabKey === "workflows" ? "preset" : tabKey === "modes" ? "mode" : tabKey === "code" ? "logic" : tabKey === "history" ? "logs" : tabKey === "cartography" ? "map" : tabKey === "document" ? "docs" : tabKey === "vfx" ? "sim" : tabKey.slice(0, 4)}
                  </button>
                ))}
              </div>

              {/* Panel views */}
              <div className="space-y-4">
                
                {/* 1. Workflows Presets Panel */}
                {activeTab === "workflows" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Presets configure targeted prompt adapters to format output style, analytical focus, or verification rules.
                    </p>
                    <div className="space-y-2.5">
                      {customWorkflows.map(cw => (
                        <button
                          key={cw.id}
                          onClick={() => setActiveWorkflowId(cw.id)}
                          className={`w-full p-3.5 rounded-xl text-left border transition-all text-xs flex items-start space-x-3 cursor-pointer ${
                            activeWorkflowId === cw.id 
                              ? "bg-[#10b981]/5 border-emerald-500/40" 
                              : "bg-slate-900/40 border-gray-850 hover:bg-slate-900/85 hover:border-gray-800"
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${activeWorkflowId === cw.id ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-950 text-gray-500'}`}>
                            {cw.id === "developer" ? <PenTool className="w-4 h-4" /> : cw.id === "creative" ? <Sparkle className="w-4 h-4" /> : cw.id === "socratic" ? <BookOpen className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                          </div>
                          <div className="flex items-center">
                            <h4 className={`font-semibold font-display ${activeWorkflowId === cw.id ? 'text-emerald-400' : 'text-neutral-200'}`}>{cw.name}</h4>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.2. Modes Selection Console Panel */}
                {activeTab === "modes" && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {/* 1. Swarm Debate Mode */}
                      <div 
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          (!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive)
                            ? "bg-emerald-500/5 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.06)]" 
                            : "bg-slate-900/40 border-gray-850 hover:bg-slate-900/80 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${(!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-950 text-gray-500'}`}>
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className={`font-bold font-display text-[12px] uppercase ${(!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive) ? 'text-emerald-400' : 'text-neutral-200'}`}>
                                Consensus Mode
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setOracleModeActive(false);
                              setIsCodeModeActive(false);
                              setPhysicsModeActive(false);
                              setForgeModeActive(false);
                            }}
                            className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold ${
                              (!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive)
                                ? "bg-emerald-400 text-black hover:bg-emerald-300" 
                                : "bg-neutral-950 border border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {(!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive) ? "ACTIVE" : "SELECT"}
                          </button>
                        </div>
                      </div>

                      {/* 2. Code Mode */}
                      <div 
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isCodeModeActive 
                            ? "bg-purple-500/5 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.06)]" 
                            : "bg-slate-900/40 border-gray-850 hover:bg-slate-900/80 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${isCodeModeActive ? 'bg-purple-500/15 text-purple-400' : 'bg-gray-950 text-gray-500'}`}>
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className={`font-bold font-display text-[12px] uppercase ${isCodeModeActive ? 'text-purple-400' : 'text-neutral-200'}`}>
                                Code Mode
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setIsCodeModeActive(!isCodeModeActive);
                              if (!isCodeModeActive) {
                                  setOracleModeActive(false);
                                  setPhysicsModeActive(false);
                                  setForgeModeActive(false);
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold ${
                              isCodeModeActive 
                                ? "bg-purple-400 text-white hover:bg-purple-300" 
                                : "bg-neutral-950 border border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {isCodeModeActive ? "ACTIVE" : "SELECT"}
                          </button>
                        </div>
                      </div>

                      {/* 3. Simulation Mode */}
                      <div 
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          physicsModeActive 
                            ? "bg-cyan-500/5 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.06)]" 
                            : "bg-slate-900/40 border-gray-850 hover:bg-slate-900/80 hover:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${physicsModeActive ? 'bg-cyan-500/15 text-cyan-400' : 'bg-gray-950 text-gray-500'}`}>
                              <Binary className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className={`font-bold font-display text-[12px] uppercase ${physicsModeActive ? 'text-cyan-400' : 'text-neutral-200'}`}>
                                Simulation Mode
                              </h4>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPhysicsModeActive(!physicsModeActive);
                              if (!physicsModeActive) {
                                setOracleModeActive(false);
                                setIsCodeModeActive(false);
                                setForgeModeActive(false);
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold ${
                              physicsModeActive 
                                ? "bg-cyan-400 text-black hover:bg-cyan-350" 
                                : "bg-neutral-950 border border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {physicsModeActive ? "ACTIVE" : "SELECT"}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 1.5. Special Purple/Emerald Synthesis Module */}
                {activeTab === "code" && (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl relative overflow-hidden border ${
                      isCodeModeActive 
                        ? "bg-purple-950/15 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                        : "bg-emerald-950/15 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                    }`}>
                      <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-xl pointer-events-none ${
                        isCodeModeActive ? "bg-purple-500/10" : "bg-emerald-500/10"
                      }`} />
                      <div className={`flex items-center space-x-2 mb-1 relative z-10 ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {isCodeModeActive ? <Terminal className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        <h4 className="text-xs font-bold tracking-tight uppercase font-display">
                          {isCodeModeActive ? "Claude Lead Orchestrator" : "Claude Conductor"}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1 font-sans">
                        <label className={`text-[9px] uppercase tracking-wider font-mono font-bold block ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'}`}>
                          {isCodeModeActive ? "Code Request / Feature Spec" : "Discourse Topic / Creative Subject"}
                        </label>
                        <textarea
                          value={codePromptInput}
                          onChange={(e) => setCodePromptInput(e.target.value)}
                          placeholder={
                            isCodeModeActive
                              ? "e.g. Write a React custom hook named useLocalStorage that handles expiration..."
                              : "e.g. Analyze the societal impacts of autonomous transport models on labor economics..."
                          }
                          className={`w-full bg-slate-950 border rounded-xl p-3 text-xs h-24 focus:outline-none resize-none leading-relaxed transition-colors duration-300 ${
                            isCodeModeActive
                              ? "border-purple-900/40 text-purple-100 placeholder-purple-900/60 focus:border-purple-500/40"
                              : "border-emerald-900/40 text-emerald-100 placeholder-emerald-900/60 focus:border-emerald-500/40"
                          }`}
                        />
                      </div>

                      <VideoDetectionModule 
                        inputText={codePromptInput}
                        onTextAppend={(text) => setCodePromptInput(prev => prev + text)}
                        accentColor={physicsModeActive ? "cyan" : isCodeModeActive ? "purple" : "emerald"}
                      />

                      {/* Information Depth Selector Hub inside Panel */}
                      <div className={`p-3 border rounded-xl space-y-2 text-left ${
                        isCodeModeActive ? "bg-purple-950/20 border-purple-500/25" : "bg-emerald-950/20 border-emerald-500/25"
                      }`}>
                        <div className="flex items-center justify-between">
                          <label className={`text-[9px] uppercase tracking-wider font-mono font-bold block ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'}`}>
                            {isCodeModeActive ? "Analysis Depth Level" : "Analysis Depth Level"}
                          </label>
                          <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCodeModeActive ? "bg-purple-500/10 text-purple-300" : "bg-emerald-500/10 text-emerald-300"
                          }`}>
                            {feedingLevel === 0 ? "STANDARD / OFF" : `${feedingLevel} NODES INGESTED`}
                          </span>
                        </div>
                        
                        {/* Selection buttons 8 to 12 */}
                        <div className={`grid grid-cols-6 gap-1 p-1 bg-slate-950 rounded-lg border ${isCodeModeActive ? 'border-purple-950/65' : 'border-emerald-950/65'}`}>
                          {([0, 8, 9, 10, 11, 12] as const).map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setFeedingLevel(lvl)}
                              className={`py-1 rounded text-[10px] font-mono font-bold tracking-tighter transition-all cursor-pointer ${
                                feedingLevel === lvl
                                  ? isCodeModeActive
                                    ? "bg-purple-600 border border-purple-500 text-white font-extrabold"
                                    : "bg-emerald-500 border border-emerald-400 text-black font-extrabold"
                                  : isCodeModeActive
                                    ? "text-gray-500 hover:text-zinc-200 hover:bg-purple-950/25"
                                    : "text-gray-500 hover:text-zinc-200 hover:bg-emerald-950/25"
                              }`}
                            >
                              {lvl === 0 ? "Off" : `${lvl}x`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleCodeSynthesis}
                        disabled={compositeState === "synthesis-fleet" || compositeState === "claude-refining" || !codePromptInput.trim()}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center space-x-2 border cursor-pointer ${
                          codePromptInput.trim() && compositeState !== "synthesis-fleet" && compositeState !== "claude-refining"
                            ? isCodeModeActive
                              ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_22px_rgba(168,85,247,0.5)] font-display"
                              : "bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5)] font-display"
                            : "bg-gray-850/60 border-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                        }`}
                      >
                        {isCodeModeActive ? <Code className="w-4 h-4 shrink-0" /> : <BookOpen className="w-4 h-4 shrink-0" />}
                        <span>
                          {compositeState === "synthesis-fleet" 
                            ? "Gathering Fleet Drafts..." 
                            : compositeState === "claude-refining"
                              ? isCodeModeActive ? "Claude Refining master module..." : "Claude Aligning sovereign insights..."
                              : isCodeModeActive ? "Synthesize Master Code" : "Synthesize Scholars Swarm"}
                        </span>
                      </button>
                    </div>

                    {/* Collaborative Multi-Model Progress Board */}
                    {(compositeState === "synthesis-fleet" || compositeState === "claude-refining" || compositeState === "completed" || compositeState === "error") && (
                      <div className="space-y-3 pt-2">
                        <div className={`border p-3 rounded-xl space-y-2.5 shadow-inner ${
                          isCodeModeActive 
                            ? "border-purple-900/20 bg-[#0e0a1b]" 
                            : "border-emerald-900/20 bg-[#07130a]"
                        }`}>
                          <label className={`text-[9px] uppercase tracking-wider font-mono font-bold block ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
                            {isCodeModeActive ? "Intelligence Assembly Pipeline" : "Deliberative Argumentative Pipeline"}
                          </label>
                          
                          {/* Selected fleet progress indicators */}
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                            {activeModels.map(m => {
                              const status = fleetLoading[m.id] || "idle";
                              return (
                                <div key={m.id} className={`flex items-center justify-between text-[10px] py-1 bg-slate-950/40 px-2 rounded-lg border ${
                                  isCodeModeActive ? 'border-purple-950/25' : 'border-emerald-950/25'
                                }`}>
                                  <span className="flex items-center gap-1.5 font-bold text-zinc-300 font-sans">
                                    <span className={`w-1.5 h-1.5 rounded-full ${m.bgColor}`} />
                                    {m.name}
                                  </span>
                                  <span className="font-mono text-[9px]">
                                    {status === "running" && <span className="text-amber-400 animate-pulse font-bold">Drafting...</span>}
                                    {status === "done" && <span className="text-emerald-400 flex items-center gap-0.5 font-bold">✓ Ready</span>}
                                    {status === "failed" && <span className="text-rose-400 font-bold">✗ Failed</span>}
                                    {status === "idle" && <span className="text-zinc-500 font-bold">Queued</span>}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Claude Lead step indicator */}
                          <div className={`p-2 rounded-xl flex items-center justify-between text-[10.5px] border ${
                            isCodeModeActive 
                              ? "bg-purple-950/10 border-purple-500/10" 
                              : "bg-emerald-950/10 border-emerald-500/10"
                          }`}>
                            <span className={`flex items-center gap-1.5 font-bold ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'}`}>
                              <Cpu className={`w-4 h-4 ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'} ${compositeState === "claude-refining" ? 'animate-spin' : ''}`} />
                              {isCodeModeActive ? "Lead Synthesis (Claude)" : "Lead Consensus (Claude)"}
                            </span>
                            <span className="font-mono font-bold">
                              {compositeState === "synthesis-fleet" && <span className="text-zinc-500">Awaiting drafts</span>}
                              {compositeState === "claude-refining" && <span className={`${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'} animate-pulse`}>Fusing insights...</span>}
                              {compositeState === "completed" && <span className="text-emerald-400 font-semibold">✓ Concluded</span>}
                              {compositeState === "error" && <span className="text-rose-400">✗ Blocked</span>}
                            </span>
                          </div>
                        </div>

                        {/* Claude's output visualization area */}
                        {claudeUnifiedResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <label className={`text-[10px] uppercase tracking-wider font-mono font-bold block ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
                                {isCodeModeActive ? "Claude's Master Synthesis" : "Claude's Strategic Consensus"}
                              </label>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(claudeUnifiedResult);
                                }}
                                className={`text-[9.5px] font-mono flex items-center gap-1 border px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-slate-950/40 ${
                                  isCodeModeActive 
                                    ? "text-purple-300 border-purple-500/20 hover:text-white" 
                                    : "text-emerald-300 border-emerald-500/20 hover:text-white"
                                }`}
                              >
                                <Copy className="w-3 h-3" />
                                {isCodeModeActive ? "Copy Code" : "Copy Thesis"}
                              </button>
                            </div>

                            <div className={`p-3 border rounded-xl max-h-[220px] overflow-y-auto font-mono text-[10.5px] leading-relaxed scrollbar-thin select-text ${
                              isCodeModeActive 
                                ? "border-purple-500/20 bg-[#06030c] text-purple-100" 
                                : "border-emerald-500/20 bg-[#030c05] text-emerald-100"
                            }`}>
                              <pre className="whitespace-pre-wrap">{claudeUnifiedResult}</pre>
                            </div>

                            <button
                              onClick={() => {
                                setPromptInput(isCodeModeActive 
                                  ? `Adopt Claude's Master Code Synthesizer structure for further actions:\n\n\`\`\`\n${claudeUnifiedResult}\n\`\`\``
                                  : `Adopt Claude's Scholars Consensus Thesis for further actions:\n\n${claudeUnifiedResult}`
                                );
                              }}
                              className={`w-full py-1.5 rounded-lg border text-[10px] font-semibold transition-colors cursor-pointer ${
                                isCodeModeActive 
                                  ? "border-purple-500/20 bg-purple-950/15 hover:bg-purple-950/30 text-purple-200" 
                                  : "border-emerald-500/20 bg-emerald-950/15 hover:bg-emerald-950/30 text-emerald-200"
                              }`}
                            >
                              {isCodeModeActive ? "Feed Master Output to main Workspace prompt" : "Feed Scholars Thesis to main Workspace prompt"}
                            </button>
                          </motion.div>
                        )}

                        {codeError && (
                          <div className="p-3 text-[11px] text-rose-400 bg-rose-950/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed">
                            {codeError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Image Generator Panel */}
                {activeTab === "image" && (
                  <div className="space-y-4">
                    {/* Sub tabs */}
                    <div className="bg-slate-950 p-0.5 rounded-lg border border-gray-900 flex text-[10px] h-8 shrink-0">
                      <button
                        onClick={() => setImageSubTab("generate")}
                        className={`flex-1 py-1 rounded-md font-mono tracking-wider transition-all uppercase cursor-pointer ${
                          imageSubTab === "generate"
                            ? "bg-slate-800 text-cyan-400 font-bold"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Asset Gen
                      </button>
                      <button
                        onClick={() => setImageSubTab("scan")}
                        className={`flex-1 py-1 rounded-md font-mono tracking-wider transition-all uppercase cursor-pointer ${
                          imageSubTab === "scan"
                            ? "bg-slate-800 text-emerald-400 font-bold"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Vision Scan
                      </button>
                    </div>

                    {imageSubTab === "generate" ? (
                      <div className="space-y-4">
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                          Create original visual assets using <span className="text-cyan-400 font-semibold">Recraft Pro v4</span> directly, specializing in layout mocks, creative designs, and realism.
                        </p>

                        {/* Artist Style and Canvas Aspect Ratio Selection */}
                        <div className="space-y-3">
                          
                          {/* Style selection */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-mono text-cyan-400/90 block font-semibold">
                              🎨 Artist Preset Style
                            </label>
                            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-gray-900">
                              {[
                                { id: "none", label: "Off" },
                                { id: "futurist", label: "Laser Neon" },
                                { id: "graphics", label: "Flat Icon" },
                                { id: "3d_render", label: "3D Figure" },
                                { id: "blueprint", label: "Blueprint" },
                                { id: "photorealistic", label: "Realism" }
                              ].map(st => (
                                <button
                                  key={st.id}
                                  onClick={() => setImgStyle(st.id)}
                                  className={`py-1 rounded text-[9.5px] font-mono transition-all text-center border cursor-pointer ${
                                    imgStyle === st.id
                                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold"
                                      : "bg-transparent border-transparent hover:bg-slate-900 text-zinc-500 hover:text-zinc-350"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Aspect Ratio selection */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-mono text-cyan-400/90 block font-semibold">
                              📐 Canvas Aspect Ratio
                            </label>
                            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-gray-900">
                              {["1:1", "16:9", "9:16", "4:3"].map(r => (
                                <button
                                  key={r}
                                  onClick={() => setImgRatio(r)}
                                  className={`py-1 rounded-md text-[9.5px] font-mono text-center transition-all border cursor-pointer ${
                                    imgRatio === r
                                      ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 font-bold"
                                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-350"
                                  }`}
                                >
                                  {r === "1:1" ? "1:1 ▢" : r === "16:9" ? "16:9 ▭" : r === "9:16" ? "9:16 ▯" : "4:3 ▱"}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Prompt Input textarea */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase tracking-wider font-mono text-cyan-400/90 block font-semibold">
                              ✍️ Visual Asset Prompt
                            </label>
                            <textarea
                              value={imagePrompt}
                              onChange={(e) => setImagePrompt(e.target.value)}
                              placeholder="A futuristic synthwave workstation with neon wireframe schematics, high detail..."
                              className="w-full bg-slate-950 border border-gray-850 rounded-xl p-3 text-xs h-20 text-neutral-200 placeholder-gray-550 focus:outline-none resize-none leading-relaxed"
                            />
                          </div>

                          {/* Quick seed suggestions */}
                          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
                            <button
                              onClick={() => setImagePrompt("A 1/7 scale high-fidelity analytical character figurine mid-leap, obsidian armor plates, active neon grid base")}
                              className="px-2 py-1 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer transition-all border border-transparent hover:border-zinc-750"
                            >
                              ⚔️ Diagnostic Scout
                            </button>
                            <button
                              onClick={() => setImagePrompt("Low-Earth orbit satellite traversing dynamic blue-green earth atmosphere orbit rings, glowing particles")}
                              className="px-2 py-1 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer transition-all border border-transparent hover:border-zinc-750"
                            >
                              🛰️ LEO Orbit
                            </button>
                            <button
                              onClick={() => setImagePrompt("Highly technical wireframe database core diagram displaying neon server schematics, blueprint style")}
                              className="px-2 py-1 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer transition-all border border-transparent hover:border-zinc-750"
                            >
                              🔬 Analytics Core
                            </button>
                          </div>

                          {/* Structured prompt editor if active */}
                          <div className="space-y-2 mt-2 bg-[#060a12]/80 p-3 rounded-xl border border-gray-900">
                            <div className="flex items-center justify-between border-b border-gray-900/60 pb-2 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
                                  {structuredPromptData ? "🛠️ Structured Creator JSON" : "⚡ Prompt-To-JSON Control"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!structuredPromptData && imagePrompt.trim()) {
                                    handleParsePromptToJson();
                                  } else {
                                    setUsePromptToJson(!usePromptToJson);
                                  }
                                }}
                                disabled={isParsingToJson || (!imagePrompt.trim() && !structuredPromptData)}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all cursor-pointer border ${
                                  usePromptToJson
                                    ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400"
                                    : "bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                } disabled:opacity-45`}
                              >
                                {usePromptToJson ? "Active (Structured) ✓" : "Enable Prompt-to-JSON"}
                              </button>
                            </div>

                            {/* Raw Prompt deconstructor tool */}
                            {!structuredPromptData && !isParsingToJson && (
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                                  Convert raw descriptions into stateful JSON parameters.
                                </span>
                                <button
                                  type="button"
                                  onClick={handleParsePromptToJson}
                                  disabled={!imagePrompt.trim()}
                                  className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[9.5px] font-mono cursor-pointer transition-all border ${
                                    imagePrompt.trim()
                                      ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/45"
                                      : "border-transparent text-zinc-700 cursor-not-allowed"
                                  }`}
                                >
                                  <span>✨ Parse to JSON</span>
                                </button>
                              </div>
                            )}

                            {isParsingToJson && (
                              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                                <div className="w-5 h-5 rounded-full border border-cyan-500 border-t-transparent animate-spin" />
                                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                                  Constructing AST JSON Schema...
                                </span>
                              </div>
                            )}

                            {parsingToJsonError && (
                              <div className="text-[10px] text-red-400 font-mono bg-red-950/10 p-2 rounded border border-red-900/30">
                                ⚠️ {parsingToJsonError}
                              </div>
                            )}

                            {structuredPromptData && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 text-left scrollbar-thin scrollbar-thumb-zinc-800">
                                  {/* Subject field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"subject":</span>
                                    <input 
                                      type="text" 
                                      value={structuredPromptData.subject || ""} 
                                      onChange={(e) => setStructuredPromptData({...structuredPromptData, subject: e.target.value})}
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-cyan-300 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                  </div>

                                  {/* Style field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"style":</span>
                                    <input 
                                      type="text" 
                                      value={structuredPromptData.style || ""} 
                                      onChange={(e) => setStructuredPromptData({...structuredPromptData, style: e.target.value})}
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-emerald-400 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Lighting field */}
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] text-zinc-500 font-mono">"lighting":</span>
                                      <input 
                                        type="text" 
                                        value={structuredPromptData.lighting || ""} 
                                        onChange={(e) => setStructuredPromptData({...structuredPromptData, lighting: e.target.value})}
                                        className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:border-cyan-500/50 focus:outline-none"
                                      />
                                    </div>
                                    {/* Framing field */}
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] text-zinc-500 font-mono">"framing":</span>
                                      <input 
                                        type="text" 
                                        value={structuredPromptData.framing || ""} 
                                        onChange={(e) => setStructuredPromptData({...structuredPromptData, framing: e.target.value})}
                                        className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:border-cyan-500/50 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Background field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"background":</span>
                                    <input 
                                      type="text" 
                                      value={structuredPromptData.background || ""} 
                                      onChange={(e) => setStructuredPromptData({...structuredPromptData, background: e.target.value})}
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-zinc-350 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                  </div>

                                  {/* Colors field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"colors":</span>
                                    <input 
                                      type="text" 
                                      value={(structuredPromptData.colors || []).join(", ")} 
                                      onChange={(e) => setStructuredPromptData({
                                        ...structuredPromptData, 
                                        colors: e.target.value.split(",").map(val => val.trim()).filter(Boolean)
                                      })}
                                      placeholder="cyan, obsidian black"
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                  </div>

                                  {/* Details field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"details" (comma separated):</span>
                                    <textarea 
                                      value={(structuredPromptData.details || []).join(", ")} 
                                      onChange={(e) => setStructuredPromptData({
                                        ...structuredPromptData, 
                                        details: e.target.value.split(",").map(val => val.trim()).filter(Boolean)
                                      })}
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-1 text-[11px] font-mono text-zinc-400 focus:border-cyan-500/50 focus:outline-none h-14 resize-none leading-normal"
                                      placeholder="hud grids, laser particles"
                                    />
                                  </div>

                                  {/* Negative Prompt field */}
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] text-zinc-500 font-mono">"negative_prompt":</span>
                                    <input 
                                      type="text" 
                                      value={structuredPromptData.negative_prompt || ""} 
                                      onChange={(e) => setStructuredPromptData({...structuredPromptData, negative_prompt: e.target.value})}
                                      className="w-full bg-[#030508] border border-gray-850 rounded px-2 py-0.5 text-[11px] font-mono text-zinc-550 focus:border-cyan-500/50 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Reset Structured Prompt */}
                                <div className="flex items-center justify-between pt-1 border-t border-gray-900/40 text-[9.5px] font-mono text-zinc-500">
                                  <span>Schema Verified ✓</span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setStructuredPromptData(null);
                                      setUsePromptToJson(false);
                                    }} 
                                    className="text-[9px] px-1.5 py-0.5 bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-805 rounded cursor-pointer transition-all hover:bg-zinc-850"
                                  >
                                    Reset Schema
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <VideoDetectionModule 
                            inputText={imagePrompt}
                            onTextAppend={(text) => setImagePrompt(prev => prev + text)}
                            accentColor={physicsModeActive ? "cyan" : isCodeModeActive ? "purple" : "emerald"}
                          />

                          <button
                            onClick={handleGenerateImage}
                            disabled={imgRunning || (!imagePrompt.trim() && (!usePromptToJson || !structuredPromptData))}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center space-x-2 border cursor-pointer ${
                              (imagePrompt.trim() || (usePromptToJson && structuredPromptData)) && !imgRunning
                                ? "bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 hover:shadow-[0_0_15px_rgba(6,180,212,0.35)]"
                                : "bg-gray-850 border-gray-800 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <ImageIcon className="w-4 h-4 shrink-0" />
                            <span>{imgRunning ? "Generating Image..." : usePromptToJson ? "Generate Visual from JSON 🚀" : "Generate Asset"}</span>
                          </button>
                        </div>

                        {/* Image result card */}
                        <AnimatePresence>
                          {generatedImg && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="p-2 border border-gray-850 bg-[#06080d] rounded-xl space-y-2"
                            >
                              <div className="relative group overflow-hidden rounded-lg">
                                {imgElementLoading && (
                                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                                      Rendering Visual...
                                    </span>
                                  </div>
                                )}
                                <img 
                                  src={generatedImg} 
                                  alt="Generated Asset" 
                                  className={`w-full h-auto rounded-lg object-contain bg-[#030508] border border-gray-900/30 transition-all duration-300 ${
                                    imgRatio === "16:9" 
                                      ? "aspect-video" 
                                      : imgRatio === "9:16" 
                                      ? "aspect-[9/16]" 
                                      : imgRatio === "4:3" 
                                      ? "aspect-[4/3]" 
                                      : "aspect-square"
                                  } ${imgElementLoading ? "opacity-30 scale-95" : "opacity-100 scale-100"}`}
                                  referrerPolicy="no-referrer"
                                  onLoad={() => setImgElementLoading(false)}
                                  onError={(e) => {
                                    setImgElementLoading(false);
                                    const target = e.currentTarget;
                                    
                                    // Prevent infinite reload loop
                                    if (!target.dataset.fallbackCount) {
                                      target.dataset.fallbackCount = "1";
                                      setImgElementLoading(true);
                                      const fallback = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?seed=${Math.floor(Math.random() * 99999)}`;
                                      console.log("Flux image load failed. Attempting clean Pollinations standard fallback:", fallback);
                                      setGeneratedImg(fallback);
                                    } else if (target.dataset.fallbackCount === "1") {
                                      target.dataset.fallbackCount = "2";
                                      setImgElementLoading(true);
                                      const fallback = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?model=turbo&seed=${Math.floor(Math.random() * 99999)}`;
                                      console.log("Standard Pollinations failed. Attempting turbo model fallback:", fallback);
                                      setGeneratedImg(fallback);
                                    } else if (target.dataset.fallbackCount === "2") {
                                      target.dataset.fallbackCount = "3";
                                      const fallback = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80";
                                      console.log("All prompt fallbacks failed. Loading beautiful default abstract art:", fallback);
                                      setGeneratedImg(fallback);
                                    }
                                  }}
                                />
                                <a
                                  href={generatedImg}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white hover:text-cyan-400 rounded p-1.5 border border-white/10 transition-all text-[10px]"
                                  title="View Full Resolution"
                                >
                                  ↗
                                </a>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => {
                                    // Set prompt input for the main chatbot prompt
                                    setPromptInput(prev => prev ? prev + `\n\n[Reference Image: ${generatedImg}]` : `Review this generated visual schema detailing: [Asset linked: ${generatedImg}]`);
                                  }}
                                  className="bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/20 text-[9.5px] font-mono py-1.5 rounded cursor-pointer transition-all uppercase tracking-wide text-center"
                                >
                                  Import to Prompt
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = generatedImg;
                                    link.download = "synthesized-artifact.png";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/40 text-[9.5px] font-mono py-1.5 rounded cursor-pointer transition-all uppercase tracking-wide text-center"
                                >
                                  Save Asset
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {imgError && (
                            <div className="p-3 text-[11px] text-rose-400 bg-rose-950/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed">
                              {imgError}
                            </div>
                          )}
                        </AnimatePresence>

                        {/* Sessions Gallery Strip */}
                        {imgHistory.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-900/60">
                            <div className="flex justify-between items-center select-none">
                              <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-semibold">
                                🌌 Sessions Asset Gallery ({imgHistory.length})
                              </span>
                              <button
                                onClick={() => setImgHistory([])}
                                className="text-[8px] font-mono text-rose-500/70 hover:text-rose-400 transition-all cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                              {imgHistory.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setImgElementLoading(true);
                                    setGeneratedImg(url);
                                  }}
                                  className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border relative transition-all group ${
                                    generatedImg === url
                                      ? "border-cyan-500 shadow-[0_0_8px_rgba(6,180,212,0.4)]"
                                      : "border-gray-850 hover:border-gray-700"
                                  }`}
                                >
                                  <img 
                                    src={url} 
                                    alt={`History ${i}`} 
                                    className="w-full h-full object-cover bg-black"
                                    referrerPolicy="no-referrer"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                          Ingest screenshots, layouts, architectural drawings or logs. Our backend scans and indexes design hierarchies and visual nodes.
                        </p>

                        <div className="space-y-1.5 text-left">
                          <label className={`text-[8.5px] uppercase tracking-wider font-mono font-bold ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'} block`}>
                            Vision Scanner Target Mode
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-gray-900/40">
                            {[
                              { id: "general", label: "General Visual", desc: "Scene details & colors" },
                              { id: "ui", label: "UI / React Clone", desc: "Converts mockup to code" },
                              { id: "ocr", label: "Text / Logs OCR", desc: "Transcribes files verbatim" },
                              { id: "diagram", label: "Diagram / Flow", desc: "Deconstructs flowchart nodes" }
                            ].map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setScanMode(item.id as any)}
                                className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                                  scanMode === item.id
                                    ? isCodeModeActive
                                      ? "bg-purple-950/40 border border-purple-500/30 text-purple-200"
                                      : "bg-emerald-950/40 border border-emerald-500/30 text-emerald-200"
                                    : "bg-[#0b0f19] border border-transparent hover:bg-slate-900 text-zinc-400"
                                }`}
                              >
                                <span className="block text-[9.5px] font-bold font-mono text-center">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {!scanAttachment ? (
                          <label className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-[#05070c]/50 hover:bg-[#070b14]/55 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                            <FileUp className="w-7 h-7 text-cyan-400 mb-2" />
                            <span className="text-xs font-bold text-neutral-250">Drop or browse scheme</span>
                            <span className="text-[9.5px] text-zinc-550 font-mono mt-1">Accepts schemas & diagrams</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleAttachmentUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="space-y-3.5">
                            <div className="border border-gray-850 bg-slate-950/80 rounded-xl p-2 relative">
                              <img 
                                src={scanAttachment.previewUrl} 
                                alt="Scheme preview" 
                                className="w-full h-auto max-h-36 object-contain rounded-lg bg-black/40"
                              />
                              <button
                                type="button"
                                onClick={() => setScanAttachment(null)}
                                className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleScanImage}
                                disabled={scanRunning}
                                className={`flex-grow py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 border ${
                                  scanRunning
                                    ? "bg-slate-900 border-slate-800 text-gray-500 cursor-not-allowed animate-pulse"
                                    : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 cursor-pointer"
                                }`}
                              >
                                <Activity className="w-3.5 h-3.5 shrink-0" />
                                <span>{scanRunning ? "Scanning Node..." : "Scan Schematic"}</span>
                              </button>
                              
                              <button
                                onClick={() => setScanAttachment(null)}
                                className="px-3 py-2 rounded-xl bg-slate-950 border border-gray-850 hover:bg-slate-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title="Clear Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {scanRunning && (
                          <div className="p-3 bg-slate-950 border border-emerald-900/30 rounded-xl space-y-1.5 text-center animate-pulse">
                            <Activity className="w-4 h-4 text-emerald-450 animate-spin mx-auto" />
                            <span className="block text-[9.5px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Autonomous Vision Diagnostic...</span>
                          </div>
                        )}

                        {scanResult && (
                          <div className="space-y-3">
                            <div className="p-3 bg-slate-950 border border-gray-850 rounded-xl h-44 overflow-y-auto scrollbar-thin text-left">
                              <span className="block text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold border-b border-gray-900 pb-1.5 mb-2">Visual Report Logs</span>
                              <div className="text-[10px] text-zinc-300 leading-normal font-mono whitespace-pre-wrap select-text">
                                {scanResult}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setPromptInput(prev => {
                                  const textWithFeedback = `Review this scanned layout report findings:\n${scanResult}\n\n${prev}`;
                                  return textWithFeedback;
                                });
                              }}
                              className="w-full py-2 bg-gradient-to-r from-[#0d121f] to-[#120a2e] hover:from-cyan-950/20 hover:to-purple-950/20 text-cyan-400 hover:text-white border border-cyan-800/25 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Inject Results to prompt
                            </button>
                          </div>
                        )}

                        {scanError && (
                          <div className="p-3 text-[10px] text-rose-400 bg-rose-950/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed text-left">
                            {scanError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Document Summarizer Panel */}
                {activeTab === "document" && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Upload system log files, design outlines, or raw text blocks. Gemini extracts theses and actionable insights in real-time.
                    </p>

                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 hover:border-emerald-500/40 rounded-xl bg-slate-950/40 text-center cursor-pointer group transition-colors">
                        <FileUp className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 mb-2 transition-colors" />
                        <span className="text-xs text-neutral-300 font-semibold">Select document text log</span>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono">(.txt, .md size limits)</span>
                        <input
                          type="file"
                          accept=".txt,.md,.json"
                          onChange={handleUploadDocumentText}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <AnimatePresence>
                      {summaryRunning && (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">Running Summarizer...</p>
                        </div>
                      )}

                      {summaryOutput && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2.5"
                        >
                          <div className="p-3 border border-gray-850 bg-slate-950 rounded-xl max-h-[160px] overflow-y-auto shrink-0 scrollbar-thin">
                            <span className="text-[9px] font-mono text-slate-500 block mb-1">Doc Title: {docFileName || 'Parsed file'}</span>
                            <p className="text-neutral-300 text-[11px] leading-relaxed whitespace-pre-wrap">{summaryOutput}</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              // Feed output directly to the prompt block
                              setPromptInput(`Analyze the following synthesized document outputs:\n\n${summaryOutput}`);
                            }}
                            className="w-full py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-[10px] text-neutral-300 hover:text-white transition-colors"
                          >
                            Inject summary into prompt field
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 4. Audio Transcriber Panel */}
                {activeTab === "audio" && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Simulate a voice dictation recording. Select a context theme, and our pipeline transcription returns formatted speech text.
                    </p>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wide text-gray-500 font-mono">Dictation Topic</label>
                        <input
                          type="text"
                          value={audioTopicInput}
                          onChange={(e) => setAudioTopicInput(e.target.value)}
                          placeholder="EV hypercar aerodynamic performance metrics..."
                          className="w-full bg-slate-950 border border-gray-850 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleTranscribeAudioMessage}
                        disabled={audioRunning}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                          audioRunning
                            ? "bg-slate-900 border-slate-800 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-500 border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] text-white"
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 shrink-0 ${audioRunning ? 'animate-pulse' : ''}`} />
                        <span>{audioRunning ? "Recording & Transcribing..." : "Simulate Audio Prompt"}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {transcribedText && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <div className="p-3 border border-purple-900/30 bg-purple-950/10 rounded-xl">
                            <span className="text-[9px] uppercase tracking-wider font-mono text-purple-400 block mb-1">Transcribed Dictation</span>
                            <p className="text-neutral-300 text-[11px] leading-relaxed italic">"{transcribedText}"</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setPromptInput(transcribedText);
                            }}
                            className="w-full py-1.5 rounded-lg border border-purple-900/40 bg-purple-950/10 hover:bg-purple-900/20 text-[10px] text-purple-300 transition-colors"
                          >
                            Use as current prompt text
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 5. Ultra-Pro VFX & Animation Engine Override Panel (Senior VFX Supervisor Console) */}
                {activeTab === "vfx" && (
                  <div className="space-y-4">
                    {/* Diagnostic Monitor Panel */}
                    <div className={`p-3 border rounded-xl relative overflow-hidden backdrop-blur-md ${
                      isCodeModeActive 
                        ? "bg-purple-950/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                        : "bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <Cpu className={`w-3.5 h-3.5 ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`} />
                          <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-white">Engine Telemetry</span>
                        </div>
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isCodeModeActive ? 'bg-purple-500/10 text-purple-300' : 'bg-emerald-500/10 text-emerald-300'
                        }`}>
                          {isCodeModeActive ? "ULTRA-PRO ENABLED" : "AI STD RUNTIME"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-zinc-400 font-normal">
                        <div className="p-1.5 bg-slate-950/80 rounded border border-gray-900">
                          <span className="block text-gray-550 uppercase text-[7.5px] tracking-tight">Active Framerate</span>
                          <span className={`text-[10.5px] font-bold ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'}`}>
                            {telemetryFps} FPS
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-950/80 rounded border border-gray-900">
                          <span className="block text-gray-550 uppercase text-[7.5px] tracking-tight">Frame Interval</span>
                          <span className="text-[10.5px] font-bold text-white">
                            {(1000 / telemetryFps).toFixed(2)} ms
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-950/80 rounded border border-gray-900">
                          <span className="block text-gray-550 uppercase text-[7.5px] tracking-tight">Shading Engine</span>
                          <span className="text-[9.5px] text-zinc-300 font-bold truncate">
                            {vfxShaderMode === "path-traced" ? "Path-Traced" : "Raster Ambient"}
                          </span>
                        </div>
                        <div className="p-1.5 bg-slate-950/80 rounded border border-gray-900">
                          <span className="block text-gray-550 uppercase text-[7.5px] tracking-tight">VRAM Heap Cache</span>
                          <span className="text-[10.5px] text-zinc-300 font-bold">{telemetryVram} MB</span>
                        </div>
                      </div>

                      {/* Mock Real-time Visual Trace Line Chart */}
                      <div className="mt-2.5 h-6 w-full bg-slate-950/90 rounded border border-gray-900 flex items-center justify-center p-1 relative overflow-hidden">
                        <svg className="w-full h-full text-purple-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                          <path
                            d={telemetryPath}
                            fill="none"
                            stroke={isCodeModeActive ? "rgba(168,85,247,0.75)" : "rgba(168,85,247,0.75)"}
                            strokeWidth="1"
                            className="transition-all duration-150"
                          />
                        </svg>
                        <span className="absolute bottom-0.5 right-1 text-[6.5px] text-zinc-500 font-mono tracking-widest uppercase">LIVE OSCILLOSCOPE</span>
                      </div>
                    </div>
                                      {/* Master Sub-Tab Selector and Specs tabs removed – direct Overrides HUD render */}
                    <div className="space-y-3.5">
                      <div className="border-t border-gray-900/60 pt-2">
                        <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block mb-2">Pillar 1: Color Space Theme Override</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: "stellar-orbit", label: "Stellar Purple", color: "bg-purple-600" },
                            { id: "aurora-emerald", label: "Aurora Emerald", color: "bg-emerald-500" },
                            { id: "hyper-cyan", label: "Hyper Cyan", color: "bg-cyan-400" },
                            { id: "solar-flare", label: "Solar Flare", color: "bg-orange-500" },
                            { id: "monochrome", label: "Monochrome Pass", color: "bg-slate-400" }
                          ].map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => setVfxColorPreset(preset.id)}
                              className={`px-2 py-1 rounded text-[9px] font-medium transition-all flex items-center space-x-1 border cursor-pointer ${
                                vfxColorPreset === preset.id
                                  ? isCodeModeActive
                                    ? "bg-purple-600/15 border-purple-500 text-purple-200"
                                    : "bg-emerald-500/15 border-emerald-500 text-emerald-200"
                                  : "border-gray-850 bg-slate-900/40 text-gray-450 hover:text-white"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${preset.color}`} />
                              <span>{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shading Model Select */}
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block">Render Pipeline Shading Mode</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setVfxShaderMode("path-traced")}
                            className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                              vfxShaderMode === "path-traced"
                                ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                : "bg-slate-950 border-gray-850 text-gray-500"
                            }`}
                          >
                            Path-Traced Space Dust
                          </button>
                          <button
                            onClick={() => setVfxShaderMode("ambient")}
                            className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                              vfxShaderMode === "ambient"
                                ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white"
                            }`}
                          >
                            Ambient Nebula Grid
                          </button>
                        </div>
                      </div>

                      {/* Pillar 2: Motion, Fluidity & Timing */}
                      <div className="border-t border-gray-900/60 pt-3.5 space-y-3">
                        <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block">Pillar 2: Motion & Timing Overrides</span>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Target Framerate Limit</span>
                            <span className="text-right text-gray-300 font-bold">{vfxFpsCap === 999 ? "Unlimited VSync" : `${vfxFpsCap} FPS`}</span>
                          </div>
                          <div className="flex gap-1">
                            {[30, 60, 120, 240, 999].map(fps => (
                              <button
                                key={fps}
                                onClick={() => setVfxFpsCap(fps)}
                                className={`flex-grow py-1 rounded text-[9px] font-mono border cursor-pointer ${
                                  vfxFpsCap === fps
                                    ? isCodeModeActive ? "bg-purple-600 border-purple-500 text-white" : "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                                    : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white"
                                }`}
                              >
                                {fps === 999 ? "VSync" : fps}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Trail Width slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Cursor Trace Ribbon Width</span>
                            <span className="text-gray-300">{vfxTrailWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="20"
                            value={vfxTrailWidth}
                            onChange={(e) => setVfxTrailWidth(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>

                        {/* Trail Length slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Cursor Trace Ribbon Length (Taper)</span>
                            <span className="text-gray-300">{vfxTrailLength} points</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={vfxTrailLength}
                            onChange={(e) => setVfxTrailLength(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>
                      </div>

                      {/* Pillar 3 & 4: Particle Physics & Optimization */}
                      <div className="border-t border-gray-900/60 pt-3.5 space-y-3">
                        <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block">Pillar 3 & 4: Physics & Space Overrides</span>
                        
                        {/* Collision burst particles on click slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Supernova Particle Burst Count (On Click)</span>
                            <span className="text-gray-300">{vfxParticleCount} stardust particles</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={vfxParticleCount}
                            onChange={(e) => setVfxParticleCount(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>

                        {/* Friction parameter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Physics Drag Friction Coefficient</span>
                            <span className="text-gray-300">{(vfxPhysicsFriction * 100).toFixed(0)}% resistance</span>
                          </div>
                          <input
                            type="range"
                            min="90"
                            max="99"
                            value={vfxPhysicsFriction * 100}
                            onChange={(e) => setVfxPhysicsFriction(Number(e.target.value) / 100)}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>

                        {/* Constellation lattice distance slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Constellation Lattice Link Boundary</span>
                            <span className="text-gray-300">{vfxLatticeDist}px radius</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="240"
                            value={vfxLatticeDist}
                            onChange={(e) => setVfxLatticeDist(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>
                      </div>

                      {/* Post-Processing effects */}
                      <div className="border-t border-gray-900/60 pt-3.5 space-y-3">
                        <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block">Pillar 5: Post-Processing Overrides</span>
                        
                        {/* Bloom Glow size slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Volumetric Mouse Glow Bloom Radius</span>
                            <span className="text-gray-300">{vfxBloomGlow * 15}px</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="30"
                            value={vfxBloomGlow}
                            onChange={(e) => setVfxBloomGlow(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>

                        {/* Chromatic aberration splits px */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-zinc-500">Chromatic Aberration Channel Offset</span>
                            <span className="text-gray-300">{vfxAberration}px RGB separation</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="12"
                            value={vfxAberration}
                            onChange={(e) => setVfxAberration(Number(e.target.value))}
                            className={`w-full accent-current cursor-pointer ${isCodeModeActive ? 'text-purple-500' : 'text-emerald-500'}`}
                          />
                        </div>

                        {/* Interactive Audio Feedback Synthesis Toggle */}
                        <div className="flex items-center justify-between border-t border-gray-900/40 pt-2.5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">Holographic Audio Synth</span>
                            <span className="text-[8px] font-mono text-zinc-500 max-w-[190px]">Synthesizes real-time frequency chimes and cosmic scan sweep triggers</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVfxSoundEnabled(!vfxSoundEnabled)}
                            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
                              vfxSoundEnabled 
                                ? (isCodeModeActive ? "bg-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]") 
                                : "bg-neutral-800"
                            }`}
                            title="Toggle Audio Synthesis Core"
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 h-3.5 transform rounded-full bg-neutral-200 shadow ring-0 transition duration-300 ease-in-out ${
                                vfxSoundEnabled ? "translate-x-3.5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Diagnostics Action Button */}
                      <button
                        onClick={() => {
                          const clickEvent = new MouseEvent("click", {
                            clientX: window.innerWidth / 2,
                            clientY: window.innerHeight / 2,
                            bubbles: true
                          });
                          window.dispatchEvent(clickEvent);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center space-x-2 border cursor-pointer mt-2 ${
                          isCodeModeActive
                            ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                            : "bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] text-black border-emerald-450 font-display font-extrabold"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Trigger Direct Supernova Burst</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. History & Passcode Session Database Panel */}
                {activeTab === "history" && (
                  <div className="space-y-4 text-left">
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      Durable multi-session database. All chat flows are securely partitioned by your unique passcode identity.
                    </p>

                    {/* Passcode Login HUD */}
                    <div className="p-3 bg-slate-950/90 border border-gray-850 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Identity Login</span>
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
                            syncStatus === "syncing" ? "bg-amber-400" :
                            syncStatus === "synced" ? "bg-emerald-400" :
                            syncStatus === "error" ? "bg-rose-500" : "bg-cyan-400"
                          }`} />
                          <span className={`text-[8px] uppercase tracking-wider font-extrabold ${
                            syncStatus === "syncing" ? "text-amber-400" :
                            syncStatus === "synced" ? "text-emerald-400" :
                            syncStatus === "error" ? "text-rose-500" : "text-cyan-400"
                          }`}>
                            {syncStatus === "syncing" && "Device Syncing..."}
                            {syncStatus === "synced" && "Cloud Synchronized"}
                            {syncStatus === "error" && "Offline / Sync Error"}
                            {syncStatus === "idle" && "Active Session Core"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono">
                        <div className="text-[11px] text-zinc-300">
                          Current ID: <span className="text-emerald-400 font-extrabold tracking-wider">{userPasscode || "None"}</span>
                        </div>
                        
                        {/* Interactive switch form */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-[8.5px] uppercase text-zinc-500 tracking-wider block">Login / Switch ID (11 chars)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              placeholder="e.g. aB2x-8pYk-9Q7"
                              id="history_passcode_input"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const btn = document.getElementById("history_login_btn");
                                  btn?.click();
                                }
                              }}
                              className="bg-black/60 border border-gray-850 hover:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 flex-grow"
                            />
                            <button
                              id="history_login_btn"
                              onClick={() => {
                                const inputEl = document.getElementById("history_passcode_input") as HTMLInputElement;
                                if (!inputEl) return;
                                const rawVal = inputEl.value.trim();
                                const cleanCode = rawVal.replace(/[^A-Za-z0-9]/g, "");
                                if (cleanCode.length !== 11) {
                                  alert("Please enter a valid 11-character high-entropy passcode.");
                                  return;
                                }
                                syncAndSwitchIdentity(cleanCode);
                                inputEl.value = "";
                              }}
                              className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(6,180,212,0.15)] shrink-0"
                            >
                              Login
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Session Action */}
                    <button
                      onClick={handleCreateNewSession}
                      className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-slate-900/40 rounded-xl text-xs font-mono text-zinc-400 hover:text-cyan-400 font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start New Chat Session</span>
                    </button>

                    {/* Sessions Database List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1 text-left">
                      <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold pb-1 border-b border-gray-900/40">Chat Sessions ({sessions.length})</span>
                      
                      {sessions.length === 0 ? (
                        <div className="text-center py-6 text-zinc-600 font-mono text-[10px]">
                          No sessions stored for this ID.
                        </div>
                      ) : (
                        sessions.map(s => {
                          const isActive = s.id === currentSessionId;
                          
                          let totalMsgs = 0;
                          if (s.histories) {
                            for (const key in s.histories) {
                              totalMsgs += (s.histories[key] || []).length;
                            }
                          }

                          return (
                            <div
                              key={s.id}
                              onClick={() => handleSelectSession(s.id)}
                              className={`p-3 rounded-xl border transition-all relative group flex flex-col justify-between cursor-pointer ${
                                isActive 
                                  ? "bg-[#0b1322] border-cyan-500/35 shadow-[0_0_12px_rgba(6,180,212,0.1)] text-white" 
                                  : "bg-[#05070c] border-neutral-900 hover:border-gray-800 text-zinc-400 hover:bg-slate-900/20"
                              }`}
                            >
                              <div className="flex items-start justify-between min-w-0 pr-12">
                                <div className="space-y-1 min-w-0 flex-grow">
                                  <div className="flex items-center space-x-1.5 min-w-0">
                                    <span className="text-xs font-bold truncate block select-text">
                                      {s.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-500">
                                    <span>{s.timestamp}</span>
                                    <span>•</span>
                                    <span className={isActive ? "text-cyan-400/80 font-bold" : ""}>
                                      {totalMsgs} logs
                                    </span>
                                  </div>
                                </div>

                                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newTitle = prompt("Enter new name for this session:", s.name);
                                      if (newTitle !== null) {
                                        handleRenameSession(s.id, newTitle);
                                      }
                                    }}
                                    className="p-1 rounded bg-[#090d16] border border-gray-850 text-zinc-500 hover:text-cyan-400 transition-colors"
                                    title="Rename Session"
                                  >
                                    <PenTool className="w-3 h-3" />
                                  </button>
                                  
                                  <button
                                    onClick={(e) => handleDeleteSession(s.id, e)}
                                    disabled={sessions.length <= 1}
                                    className={`p-1 rounded bg-[#090d16] border border-gray-850 transition-colors ${
                                      sessions.length <= 1 
                                        ? "text-zinc-800 cursor-not-allowed opacity-30" 
                                        : "text-zinc-500 hover:text-rose-400"
                                    }`}
                                    title="Delete Session"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 7. Cognitive Cartography panel */}
                {activeTab === "cartography" && (() => {
                  const topology = getCartographyTopology();
                  const selectedNodeData = topology.nodes.find(n => n.id === selectedCartNode);

                  return (
                    <div className="space-y-4 text-left">
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                        Cognitive Cartography maps the real-time argumentative topology and safety reasoning of the live swarm debate.
                      </p>

                      {/* SVG Force-directed Visualizer Canvas */}
                      <div className="relative h-[310px] w-full rounded-2xl border border-purple-500/30 bg-black/80 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center overflow-hidden">
                        
                        {/* Background laser/radar grid ring overlays */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                          <div className="w-[170px] h-[170px] rounded-full border border-dashed border-purple-500/60 animate-[spin_40s_linear_infinite]" />
                          <div className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-cyan-500/40 animate-[spin_60s_linear_infinite_reverse]" />
                        </div>

                        {/* Node map SVG */}
                        <svg className="w-full h-full relative z-10" viewBox="0 0 320 306">
                          <defs>
                            <marker id="arrow-supports" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                              <path d="M0,0 L10,5 L0,10 z" fill="#10b981" />
                            </marker>
                            <marker id="arrow-contradicts" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                              <path d="M0,0 L10,5 L0,10 z" fill="#ef4444" />
                            </marker>
                            <marker id="arrow-quantifies" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                              <path d="M0,0 L10,5 L0,10 z" fill="#06b6d4" />
                            </marker>
                            <marker id="arrow-refutes" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                              <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" />
                            </marker>
                          </defs>

                          {/* Render Relationship Link lines */}
                          {topology.links.map((link, lIdx) => {
                            const sourceNode = topology.nodes.find(n => n.id === link.source);
                            const targetNode = topology.nodes.find(n => n.id === link.target);
                            if (!sourceNode || !targetNode) return null;

                            const isSelected = selectedCartNode === link.source || selectedCartNode === link.target;
                            const strokeColor = 
                              link.relationship === "supports" ? "rgba(16,185,129,0.3)" : 
                              link.relationship === "contradicts" ? "rgba(239,68,68,0.3)" :
                              link.relationship === "quantifies" ? "rgba(6,182,212,0.3)" : "rgba(245,158,11,0.3)";

                            const markerId = `arrow-${link.relationship}`;

                            return (
                              <g key={`topo-link-${lIdx}`}>
                                <line 
                                  x1={sourceNode.x} 
                                  y1={sourceNode.y} 
                                  x2={targetNode.x} 
                                  y2={targetNode.y}
                                  stroke={isSelected ? strokeColor.replace("0.3", "0.8") : strokeColor}
                                  strokeWidth={isSelected ? 1.8 : 1}
                                  strokeDasharray={link.relationship === "contradicts" || link.relationship === "refutes" ? "4 3" : "none"}
                                  markerEnd={`url(#${markerId})`}
                                />
                                {isSelected && (
                                  <line 
                                    x1={sourceNode.x} 
                                    y1={sourceNode.y} 
                                    x2={targetNode.x} 
                                    y2={targetNode.y}
                                    stroke="rgba(168,85,247,0.3)"
                                    strokeWidth={4}
                                    className="animate-pulse"
                                  />
                                )}
                              </g>
                            );
                          })}

                          {/* Render Nodes */}
                          {topology.nodes.map((node, nIdx) => {
                            const isSelected = selectedCartNode === node.id;
                            
                            // Style nodes elegantly by type
                            const nodeColor = 
                              node.type === "root" ? "rgba(168,85,247,0.85)" : 
                              node.type === "agent" ? "rgba(6,182,212,0.8)" : "rgba(59,130,246,0.75)";

                            const nodeBorderColor = 
                              node.type === "root" ? "rgb(168,85,247)" :
                              node.type === "agent" ? "rgb(6,182,212)" : "rgb(59,130,246)";

                            const r = node.type === "root" ? 14 : node.type === "agent" ? 10 : 8;

                            return (
                              <g 
                                key={`topo-node-${node.id}`}
                                className="cursor-pointer group"
                                onClick={() => setSelectedCartNode(selectedCartNode === node.id ? null : node.id)}
                              >
                                {isSelected && (
                                  <circle 
                                    cx={node.x} 
                                    cy={node.y} 
                                    r={r + 5} 
                                    fill="transparent" 
                                    stroke="rgb(168,85,247)" 
                                    strokeWidth={1.5}
                                    className="animate-ping"
                                    opacity={0.65}
                                  />
                                )}
                                <circle 
                                  cx={node.x} 
                                  cy={node.y} 
                                  r={r} 
                                  fill={nodeColor} 
                                  stroke={nodeBorderColor}
                                  strokeWidth={isSelected ? 2 : 1}
                                  className="transition-transform group-hover:scale-110 duration-200"
                                />
                                <text 
                                  x={node.x} 
                                  y={node.y - (r + 4)} 
                                  textAnchor="middle" 
                                  fill="#f4f4f5" 
                                  fontSize="7" 
                                  fontWeight={isSelected ? "900" : "500"}
                                  className="select-none filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                                >
                                  {node.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Tiny HUD Overlay legend */}
                        <div className="absolute bottom-2.5 right-3 text-[7.5px] font-mono text-zinc-500 bg-black/60 border border-zinc-900 px-2 py-1 rounded flex items-center space-x-2 gap-1 pointer-events-none select-none">
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" /> Root</span>
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> Agent</span>
                          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> Concept</span>
                        </div>
                      </div>

                      {/* Node Inspector Sheet */}
                      {selectedNodeData ? (
                        <div className="p-4 rounded-xl border border-purple-500/30 bg-[#090514]/95 space-y-3 shadow-md">
                          <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                            <span className="text-[10px] uppercase font-mono font-black text-purple-400 tracking-widest">{selectedNodeData.type} Node Insight</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                              Confidence: {selectedNodeData.confidence}%
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-white leading-normal">{selectedNodeData.label}</h4>
                            <p className="text-[10.5px] text-zinc-300 leading-relaxed font-sans">
                              {selectedNodeData.type === "root" && `Focus of the current multi-perspective discussion segment is mapped in real-time. Live scientific consensus index evaluates to 89.2%.`}
                              {selectedNodeData.type === "agent" && `Participating specialist model offering continuous reasoning trajectories toward scientific target safety.`}
                              {selectedNodeData.type === "concept" && `Extracted scientific pillar or hypothetical metric used as a cornerstone variable in arguments.`}
                            </p>
                          </div>
                          
                          {/* Node relationships list */}
                          {(() => {
                            const relations = topology.links.filter(l => l.source === selectedNodeData.id || l.target === selectedNodeData.id);
                            if (relations.length > 0) {
                              return (
                                <div className="space-y-1.5 pt-1.5 border-t border-purple-950/20 text-left">
                                  <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Topology Bridges ({relations.length})</span>
                                  <div className="space-y-1">
                                    {relations.map((rel, rIdx) => {
                                      const relatedNode = topology.nodes.find(n => n.id === (rel.source === selectedNodeData.id ? rel.target : rel.source));
                                      if (!relatedNode) return null;
                                      return (
                                        <div key={rIdx} className="flex items-center justify-between text-[10px] font-sans bg-slate-950/40 px-2 py-1 rounded border border-zinc-900">
                                          <span className="text-zinc-400">Connection to <strong className="text-white font-medium">{relatedNode.label}</strong></span>
                                          <span className={`text-[8px] font-mono uppercase font-black tracking-wider px-1 rounded-sm ${
                                            rel.relationship === "supports" ? "text-emerald-400 bg-emerald-950/40" : 
                                            rel.relationship === "contradicts" ? "text-rose-400 bg-rose-950/40" :
                                            rel.relationship === "quantifies" ? "text-cyan-400 bg-cyan-950/40" : "text-amber-400 bg-amber-950/40"
                                          }`}>{rel.relationship}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-gray-800 text-center text-zinc-500 text-[11px] font-sans">
                          Click any node on the topology grid to analyze its exact logical connection vector, confidence matrix, and relative weight indices.
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

            </div>

            {/* Sidebar Footer badge / Config drawer */}
            <div className="border-t border-gray-850 bg-slate-950/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center space-x-2 text-[11.5px] font-mono hover:text-white transition-colors cursor-pointer text-left focus:outline-none"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    serverStatus === "online" 
                      ? "bg-emerald-500 animate-pulse" 
                      : serverStatus === "checking" 
                      ? "bg-amber-400 animate-pulse" 
                      : "bg-rose-500"
                  }`} />
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    Sync: {serverStatus === "online" ? "Online" : serverStatus === "checking" ? "Verifying..." : "Offline"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 uppercase tracking-widest border border-emerald-500/10 hover:border-emerald-500/35 bg-emerald-500/[0.02] px-1.5 py-0.5 rounded transition-all cursor-pointer"
                >
                  {showConfig ? "Collapse" : "Configure Connection"}
                </button>
              </div>

              {showConfig && (
                <div className="space-y-3 pt-1.5 border-t border-gray-900/60 transition-all text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9.5px] uppercase tracking-wider text-amber-500 font-mono font-bold block">
                        🔒 Target Origin [LOCKED]
                      </label>
                      <span className="text-[8px] font-mono text-cyan-300 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        Failover: Active
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={backendUrl}
                        disabled
                        placeholder="https://..."
                        className="flex-grow bg-slate-950/80 border border-gray-850/50 rounded-lg p-2 font-mono text-[10px] text-zinc-500 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-925 p-2.5 rounded-lg space-y-1.5 text-[9px] font-mono leading-normal text-zinc-400">
                      <p>
                        The backend target origin is locked to preserve connection integrity.
                      </p>
                      <p className="border-t border-zinc-900/80 pt-1.5 text-zinc-500">
                        If the primary host experience latency or fails, requests stream automatically to the secondary fallback origin:
                      </p>
                      <span className="block p-1 bg-black text-cyan-400 select-all font-semibold rounded text-[8.5px] truncate">
                        https://8cd48335.aiworkspace-f4d.pages.dev
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-650 pt-1">
                <span className="flex items-center gap-1 text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/55" />
                  Independent Sync Node
                </span>
                <span className="text-gray-600">v1.2.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXCLUSIVE REDIRECTED INTERACTIVE AI CHATROOM DIALOG OVERLAY */}
      <AnimatePresence>
        {individualChatModelId && (() => {
          const selModel = models.find(m => m.id === individualChatModelId);
          if (!selModel) return null;
          const modelHistory = chatHistories[individualChatModelId] || [];
          const modelResp = responses[individualChatModelId] || { modelId: individualChatModelId, content: "", status: "idle" };
          const isPending = modelResp.status === "loading" || modelResp.status === "streaming";

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-[#030611] border border-zinc-850 rounded-2xl w-full max-w-3xl h-[640px] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] relative"
              >
                {/* Decorative neon colored track at top */}
                <div className={`h-1 bg-gradient-to-r ${selModel.accentColor}`} />

                {/* Header elements */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-[#060a16]">
                  <div className="flex items-center space-x-3 text-left">
                    <span className="text-2xl">{getModelAvatar(selModel.id, selModel.provider)}</span>
                    <div>
                      <div className="flex items-center space-x-2 animate-fade-in font-display">
                        <h3 className="font-extrabold text-sm text-zinc-150 tracking-tight leading-none">{selModel.name}</h3>
                        <span className="text-[7.5px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1 rounded uppercase">Live Link</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[400px] mt-1 font-sans">{selModel.description}</p>
                    </div>
                  </div>

                  {/* Right Header button elements */}
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono uppercase tracking-wider">{selModel.provider}</span>
                    <button
                      onClick={() => setIndividualChatModelId(null)}
                      className="p-1 px-2 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors text-zinc-400 font-sans text-xs flex items-center gap-1 cursor-pointer border border-transparent hover:border-zinc-800"
                    >
                      <span>✕</span>
                      <span className="text-[10px] font-mono uppercase">Close</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle status bar */}
                <div className="bg-[#05091a] border-b border-zinc-900/65 px-4 py-2 flex items-center justify-between text-[9.5px] font-mono text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>COGNITIVE SESSION SYNCHRONIZED GLOBALLY</span>
                  </div>
                  <div className="text-zinc-500 uppercase">
                    {modelHistory.length} Exchanges In Log
                  </div>
                </div>

                {/* Scrollable message window body */}
                <div 
                  ref={individualChatScrollRef}
                  className="flex-grow overflow-y-auto p-5 space-y-5 bg-[#02050c]/30 scrollbar-thin scrollbar-track-transparent text-left"
                >
                  {modelHistory.length === 0 && modelResp.status === "idle" ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/40 flex items-center justify-center text-xl">💬</div>
                      <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Isolated Thread Channel Initialized</p>
                      <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                        Start your exclusive chat thread with <strong>{selModel.name}</strong>. Ask follow-up queries, test boundary limits, or explore hypothetical scenarios. This dialogue stays globally synced with the main workspace!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modelHistory.map((msg, idx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div key={msg.id || idx} className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                            {!isUser && (
                              <span className="text-lg p-1.5 bg-zinc-950 rounded-lg border border-zinc-900 shrink-0 mt-0.5">{getModelAvatar(selModel.id, selModel.provider)}</span>
                            )}
                            <div className={`max-w-[85%] rounded-xl p-4 border text-[12px] leading-relaxed relative ${
                              isUser 
                                ? "bg-amber-950/10 border-amber-500/25 text-amber-200" 
                                : "bg-slate-950/80 border-zinc-900 text-zinc-300 animate-fade-in"
                            }`}>
                              <div className="flex justify-between items-center mb-1 text-[8px] font-mono font-black uppercase text-zinc-500 tracking-wider">
                                <span>{isUser ? "👤 USER DIALOGUE" : `🤖 ${selModel.name}`}</span>
                                <span className="opacity-70">{msg.timestamp}</span>
                              </div>
                              <div className="whitespace-pre-wrap font-sans">
                                {isUser ? msg.content : renderFormattedConsensusText(msg.content, physicsModeActive, handleSyncTelemetry)}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Stream loading placeholder */}
                      {modelResp.status === "loading" && (
                        <div className="flex justify-start items-start gap-2.5">
                          <span className="text-lg p-1.5 bg-zinc-950 rounded-lg border border-zinc-900 shrink-0 mt-0.5">{getModelAvatar(selModel.id, selModel.provider)}</span>
                          <div className="max-w-[85%] basis-[180px] bg-slate-950/80 border border-zinc-900 rounded-xl p-4 space-y-3">
                            <div className="h-2.5 bg-zinc-800/60 rounded-md animate-pulse w-[95%]" />
                            <div className="h-2.5 bg-zinc-800/60 rounded-md animate-pulse w-[80%]" />
                            <div className="h-2.5 bg-zinc-800/60 rounded-md animate-pulse w-[40%]" />
                          </div>
                        </div>
                      )}

                      {/* Active streaming text block */}
                      {modelResp.status === "streaming" && (
                        <div className="flex justify-start items-start gap-2.5">
                          <span className="text-lg p-1.5 bg-zinc-950 rounded-lg border border-zinc-900 shrink-0 mt-0.5">{getModelAvatar(selModel.id, selModel.provider)}</span>
                          <div className="max-w-[85%] bg-slate-950/80 border border-emerald-500/35 rounded-xl p-4 text-[12.5px]">
                            <div className="flex justify-between items-center mb-1.5 text-[8px] font-mono font-black uppercase text-emerald-400 tracking-wider">
                              <span>⚡ STREAMING RESPONSE</span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans text-zinc-200">
                              {renderFormattedConsensusText(modelResp.content, physicsModeActive, handleSyncTelemetry)}
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error state display block */}
                      {modelResp.status === "error" && (
                        <div className="flex justify-start items-start gap-2.5">
                          <span className="text-lg p-1.5 bg-zinc-950 rounded-lg border border-zinc-900 shrink-0 mt-0.5">{getModelAvatar(selModel.id, selModel.provider)}</span>
                          <div className="max-w-[85%] bg-rose-950/15 border border-rose-900/50 rounded-xl p-4 text-[12px] text-rose-300">
                            <p className="font-mono text-[9px] uppercase tracking-wider text-rose-400 font-bold mb-1">Transmission Error Occurred</p>
                            <p className="font-mono text-[10px]">{modelResp.error || "Host severed link or exhausted quota limits."}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Input Area and prompt panel */}
                <div className="p-4 border-t border-zinc-900 bg-slate-950/50 flex flex-col gap-2">
                  <div className="flex gap-2.5">
                    <textarea
                      value={individualChatInput}
                      onChange={(e) => setIndividualChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendIndividualChatMessage();
                        }
                      }}
                      placeholder={`Draft message to ${selModel.name}... (Press Enter to transmit)`}
                      className="flex-grow bg-slate-950 border border-zinc-850 hover:border-zinc-800 focus:border-cyan-500/40 rounded-xl p-3 text-xs text-zinc-150 placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-cyan-500/10 min-h-[50px] max-h-[120px] resize-none"
                    />
                    <button
                      onClick={handleSendIndividualChatMessage}
                      disabled={isPending || !individualChatInput.trim()}
                      className={`px-5 rounded-xl border flex items-center justify-center text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isPending || !individualChatInput.trim()
                          ? "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed"
                          : "bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,180,212,0.25)]"
                      }`}
                    >
                      {isPending ? "LINKING" : "TRANSMIT"}
                    </button>
                  </div>
                  <div className="text-[8px] font-mono text-zinc-600 text-left">
                    * The contents of this conversation thread are automatically saved. Closing this modal retains state globally.
                  </div>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Fullscreen Temporal Ripple Reality Flash Overlay */}
      <AnimatePresence>
        {replayFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "linear" }}
            className="fixed inset-0 z-[200] pointer-events-none bg-gradient-to-r from-cyan-950 via-purple-950 to-blue-950 flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.3),transparent_70%)] animate-pulse" />
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.4, 1.1], opacity: [0, 1, 0] }}
              transition={{ duration: 1 }}
              className="text-center z-10"
            >
              <Zap className="w-16 h-16 text-cyan-400 mx-auto animate-[spin_2s_linear_infinite]" />
              <h2 className="text-xl font-display font-black tracking-widest text-white mt-4 uppercase">
                RE-WRITING RAZOR LINE REALITY
              </h2>
              <p className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest mt-1">
                Restructuring dimensional consensus states...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Temporal Replay Hub - Global Utility Bottom-Bar Dock */}
      {isCodeModeActive && (
        <div className="fixed bottom-3 left-4 right-4 md:left-[350px] md:right-4 z-40 select-none pointer-events-none">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            
            {/* The expansion toggler button tab */}
            <button
              onClick={() => setIsReplayDockOpen(!isReplayDockOpen)}
              className={`pointer-events-auto flex items-center space-x-2 px-4 py-2 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
                isReplayDockOpen 
                  ? "bg-purple-950/90 border-purple-500/40 text-purple-300 hover:bg-purple-900/90" 
                  : "bg-slate-950/90 border-gray-800 text-zinc-400 hover:text-white"
              }`}
              title="Toggle Swarm Replay Debugger Dock"
            >
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isReplayDockOpen ? "15s" : "0s" }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                {isReplayDockOpen ? "Close Time-Travel Console" : "Open Time-Travel Console"}
              </span>
              <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-black uppercase">
                PRO ACTIVE
              </span>
            </button>

            {/* Expansible debug console interface dashboard */}
            <AnimatePresence>
              {isReplayDockOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  className="pointer-events-auto w-full p-5 rounded-2xl border border-purple-500/40 bg-slate-950/95 text-zinc-300 shadow-[0_4px_30px_rgba(168,85,247,0.3)] backdrop-blur-xl space-y-4"
                >
                  
                  {/* Console Header details */}
                  <div className="flex items-center justify-between border-b border-purple-950/45 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                      <h4 className="text-xs font-mono font-black uppercase text-white tracking-widest">
                        Consensus Temporal Debugger
                      </h4>
                    </div>

                    {/* Global vs Local Segment State Display Badge */}
                    {currentSnapshotIndex === consensusLogs.length ? (
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> GLOBAL ROOT STATE
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> FRAGMENT BRANCH STATE
                      </span>
                    )}
                  </div>

                  {/* Scroller ticks line timeline */}
                  <div className="space-y-2 text-left">
                    <label className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider block">
                      Select discussion snapshot log point (Turns)
                    </label>
                    <div className="flex items-center space-x-2">
                      
                      {/* Left bracket step back */}
                      <button
                        onClick={() => setCurrentSnapshotIndex(Math.max(0, currentSnapshotIndex - 1))}
                        disabled={currentSnapshotIndex === 0}
                        className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer font-bold"
                      >
                        ◀ Back
                      </button>

                      {/* Interactive Scrubber timeline ticks */}
                      <div className="flex-grow h-11 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-around px-3 relative overflow-hidden">
                        
                        {/* Selected background highlight overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-transparent pointer-events-none" />

                        {Array.from({ length: Math.max(1, consensusLogs.length + 1) }).map((_, stepIdx) => {
                          const snap = replaySnapshots.find(s => s.index === stepIdx && s.topic === consensusTopic);
                          const exists = !!snap;
                          const isCurrent = stepIdx === currentSnapshotIndex;

                          return (
                            <button
                              key={`scrub-tick-${stepIdx}`}
                              onClick={() => {
                                if (exists) {
                                  setCurrentSnapshotIndex(stepIdx);
                                }
                              }}
                              disabled={!exists}
                              className={`relative group flex flex-col items-center justify-center w-6 h-8 rounded transition-all cursor-pointer ${
                                isCurrent 
                                  ? "bg-purple-500/25 border border-purple-500/50 scale-110 shadow-sm" 
                                  : exists 
                                  ? "hover:bg-zinc-800" 
                                  : "opacity-20 cursor-not-allowed"
                              }`}
                              title={exists ? `Turn #${stepIdx} timestamp: ${snap.timestamp}` : "Unrecorded turn"}
                            >
                              <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-purple-300' : 'text-zinc-500'}`}>
                                {stepIdx === 0 ? "RT" : stepIdx}
                              </span>
                              <span className={`w-1 h-1 rounded-full mt-0.5 ${isCurrent ? 'bg-purple-400' : exists ? 'bg-cyan-500/60' : 'bg-transparent'}`} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Right bracket step next */}
                      <button
                        onClick={() => setCurrentSnapshotIndex(Math.min(consensusLogs.length, currentSnapshotIndex + 1))}
                        disabled={currentSnapshotIndex >= consensusLogs.length || !replaySnapshots.some(s => s.index === currentSnapshotIndex + 1 && s.topic === consensusTopic)}
                        className="p-1 px-[11px] rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-xs transition-colors cursor-pointer font-bold"
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>

                  {/* Active snapshot metadata details panel */}
                  {(() => {
                    const snap = replaySnapshots.find(s => s.index === currentSnapshotIndex && s.topic === consensusTopic);
                    if (!snap) return null;
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-zinc-950/60 p-3.5 rounded-xl border border-gray-900">
                        <div className="space-y-1 text-left text-[11px]">
                          <div className="text-zinc-500 uppercase text-[8px] tracking-widest font-bold">Consensus Segment info</div>
                          <div className="text-white truncate">Topic: <span className="font-semibold">{snap.topic}</span></div>
                          <div className="text-zinc-300">Logged Speakers: <span className="text-purple-400 font-bold">{snap.logs.length} agents</span></div>
                          <div className="text-zinc-300">Timestamp Logged: <span className="text-cyan-400 font-bold">{snap.timestamp}</span></div>
                        </div>

                        <div className="space-y-1 text-left text-[11px] sm:border-l sm:border-gray-900 sm:pl-4">
                          <div className="text-zinc-500 uppercase text-[8px] tracking-widest font-bold">Simulation telemetry variables</div>
                          <div className="text-zinc-300">Altitude parameter: <span className="text-cyan-400 font-bold">{snap.altitude} km</span></div>
                          <div className="text-zinc-300">Intercept Velocity: <span className="text-emerald-400 font-bold">{snap.approachSpeed} m/s</span></div>
                          <div className="text-zinc-500 text-[9px]">S-Weightings status: {snap.weightTheoretical} • {snap.weightSystems} • {snap.weightApplied}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Branch Action Trigger Warn banner */}
                  {currentSnapshotIndex !== consensusLogs.length ? (
                    <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-950/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left animate-pulse">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          ⚠️ TIMELINE BRANCH CONVERGENCE LIMITS
                        </div>
                        <p className="text-[10px] text-zinc-300 leading-normal font-sans">
                          You are viewing an alternate historic state. Traveling back here will purge all downstream future turns and re-initialize the simulation parameters from this segment.
                        </p>
                      </div>
                      <button
                        onClick={handleTimeTravelBranch}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] rounded-lg text-xs leading-none shrink-0 transition-all cursor-pointer active:scale-95 text-center font-mono uppercase"
                      >
                        ⚡ Re-Write Reality
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-left">
                      <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                        ❇️ Fully aligned with the real-world live timeline stream. State capture is synchronized continuously without data lag or consensus divergence.
                      </p>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Watermark in Bottom Right corner */}
      <div className="fixed bottom-2 right-2 z-50 pointer-events-none select-none font-mono text-[9px] uppercase tracking-wider text-white/20 bg-black/35 px-2 py-1 rounded backdrop-blur-[1px] border border-white/5 whitespace-nowrap">
        BY MAYANK SURYAWANSHI
      </div>

    </div>
  );
}

// Inline mini helpers to ensure clean compiling
function PlaySymbol({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="none"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
