/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Cpu, Sparkles, Copy, Play } from "lucide-react";

interface SwarmDebatePanelProps {
  isMasterCodeModeActive: boolean;
  isCodeModeActive: boolean;
  physicsModeActive: boolean;
  consensusTopic: string;
  setConsensusTopic: (val: string) => void;
  consensusStatus: "idle" | "conversing" | "fusing" | "completed" | "error";
  consensusLogs: Array<{ modelId: string; modelName: string; content: string; key: number }>;
  consensusFinalResult: string;
  handleRunSwarmConsensus: () => void;
  renderFormattedConsensusText: (text: string) => React.ReactNode;
}

export const SwarmDebatePanel: React.FC<SwarmDebatePanelProps> = ({
  isMasterCodeModeActive,
  isCodeModeActive,
  physicsModeActive,
  consensusTopic,
  setConsensusTopic,
  consensusStatus,
  consensusLogs,
  consensusFinalResult,
  handleRunSwarmConsensus,
  renderFormattedConsensusText,
}) => {
  if (!isMasterCodeModeActive) return null;

  return (
    <div className={`mb-8 p-5 md:p-8 rounded-2xl border-2 relative overflow-hidden backdrop-blur-xl transition-all duration-700 ${
      isCodeModeActive
        ? "bg-gradient-to-b from-[#180d04] via-[#0f0701] to-[#040200] border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
        : "bg-gradient-to-b from-[#02140a] via-[#010804] to-[#000402] border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    }`}>
      {/* Glowing decorative laser grid styling */}
      <div className={`absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-35 ${
        isCodeModeActive 
          ? "bg-[size:24px_24px] bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)]" 
          : "bg-[size:28px_28px] bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)]"
      }`} />
      
      {/* Tactical status beam */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-5 relative z-10 font-mono gap-3 ${
        isCodeModeActive 
          ? "border-amber-500/20" 
          : "border-emerald-500/20"
      }`}>
        <div className="flex items-center space-x-2.5 text-left">
          <div>
            <h2 className={`text-sm font-extrabold tracking-widest uppercase ${isCodeModeActive ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isCodeModeActive ? "Multi-Agent Swarm Consensus Hub" : "Universal Swarm Debate Seminar"}
            </h2>
          </div>
        </div>
      </div>

      {/* Topic specification block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 relative z-10 text-left">
        <div className="lg:col-span-8">
          <div className="relative">
            <input 
              type="text" 
              value={consensusTopic} 
              onChange={(e) => setConsensusTopic(e.target.value)}
              placeholder={
                isCodeModeActive 
                  ? "e.g. Architect a highly secure multi-threaded web socket server in Rust..." 
                  : "e.g. Analyze the geopolitical, economic, and systemic implications of asteroid helium-3 mining..."
              } 
              className={`w-full bg-black/85 border rounded-xl px-4 py-3 text-xs focus:outline-none shadow-inner block ${
                isCodeModeActive 
                  ? "border-amber-500/30 text-amber-100 placeholder-amber-950/60 focus:border-amber-400" 
                  : "border-emerald-500/30 text-emerald-100 placeholder-emerald-950/60 focus:border-emerald-400"
              }`}
            />
          </div>
        </div>
        <div className="lg:col-span-4 flex items-end">
          <button
            onClick={handleRunSwarmConsensus}
            disabled={consensusStatus === "conversing" || consensusStatus === "fusing"}
            className={`w-full py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 border cursor-pointer ${
              consensusStatus === "conversing" || consensusStatus === "fusing"
                ? "bg-neutral-900 border-neutral-850 text-neutral-600 cursor-not-allowed"
                : isCodeModeActive
                  ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]"
            }`}
          >
            {consensusStatus === "conversing" ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>Scientists Solving...</span>
              </>
            ) : consensusStatus === "fusing" ? (
              <>
                <Sparkles className="w-4 h-4 animate-pulse text-white" />
                <span>Nobel Synthesis...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Trigger Swarm Solver</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section where selected AI talk to each other (opinions) */}
      <div className="mb-6 space-y-4 text-left">
        <h3 className={`text-[10px] font-mono uppercase tracking-widest font-extrabold pb-2 border-b flex justify-between items-center ${
          isCodeModeActive ? "text-amber-500 border-amber-500/10" : "text-emerald-500 border-emerald-500/10"
        }`}>
          <span>Multi-Agent Argumentation & Discussion Pipeline</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-950 font-bold border border-zinc-900 text-zinc-400">
            {consensusLogs.length > 0 ? `${consensusLogs.length} TRANSMISSIONS ACTIVE` : "PENDING TRIGGER"}
          </span>
        </h3>
        
        {consensusLogs.length > 0 ? (
          /* Scrollable conversational feed of agents talking to each other */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {consensusLogs.map((log) => (
              <motion.div
                key={log.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border bg-black/60 flex flex-col justify-between space-y-3 shadow-md transition-all group ${
                  isCodeModeActive 
                    ? "border-amber-500/10 hover:border-amber-500/20" 
                    : "border-emerald-500/10 hover:border-emerald-500/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isCodeModeActive ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className={`text-[10.5px] font-extrabold font-mono uppercase tracking-wider ${
                        isCodeModeActive ? "text-amber-300" : "text-emerald-300"
                      }`}>{log.modelName}</span>
                    </div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                      isCodeModeActive 
                        ? "text-amber-500/50 bg-amber-500/5 border-amber-500/10" 
                        : "text-emerald-500/50 bg-emerald-500/5 border-emerald-500/10"
                    }`}>OPINION #{log.key + 1}</span>
                  </div>
                  <div className="text-[11px] select-text leading-relaxed text-zinc-300 pr-1 max-h-[220px] overflow-y-auto font-sans">
                    {renderFormattedConsensusText(log.content)}
                  </div>
                </div>
                <div className={`pt-2 border-t flex items-center justify-between text-[8px] font-mono ${
                  isCodeModeActive ? "border-amber-500/5 text-amber-500/40" : "border-emerald-500/5 text-emerald-500/40"
                }`}>
                  <span>SEGMENT RESPONDED</span>
                  <span className="group-hover:text-amber-400 transition-colors uppercase">TRANSMISSION OVER</span>
                </div>
              </motion.div>
            ))}
            
            {consensusStatus === "conversing" && (
              <div className={`p-4 rounded-xl border border-dashed bg-black/20 flex flex-col items-center justify-center text-center space-y-2 animate-pulse min-h-[180px] ${
                isCodeModeActive ? "border-amber-500/30" : "border-emerald-500/30"
              }`}>
                <Cpu className={`w-5 h-5 animate-spin ${isCodeModeActive ? 'text-amber-550' : 'text-emerald-555'}`} />
                <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider ${
                  isCodeModeActive ? 'text-amber-400' : 'text-emerald-400'
                }`}>Gathering Next Agent Opinion...</span>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-6 rounded-2xl border text-center transition-all bg-[#04060b]/60 ${
            isCodeModeActive ? "border-amber-500/10" : "border-emerald-500/10"
          }`}>
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center mx-auto mb-3">
              <Cpu className={`w-4 h-4 ${isCodeModeActive ? "text-amber-400" : "text-emerald-400"}`} />
            </div>
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-300 tracking-wider">Argumentation Fleet Primed & Ready</h4>
            <p className="text-[10.5px] text-zinc-500 mt-1 max-w-lg mx-auto leading-relaxed">
              No active discussion links have been established yet. Click <strong className={`font-semibold ${isCodeModeActive ? 'text-amber-400' : 'text-emerald-400'}`}>"Trigger Swarm Solver"</strong> in the panel above to begin opinion stream aggregation from the multiple scientific nodes.
            </p>
          </div>
        )}
      </div>

      {/* Claude AI Debate Synthesis / Summary */}
      {(consensusFinalResult || consensusStatus === "fusing") && (
        <div className="mt-8 mb-8 text-left">
          <h3 className={`text-[10px] font-mono uppercase tracking-widest font-extrabold pb-2 border-b flex justify-between items-center mb-4 ${
            isCodeModeActive ? "text-amber-500 border-amber-500/10" : "text-emerald-500 border-emerald-500/10"
          }`}>
            <span>Claude AI Master Debate Synthesis</span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
              isCodeModeActive 
                ? "bg-amber-950/45 border-amber-500/20 text-amber-300" 
                : "bg-emerald-950/45 border-emerald-500/20 text-emerald-300 animate-pulse"
            }`}>
              {consensusStatus === "fusing" ? "GENERATING SUMMARY" : "SYNTHESIS CONCLUDED"}
            </span>
          </h3>

          <div className={`p-6 md:p-8 border rounded-2xl relative overflow-hidden shadow-2xl transition-all duration-700 ${
            isCodeModeActive 
              ? "border-amber-500/20 bg-gradient-to-b from-[#180d04]/60 to-black/80 shadow-[0_0_30px_rgba(245,158,11,0.06)]" 
              : "border-emerald-500/20 bg-gradient-to-b from-[#02140a]/30 to-black/80 shadow-[0_0_30px_rgba(16,185,129,0.06)]"
          }`}>
            {/* Top accent light bar */}
            <div className={`absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent ${
              isCodeModeActive ? "via-amber-500/40" : "via-emerald-500/40"
            }`} />

            <div className="relative z-10 space-y-6">
              {consensusFinalResult ? (
                <div className="text-xs md:text-sm leading-relaxed text-zinc-200 select-text font-sans">
                  {renderFormattedConsensusText(consensusFinalResult)}
                </div>
              ) : consensusStatus === "fusing" ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className={`w-12 h-12 border-2 rounded-full animate-ping pointer-events-none absolute inset-0 ${
                      isCodeModeActive ? "border-amber-500/20" : "border-emerald-500/20"
                    }`} />
                    <Cpu className={`w-12 h-12 animate-spin ${isCodeModeActive ? 'text-amber-400' : 'text-emerald-400'}`} style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="text-center font-mono space-y-1">
                    <p className={`text-xs font-black uppercase tracking-widest animate-pulse ${
                      isCodeModeActive ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      Synthesis in Progress...
                    </p>
                    <p className="text-[10px] text-zinc-500 max-w-md mx-auto leading-relaxed">
                      Claude Fable 5 is compiling perspective arguments and key strategic pillars from all 12 debate dialogue contributions into the unified Master Synthesis summary report...
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {consensusFinalResult && (
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-zinc-900 z-10 relative">
                <button
                  onClick={() => navigator.clipboard.writeText(consensusFinalResult)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 cursor-pointer bg-transparent ${
                    isCodeModeActive 
                      ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-white" 
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:text-white"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
