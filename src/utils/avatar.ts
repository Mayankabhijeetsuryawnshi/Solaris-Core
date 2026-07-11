/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const getModelAvatar = (mdId: string, prov: string): string => {
  const lowerId = mdId.toLowerCase();
  if (lowerId.includes("claude") || lowerId.includes("anthropic")) return "🔮";
  if (lowerId.includes("deepseek")) return "🐳";
  if (lowerId.includes("qwen")) return "🏮";
  if (lowerId.includes("llama") || prov.toLowerCase().includes("meta")) return "🦙";
  if (lowerId.includes("gpt") || prov.toLowerCase().includes("openai")) return "🧠";
  if (lowerId.includes("o1") || lowerId.includes("o3")) return "🟢";
  if (lowerId.includes("phi") || prov.toLowerCase().includes("microsoft")) return "📐";
  if (lowerId.includes("cohere")) return "🧬";
  if (lowerId.includes("mistral")) return "🪁";
  if (lowerId.includes("command")) return "📡";
  return "🤖";
};
