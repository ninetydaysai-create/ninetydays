export function buildChallengeGenerationPrompt(
  type: string,
  dimension: string,
  targetRole: string,
  currentScore?: number
): string {
  const roleLabel = targetRole.replace(/_/g, " ");
  const dimLabel = dimension.replace(/_/g, " ");
  const scoreCtx =
    currentScore !== undefined
      ? `Their current ${dimLabel} score is ${currentScore}/100.`
      : `They haven't been assessed on ${dimLabel} yet.`;

  const typeInstructions: Record<string, string> = {
    bullet_rewrite: `Write ONE weak resume bullet for a ${roleLabel} — vague, passive, no metrics. The candidate must rewrite it to be strong, impact-driven, and quantified. Output only: "Rewrite this bullet: [the weak bullet]"`,

    interview_question: `Write ONE specific behavioral or situational ${dimLabel} interview question for a ${roleLabel} role. Not theoretical — it must ask about a real past experience or decision. Output only the question.`,

    star_story: `Prompt the candidate to tell a specific STAR story for a ${roleLabel} role targeting ${dimLabel}. Give a concrete scenario or experience type to draw from. Output only: "Tell me about a time when [specific scenario]..."`,

    case_study: `Write a 2-3 sentence mini case study scenario for a ${roleLabel}, relevant to ${dimLabel}. End with one specific question. Format: [scenario] Question: [question]`,

    flashcard: `Pick one ${dimLabel} concept critical for ${roleLabel} interviews. Ask them to explain it in plain English to a non-technical stakeholder. Output only: "Explain [concept] in 2-3 sentences as you would to a VP of Product."`,

    ai_conversation: `Write a 2-sentence realistic scenario a ${roleLabel} might face involving ${dimLabel}. Ask how they'd respond. Output only: [scenario] How would you handle this?`,
  };

  return `Generate a daily 5-minute practice challenge.

Target role: ${roleLabel}
Skill to practice: ${dimLabel}
Challenge type: ${type}
${scoreCtx}

Instructions:
${typeInstructions[type] ?? typeInstructions.interview_question}

Rules:
- Be specific, not generic
- Output ONLY the challenge text — no title, no preamble, no meta-commentary
- The challenge must be completable in writing in 3-5 minutes`;
}

function scoringCriteria(type: string, dimLabel: string): string {
  const map: Record<string, string> = {
    bullet_rewrite:
      "- Specificity: concrete numbers, tech stack, scale (40pts)\n- Impact language: quantified outcomes, business results (35pts)\n- Ownership: active voice, clear individual contribution (25pts)",
    interview_question:
      "- Specificity: real example with names and context (30pts)\n- Structure: clear situation, action, result (30pts)\n- Impact: quantified or well-described outcome (25pts)\n- Relevance: directly answers the question (15pts)",
    star_story:
      "- Situation: clear context, stakes, timeline (20pts)\n- Task: specific responsibility, what was expected (20pts)\n- Action: personal steps, decisions made, reasoning (35pts)\n- Result: measurable outcome, business impact (25pts)",
    case_study:
      `- Problem framing: identifies root issue (25pts)\n- Structured thinking: logical progression (30pts)\n- Recommendations: specific and feasible (30pts)\n- ${dimLabel} domain knowledge (15pts)`,
    flashcard:
      "- Accuracy: conceptually correct (40pts)\n- Clarity: understandable to a non-technical stakeholder (35pts)\n- Conciseness: no unnecessary jargon (25pts)",
    ai_conversation:
      "- Diagnosis: identifies the real problem (25pts)\n- Approach: structured and systematic (35pts)\n- Stakeholder awareness: considers people not just process (25pts)\n- Decisiveness: clear recommendation (15pts)",
  };
  return map[type] ?? map.interview_question;
}

export function buildChallengeEvaluationPrompt(
  type: string,
  dimension: string,
  targetRole: string,
  challengePrompt: string,
  userResponse: string
): string {
  const roleLabel = targetRole.replace(/_/g, " ");
  const dimLabel = dimension.replace(/_/g, " ");

  return `Evaluate this daily practice response from a ${roleLabel} candidate working on ${dimLabel}.

Challenge:
${challengePrompt}

Response:
${userResponse}

Scoring criteria for ${type}:
${scoringCriteria(type, dimLabel)}

Return valid JSON only — no markdown fences:
{
  "score": <number 0-100>,
  "verdict": "<one sentence summary of overall quality>",
  "strengths": ["<specific strength>", "<specific strength>"],
  "improvements": ["<specific actionable improvement>", "<specific actionable improvement>"]
}

Be honest and specific. No generic advice.`;
}
