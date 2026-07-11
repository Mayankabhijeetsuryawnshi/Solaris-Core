/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Trash2, Sliders, Activity } from "lucide-react";
import { ModelInfo } from "../types";
import ControlCluster from "./ControlCluster";

interface WorkspaceHeaderProps {
  onBack: () => void;
  models: ModelInfo[];
  isCodeModeActive: boolean;
  setIsCodeModeActive: (val: boolean) => void;
  physicsModeActive: boolean;
  setPhysicsModeActive: (val: boolean) => void;
  layoutMode: "grid" | "side-by-side";
  setLayoutMode: (val: "grid" | "side-by-side") => void;
  responseMode: "latest" | "history";
  setResponseMode: (val: "latest" | "history") => void;
  isMasterCodeModeActive: boolean;
  setIsMasterCodeModeActive: (val: boolean) => void;
  selectedModelIds: string[];
  setSelectedModelIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearWorkspace: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  activeModels: ModelInfo[];
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  onBack,
  models,
  isCodeModeActive,
  setIsCodeModeActive,
  physicsModeActive,
  setPhysicsModeActive,
  layoutMode,
  setLayoutMode,
  responseMode,
  setResponseMode,
  isMasterCodeModeActive,
  setIsMasterCodeModeActive,
  selectedModelIds,
  setSelectedModelIds,
  handleClearWorkspace,
  isSidebarOpen,
  setIsSidebarOpen,
  activeModels,
}) => {
  return (
    <>
      {/* Workspace Header */}
      <header className={`border-b border-gray-800/60 transition-all duration-700 bg-opacity-80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10 shrink-0 ${
        isCodeModeActive ? "bg-[#0b051c]/80" : "bg-[#07090e]/80"
      }`}>
        <div className="flex items-center space-x-3 md:space-x-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-950 hover:bg-slate-900 border border-gray-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-500 ${
              isCodeModeActive 
                ? "bg-gradient-to-tr from-purple-500 to-fuchsia-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.45)]" 
                : "bg-gradient-to-tr from-emerald-500 to-purple-500 text-black"
            }`}>
              {isCodeModeActive ? "CL" : "AI"}
            </div>
            <div className="text-left">
              <h1 className="font-display font-extrabold text-sm md:text-base tracking-tight leading-none text-white">
                {isMasterCodeModeActive ? "Claude Fable 5 Master Synth" : isCodeModeActive ? "Claude Code Module" : "AI"}
              </h1>
              <span className={`text-[9px] font-mono transition-colors duration-500 ${isMasterCodeModeActive ? 'text-amber-400 font-bold' : isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`}>
                {isMasterCodeModeActive ? "Autonomous Multi-Agent Swarm" : isCodeModeActive ? "Collaborative Fleet Conductor" : `${activeModels.length}x Model${activeModels.length === 1 ? '' : 's'} Active`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2.5 flex-wrap sm:flex-nowrap justify-end shrink-0 min-w-0">
          {isCodeModeActive ? (
            /* Master Synthesizer Toggle switch for PRO mode */
            <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border transition-all duration-500 scale-90 sm:scale-100 ${
              isMasterCodeModeActive 
                ? "bg-amber-950/45 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]" 
                : "bg-slate-950 border-gray-800/60"
            }`}>
              <Sparkles className={`w-3.5 h-3.5 transition-all duration-500 ${isMasterCodeModeActive ? "text-amber-400 animate-pulse" : "text-gray-500"}`} />
              <span className={`font-mono text-[9px] md:text-[10px] uppercase tracking-wider transition-colors duration-500 ${isMasterCodeModeActive ? 'text-amber-300 font-extrabold' : 'text-gray-400 font-normal'}`}>
                MASTER SYNTH
              </span>
              <button
                type="button"
                onClick={() => setIsMasterCodeModeActive(!isMasterCodeModeActive)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
                  isMasterCodeModeActive ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-neutral-800"
                }`}
                title="Toggle Master Code synthesizer"
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-neutral-200 shadow ring-0 transition duration-300 ease-in-out ${
                    isMasterCodeModeActive ? "translate-x-3.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ) : (
            /* Universal Swarm Toggle switch for NORMAL/general subjects mode */
            <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg border transition-all duration-500 scale-90 sm:scale-100 ${
              isMasterCodeModeActive 
                ? "bg-emerald-950/45 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]" 
                : "bg-slate-950 border-gray-800/60"
            }`}>
              <Activity className={`w-3.5 h-3.5 transition-all duration-500 ${isMasterCodeModeActive ? "text-emerald-400 animate-pulse" : "text-gray-500"}`} />
              <span className={`font-mono text-[9px] md:text-[10px] uppercase tracking-wider transition-colors duration-500 ${isMasterCodeModeActive ? 'text-emerald-300 font-extrabold' : 'text-gray-400 font-normal'}`}>
                SWARM DEBATE
              </span>
              <button
                type="button"
                onClick={() => setIsMasterCodeModeActive(!isMasterCodeModeActive)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
                  isMasterCodeModeActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-neutral-800"
                }`}
                title="Toggle Universal Fleet Swarm debating and creative consensus"
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-neutral-200 shadow ring-0 transition duration-300 ease-in-out ${
                    isMasterCodeModeActive ? "translate-x-3.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Integrated high-tech ControlCluster */}
          <ControlCluster
            isCodeModeActive={isCodeModeActive}
            setIsCodeModeActive={setIsCodeModeActive}
            physicsModeActive={physicsModeActive}
            setPhysicsModeActive={setPhysicsModeActive}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />

          {/* Clear Button */}
          <button
            onClick={handleClearWorkspace}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/20 hover:text-rose-400 border border-neutral-800 text-xs text-neutral-400 font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Clear entire workspace state"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Board</span>
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-slate-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Toolbox Sidebar"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* User Model Selector Bar */}
      <div className="px-4 md:px-6 py-2.5 bg-[#090d16]/40 border-b border-gray-900/60 flex flex-wrap items-center gap-2 relative z-10 shrink-0">
        <span className="font-mono text-[9.5px] tracking-wider text-zinc-500 uppercase mr-1">Query Targets:</span>
        <div className="flex flex-wrap gap-1.5">
          {models.map(model => {
            const isActive = selectedModelIds.includes(model.id);
            return (
              <motion.button
                key={model.id}
                whileHover={{ scale: 1.05, y: -0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isActive) {
                    if (selectedModelIds.length > 1) {
                      setSelectedModelIds(prev => prev.filter(id => id !== model.id));
                    }
                  } else {
                    setSelectedModelIds(prev => [...prev, model.id]);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                  isActive
                    ? isCodeModeActive
                      ? "bg-[#120a2e]/65 border-purple-500/50 text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                      : "bg-slate-900 border-emerald-500/35 text-emerald-400 font-bold"
                    : isCodeModeActive
                      ? "bg-[#05030d]/30 border-purple-950/40 text-purple-900/60 hover:text-purple-300 hover:border-purple-800/40"
                      : "bg-[#06080d]/40 border-gray-900/60 text-zinc-555 hover:text-zinc-355 hover:border-gray-800/80"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? model.bgColor : 'bg-zinc-750'}`} />
                <span>{model.name}</span>
                {isActive && <span className={`text-[8px] font-bold ${isCodeModeActive ? 'text-purple-400' : 'text-emerald-500'}`}>✓</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Interactive Workspace Modes Toolbar */}
      <div className="px-4 md:px-6 py-2 bg-[#060a12]/60 border-b border-gray-950 flex flex-wrap items-center justify-between gap-4 relative z-10 shrink-0 text-xs">
        {/* Left Block: Layout Select Mode */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">Board View:</span>
          <div className="bg-slate-950/70 p-0.5 rounded-lg border border-gray-900/80 flex">
            <button
              onClick={() => setLayoutMode("grid")}
              className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono uppercase tracking-wider transition-all cursor-pointer border-0 ${
                layoutMode === "grid" 
                  ? "bg-slate-800 text-emerald-400 font-bold shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
            >
              Grid Wrap
            </button>
            <button
              onClick={() => setLayoutMode("side-by-side")}
              className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border-0 ${
                layoutMode === "side-by-side" 
                  ? "bg-slate-800 text-emerald-400 font-bold shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
            >
              Side-by-Side Lanes
            </button>
          </div>
        </div>

        {/* Right Block: Responses Mode */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase font-medium">History Mode:</span>
          <div className="bg-slate-950/70 p-0.5 rounded-lg border border-gray-900/80 flex">
            <button
              onClick={() => setResponseMode("latest")}
              className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono uppercase tracking-wider transition-all cursor-pointer border-0 ${
                responseMode === "latest" 
                  ? "bg-slate-800 text-cyan-400 font-bold shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
              title="Show only the newest answer for each model card"
            >
              Overwrite (Latest)
            </button>
            <button
              onClick={() => setResponseMode("history")}
              className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border-0 ${
                responseMode === "history" 
                  ? "bg-slate-800 text-emerald-400 font-bold shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
              title="Saves and appends past answers so you can scroll up and view history"
            >
              Keep Past Responses
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
