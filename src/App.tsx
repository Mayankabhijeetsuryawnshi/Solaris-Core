import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Workspace from "./components/Workspace";
import { ModelInfo } from "./types";

const defaultModels: ModelInfo[] = [
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    bgColor: "bg-blue-500",
    textColor: "text-blue-200",
    accentColor: "from-blue-500 to-sky-600",
    glowColor: "rgba(59, 130, 246, 0.4)",
    strengths: ["Reasoning", "Logic", "Math"],
    description: "First-tier reasoning expert optimized for hard math, deep search, and complex algorithmic structures."
  },
  {
    id: "qwen-coder",
    name: "Qwen 2.5 Coder 32B",
    provider: "Alibaba",
    bgColor: "bg-teal-500",
    textColor: "text-teal-200",
    accentColor: "from-teal-500 to-emerald-600",
    glowColor: "rgba(20, 184, 166, 0.4)",
    strengths: ["Coding", "System Design", "Tech QA"],
    description: "Alibaba's flagship coding expert, fluent in high-concurrency systems, low-latency micro-kernels, and WebAssembly compilation."
  },
  {
    id: "llama-3-3",
    name: "Llama 3.3 70B",
    provider: "Meta",
    bgColor: "bg-purple-500",
    textColor: "text-purple-200",
    accentColor: "from-purple-500 to-indigo-600",
    glowColor: "rgba(168, 85, 247, 0.4)",
    strengths: ["General Performance", "Synthesis", "RAG"],
    description: "Meta's highly versatile open-weight centerpiece model, delivering outstanding systemic integration and analytical summaries."
  },
  {
    id: "gpt-4-5",
    name: "GPT-4.5 Preview",
    provider: "OpenAI",
    bgColor: "bg-emerald-500",
    textColor: "text-emerald-200",
    accentColor: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
    strengths: ["Intuition", "Strategic Fusion", "Creative QA"],
    description: "OpenAI's state-of-the-art preview model, excels in synthesizing complex compromises, strategic planning, and highly humanlike feedback."
  },
  {
    id: "phi-4",
    name: "Phi-4",
    provider: "Microsoft",
    bgColor: "bg-cyan-500",
    textColor: "text-cyan-200",
    accentColor: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.4)",
    strengths: ["Scientific Formulas", "Formal Proofs", "Math Concepts"],
    description: "Microsoft's lightweight reasoning engine, specialized in rigorous scientific notation, physical constants validation, and Keplarian PDE continuums."
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    bgColor: "bg-amber-500",
    textColor: "text-amber-200",
    accentColor: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
    strengths: ["Data Retrieval", "Multi-Step Planning", "API Integration"],
    description: "Cohere's retrieval-led enterprise powerhouse, adept at parallel API telemetry, batch compilations, and structured pipeline execution."
  },
  {
    id: "claude-coder",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    bgColor: "bg-orange-500",
    textColor: "text-orange-200",
    accentColor: "from-orange-500 to-amber-600",
    glowColor: "rgba(249, 115, 22, 0.4)",
    strengths: ["Code Modification", "Agent Orchestration", "Logic Check"],
    description: "Anthropic's pinnacle code execution specialist, optimized to trace memory leaks, resolve circular dependency loops, and write robust unit tests."
  },
  {
    id: "claude-fable-5",
    name: "Claude 3.5 (Orchestration)",
    provider: "Anthropic",
    bgColor: "bg-indigo-500",
    textColor: "text-indigo-200",
    accentColor: "from-indigo-500 to-violet-600",
    glowColor: "rgba(99, 102, 241, 0.4)",
    strengths: ["Consensus Fusion", "Swarm Supervision", "Master Report"],
    description: "High-tier master fusion conductor. Synthesizes inputs from the other 12 agents, resolves contradictions, and outputs the final compromise."
  },
  {
    id: "llama-3-8b",
    name: "Llama 3 8B",
    provider: "Meta",
    bgColor: "bg-blue-400",
    textColor: "text-blue-100",
    accentColor: "from-blue-400 to-indigo-500",
    glowColor: "rgba(56, 189, 248, 0.4)",
    strengths: ["Low Latency", "Quick Brainstorm", "Raw Speed"],
    description: "Meta's highly optimized fast-response model, providing high-efficiency text streaming and instant conceptual iteration."
  },
  {
    id: "qwen-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    bgColor: "bg-rose-400",
    textColor: "text-rose-100",
    accentColor: "from-rose-400 to-red-500",
    glowColor: "rgba(251, 113, 133, 0.4)",
    strengths: ["Multilingual", "Logical Bounds", "Structured Data"],
    description: "High-parameter open weight model from Alibaba, providing excellent logical constraints verification and structured data translations."
  },
  {
    id: "mistral-large",
    name: "Mistral Large 2",
    provider: "Mistral",
    bgColor: "bg-violet-400",
    textColor: "text-violet-100",
    accentColor: "from-violet-400 to-fuchsia-500",
    glowColor: "rgba(167, 139, 250, 0.4)",
    strengths: ["Complex Reasoning", "Multilingual Support", "Enterprise Synthesis"],
    description: "Mistral's flagship European model, known for rigorous structured syntax, reasoning complexity, and clear-headed executive formatting."
  },
  {
    id: "mythomax-13b",
    name: "MythoMax L2 13B",
    provider: "Gryphe",
    bgColor: "bg-fuchsia-500",
    textColor: "text-fuchsia-200",
    accentColor: "from-fuchsia-500 to-pink-600",
    glowColor: "rgba(217, 70, 239, 0.4)",
    strengths: ["Creative Narrative", "Scenario Simulator", "Persona Fidelity"],
    description: "Highly creative open model, ideal for mock-simulation scenarios, rich educational analogical storytelling, and persona fidelity."
  },
  {
    id: "llama-3-2-3b",
    name: "Llama 3.2 3B",
    provider: "Meta",
    bgColor: "bg-sky-400",
    textColor: "text-sky-100",
    accentColor: "from-sky-400 to-cyan-500",
    glowColor: "rgba(56, 189, 248, 0.4)",
    strengths: ["Ultra-Low Latency", "Edge Execution", "Concise Summaries"],
    description: "Meta's edge-optimized ultra-lightweight node, perfect for quick sub-tasks execution, basic formatting, and instant telemetry validation."
  },
  {
    id: "zephyr-7b",
    name: "Zephyr 7B Beta",
    provider: "HuggingFace",
    bgColor: "bg-lime-400",
    textColor: "text-lime-100",
    accentColor: "from-lime-400 to-green-500",
    glowColor: "rgba(163, 230, 53, 0.4)",
    strengths: ["Assistant Conversationalist", "Informative Outlines", "Direct QA"],
    description: "A highly-tuned conversational assistant model, delivering concise outlines, direct answers, and friendly interactive explanations."
  }
];

