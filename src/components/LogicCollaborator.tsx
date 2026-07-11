/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code, Copy, Cpu, Sparkles } from "lucide-react";
import { ModelInfo } from "../types";

interface LogicCollaboratorProps {
  isCodeModeActive: boolean;
  codePromptInput: string;
  setCodePromptInput: (val: string) => void;
  fleetLoading: Record<string, "idle" | "running" | "done" | "failed">;
  fleetOutputs: Record<string, string>;
  claudeLoading: boolean;
  claudeUnifiedResult: string;
  codeError: string;
  activeModels: ModelInfo[];
  onCodeSynthesis: () => void;
  onSetPromptInput: (val: string | ((prev: string) => string)) => void;
}

export const LogicCollaborator: React.FC<LogicCollaboratorProps> = ({
  isCodeModeActive,
  codePromptInput,
  setCodePromptInput,
  fleetLoading,
  fleetOutputs,
  claudeLoading,
  claudeUnifiedResult,
  codeError,
  activeModels,
  onCodeSynthesis,
  onSetPromptInput,
}) => {
  const isFleetGenerating = Object.values(fleetLoading).some(status => status === "running");

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
        {isCodeModeActive 
          ? "Parallel compile stage. Input technical parameters to request dual-phase swarm code drafting from all active models, consolidated by Claude."
          : "Swarm-assisted deep collaborative analysis. Gathers templates and arguments across models, fused into a final comprehensive report."
        }
      </p>

      {/* Prompter box */}
      <div className="space-y-3">
        <div className="space-y-1 text-left">
          <label className={`text-[9.5px] font-mono uppercase tracking-widest font-bold ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
            {isCodeModeActive ? "Code Synthesis Directives" : "Deep Analytical Thesis Prompts"}
          </label>
          <textarea
            value={codePromptInput}
            onChange={(e) => setCodePromptInput(e.target.value)}
            placeholder={
              isCodeModeActive
                ? "e.g. Implement a high-performance debounced scroll hook in React 19 with cleanup handlers..."
                : "e.g. Synthesize a unified thermodynamic model of helium propellant flow..."
            }
            className="w-full bg-slate-950 border border-gray-850 rounded-xl p-3 text-xs h-20 text-neutral-200 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <button
          onClick={onCodeSynthesis}
          disabled={isFleetGenerating || claudeLoading || !codePromptInput.trim()}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center space-x-2 border cursor-pointer ${
            codePromptInput.trim() && !isFleetGenerating && !claudeLoading
              ? isCodeModeActive
                ? "bg-purple-600 hover:bg-purple-500 text-white border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]"
              : "bg-gray-850 border-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Code className={`w-4 h-4 shrink-0 ${(isFleetGenerating || claudeLoading) ? 'animate-spin' : ''}`} />
          <span>
            {isFleetGenerating 
              ? "Running Fleet Drafting..." 
              : claudeLoading 
              ? "Claude Fusing Output..." 
              : isCodeModeActive 
              ? "Begin Dual-Phase Synthesis" 
              : "Begin Deep Research Fuse"
            }
          </span>
        </button>
      </div>

      {/* Parallel Fleet responses state trackers */}
      {Object.keys(fleetLoading).length > 0 && (
        <div className="space-y-2 border-t border-gray-900/60 pt-3">
          <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold text-left">
            ⚡ Stage 1: Swarm Draft Progress ({activeModels.length} nodes)
          </span>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
            {activeModels.map(m => {
              const status = fleetLoading[m.id] || "idle";
              const progress = fleetOutputs[m.id] || "";
              
              let badgeBg = "bg-neutral-900 text-zinc-500 border-zinc-800";
              let badgeLabel = "Standby";
              if (status === "running") {
                badgeBg = isCodeModeActive ? "bg-purple-950/20 text-purple-300 border-purple-900/40 animate-pulse" : "bg-emerald-950/20 text-emerald-300 border-emerald-900/40 animate-pulse";
                badgeLabel = `Drafting... ${progress ? `${Math.min(100, Math.floor(progress.length / 10))}%` : "0%"}`;
              } else if (status === "done") {
                badgeBg = "bg-emerald-950/40 text-emerald-300 border-emerald-500/20";
                badgeLabel = "Compiled";
              } else if (status === "failed") {
                badgeBg = "bg-rose-950/30 text-rose-400 border-rose-900/20";
                badgeLabel = "Offline";
              }

              return (
                <div key={m.id} className="p-2 rounded-lg bg-slate-950 border border-gray-900/40 flex items-center justify-between">
                  <span className="truncate max-w-[80px] text-zinc-400 font-bold">{m.name.replace(" Chat", "")}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${badgeBg}`}>
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claude Master Fusion stage */}
      <AnimatePresence>
        {claudeLoading && (
          <div className="p-3 bg-[#070511] border border-purple-900/40 rounded-xl space-y-1.5 text-center animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin mx-auto" />
            <span className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest font-extrabold">
              Stage 2: Claude Fusing & Refactoring Output...
            </span>
          </div>
        )}

        {claudeUnifiedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 pt-3 border-t border-gray-900/60"
          >
            <div className="flex justify-between items-center select-none text-left">
              <span className={`text-[8px] uppercase tracking-widest font-mono font-bold ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
                🏆 Claude Master Fusion Results
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(claudeUnifiedResult)}
                className={`p-1 px-2 rounded bg-slate-950 border text-[8.5px] font-mono cursor-pointer transition-colors flex items-center gap-1 hover:bg-slate-900 ${
                  isCodeModeActive 
                    ? "text-purple-300 border-purple-500/20 hover:text-white" 
                    : "text-emerald-300 border-emerald-500/20 hover:text-white"
                }`}
              >
                <Copy className="w-3 h-3" />
                {isCodeModeActive ? "Copy Code" : "Copy Thesis"}
              </button>
            </div>

            <div className={`p-3 border rounded-xl max-h-[220px] overflow-y-auto font-mono text-[10.5px] leading-relaxed scrollbar-thin select-text text-left ${
              isCodeModeActive 
                ? "border-purple-500/20 bg-[#06030c] text-purple-100" 
                : "border-emerald-500/20 bg-[#030c05] text-emerald-100"
            }`}>
              <pre className="whitespace-pre-wrap">{claudeUnifiedResult}</pre>
            </div>

            <button
              onClick={() => {
                onSetPromptInput(isCodeModeActive 
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
          <div className="p-3 text-[11px] text-rose-400 bg-rose-950/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed text-left">
            {codeError}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
