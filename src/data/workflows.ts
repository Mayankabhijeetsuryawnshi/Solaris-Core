/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomWorkflow } from "../types";

export const customWorkflows: CustomWorkflow[] = [
  {
    id: "none",
    name: "General Workspace",
    icon: "Layers",
    promptPrefix: "",
    description: "Standard model orchestration without predefined system constraints."
  },
  {
    id: "developer",
    name: "Technical/Developer Suite",
    icon: "PenTool",
    promptPrefix: "Provide a highly modular, clean, and production-ready code design, optimizing for execution efficiency, rigorous error guards, and performance bottlenecks: ",
    description: "Focuses response structures specifically on software architecture and high scalability."
  },
  {
    id: "creative",
    name: "Creative/Narrative Studio",
    icon: "Sparkle",
    promptPrefix: "Craft a deeply creative, elegant, prose-driven narrative output with vivid sensory descriptions and engaging structure: ",
    description: "Tailored specifically for branding, copy, storytelling, and copy editing."
  },
  {
    id: "socratic",
    name: "Socratic Educator",
    icon: "BookOpen",
    promptPrefix: "Explain the concept comprehensively using a Socratic teaching format. Challenge assumptions, give concrete analogical examples, and outline logical deductions: ",
    description: "Ideal for deep-concept assimilation and analytical debugging."
  }
];