export default function App() {
  const [isLaunched, setIsLaunched] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mas_is_launched") === "true";
    } catch (e) {
      return false;
    }
  });

  const [isCodeModeActive, setIsCodeModeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mas_code_mode_active") === "true";
    } catch (e) {
      return false;
    }
  });

  const [physicsModeActive, setPhysicsModeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mas_physics_mode_active") === "true";
    } catch (e) {
      return false;
    }
  });

  const [userPasscode, setUserPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem("mas_user_passcode") || "";
    } catch (e) {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mas_is_launched", String(isLaunched));
    } catch (e) {}
  }, [isLaunched]);

  useEffect(() => {
    try {
      localStorage.setItem("mas_code_mode_active", String(isCodeModeActive));
    } catch (e) {}
  }, [isCodeModeActive]);

  useEffect(() => {
    try {
      localStorage.setItem("mas_physics_mode_active", String(physicsModeActive));
    } catch (e) {}
  }, [physicsModeActive]);

  return (
    <div id="solaris-root-wrapper" className="w-full h-full min-h-screen">
      {!isLaunched ? (
        <LandingPage
          onLaunch={() => setIsLaunched(true)}
          models={defaultModels}
          isCodeModeActive={isCodeModeActive}
          setIsCodeModeActive={(val) => {
            setIsCodeModeActive(val);
            if (val) setPhysicsModeActive(false);
          }}
          physicsModeActive={physicsModeActive}
          setPhysicsModeActive={(val) => {
            setPhysicsModeActive(val);
            if (val) setIsCodeModeActive(false);
          }}
          userPasscode={userPasscode}
          setUserPasscode={setUserPasscode}
        />
      ) : (
        <Workspace
          onBack={() => setIsLaunched(false)}
          models={defaultModels}
          isCodeModeActive={isCodeModeActive}
          setIsCodeModeActive={setIsCodeModeActive}
          physicsModeActive={physicsModeActive}
          setPhysicsModeActive={setPhysicsModeActive}
          userPasscode={userPasscode}
          setUserPasscode={setUserPasscode}
        />
      )}
    </div>
  );
}
