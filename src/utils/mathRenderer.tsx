/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const renderMathematicalFormula = (content: string): React.ReactNode => {
  let processed = content;

  // 1. Resolve braced vector/hat/dot modifiers
  processed = processed
    .replace(/\\vec\{([^{}]+)\}/g, '<span class="relative inline-block font-bold select-all">$1<span class="absolute -top-1 left-0 right-0 text-[9px] font-normal leading-none block text-center">→</span></span>')
    .replace(/\\hat\{([^{}]+)\}/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1 left-0 right-0 text-[10px] font-light leading-none block text-center">^</span></span>')
    .replace(/\\dot\{([^{}]+)\}/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1.5 left-0 right-0 text-[10px] font-bold leading-none block text-center">.</span></span>')
    .replace(/\\bar\{([^{}]+)\}/g, '<span class="overline select-all">$1</span>');

  // 2. Resolve single-char vector/hat modifiers (e.g. \vec v or \hat n)
  processed = processed
    .replace(/\\vec\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block font-bold select-all">$1<span class="absolute -top-1/2 left-0 right-0 text-[9px] font-normal leading-none block text-center">→</span></span>')
    .replace(/\\hat\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1/2 left-0 right-0 text-[10px] font-light leading-none block text-center">^</span></span>')
    .replace(/\\dot\s*([a-zA-Z0-9_])/g, '<span class="relative inline-block select-all">$1<span class="absolute -top-1.5 left-0 right-0 text-[10px] font-bold leading-none block text-center">.</span></span>');

  // 3. Clean up \left and \right matrix delimiters
  processed = processed
    .replace(/\\left\s*\[/g, '<span class="text-cyan-400 font-bold font-serif text-[13px] scale-y-125 inline-block mx-0.5">[</span>')
    .replace(/\\right\s*\]/g, '<span class="text-cyan-400 font-bold font-serif text-[13px] scale-y-125 inline-block mx-0.5">]</span>')
    .replace(/\\left\s*\(/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">(</span>')
    .replace(/\\right\s*\)/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">)</span>')
    .replace(/\\left\s*\\\{/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">{</span>')
    .replace(/\\right\s*\\\}/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">}</span>')
    .replace(/\\left\s*\\\|/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">|</span>')
    .replace(/\\right\s*\\\|/g, '<span class="text-cyan-400 font-light font-serif text-[13px] scale-y-125 inline-block mx-0.5">|</span>')
    .replace(/\\left\b/g, "")
    .replace(/\\right\b/g, "");

  // 4. Superscript and Subscript curly brace stripping (recursive up to 4 layers)
  for (let i = 0; i < 4; i++) {
    processed = processed
      .replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>")
      .replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
  }

  // 5. Standard Greek & Scientific Symbols
  processed = processed
    .replace(/\\omega/g, "ω")
    .replace(/\\theta/g, "θ")
    .replace(/\\pi/g, "π")
    .replace(/\\mu/g, "μ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\rho/g, "ρ")
    .replace(/\\lambda/g, "λ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\delta/g, "δ")
    .replace(/\\epsilon/g, "ε")
    .replace(/\\phi/g, "φ")
    .replace(/\\psi/g, "ψ")
    .replace(/\\eta/g, "η")
    .replace(/\\tau/g, "τ")
    .replace(/\\approx/g, "≈")
    .replace(/\\neq/g, "≠")
    .replace(/\\pm/g, "±")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\infty/g, "∞")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\partial/g, "∂")
    .replace(/\\nabla/g, "∇")
    .replace(/\\int/g, "∫")
    .replace(/\\sum/g, "Σ")
    .replace(/\\sqrt/g, "√")
    .replace(/\\hbar/g, "ħ")
    .replace(/\\deg/g, "°")
    .replace(/\\prod/g, "Π")
    .replace(/\\oint/g, "∮");

  // 5.5. Render mathematical factorials elegantly (e.g. n! or (n-k)!)
  processed = processed
    .replace(/([a-zA-Z0-9]+)!/g, '<span class="font-serif italic text-cyan-300">$1</span><span class="font-sans font-bold text-cyan-400">!</span>')
    .replace(/\(([^()]+)\)!/g, '<span class="font-sans font-semibold text-cyan-300">($1)</span><span class="font-sans font-bold text-cyan-400">!</span>');

  // 6. Inline index replacements - support factorials, subscripts, superscripts, brackets, and common operators
  processed = processed
    .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)\^([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sup>$2</sup>")
    .replace(/([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.()!+-]+)_([a-zA-Z0-9_ωθπμσαβγλΔδεφψηητ.+\/()!+-]+)/g, "$1<sub>$2</sub>");

  // 7. Render text macros beautifully
  processed = processed
    .replace(/\\text\s*\{([^{}]+)\}/g, '<span class="font-sans normal-case select-all">$1</span>')
    .replace(/\\mathrm\s*\{([^{}]+)\}/g, '<span class="font-sans select-all">$1</span>');

  return <span className="font-serif italic select-all inline-block align-middle" dangerouslySetInnerHTML={{ __html: processed }} />;
};

export const renderFractions = (text: string): React.ReactNode => {
  const regex = /(?:\\|\/)(?:fract|frac)\{([^{}]+)\}\{([^{}]+)\}/g;
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) {
    return renderMathematicalFormula(text);
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const matchIndex = match.index!;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`t-${idx}`}>{renderFractions(text.substring(lastIndex, matchIndex))}</span>);
    }
    const numerator = match[1];
    const denominator = match[2];
    parts.push(
      <span key={`f-${idx}`} className="inline-flex flex-col items-center justify-center align-middle mx-1.5 bg-slate-950/40 border border-slate-800/50 px-1 rounded-md text-[11px] leading-tight font-serif text-sky-305">
        <span className="border-b border-sky-450/40 pb-0.5 px-1 block text-center min-w-[20px]">{renderFractions(numerator)}</span>
        <span className="pt-0.5 px-1 block text-center min-w-[20px]">{renderFractions(denominator)}</span>
      </span>
    );
    lastIndex = matchIndex + match[0].length;
  });
  if (lastIndex < text.length) {
    parts.push(<span key="tail">{renderFractions(text.substring(lastIndex))}</span>);
  }
  return <>{parts}</>;
};

export const renderFormulasBlock = (text: string, onSyncParam?: (p: string, v: number) => void): React.ReactNode => {
  const formulaRegex = /(?:\\|\/)?formula\{([\s\S]*?)\}/g;
  const matches = [...text.matchAll(formulaRegex)];
  
  const highlightTelemetry = (rawText: string) => {
    if (!onSyncParam) return renderFractions(rawText);
    
    // Scan for numbers followed by physical units
    const telemetryRegex = /(\b\d+(?:\.\d+)?\s*(?:km|m\/s)\b)/gi;
    const pieces = rawText.split(telemetryRegex);
    if (pieces.length === 1) {
      return renderFractions(rawText);
    }
    
    return pieces.map((piece, pIdx) => {
      const match = piece.match(/^(\d+(?:\.\d+)?)\s*(km|m\/s)$/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        if (unit === "km" && val >= 150 && val <= 500) {
          return (
            <button
              key={`teleport-alt-${pIdx}`}
              type="button"
              onClick={() => onSyncParam("altitude", val)}
              className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 text-[10.5px] font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer leading-none"
              title="Click to Teleport this state to the Simulation Engine!"
            >
              <span>{val} km</span>
              <span className="text-[9px] text-cyan-400">⚡ Teleport</span>
            </button>
          );
        } else if (unit === "m/s" && val >= 2500 && val <= 4500) {
          return (
            <button
              key={`teleport-speed-${pIdx}`}
              type="button"
              onClick={() => onSyncParam("approachSpeed", val)}
              className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-950/40 text-[10.5px] font-mono font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer leading-none"
              title="Click to Teleport this state to the Simulation Engine!"
            >
              <span>{val} m/s</span>
              <span className="text-[9px] text-emerald-400">⚡ Teleport</span>
            </button>
          );
        }
      }
      return renderFractions(piece);
    });
  };

  if (matches.length === 0) {
    return highlightTelemetry(text);
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const matchIndex = match.index!;
    if (matchIndex > lastIndex) {
      parts.push(<span key={`pre-${idx}`}>{highlightTelemetry(text.substring(lastIndex, matchIndex))}</span>);
    }
    const formulaContent = match[1];
    parts.push(
      <div key={`blk-${idx}`} className="my-4 p-5 rounded-2xl border border-blue-500/40 bg-[#080d1e] shadow-[0_0_30px_rgba(59,130,246,0.2)] select-all transition-all hover:bg-[#0b132c]/90 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute top-2 left-4 text-[8px] font-mono text-blue-450 tracking-wider uppercase font-extrabold select-none">
          ⚛️ UNIFIED SCIENTIFIC EQUATION STATE
        </div>
        <div className="text-[16px] leading-relaxed text-blue-105 mt-2.5 font-serif font-extrabold tracking-wide">
          {renderFractions(formulaContent)}
        </div>
      </div>
    );
    lastIndex = matchIndex + match[0].length;
  });
  if (lastIndex < text.length) {
    parts.push(<span key="tail-blk">{highlightTelemetry(text.substring(lastIndex))}</span>);
  }
  return <>{parts}</>;
};

export const renderFormattedConsensusText = (
  text: string, 
  isPhysics: boolean,
  onSyncParam?: (paramName: string, paramValue: number) => void
): React.ReactNode => {
  if (!text) return null;
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const segments = text.split(codeBlockRegex);

  return segments.map((seg, idx) => {
    if (seg.startsWith("```")) {
      const lines = seg.split("\n");
      const firstLine = lines[0];
      const match = firstLine.match(/```(\w*)/);
      const language = match ? match[1] : "code";
      const codeContent = lines.slice(1, lines.length - 1).join("\n");

      return (
        <div key={`codeblock-${idx}`} className="my-4 rounded-xl border border-gray-800 bg-slate-950 overflow-hidden font-mono text-[11.5px] leading-relaxed shadow-lg text-left">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-gray-850 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {language || "code"}
            </span>
            <button 
              onClick={() => navigator.clipboard.writeText(codeContent)}
              className="hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
              type="button"
            >
              Copy Code
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-blue-200">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }

    const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
    const mathSegments = seg.split(mathBlockRegex);

    return (
      <div key={`textsegment-${idx}`} className="space-y-2">
        {mathSegments.map((mathSeg, mIdx) => {
          const isBlockMath = mathSeg.startsWith("$$") || mathSeg.startsWith("\\[");
          if (isBlockMath) {
            let mathContent = "";
            if (mathSeg.startsWith("$$")) {
              mathContent = mathSeg.substring(2, mathSeg.length - 2);
            } else {
              mathContent = mathSeg.substring(2, mathSeg.length - 2);
            }
            mathContent = mathContent.trim();
            return (
              <div key={`mathblock-${idx}-${mIdx}`} className="my-4 p-5 rounded-2xl border border-cyan-500/20 bg-[#04081c]/90 text-center relative overflow-hidden select-all font-mono group">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
                
                <div className="text-[13px] md:text-[14px] font-bold text-cyan-400 tracking-wide select-all">
                  {renderFractions(mathContent)}
                </div>
              </div>
            );
          }

          const parseInline = (linePart: string) => {
            const inlineMathRegex = /(\$[\s\S]*?\$|\\\(.*?\\\))/g;
            const inlineSegments = linePart.split(inlineMathRegex);

            return inlineSegments.map((inlineSeg, inlineIdx) => {
              const isInlineMath = inlineSeg.startsWith("$") || inlineSeg.startsWith("\\(");
              if (isInlineMath) {
                let mathExpr = "";
                if (inlineSeg.startsWith("$")) {
                  mathExpr = inlineSeg.substring(1, inlineSeg.length - 1);
                } else {
                  mathExpr = inlineSeg.substring(2, inlineSeg.length - 2);
                }
                return (
                  <span key={`inline-math-${inlineIdx}`} className="inline-block bg-cyan-950/20 border border-cyan-950 px-1 py-0.5 rounded text-cyan-300 font-semibold font-serif text-[11px] mx-0.5 align-middle select-all">
                    {renderFractions(mathExpr)}
                  </span>
                );
              }

              const codeParts = inlineSeg.split(/`([^`\n]+)`/g);
              return codeParts.map((part, cIdx) => {
                if (cIdx % 2 === 1) {
                  return (
                    <code key={`code-${inlineIdx}-${cIdx}`} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400 text-[11px] font-mono font-semibold">
                      {part}
                    </code>
                  );
                }
                
                const boldParts = part.split(/\*\*([\s\S]*?)\*\*/g);
                return boldParts.map((bPart, bIdx) => {
                  if (bIdx % 2 === 1) {
                    return <strong key={`bold-${inlineIdx}-${cIdx}-${bIdx}`} className="font-extrabold text-white">{bPart}</strong>;
                  }
                  const italicParts = bPart.split(/\*([\s\S]*?)\*/g);
                  return italicParts.map((iPart, iIdx) => {
                    if (iIdx % 2 === 1) {
                      return <em key={`italic-${inlineIdx}-${cIdx}-${bIdx}-${iIdx}`} className="italic text-gray-200">{iPart}</em>;
                    }
                    return renderFormulasBlock(iPart, onSyncParam);
                  });
                });
              });
            });
          };

          const lines = mathSeg.split("\n");
          return (
            <div key={`textBlock-${idx}-${mIdx}`} className="text-left select-text">
              {lines.map((line, lIdx) => {
                if (!line.trim()) {
                  return <div key={`empty-${lIdx}`} className="h-3" />;
                }

                const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
                if (hMatch) {
                  const level = hMatch[1].length;
                  const content = hMatch[2];
                  const formatted = parseInline(content);
                  if (level === 1) return <h1 key={`h1-${lIdx}`} className="text-base font-black text-white tracking-tight mt-5 mb-2 font-display border-b border-gray-800 pb-1.5">{formatted}</h1>;
                  if (level === 2) return <h2 key={`h2-${lIdx}`} className="text-sm font-extrabold text-zinc-100 tracking-tight mt-4 mb-2 font-display">{formatted}</h2>;
                  return <h3 key={`h3-${lIdx}`} className="text-xs font-bold text-zinc-200 mt-3.5 mb-1.5 font-display">{formatted}</h3>;
                }

                if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                  const bulletText = line.trim().substring(2);
                  return (
                    <div key={`bullet-${lIdx}`} className="flex items-start space-x-2 ml-4 my-1.5 font-sans leading-relaxed text-zinc-300 text-left">
                      <span className={`${isPhysics ? "text-blue-400" : "text-emerald-400"} mt-2 shrink-0 select-none text-[8px]`}>●</span>
                      <span className="flex-grow">{parseInline(bulletText)}</span>
                    </div>
                  );
                }

                return <div key={`p-${lIdx}`} className="leading-relaxed my-2 text-zinc-250 font-sans text-left">{parseInline(line)}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  });
};
