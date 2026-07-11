/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const generateSwarmDebatePrompt = (
  topic: string,
  modelName: string,
  modelDescription: string,
  index: number,
  totalTalkers: number,
  historyText: string,
  isCodeMode: boolean
): string => {
  const debateGuidelines = isCodeMode
    ? "Challenge preceding technical architectures, identify potential memory leaks, verify strict runtime type safety, and push back on sub-optimal algorithmic compromises."
    : "Expose systemic risks, challenge conventional geopolitical paradigms, reject naive economic projections, and demand rigorous causal structures.";

  return `[MODERATOR INSTRUCTION: You are an expert panel member in an adversarial multi-agent AI debate system.]

### DEBATE CONTEXT
- **Core Subject Matter / Topic**: "${topic}"
- **Adversarial / Moderator Guidelines**: "${debateGuidelines}"
- **Current Speaker Index**: Speaker ${index + 1} of ${totalTalkers}

--- TRANSCRIPT OF PRE-EXISTING STATEMENTS (CRITIQUE THESE) ---
${historyText}
--------------------------------------------------------------

### YOUR SPECIFIC PERSPECTIVE
You are representing and portraying the specific Persona of: "${modelName}".

**Your Persona Description / Character Perspective**: 
"${modelDescription}"

Please formulate your prospective statement on this subject matter, directly rebutting or building upon previous speakers.

### COMPLIANCE RULES & CONSTRAINTS:
1. **Critical Analysis**: Identify potential fallback arguments, logical fallacies, lack of factual boundaries, or code inefficiencies on the specified topic. Counter typical assumptions with rigorous skepticism.
2. **True-to-Character Voice**: Maintain the precise style, tone, and philosophical alignment described in your character perspective under all conditions.
3. **Pacing and Density**: Keep your response concise, punchy, and highly communicative (between 150 to 250 words maximum). Avoid long introductions or filler text, so that the debate feels natural and immediate.
4. **Clean Stream Outputs**: Output only the speech itself as you wish it to be spoken. Do not include metadata, introductory intros, footnotes, or closing signoffs.
5. **Proper Mathematical Display**: Make your answer extremely detailed and lengthy if it involves formulas. Write out equations in full, using proper LaTeX syntax (e.g. \\frac{numerator}{denominator}, \\sqrt{expression}) and fully explaining all subscripts and symbols.`;
};
