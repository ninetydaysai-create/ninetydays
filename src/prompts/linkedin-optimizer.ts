import { TargetRole } from "@prisma/client";

export function buildLinkedInOptimizationPrompt(
  headline: string,
  summary: string,
  targetRole: TargetRole,
  jobDescriptions: string[],
  signalDepthMap?: Record<string, string>,
  skillsWithEvidence?: string[]
): string {
  const roleLabel = targetRole.replace(/_/g, " ");

  // Build signal context to prevent keyword stuffing without evidence
  const strongSkills = signalDepthMap
    ? Object.entries(signalDepthMap).filter(([, d]) => d === "STRONG").map(([s]) => s)
    : skillsWithEvidence ?? [];

  const moderateSkills = signalDepthMap
    ? Object.entries(signalDepthMap).filter(([, d]) => d === "MODERATE").map(([s]) => s)
    : [];

  const weakSkills = signalDepthMap
    ? Object.entries(signalDepthMap).filter(([, d]) => d === "WEAK").map(([s]) => s)
    : [];

  const signalSection = signalDepthMap
    ? `\nCANDIDATE SIGNAL DEPTH (critical for credibility — do NOT headline weak signals):
STRONG evidence (can be featured prominently): ${strongSkills.join(", ") || "none"}
MODERATE evidence (mention in context, don't lead with): ${moderateSkills.join(", ") || "none"}
WEAK evidence (in skills list only — do NOT feature in headline or first line of summary): ${weakSkills.join(", ") || "none"}
`
    : "";

  return `You are a LinkedIn profile optimizer who helps engineers land ${roleLabel} roles at product companies.
Your goal is NOT to stuff keywords — it is to make the profile credible and compelling to a product company hiring manager who scans in 8 seconds.

CURRENT HEADLINE:
${headline}

CURRENT SUMMARY:
${summary}

TARGET ROLE: ${roleLabel}
${signalSection}
SAMPLE JOB DESCRIPTIONS FROM TARGET COMPANIES:
${jobDescriptions.map((jd, i) => `JD ${i + 1}:\n${jd.slice(0, 600)}`).join("\n\n")}

OPTIMIZATION PHILOSOPHY:
- Write for the hiring manager's 8-second scan, not an ATS bot
- The headline should say what you BUILD, not what you want ("Builds AI-powered products" beats "Seeking ML Engineer roles")
- The summary opens with the hook visible before "see more" — make it specific and strong
- Only feature skills with real evidence in headline/first paragraph — weak signals buried in the summary are fine
- Three quantified achievements are mandatory in the summary
- The summary ends with a clear call to action (not "Looking for new opportunities")
- Credibility > keyword density

SCORING RUBRIC (score the CURRENT profile, not the rewrite):
Rate each dimension 0–25:
- keywords (0–25): How well does the current headline + summary include the right keywords for ${roleLabel} at product companies? 0 = none, 25 = comprehensive
- hook (0–25): How strong is the first visible line (before "see more")? 0 = generic/vague, 25 = specific, compelling, and role-relevant
- credibility (0–25): How many quantified achievements exist in the current summary? 0 = zero numbers/impact, 25 = 3+ strong quantified claims
- callToAction (0–25): Does the current summary end with a clear CTA? 0 = no CTA / "open to opportunities", 25 = specific and confident CTA
profileScore = sum of all four dimensions (0–100)

Return JSON:
{
  "outputHeadline": "<optimized headline, max 120 chars — says what you DO and at what level, no 'seeking' language>",
  "outputSummary": "<optimized About section, max 2000 chars — opens with a hook, includes 3 quantified achievements based on strong evidence, ends with clear CTA>",
  "alternatives": [
    "<alternative headline 1 — different angle>",
    "<alternative headline 2>",
    "<alternative headline 3>"
  ],
  "keywordsAdded": ["<skill or signal term added that has project evidence to back it up>"],
  "keywordsMissing": ["<important signal for ${roleLabel} that the candidate genuinely lacks project evidence for — framed as a growth area, not a keyword dump>"],
  "profileScore": <integer 0–100, sum of the four dimensions below>,
  "scoreBreakdown": {
    "keywords": <0–25>,
    "hook": <0–25>,
    "credibility": <0–25>,
    "callToAction": <0–25>
  }
}

Rules:
- Headline must NOT say "Looking for opportunities", "Open to work", or "Available"
- Summary must open with a strong first line visible without expanding (shows in search previews)
- Write in first person
- Every claim in the headline or first paragraph must be backed by something from the resume
- Use natural language — do NOT write a comma-separated list of technologies

Return ONLY valid JSON.`;
}

export function buildGithubReadmePrompt(
  currentReadme: string,
  name: string,
  targetRole: TargetRole,
  skills: string[]
): string {
  return `You are a GitHub profile expert. Rewrite this GitHub profile README to make it stand out for ${targetRole.replace(/_/g, " ")} roles at product companies.

CURRENT README:
${currentReadme || "(empty — create from scratch)"}

DEVELOPER NAME: ${name}
TARGET ROLE: ${targetRole.replace(/_/g, " ")}
KEY SKILLS: ${skills.join(", ")}

Create a compelling README that:
1. Opens with a one-line value proposition (not "Hi I'm X")
2. Shows current focus / what they're building
3. Tech stack section with shields.io badges
4. GitHub stats embed (use: https://github-readme-stats.vercel.app/api?username=USERNAME)
5. "Currently learning" or "Building" section
6. Clean, minimal formatting — no emojis overload

Return ONLY the raw markdown. No JSON wrapper. No explanation.`;
}
