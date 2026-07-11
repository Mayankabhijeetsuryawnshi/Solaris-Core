/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ModelInfo } from "../types";
import CelestialCanvas from "./CelestialCanvas";

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied for key:", key, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied for key:", key, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removal denied for key:", key, e);
    }
  }
};

interface LandingPageProps {
  onLaunch: () => void;
  models: ModelInfo[];
  isCodeModeActive: boolean;
  setIsCodeModeActive: (val: boolean) => void;
  physicsModeActive: boolean;
  setPhysicsModeActive: (val: boolean) => void;
  userPasscode: string;
  setUserPasscode: (val: string) => void;
}

export default function LandingPage({ 
  onLaunch, 
  models, 
  isCodeModeActive, 
  setIsCodeModeActive,
  physicsModeActive,
  setPhysicsModeActive,
  userPasscode,
  setUserPasscode
}: LandingPageProps) {
  const [localCode, setLocalCode] = useState(userPasscode);

  const handleLaunchClick = () => {
    let currentCode = localCode;
    if (!currentCode || currentCode.length !== 11) {
      let result = "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 11; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      currentCode = result;
      setLocalCode(result);
    }
    safeStorage.setItem("mas_user_passcode", currentCode);
    setUserPasscode(currentCode);
    onLaunch();
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ${
      physicsModeActive
        ? "bg-[#020512]"
        : isCodeModeActive 
          ? "bg-[#04010a]" 
          : "bg-[#07090e]"
    } text-white ${
      physicsModeActive
        ? "selection:bg-cyan-500/35 selection:text-cyan-200"
        : isCodeModeActive 
          ? "selection:bg-purple-500/35 selection:text-purple-200" 
          : "selection:bg-emerald-500/30 selection:text-emerald-300"
    } font-sans relative overflow-x-hidden flex flex-col justify-between items-center py-8 md:py-12 px-4 md:px-6`}>
      
      {/* Interactive Celestial Particle Orbit Canvas Layer */}
      <CelestialCanvas isProMode={isCodeModeActive} isPhysicsMode={physicsModeActive} />

      {/* Dynamic Ambient Background Mesh Gradients */}
      <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700 ${
        physicsModeActive
          ? "bg-blue-600/10 animate-pulse duration-[8000ms]"
          : isCodeModeActive ? "bg-purple-600/10 animate-pulse duration-[8000ms]" : "bg-emerald-500/5"
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] blur-[140px] rounded-full pointer-events-none transition-colors duration-700 ${
        physicsModeActive
          ? "bg-cyan-600/10 animate-pulse duration-[10000ms]"
          : isCodeModeActive ? "bg-fuchsia-600/10 animate-pulse duration-[10000ms]" : "bg-[#06b6d4]/5"
      }`} />

      {/* Floating Top Right Mode Switch Panel */}
      <div className="absolute top-6 right-6 z-40 flex flex-col gap-2.5 bg-slate-950/80 border border-gray-800/45 p-2.5 rounded-xl backdrop-blur-md shadow-inner min-w-[130px]">
        {/* PRO Code Mode Switch */}
        <div className="flex items-center justify-between gap-3">
          <span className={`font-mono text-[9px] uppercase tracking-wider transition-colors duration-300 ${isCodeModeActive && !physicsModeActive ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}>
            Code Mode
          </span>
          <button
            onClick={() => {
              setIsCodeModeActive(!isCodeModeActive);
              setPhysicsModeActive(false);
            }}
            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
              isCodeModeActive && !physicsModeActive ? "bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "bg-neutral-800"
            }`}
            title="Toggle Code Mode"
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                isCodeModeActive && !physicsModeActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Subtle Separator */}
        <div className="h-[1px] bg-zinc-800/50 w-full" />

        {/* Numerical Mode Switch */}
        <div className="flex items-center justify-between gap-3">
          <span className={`font-mono text-[9px] uppercase tracking-wider transition-colors duration-300 ${physicsModeActive ? 'text-cyan-400 font-bold' : 'text-zinc-500'}`}>
            Simulation Mode
          </span>
          <button
            onClick={() => {
              const nextVal = !physicsModeActive;
              setPhysicsModeActive(nextVal);
              if (nextVal) {
                setIsCodeModeActive(false);
              }
            }}
            className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ${
              physicsModeActive ? "bg-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-neutral-800"
            }`}
            title="Toggle Simulation Mode"
          >
            <span
              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                physicsModeActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Decorative Grid Overlay */}
      <div 
         className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40"
         style={{ maskImage: "radial-gradient(ellipse at center, black, transparent 80%)" }}
       />

      {/* Spacer to keep alignment balance */}
      <div />

      {/* Main Centered Launch Card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full border p-6 sm:p-8 md:p-10 rounded-3xl backdrop-blur-xl transition-all duration-700 ${
            physicsModeActive
              ? "bg-[#04081c]/80 border-blue-500/30 shadow-[0_30px_100px_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.08)]"
              : isCodeModeActive 
                ? "bg-[#0b061c]/80 border-purple-500/25 shadow-[0_30px_100px_rgba(168,85,247,0.12),inset_0_1px_1px_rgba(255,255,255,0.08)]" 
                : "bg-[#090d16]/75 border-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          } relative overflow-hidden`}
        >
          {/* Top subtle light streak */}
          <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent transition-all duration-700 ${
            physicsModeActive ? "via-cyan-500/40" : isCodeModeActive ? "via-purple-500/40" : "via-emerald-500/35"
          }`} />

          {/* Typography */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-400 font-sans uppercase">
              {physicsModeActive ? "NUMERICAL SYSTEM" : isCodeModeActive ? "DEVELOPMENT CONSOLE" : "MODEL SYSTEM"}
            </h2>
          </div>

          {/* Centered Launch Button */}
          <div className="flex flex-col items-center w-full relative">
            {isCodeModeActive && (
              <div className="absolute -inset-6 pointer-events-none z-0">
                {/* Outermost subtle dust ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-purple-500/5 flex items-center justify-between"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
                  <div className="w-1 h-1 rounded-full bg-purple-400/30" />
                </motion.div>

                {/* Asteroidal dashed orbit line */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-dashed border-purple-500/20"
                />

                {/* Inner planetary orbit with fuchsia celestial sphere */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-fuchsia-500/10 flex items-start justify-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-rose-400 shadow-[0_0_12px_rgba(217,70,239,0.7)] -mt-1.5"
                  />
                </motion.div>

                {/* Pulsing core aura background */}
                <motion.div
                  animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-2 bg-gradient-to-tr from-purple-500/5 via-fuchsia-500/5 to-transparent blur-xl rounded-full"
                />
              </div>
            )}
            <div className="flex flex-col gap-3.5 w-full relative z-10">
              {!physicsModeActive ? (
                <button
                  id="center_launch_workspace_btn"
                  onClick={() => {
                    handleLaunchClick();
                  }}
                  className={`w-full relative group inline-flex items-center justify-center px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.18em] transition-all duration-300 transform active:scale-[0.97] hover:scale-[1.01] ${
                    isCodeModeActive 
                      ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_0_35px_rgba(168,85,247,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.65)] border border-purple-300/35" 
                      : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] border border-emerald-300/35"
                  } cursor-pointer`}
                >
                  <span>Start Session</span>
                  <ArrowRight className={`w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1.5 ${isCodeModeActive ? 'text-white' : 'text-black'}`} />
                </button>
              ) : (
                <button
                  id="launch_physics_swarm_btn"
                  onClick={() => {
                    handleLaunchClick();
                  }}
                  className="w-full relative group inline-flex items-center justify-center px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 transform active:scale-[0.97] hover:scale-[1.01] bg-gradient-to-r from-indigo-650 via-blue-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.55)] border border-blue-400/30 font-black cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <span>Start Simulation</span>
                  <Sparkles className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:scale-110 text-cyan-200" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer System Credits */}
      <div className="relative z-10 text-center">
        <p className="text-[9px] font-mono text-zinc-650 tracking-[0.18em] uppercase">
          Solaris Systems
        </p>
      </div>

    </div>
  );
}
