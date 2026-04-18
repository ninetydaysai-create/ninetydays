export function buildBulletRewritePrompt(original: string, targetRole?: string, jdText?: string): string {
  const roleContext = targetRole ?? "AI/ML Engineer at a product company";

  const jdSection = jdText
    ? `\nJOB DESCRIPTION CONTEXT (tailor rewrites to match this role's language and priorities):\n${jdText.slice(0, 1500)}\n`
    : "";

  return `You are a senior technical resume writer who helps engineers land roles at top product companies.
Your rewrites are specific, evidence-based, and use language that resonates with product company hiring managers.

ORIGINAL BULLET:
${original}

TARGET ROLE: ${roleContext}
${jdSection}
A strong resume bullet:
- Starts with a powerful, specific action verb (not "Worked on", "Helped", "Assisted", "Participated")
- Has a concrete outcome with numbers (%, latency, users, revenue, error rate, throughput)
- Shows ownership: "Led", "Designed", "Built", "Shipped" — not "Contributed to" or "Part of team that"
- Is 1–2 lines, past tense, no filler phrases ("in order to", "successfully", "leveraged")
- If the JD context is provided, mirrors the specific language and priorities of that role

IMPORTANT: Do NOT invent metrics. If metrics are absent from the original, use placeholder format [X%] or [N users] and note in reasoning that the user should fill in real numbers.

Rate the original and provide 3 rewrites with different angles:
1. Conservative: minimal changes, strengthens what's there
2. Impact-forward: restructures around the outcome, adds estimated placeholders if needed
3. Ownership-first: rewrites to show maximum ownership and scope

Return JSON:
{
  "impactScoreBefore": <1-10: honest score of original — most service-company bullets score 2-4>,
  "rewrites": [
    {
      "text": "<rewritten bullet>",
      "impactScore": <1-10>,
      "reasoning": "<one sentence: exactly what was improved and why it matters to a hiring manager>"
    },
    {
      "text": "<second rewrite, different angle>",
      "impactScore": <1-10>,
      "reasoning": "<one sentence>"
    },
    {
      "text": "<third rewrite, ownership-first framing>",
      "impactScore": <1-10>,
      "reasoning": "<one sentence>"
    }
  ]
}

Each rewrite must start with a different strong action verb.
Return ONLY the JSON. No markdown. No explanation outside the JSON.`;
}
