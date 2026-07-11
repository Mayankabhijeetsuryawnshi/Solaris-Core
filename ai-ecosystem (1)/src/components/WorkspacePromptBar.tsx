/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Send, Sparkles, Paperclip, X, Play } from "lucide-react";
import { CustomWorkflow } from "../types";
import VideoDetectionModule from "./VideoDetectionModule";

interface WorkspacePromptBarProps {
  isCodeModeActive: boolean;
  activeWorkflowId: string;
  setActiveWorkflowId: (id: string) => void;
  customWorkflows: CustomWorkflow[];
  activeAttachment: { name: string; previewUrl: string } | null;
  setActiveAttachment: (attachment: any) => void;
  promptInput: string;
  setPromptInput: React.Dispatch<React.SetStateAction<string>>;
  feedingLevel: number;
  setFeedingLevel: (lvl: number) => void;
  enhancing: boolean;
  handleEnhancePrompt: () => void;
  handleSendPrompt: () => void;
  handleAttachmentUpload: (e: React.ChangeEvent<HTMLInputElement>, isDrop: boolean) => void;
  physicsModeActive: boolean;
}

export const WorkspacePromptBar: React.FC<WorkspacePromptBarProps> = ({
  isCodeModeActive,
  activeWorkflowId,
  setActiveWorkflowId,
  customWorkflows,
  activeAttachment,
  setActiveAttachment,
  promptInput,
  setPromptInput,
  feedingLevel,
  setFeedingLevel,
  enhancing,
  handleEnhancePrompt,
  handleSendPrompt,
  handleAttachmentUpload,
  physicsModeActive,
}) => {
  return (
    <div className="max-w-4xl mx-auto pt-6 border-t border-gray-900">
      <div className={`transition-all duration-500 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden border ${
        isCodeModeActive 
          ? "bg-[#0b051c]/90 border-purple-500/35 shadow-[0_0_25px_rgba(168,85,247,0.15)]" 
          : "bg-[#090d16]/90 border border-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      }`}>
        
        {/* Coder Simulated CLI Terminal Path */}
        {isCodeModeActive && (
          <div className="flex items-center space-x-2 pb-2.5 mb-2.5 border-b border-purple-950/40 font-mono text-[10.5px]">
            <span className="text-purple-400 font-extrabold">claude@codespace:~$</span>
            <span className="text-[#a78bfa]/50 text-[10px] sm:text-xs"># multi-model live orchestration pipeline initialized</span>
            <span className="ml-auto text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
              PARALLEL
            </span>
          </div>
        )}

        {/* Dynamic workflow label tag */}
        {activeWorkflowId !== "none" && (
          <div className={`inline-flex items-center space-x-1.5 mb-3 px-2.5 py-1 rounded font-mono text-[10px] ${
            isCodeModeActive
              ? "bg-purple-500/10 border border-purple-500/20 text-purple-300"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}>
            <span className={`w-2 h-2 animate-pulse rounded-full shrink-0 ${isCodeModeActive ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            <span className="uppercase font-bold tracking-wider">Workflow: {customWorkflows.find(w => w.id === activeWorkflowId)?.name}</span>
          </div>
        )}

        {/* Attachment Preview Bubble */}
        {activeAttachment && (
          <div className="flex items-center gap-2 mb-3 p-1.5 bg-slate-950/80 border border-gray-800 rounded-xl w-fit relative group">
            <img 
              src={activeAttachment.previewUrl} 
              alt="Upload preview" 
              className="w-10 h-10 object-cover rounded-lg border border-gray-800"
            />
            <div className="pr-4 max-w-[150px] overflow-hidden text-left">
              <span className="block text-[9px] font-mono text-zinc-500 truncate">{activeAttachment.name}</span>
              <span className="block text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider animate-pulse">Ready to Analyze</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveAttachment(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-colors border-0"
              title="Remove Image"
            >
              <X className="w-3" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-start space-x-3">
          <div className="w-full relative">
            <textarea
              id="workspace_prompt_area"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={
                isCodeModeActive
                  ? "Input software specification or algorithmic code constraints to dispatch to the parallel model fleet..."
                  : "Enter one global prompt to query all model grids simultaneously..."
              }
              className="w-full bg-transparent border-0 text-sm h-24 text-neutral-200 placeholder-gray-550 focus:outline-none resize-none align-top scrollbar-thin pr-12 pt-1.5"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
            />
            
            {/* Text length helper */}
            <span className="absolute bottom-2 right-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-slate-950 border border-gray-900 px-1.5 py-0.5 rounded">
              TS Mode
            </span>
          </div>
        </div>

        {/* Video detection and analysis system */}
        <VideoDetectionModule 
          inputText={promptInput}
          onTextAppend={(text) => setPromptInput(prev => prev + text)}
          accentColor={physicsModeActive ? "cyan" : isCodeModeActive ? "purple" : "emerald"}
        />

        {/* Information Feeding Selector for Prompt Bar */}
        <div className={`mt-2 mb-1 p-2 rounded-xl text-left flex flex-col md:flex-row md:items-center md:justify-between gap-2 transition-all duration-300 ${
          isCodeModeActive
            ? "bg-purple-950/15 border border-purple-500/15"
            : "bg-emerald-950/15 border border-emerald-500/15"
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`text-[8.5px] uppercase tracking-wider font-mono font-bold ${
              isCodeModeActive ? "text-purple-300" : "text-emerald-300"
            }`}>
              FEEDING LEVEL
            </span>
            <span className={`text-[8px] font-mono font-bold px-1 rounded-sm ${
              isCodeModeActive ? "bg-purple-500/15 text-purple-300 border border-purple-500/10" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/10"
            }`}>
              {feedingLevel === 0 ? "Off / Standalone" : `${feedingLevel}x Nodes`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[9px]">
            <span className="text-zinc-500 text-[8px] uppercase">Select:</span>
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-gray-900">
              {([0, 8, 9, 10, 11, 12] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFeedingLevel(lvl)}
                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer border-0 ${
                    feedingLevel === lvl
                      ? isCodeModeActive
                        ? "bg-purple-600 border border-purple-400 text-white font-extrabold"
                        : "bg-emerald-500 border border-emerald-400 text-black font-extrabold"
                      : "text-gray-500 hover:text-zinc-200 hover:bg-white/5 bg-transparent"
                  }`}
                >
                  {lvl === 0 ? "Off" : `${lvl}x`}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block max-w-[280px] truncate text-right">
            <span className="text-[8px] font-mono text-zinc-400">
              {feedingLevel === 0 && "Standard prompt directly (Not compulsory)"}
              {feedingLevel === 8 && "Level 8: Basic Scope & Syntax Parsing"}
              {feedingLevel === 9 && (isCodeModeActive ? "Level 9: + Algorithmic Big-O Optimization" : "Level 9: + Multi-perspective scholarly logic")}
              {feedingLevel === 10 && (isCodeModeActive ? "Level 10: + Deep Boundary Condition Checks" : "Level 10: + Anomaly & Tail-risk validation")}
              {feedingLevel === 11 && (isCodeModeActive ? "Level 11: + Sandboxed Thread-Safety" : "Level 11: + Long-term equilibrium feeds")}
              {feedingLevel === 12 && (isCodeModeActive ? "Level 12: + Full-Fleet Cross-Examination" : "Level 12: + Full-Fleet debating syntheses")}
            </span>
          </div>
        </div>

        {/* Input Toolbar actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between pt-3 mt-3 border-t border-gray-800/50">
          <div className="flex items-center gap-2">
            
            {/* Image Attachment Button */}
            <label className={`inline-flex items-center justify-center p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-gray-850 text-cyan-404 hover:text-cyan-300 transition-colors cursor-pointer ${activeAttachment ? 'ring-1 ring-emerald-500/35 border-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'}`} title="Attach diagnostic image or schema (PNG/JPG)">
              <Paperclip className="w-4 h-4" />
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => handleAttachmentUpload(e, false)}
                className="hidden"
              />
            </label>

            {/* Auto Enhance prompt button */}
            <button
              onClick={handleEnhancePrompt}
              disabled={enhancing || !promptInput}
              className={`flex-grow sm:flex-grow-0 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                enhancing 
                  ? "bg-slate-900 border-slate-850 text-gray-500 cursor-not-allowed" 
                  : isCodeModeActive
                    ? "bg-purple-950/40 hover:bg-purple-500/10 border-purple-500/40 text-purple-300 hover:text-white"
                    : "bg-emerald-950/40 hover:bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:text-white"
              }`}
              title="Let Gemini optimize and enhance your prompt automatically using advanced schemas"
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${enhancing ? 'animate-spin' : isCodeModeActive ? 'text-purple-400' : 'text-emerald-400'}`} />
              <span>{enhancing ? "Enhancing..." : "Auto Enhance"}</span>
            </button>

            {/* Quick Preset workflow dropdown helper */}
            <div className="flex-grow sm:flex-grow-0 relative inline-block text-left">
              <select
                value={activeWorkflowId}
                onChange={(e) => setActiveWorkflowId(e.target.value)}
                className={`w-full border rounded-lg text-xs px-3 py-2 sm:py-1.5 focus:outline-none cursor-pointer transition-colors ${
                  isCodeModeActive
                    ? "bg-[#100a2b] border-purple-500/25 text-purple-300 hover:bg-purple-950/40"
                    : "bg-slate-950/65 hover:bg-slate-900 border-gray-800 text-neutral-400 hover:text-white"
                }`}
                title="Inject predefined template adapter context"
              >
                {customWorkflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id} className="bg-slate-950 text-neutral-350">
                    {workflow.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Send action Button */}
          <button
            id="workspace_send_btn"
            onClick={handleSendPrompt}
            disabled={!promptInput.trim()}
            className={`group relative px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center space-x-1.5 overflow-hidden transition-all duration-300 border-0 cursor-pointer ${
              promptInput.trim() 
                ? isCodeModeActive
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]" 
                : "bg-gray-850/60 text-gray-500 border border-gray-800 cursor-not-allowed shadow-none"
            }`}
          >
            <span>SEND PROMPT</span>
            <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
