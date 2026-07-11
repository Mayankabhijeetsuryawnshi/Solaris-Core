/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, PenTool, Trash2 } from "lucide-react";
import { ChatSession } from "../types";

interface SessionLogsProps {
  sessions: ChatSession[];
  currentSessionId: string;
  syncStatus: "idle" | "syncing" | "synced" | "error";
  userPasscode: string;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onCreateNewSession: () => void;
  onSyncAndSwitchIdentity: (passcode: string) => void;
}

export const SessionLogs: React.FC<SessionLogsProps> = ({
  sessions,
  currentSessionId,
  syncStatus,
  userPasscode,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onCreateNewSession,
  onSyncAndSwitchIdentity
}) => {
  return (
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
                    alert("Please enter a valid 11-character passcode.");
                    return;
                  }
                  onSyncAndSwitchIdentity(cleanCode);
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
        onClick={onCreateNewSession}
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
                onClick={() => onSelectSession(s.id)}
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
                          onRenameSession(s.id, newTitle);
                        }
                      }}
                      className="p-1 rounded bg-[#090d16] border border-gray-850 text-zinc-500 hover:text-cyan-400 transition-colors"
                      title="Rename Session"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id, e);
                      }}
                      disabled={sessions.length <= 1}
                      className={`p-1 rounded bg-[#090d16] border border-gray-850 transition-colors ${
                        sessions.length <= 1 
                          ? "text-zinc-800 cursor-not-allowed opacity-30" 
                          : "text-zinc-500 hover:text-rose-400"
                      }`}
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
