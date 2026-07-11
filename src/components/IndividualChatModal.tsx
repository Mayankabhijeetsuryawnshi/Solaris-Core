/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ModelInfo, ChatMessage } from "../types";
import { getModelAvatar } from "../utils/avatar";
import { renderFormattedConsensusText } from "../utils/mathRenderer";

interface IndividualChatModalProps {
  individualChatModelId: string | null;
  setIndividualChatModelId: (id: string | null) => void;
  models: ModelInfo[];
  chatHistories: Record<string, ChatMessage[]>;
  responses: Record<string, { modelId: string; content: string; status: "idle" | "loading" | "streaming" | "completed" | "error"; error?: string }>;
  individualChatScrollRef: React.RefObject<HTMLDivElement | null>;
  individualChatInput: string;
  setIndividualChatInput: (val: string) => void;
  handleSendIndividualChatMessage: () => void;
  physicsModeActive: boolean;
  handleSyncTelemetry: (paramName: string, paramValue: number) => void;
}

export const IndividualChatModal: React.FC<IndividualChatModalProps> = ({
  individualChatModelId,
  setIndividualChatModelId,
  models,
  chatHistories,
  responses,
  individualChatScrollRef,
  individualChatInput,
  setIndividualChatInput,
  handleSendIndividualChatMessage,
  physicsModeActive,
  handleSyncTelemetry,
}) => {
  if (!individualChatModelId) return null;

  const selModel = models.find(m => m.id === individualChatModelId);
  if (!selModel) return null;

  const modelHistory = chatHistories[individualChatModelId] || [];
  const modelResp = responses[individualChatModelId] || { modelId: individualChatModelId, content: "", status: "idle" };
  const isPending = modelResp.status === "loading" || modelResp.status === "streaming";

  return (
    <AnimatePresence>
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
                    : "bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,180,212,0.25)] border-0"
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
    </AnimatePresence>
  );
};
