/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cpu, Sparkles } from "lucide-react";

interface SimulationControlsProps {
  isCodeModeActive: boolean;
  telemetryFps: number;
  telemetryVram: number;
  telemetryPath: string;
  vfxColorPreset: string;
  setVfxColorPreset: (preset: string) => void;
  vfxShaderMode: "path-traced" | "ambient";
  setVfxShaderMode: (mode: "path-traced" | "ambient") => void;
  vfxFpsCap: number;
  setVfxFpsCap: (fps: number) => void;
  vfxTrailWidth: number;
  setVfxTrailWidth: (width: number) => void;
  vfxTrailLength: number;
  setVfxTrailLength: (length: number) => void;
  vfxParticleCount: number;
  setVfxParticleCount: (count: number) => void;
  vfxPhysicsFriction: number;
  setVfxPhysicsFriction: (friction: number) => void;
  vfxLatticeDist: number;
  setVfxLatticeDist: (dist: number) => void;
  vfxBloomGlow: number;
  setVfxBloomGlow: (glow: number) => void;
  vfxAberration: number;
  setVfxAberration: (aberration: number) => void;
  vfxSoundEnabled: boolean;
  setVfxSoundEnabled: (enabled: boolean) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isCodeModeActive,
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
}) => {
  return (
    <div className="space-y-4">
      {/* Diagnostic Monitor Panel */}
      <div className={`p-3 border rounded-xl relative overflow-hidden backdrop-blur-md ${
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
              {(1000 / Math.max(1, telemetryFps)).toFixed(2)} ms
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

      <div className="space-y-3.5">
        <div className="border-t border-gray-900/60 pt-2 text-left">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block mb-2">Pillar 1: Color Space Theme Override</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "stellar-orbit", label: "Stellar Purple", color: "bg-purple-600" },
              { id: "aurora-emerald", label: "Aurora Emerald", color: "bg-emerald-500" },
              { id: "hyper-cyan", label: "Hyper Cyan", color: "bg-cyan-400" },
              { id: "solar-flare", label: "Solar Flare", color: "bg-orange-500" },
              { id: "monochrome", label: "Monochrome Pass", color: "bg-slate-400" }
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
        <div className="space-y-1 text-left">
          <label className="text-[9.5px] font-mono uppercase tracking-wider text-gray-400 block">Render Pipeline Shading Mode</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setVfxShaderMode("path-traced")}
              className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                vfxShaderMode === "path-traced"
                  ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                  : "bg-slate-950 border-gray-850 text-gray-500"
              }`}
            >
              Path-Traced Space Dust
            </button>
            <button
              onClick={() => setVfxShaderMode("ambient")}
              className={`py-1.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                vfxShaderMode === "ambient"
                  ? vfxShaderMode === "ambient"
                    ? isCodeModeActive ? "bg-purple-600/10 border-purple-500 text-purple-300" : "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white"
                  : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white"
              }`}
            >
              Ambient Nebula Grid
            </button>
          </div>
        </div>

        {/* Pillar 2: Motion, Fluidity & Timing */}
        <div className="border-t border-gray-900/60 pt-3.5 space-y-3 text-left">
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
                  className={`flex-grow py-1 rounded text-[9px] font-mono border cursor-pointer ${
                    vfxFpsCap === fps
                      ? isCodeModeActive ? "bg-purple-600 border-purple-500 text-white" : "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                      : "bg-slate-950 border-gray-850 text-gray-450 hover:text-white"
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
        <div className="border-t border-gray-900/60 pt-3.5 space-y-3 text-left">
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
        <div className="border-t border-gray-900/60 pt-3.5 space-y-3 text-left">
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
          <div className="flex items-center justify-between border-t border-gray-900/40 pt-2.5 text-left">
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
  );
};
