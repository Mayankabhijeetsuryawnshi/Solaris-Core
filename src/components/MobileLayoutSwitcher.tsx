/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ModelInfo } from "../types";

interface MobileLayoutSwitcherProps {
  isMobile: boolean;
  mobileLayout: "stack" | "tabs" | "split";
  setMobileLayout: (mode: "stack" | "tabs" | "split") => void;
  activeModels: ModelInfo[];
  selectedMobileModelId: string;
  setSelectedMobileModelId: (id: string) => void;
  splitModelId1: string;
  setSplitModelId1: (id: string) => void;
  splitModelId2: string;
  setSplitModelId2: (id: string) => void;
}

export const MobileLayoutSwitcher: React.FC<MobileLayoutSwitcherProps> = ({
  isMobile,
  mobileLayout,
  setMobileLayout,
  activeModels,
  selectedMobileModelId,
  setSelectedMobileModelId,
  splitModelId1,
  setSplitModelId1,
  splitModelId2,
  setSplitModelId2,
}) => {
  if (!isMobile) return null;

  return (
    <div className="px-5 py-3.5 bg-slate-950/60 border-b border-gray-800/50 flex flex-col gap-3 relative z-10 shrink-0 select-none text-left">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Comparison Layout</span>
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-gray-850">
          {(["stack", "tabs", "split"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setMobileLayout(mode)}
              className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer border-0 ${
                mobileLayout === mode
                  ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold"
                  : "text-zinc-500 hover:text-white bg-transparent"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-config depending on layout chosen */}
      {mobileLayout === "tabs" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {activeModels.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMobileModelId(m.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer whitespace-nowrap border ${
                selectedMobileModelId === m.id
                  ? "bg-slate-900 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-950/40 border-gray-900/60 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${m.bgColor}`} />
                {m.name.replace(" Chat", "").replace(" Coder", "").replace(" Turbo", "")}
              </span>
            </button>
          ))}
        </div>
      )}

      {mobileLayout === "split" && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Left Column</label>
            <select
              value={splitModelId1}
              onChange={(e) => setSplitModelId1(e.target.value)}
              className="bg-slate-900 border border-gray-800 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500/35 font-mono text-[10px] cursor-pointer"
            >
              {activeModels.map(m => (
                <option key={m.id} value={m.id} disabled={m.id === splitModelId2}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Right Column</label>
            <select
              value={splitModelId2}
              onChange={(e) => setSplitModelId2(e.target.value)}
              className="bg-slate-900 border border-gray-800 rounded-lg p-1.5 text-zinc-300 focus:outline-none focus:border-emerald-500/35 font-mono text-[10px] cursor-pointer"
            >
              {activeModels.map(m => (
                <option key={m.id} value={m.id} disabled={m.id === splitModelId1}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
