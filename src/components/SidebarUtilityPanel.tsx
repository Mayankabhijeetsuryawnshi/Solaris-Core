/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, X, PenTool, Sparkles, BookOpen, Layers, 
  MessageSquare, Terminal, Binary, Code, Cpu, Copy, 
  FileUp, Volume2, Activity, Trash2, ShieldCheck, 
  ImageIcon, Sparkle, FileUp as FileUpIcon
} from "lucide-react";
import { CustomWorkflow, ModelInfo, ChatSession } from "../types";

interface SidebarUtilityPanelProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  isMobile: boolean;
  isCodeModeActive: boolean;
  setIsCodeModeActive: (val: boolean) => void;
  physicsModeActive: boolean;
  setPhysicsModeActive: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Workflows
  customWorkflows: CustomWorkflow[];
  activeWorkflowId: string;
  setActiveWorkflowId: (id: string) => void;

  // Modes
  oracleModeActive: boolean;
  setOracleModeActive: (val: boolean) => void;
  forgeModeActive: boolean;
  setForgeModeActive: (val: boolean) => void;

  // Code synthesis tab
  codePromptInput: string;
  setCodePromptInput: (val: string) => void;
  compositeState: "idle" | "synthesis-fleet" | "claude-refining" | "completed" | "error";
  fleetLoading: Record<string, "idle" | "running" | "done" | "failed">;
  activeModels: ModelInfo[];
  claudeUnifiedResult: string;
  codeError: string;
  handleCodeSynthesis: () => void;
  feedingLevel: number;
  setFeedingLevel: (lvl: number) => void;
  setPromptInput: React.Dispatch<React.SetStateAction<string>>;

  // Image tab
  imageSubTab: "generate" | "scan";
  setImageSubTab: (tab: "generate" | "scan") => void;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  imgStyle: string;
  setImgStyle: (style: string) => void;
  imgRatio: string;
  setImgRatio: (ratio: string) => void;
  imgRunning: boolean;
  generatedImg: string;
  setGeneratedImg: (url: string) => void;
  imgElementLoading: boolean;
  setImgElementLoading: (val: boolean) => void;
  imgError: string;
  imgHistory: string[];
  setImgHistory: React.Dispatch<React.SetStateAction<string[]>>;
  usePromptToJson: boolean;
  setUsePromptToJson: (val: boolean) => void;
  structuredPromptData: any;
  setStructuredPromptData: (data: any) => void;
  isParsingToJson: boolean;
  parsingToJsonError: string;
  handleParsePromptToJson: () => void;
  handleGenerateImage: () => void;

  // Vision Scan
  scanMode: "general" | "ui" | "ocr" | "diagram";
  setScanMode: (mode: "general" | "ui" | "ocr" | "diagram") => void;
  scanAttachment: { previewUrl: string } | null;
  setScanAttachment: (val: any) => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>, isScan: boolean) => void;
  handleScanImage: () => void;
  scanRunning: boolean;
  scanResult: string;
  scanError: string;

  // Document tab
  handleUploadDocumentText: (e: React.ChangeEvent<HTMLInputElement>) => void;
  summaryRunning: boolean;
  summaryOutput: string;
  docFileName: string;

  // Audio tab
  audioTopicInput: string;
  setAudioTopicInput: (val: string) => void;
  audioRunning: boolean;
  transcribedText: string;
  handleTranscribeAudioMessage: () => void;

  // VFX/Simulation controls
  telemetryFps: number;
  telemetryVram: number;
  telemetryPath: string;
  vfxColorPreset: string;
  setVfxColorPreset: (preset: string) => void;
  vfxShaderMode: "path-traced" | "ambient";
  setVfxShaderMode: (mode: "path-traced" | "ambient") => void;
  vfxFpsCap: number;
  setVfxFpsCap: (cap: number) => void;
  vfxTrailWidth: number;
  setVfxTrailWidth: (w: number) => void;
  vfxTrailLength: number;
  setVfxTrailLength: (l: number) => void;
  vfxParticleCount: number;
  setVfxParticleCount: (c: number) => void;
  vfxPhysicsFriction: number;
  setVfxPhysicsFriction: (f: number) => void;
  vfxLatticeDist: number;
  setVfxLatticeDist: (d: number) => void;
  vfxBloomGlow: number;
  setVfxBloomGlow: (g: number) => void;
  vfxAberration: number;
  setVfxAberration: (a: number) => void;
  vfxSoundEnabled: boolean;
  setVfxSoundEnabled: (enabled: boolean) => void;

  // Sessions Logs tab
  syncStatus: "idle" | "syncing" | "synced" | "error";
  userPasscode: string;
  syncAndSwitchIdentity: (code: string) => void;
  handleCreateNewSession: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  handleSelectSession: (id: string) => void;
  handleRenameSession: (id: string, name: string) => void;
  handleDeleteSession: (id: string, e: React.MouseEvent) => void;

  // Cognitive Cartography
  getCartographyTopology: () => any;
  selectedCartNode: string | null;
  setSelectedCartNode: (node: string | null) => void;

  // Connection drawer
  showConfig: boolean;
  setShowConfig: (show: boolean) => void;
  serverStatus: "online" | "checking" | "offline";
  backendUrl: string;
}

