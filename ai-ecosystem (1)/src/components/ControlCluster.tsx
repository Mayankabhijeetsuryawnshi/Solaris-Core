import React from "react";
import { 
  MessageSquare, 
  Activity,
  Binary
} from "lucide-react";

interface ControlClusterProps {
  isCodeModeActive: boolean;
  setIsCodeModeActive: (val: boolean) => void;
  physicsModeActive: boolean;
  setPhysicsModeActive: (val: boolean) => void;
  layoutMode: "grid" | "side-by-side";
  setLayoutMode: (val: "grid" | "side-by-side") => void;
}

export default function ControlCluster({
  isCodeModeActive,
  setIsCodeModeActive,
  physicsModeActive,
  setPhysicsModeActive,
  layoutMode,
  setLayoutMode,
}: ControlClusterProps) {

  // Current active tab detection
  const isDebateSwarmActive = !physicsModeActive && layoutMode === "grid";
  const isDebateActive = !physicsModeActive && layoutMode === "side-by-side";
  const isNumericalActive = physicsModeActive;

  const handleSelectDebateSwarm = () => {
    setPhysicsModeActive(false);
    setLayoutMode("grid");
  };

  const handleSelectDebate = () => {
    setPhysicsModeActive(false);
    setLayoutMode("side-by-side");
  };

  const handleSelectNumerical = () => {
    setPhysicsModeActive(true);
  };

  return (
    <div className="flex items-center gap-3 bg-transparent select-none text-left shrink-0">
      {/* Three tabs for: Debate Swarm, Debate, Numerical */}
      <div className="bg-[#09090b]/95 border border-zinc-800/80 rounded-xl p-1 flex flex-row items-center gap-0.5 shadow-2xl overflow-hidden">
        
        {/* Debate Swarm tab */}
        <button
          id="nav_debate_swarm_tab"
          type="button"
          onClick={handleSelectDebateSwarm}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-250 cursor-pointer ${
            isDebateSwarmActive 
              ? isCodeModeActive
                ? "bg-purple-500/10 border border-purple-500/35 text-purple-300 font-bold"
                : "bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.12)]" 
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="font-mono text-[9.5px] tracking-wider uppercase">Consensus Grid</span>
        </button>

        {/* Debate tab */}
        <button
          id="nav_debate_tab"
          type="button"
          onClick={handleSelectDebate}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-250 cursor-pointer ${
            isDebateActive 
              ? isCodeModeActive
                ? "bg-purple-500/10 border border-purple-500/35 text-purple-300 font-bold"
                : "bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.12)]" 
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="font-mono text-[9.5px] tracking-wider uppercase">Comparison</span>
        </button>

        {/* Numerical tab */}
        <button
          id="nav_numerical_tab"
          type="button"
          onClick={handleSelectNumerical}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-250 cursor-pointer relative ${
            isNumericalActive 
              ? isCodeModeActive
                ? "bg-purple-500/10 border border-purple-500/35 text-purple-300 font-bold"
                : "bg-cyan-500/10 border border-cyan-500/35 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
              : "border border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span className="font-mono text-[9.5px] tracking-wider uppercase">Simulation</span>
        </button>

      </div>

      {/* Pro Mode Switch */}
      <div className="flex items-center gap-2 bg-[#09090b]/95 border border-zinc-800/80 rounded-xl px-3 py-1.5 shadow-2xl">
        <span className={`font-mono text-[9.5px] uppercase tracking-wider transition-colors duration-300 ${isCodeModeActive ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
          Code Mode
        </span>
        <button
          id="nav_pro_mode_toggle"
          type="button"
          onClick={() => setIsCodeModeActive(!isCodeModeActive)}
          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
            isCodeModeActive ? "bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "bg-[#18181b]"
          }`}
          title="Toggle Code Mode"
        >
          <span
            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
              isCodeModeActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

    </div>
  );
}