export const SidebarUtilityPanel: React.FC<SidebarUtilityPanelProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isMobile,
  isCodeModeActive,
  setIsCodeModeActive,
  physicsModeActive,
  setPhysicsModeActive,
  activeTab,
  setActiveTab,
  customWorkflows,
  activeWorkflowId,
  setActiveWorkflowId,
  oracleModeActive,
  setOracleModeActive,
  forgeModeActive,
  setForgeModeActive,
  codePromptInput,
  setCodePromptInput,
  compositeState,
  fleetLoading,
  activeModels,
  claudeUnifiedResult,
  codeError,
  handleCodeSynthesis,
  feedingLevel,
  setFeedingLevel,
  setPromptInput,
  imageSubTab,
  setImageSubTab,
  imagePrompt,
  setImagePrompt,
  imgStyle,
  setImgStyle,
  imgRatio,
  setImgRatio,
  imgRunning,
  generatedImg,
  setGeneratedImg,
  imgElementLoading,
  setImgElementLoading,
  imgError,
  imgHistory,
  setImgHistory,
  usePromptToJson,
  setUsePromptToJson,
  structuredPromptData,
  setStructuredPromptData,
  isParsingToJson,
  parsingToJsonError,
  handleParsePromptToJson,
  handleGenerateImage,
  scanMode,
  setScanMode,
  scanAttachment,
  setScanAttachment,
  handleAttachmentUpload,
  handleScanImage,
  scanRunning,
  scanResult,
  scanError,
  handleUploadDocumentText,
  summaryRunning,
  summaryOutput,
  docFileName,
  audioTopicInput,
  setAudioTopicInput,
  audioRunning,
  transcribedText,
  handleTranscribeAudioMessage,
  telemetryFps,
  telemetryVram,
  telemetryPath,
  vfxColorPreset,
  setVfxColorPreset,
  vfxShaderMode,
  setVfxShaderMode,
  vfxFpsCap,
  setVfxFpsCap,
  vfxTrailWidth,
  setVfxTrailWidth,
  vfxTrailLength,
  setVfxTrailLength,
  vfxParticleCount,
  setVfxParticleCount,
  vfxPhysicsFriction,
  setVfxPhysicsFriction,
  vfxLatticeDist,
  setVfxLatticeDist,
  vfxBloomGlow,
  setVfxBloomGlow,
  vfxAberration,
  setVfxAberration,
  vfxSoundEnabled,
  setVfxSoundEnabled,
  syncStatus,
  userPasscode,
  syncAndSwitchIdentity,
  handleCreateNewSession,
  sessions,
  currentSessionId,
  handleSelectSession,
  handleRenameSession,
  handleDeleteSession,
  getCartographyTopology,
  selectedCartNode,
  setSelectedCartNode,
  showConfig,
  setShowConfig,
  serverStatus,
  backendUrl,
}) => {
  if (!isSidebarOpen) return null;

  const topology = getCartographyTopology();
  const selectedNodeData = topology.nodes.find((n: any) => n.id === selectedCartNode);

  return (
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
      } flex flex-col justify-between transition-all duration-700 h-screen overflow-hidden`}
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
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 p-1 bg-slate-950 rounded-lg border border-gray-855 select-none">
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
              className={`py-1.5 rounded text-[8px] font-mono tracking-tighter uppercase transition-all cursor-pointer border-0 ${
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
                  : "text-gray-500 hover:text-white bg-transparent"
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
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans text-left">
                Presets configure targeted prompt adapters to format output style, analytical focus, or verification rules.
              </p>
              <div className="space-y-2.5 text-left">
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
                      className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold border-0 ${
                        (!oracleModeActive && !isCodeModeActive && !physicsModeActive && !forgeModeActive)
                          ? "bg-emerald-400 text-black hover:bg-emerald-300" 
                          : "bg-neutral-955 border border-white/5 text-zinc-400 hover:text-white"
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
                      className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold border-0 ${
                        isCodeModeActive 
                          ? "bg-purple-400 text-white hover:bg-purple-300" 
                          : "bg-neutral-955 border border-white/5 text-zinc-400 hover:text-white"
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
                      className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer font-extrabold border-0 ${
                        physicsModeActive 
                          ? "bg-cyan-400 text-black hover:bg-cyan-350" 
                          : "bg-neutral-955 border border-white/5 text-zinc-400 hover:text-white"
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
              <div className={`p-3 rounded-xl relative overflow-hidden border text-left ${
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
                <div className="space-y-1 font-sans text-left">
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
                        ? "border-purple-900/40 text-purple-100 placeholder-purple-905/60 focus:border-purple-500/40"
                        : "border-emerald-900/40 text-emerald-100 placeholder-emerald-905/60 focus:border-emerald-500/40"
                    }`}
                  />
                </div>

                {/* Information Depth Selector Hub inside Panel */}
                <div className={`p-3 border rounded-xl space-y-2 text-left ${
                  isCodeModeActive ? "bg-purple-950/20 border-purple-500/25" : "bg-emerald-950/20 border-emerald-500/25"
                }`}>
                  <div className="flex items-center justify-between">
                    <label className={`text-[9px] uppercase tracking-wider font-mono font-bold block ${isCodeModeActive ? 'text-purple-300' : 'text-emerald-300'}`}>
                      Analysis Depth Level
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
                        className={`py-1 rounded text-[10px] font-mono font-bold tracking-tighter transition-all cursor-pointer border-0 ${
                          feedingLevel === lvl
                            ? isCodeModeActive
                              ? "bg-purple-600 border border-purple-400 text-white font-extrabold"
                              : "bg-emerald-500 border border-emerald-400 text-black font-extrabold"
                            : isCodeModeActive
                              ? "text-gray-500 hover:text-zinc-200 hover:bg-purple-950/25 bg-transparent"
                              : "text-gray-500 hover:text-zinc-200 hover:bg-emerald-950/25 bg-transparent"
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
                <div className="space-y-3 pt-2 text-left">
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
                            isCodeModeActive ? 'border-purple-955/25' : 'border-emerald-955/25'
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
                          className={`text-[9.5px] font-mono flex items-center gap-1 border px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-slate-950/40 border-0 ${
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
                        className={`w-full py-1.5 rounded-lg border text-[10px] font-semibold transition-colors cursor-pointer border-0 ${
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
                  className={`flex-1 py-1 rounded-md font-mono tracking-wider transition-all uppercase cursor-pointer border-0 ${
                    imageSubTab === "generate"
                      ? "bg-slate-800 text-cyan-400 font-bold"
                      : "text-zinc-500 hover:text-zinc-300 bg-transparent"
                  }`}
                >
                  Asset Gen
                </button>
                <button
                  onClick={() => setImageSubTab("scan")}
                  className={`flex-1 py-1 rounded-md font-mono tracking-wider transition-all uppercase cursor-pointer border-0 ${
                    imageSubTab === "scan"
                      ? "bg-slate-800 text-emerald-400 font-bold"
                      : "text-zinc-500 hover:text-zinc-300 bg-transparent"
                  }`}
                >
                  Vision Scan
                </button>
              </div>

              {imageSubTab === "generate" ? (
                <div className="space-y-4 text-left">
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
                          <span className="text-[10px] text-zinc-500 font-sans leading-relaxed text-left">
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
                        <div className="text-[10px] text-red-400 font-mono bg-red-955/10 p-2 rounded border border-red-900/30">
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
                                className="w-full bg-[#030508] border border-gray-855 rounded px-2 py-1 text-[11px] font-mono text-zinc-400 focus:border-cyan-500/50 focus:outline-none"
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
                                className="w-full bg-[#030508] border border-gray-855 rounded px-2 py-1 text-[11px] font-mono text-zinc-400 focus:border-cyan-500/50 focus:outline-none h-14 resize-none leading-normal"
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
                                className="w-full bg-[#030508] border border-gray-855 rounded px-2 py-0.5 text-[11px] font-mono text-zinc-550 focus:border-cyan-500/50 focus:outline-none"
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
                        className="p-2 border border-gray-850 bg-[#06080d] rounded-xl space-y-2 mt-3"
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
                      <div className="p-3 text-[11px] text-rose-400 bg-rose-955/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed mt-3">
                        {imgError}
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Sessions Gallery Strip */}
                  {imgHistory.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-900/60 mt-3">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-semibold">
                          🌌 Sessions Asset Gallery ({imgHistory.length})
                        </span>
                        <button
                          onClick={() => setImgHistory([])}
                          className="text-[8px] font-mono text-rose-500/70 hover:text-rose-400 transition-all cursor-pointer bg-transparent border-0"
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
                            className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border relative transition-all group p-0 ${
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
                <div className="space-y-4 text-left">
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
                          className={`p-2 rounded-lg text-left transition-all cursor-pointer border-0 ${
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
                      <FileUp className="w-7 h-7 text-cyan-400 mb-2 animate-bounce" />
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
                          className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer border-0"
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
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-gray-855 hover:bg-slate-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
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
                          setPromptInput(prev => `Review this scanned layout report findings:\n${scanResult}\n\n${prev}`);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-[#0d121f] to-[#120a2e] hover:from-cyan-950/20 hover:to-purple-950/20 text-cyan-400 hover:text-white border border-cyan-800/25 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Inject Results to prompt
                      </button>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-3 text-[10px] text-rose-400 bg-rose-955/15 border border-rose-900/30 rounded-xl font-mono leading-relaxed text-left">
                      {scanError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Document Summarizer Panel */}
          {activeTab === "document" && (
            <div className="space-y-4 text-left">
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Upload system log files, design outlines, or raw text blocks. Gemini extracts theses and actionable insights in real-time.
              </p>

              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 hover:border-emerald-500/40 rounded-xl bg-slate-950/40 text-center cursor-pointer group transition-colors">
                  <FileUp className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 mb-2 transition-colors animate-pulse" />
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
                        setPromptInput(`Analyze the following synthesized document outputs:\n\n${summaryOutput}`);
                      }}
                      className="w-full py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-[10px] text-neutral-300 hover:text-white transition-colors border-0 cursor-pointer"
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
            <div className="space-y-4 text-left">
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
                      className="w-full py-1.5 rounded-lg border border-purple-900/40 bg-purple-950/10 hover:bg-purple-900/20 text-[10px] text-purple-300 transition-colors border-0 cursor-pointer"
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
              <div className={`p-3 border rounded-xl relative overflow-hidden backdrop-blur-md text-left ${
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
                      stroke={isCodeModeActive ? "rgba(168,85,247,0.75)" : "rgba(16,185,129,0.75)"}
                      strokeWidth="1"
                      className="transition-all duration-150"
                    />
                  </svg>
                  <span className="absolute bottom-0.5 right-1 text-[6.5px] text-zinc-500 font-mono tracking-widest uppercase">LIVE OSCILLOSCOPE</span>
                </div>
              </div>

              <div className="space-y-3.5 text-left">
                <div className="border-t border-gray-900/60 pt-2">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block mb-2">Pillar 1: Color Space Theme Override</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "stellar-orbit", label: "Stellar Purple", color: "bg-purple-650" },
                      { id: "aurora-emerald", label: "Aurora Emerald", color: "bg-emerald-505" },
                      { id: "hyper-cyan", label: "Hyper Cyan", color: "bg-cyan-405" },
                      { id: "solar-flare", label: "Solar Flare", color: "bg-orange-505" },
                      { id: "monochrome", label: "Monochrome Pass", color: "bg-slate-405" }
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
                      className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer border-0 ${
                        vfxShaderMode === "path-traced"
                          ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                          : "bg-slate-950 border-gray-850 text-gray-500 bg-transparent"
                      }`}
                    >
                      Path-Traced Space Dust
                    </button>
                    <button
                      onClick={() => setVfxShaderMode("ambient")}
                      className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer border-0 ${
                        vfxShaderMode === "ambient"
                          ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                          : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white bg-transparent"
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
                          className={`flex-grow py-1 rounded text-[9px] font-mono border cursor-pointer border-0 ${
                            vfxFpsCap === fps
                              ? isCodeModeActive ? "bg-purple-600 border-purple-500 text-white" : "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                              : "bg-slate-955 border-gray-850 text-gray-455 hover:text-white bg-transparent"
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
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-neutral-200 shadow ring-0 transition duration-300 ease-in-out ${
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
                        className="bg-black/60 border border-gray-850 hover:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-250 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 flex-grow"
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
                        className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(6,180,212,0.15)] shrink-0 border-0"
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
                className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-slate-900/40 rounded-xl text-xs font-mono text-zinc-400 hover:text-cyan-400 font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer bg-transparent"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
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
                              className="p-1 rounded bg-[#090d16] border border-gray-850 text-zinc-500 hover:text-cyan-400 transition-colors border-0"
                              title="Rename Session"
                            >
                              <PenTool className="w-3 h-3" />
                            </button>
                            
                            <button
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              disabled={sessions.length <= 1}
                              className={`p-1 rounded bg-[#090d16] border border-gray-850 transition-colors border-0 ${
                                sessions.length <= 1 
                                  ? "text-zinc-850 cursor-not-allowed opacity-30" 
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
          {activeTab === "cartography" && (
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
                  {topology.links.map((link: any, lIdx: number) => {
                    const sourceNode = topology.nodes.find((n: any) => n.id === link.source);
                    const targetNode = topology.nodes.find((n: any) => n.id === link.target);
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
                  {topology.nodes.map((node: any, nIdx: number) => {
                    const isSelected = selectedCartNode === node.id;
                    
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
                  <div className="flex items-center justify-between border-b border-purple-955/40 pb-2">
                    <span className="text-[10px] uppercase font-mono font-black text-purple-400 tracking-widest">{selectedNodeData.type} Node Insight</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-955/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      Confidence: {selectedNodeData.confidence}%
                    </span>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xs font-bold text-white leading-normal">{selectedNodeData.label}</h4>
                    <p className="text-[10.5px] text-zinc-300 leading-relaxed font-sans">
                      {selectedNodeData.type === "root" && `Focus of the current multi-perspective discussion segment is mapped in real-time. Live scientific consensus index evaluates to 89.2%.`}
                      {selectedNodeData.type === "agent" && `Participating specialist model offering continuous reasoning trajectories toward scientific target safety.`}
                      {selectedNodeData.type === "concept" && `Extracted scientific pillar or hypothetical metric used as a cornerstone variable in arguments.`}
                    </p>
                  </div>
                  
                  {/* Node relationships list */}
                  {(() => {
                    const relations = topology.links.filter((l: any) => l.source === selectedNodeData.id || l.target === selectedNodeData.id);
                    if (relations.length > 0) {
                      return (
                        <div className="space-y-1.5 pt-1.5 border-t border-purple-955/20 text-left">
                          <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Topology Bridges ({relations.length})</span>
                          <div className="space-y-1">
                            {relations.map((rel: any, rIdx: number) => {
                              const relatedNode = topology.nodes.find((n: any) => n.id === (rel.source === selectedNodeData.id ? rel.target : rel.source));
                              if (!relatedNode) return null;
                              return (
                                <div key={rIdx} className="flex items-center justify-between text-[10px] font-sans bg-slate-950/40 px-2 py-1 rounded border border-zinc-900">
                                  <span className="text-zinc-450">Connection to <strong className="text-white font-medium">{relatedNode.label}</strong></span>
                                  <span className={`text-[8px] font-mono uppercase font-black tracking-wider px-1 rounded-sm ${
                                    rel.relationship === "supports" ? "text-emerald-400 bg-emerald-95d/40" : 
                                    rel.relationship === "contradicts" ? "text-rose-400 bg-rose-95d/40" :
                                    rel.relationship === "quantifies" ? "text-cyan-400 bg-cyan-95d/40" : "text-amber-400 bg-amber-95d/40"
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
                <div className="p-4 rounded-xl border border-dashed border-gray-850 text-center text-zinc-500 text-[11px] font-sans">
                  Click any node on the topology grid to analyze its exact logical connection vector, confidence matrix, and relative weight indices.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Sidebar Footer badge / Config drawer */}
      <div className="border-t border-gray-850 bg-slate-950/40 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 text-[11.5px] font-mono hover:text-white transition-colors cursor-pointer text-left focus:outline-none bg-transparent border-0"
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
                  className="flex-grow bg-slate-950/80 border border-gray-850/50 rounded-lg p-2 font-mono text-[10px] text-zinc-500 cursor-not-allowed select-none focus:outline-none w-full"
                />
              </div>

              <div className="bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-lg space-y-1.5 text-[9px] font-mono leading-normal text-zinc-400">
                <p>
                  The backend target origin is locked to preserve connection integrity.
                </p>
                <p className="border-t border-zinc-900/80 pt-1.5 text-zinc-500">
                  If the primary host experiences latency or fails, requests stream automatically to the secondary fallback origin:
                </p>
                <span className="block p-1 bg-black text-cyan-400 select-all font-semibold rounded text-[8.5px] truncate">
                  https://8cd48335.aiworkspace-f4d.pages.dev
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 text-left">
          <span className="flex items-center gap-1 text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/55" />
            Independent Sync Node
          </span>
          <span className="text-gray-600">v1.2.0</span>
        </div>
      </div>
    </motion.div>
  );
};
